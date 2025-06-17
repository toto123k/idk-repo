# src/main.py

import logging
from typing import List, Dict, Any, Optional

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

# ——— Logging Setup —————————————————————————————————————————————————
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ——— Models ———————————————————————————————————————————————————————

class Coordinate(BaseModel):
    lon: float
    lat: float


class RouteRequest(BaseModel):
    coordinates: List[Coordinate] = Field(
        ...,
        description="At least start and end point",
        min_length=2
    )
    avoid_zones: List[List[Coordinate]] = Field(
        default_factory=list,
        description="Optional list of polygons (each a list of lon/lat) to avoid"
    )


class RouteResponse(BaseModel):
    route: List[List[float]]


# ——— App Setup —————————————————————————————————————————————————————

app = FastAPI(
    title="Routing API",
    description="API to get routes from OpenRouteService, with support for avoid zones.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ——— Constants —————————————————————————————————————————————————————

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_TIMEOUT_SECONDS = 15


# ——— Helper Functions ——————————————————————————————————————————————

def _validate_avoid_zone_polygons(avoid_zones: List[List[Coordinate]]):
    """
    Validates that each polygon in avoid_zones has at least 3 points.
    Raises HTTPException if validation fails.
    """
    for i, polygon_points in enumerate(avoid_zones):
        if len(polygon_points) < 3:
            raise HTTPException(
                status_code=400,
                detail=f"Each avoid_zones polygon requires at least 3 points. Error in polygon at index {i}."
            )


def _coordinates_to_geojson_ring(polygon_points: List[Coordinate]) -> List[List[float]]:
    """
    Converts a list of Coordinate objects to a GeoJSON-style closed linear ring.
    A linear ring must have at least 4 points, with the first and last being identical.
    This function ensures the ring is closed.
    Assumes polygon_points has at least 3 distinct points as per _validate_avoid_zone_polygons.
    """
    ring = [[p.lon, p.lat] for p in polygon_points]
    if ring[0] != ring[-1]:
        ring.append(list(ring[0]))
    return ring


def _build_avoid_polygons_feature(avoid_zones: List[List[Coordinate]]) -> Optional[Dict[str, Any]]:
    """
    Builds the GeoJSON object for the 'avoid_polygons' option for ORS.
    Returns None if no avoid_zones are provided.
    """
    if not avoid_zones:
        return None

    # Each polygon in avoid_zones becomes a GeoJSON ring
    # GeoJSON Polygon coordinates: List of linear rings (first is exterior, others are interior holes)
    # GeoJSON MultiPolygon coordinates: List of Polygon coordinate arrays

    processed_rings = [_coordinates_to_geojson_ring(points) for points in avoid_zones]

    if len(processed_rings) == 1:
        # Single polygon: structure is {"type": "Polygon", "coordinates": [ring]}
        return {
            "type": "Polygon",
            "coordinates": [processed_rings[0]]
        }
    else:
        multi_polygon_coords = [[ring] for ring in processed_rings]
        return {
            "type": "MultiPolygon",
            "coordinates": multi_polygon_coords
        }


def _build_ors_request_payload(req: RouteRequest) -> Dict[str, Any]:
    """Constructs the payload for the OpenRouteService API request."""
    _validate_avoid_zone_polygons(req.avoid_zones)  # Perform validation first

    ors_coordinates = [[c.lon, c.lat] for c in req.coordinates]
    payload: Dict[str, Any] = {"coordinates": ors_coordinates}

    avoid_polygons_geojson = _build_avoid_polygons_feature(req.avoid_zones)
    if avoid_polygons_geojson:
        payload.setdefault("options", {})["avoid_polygons"] = avoid_polygons_geojson

    return payload


def _call_ors_get_route(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the OpenRouteService API with the given payload.
    Handles API errors and returns the parsed JSON response.
    Raises HTTPException for ORS errors or network issues.
    """
    ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    headers = {
        "Authorization": ORS_TOKEN,
        "Content-Type": "application/json",
        "Accept": "application/json, application/geo+json"
    }

    logger.info("Sending request to ORS API. Payload keys: %s", list(payload.keys()))
    if "options" in payload:
        logger.info("Payload options: %s", payload["options"])

    try:
        response = requests.post(
            ORS_API_URL,
            json=payload,
            headers=headers,
            timeout=ORS_TIMEOUT_SECONDS
        )
        response.raise_for_status()  # Raises HTTPError for 4xx/5xx responses
    except requests.exceptions.Timeout:
        logger.error("ORS API request timed out after %s seconds.", ORS_TIMEOUT_SECONDS)
        raise HTTPException(status_code=504, detail="Routing service request timed out.")
    except requests.exceptions.RequestException as e:
        # Other request errors (e.g., network connection, DNS failure)
        logger.error("ORS API request failed: %s\nSent Payload: %s", e, payload)
        raise HTTPException(status_code=502, detail=f"Routing service connection error: {e}")

    try:
        return response.json()
    except requests.exceptions.JSONDecodeError as e:
        logger.error(
            "Failed to decode ORS API JSON response: %s\nResponse body (first 500 chars): %s",
            e, response.text[:500]
        )
        raise HTTPException(status_code=502, detail="Routing service returned an invalid JSON response.")


def _extract_route_from_ors_response(ors_data: Dict[str, Any]) -> List[List[float]]:
    """
    Extracts the route coordinates from a successful ORS API GeoJSON response.
    Raises HTTPException if the response format is unexpected.
    """
    try:
        # Standard ORS GeoJSON response: route is in features[0].geometry.coordinates
        features = ors_data.get("features")
        geometry = features[0].get("geometry")
        route_coordinates = geometry.get("coordinates")

        return route_coordinates
    except Exception as e:
        logger.error(
            "Unexpected ORS API response format: %s\nORS Response Data: %s",
            e, ors_data
        )
        raise HTTPException(
            status_code=500,  # Internal Server Error, as we couldn't parse a successful ORS response
            detail=f"Could not parse route from routing service: {e}"
        )


# ——— Endpoint ——————————————————————————————————————————————————————

@app.post("/route", response_model=RouteResponse)
async def create_route(request_data: RouteRequest):
    """
    Calculates a route between specified coordinates, optionally avoiding given polygonal zones.

    - **coordinates**: A list of at least two `[lon, lat]` points defining the route.
    - **avoid_zones**: An optional list of polygons. Each polygon is a list of `[lon, lat]`
      points (minimum 3 distinct points) defining an area to avoid.
    """
    try:
        ors_payload = _build_ors_request_payload(request_data)
        ors_response_data = _call_ors_get_route(ors_payload)
        route_linestring = _extract_route_from_ors_response(ors_response_data)

        return RouteResponse(route=route_linestring)

    except HTTPException:
        # Re-raise HTTPExceptions directly (e.g., from validation, ORS API call)
        raise
    except Exception as e:
        # Catch any other unexpected errors
        logger.exception("An unexpected error occurred in /route endpoint.")  # Logs with stack trace
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred while processing the route."
        )