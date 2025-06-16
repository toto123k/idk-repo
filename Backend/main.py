from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field  # <-- Import Field for validation
from typing import List
import requests
import openrouteservice
from starlette.middleware.cors import CORSMiddleware


# --- Pydantic Models ---

class Coordinate(BaseModel):
    """A model representing a single geographic coordinate."""
    lon: float
    lat: float


# UPDATED RouteRequest to accept a list of coordinates
class RouteRequest(BaseModel):
    """
    The input model for the route request.
    Accepts a list of coordinates, where the first is the start,
    the last is the end, and any in between are waypoints.
    """
    # We use Field to add validation: must have at least 2 points (start and end).
    # The max_items is based on OpenRouteService free tier limits (typically 50).
    coordinates: List[Coordinate] = Field(..., min_length=2, max_length=50)


class RouteResponse(BaseModel):
    """The output model for the route response, containing the list of coordinate pairs."""
    # The route itself will be a list of [lng, lat] pairs
    route: List[List[float]]


# --- FastAPI Application Setup ---

app = FastAPI(
    title="Routing API with Waypoints",
    description="An API to get driving routes from OpenRouteService, now with waypoint support.",
    version="1.1.0"  # Version bump
)

# It's good practice to get sensitive tokens from environment variables,
# but for this example, we'll keep it here.
# ORS_TOKEN = os.environ.get("ORS_API_KEY")
ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_URL = "https://api.openrouteservice.org/v2"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoint ---

@app.post("/route", response_model=RouteResponse)
def create_route(request_data: RouteRequest):
    """
    Accepts a list of coordinates (start, waypoints, end) in a JSON body
    and returns a calculated route.
    """
    ors_coords = [[coord.lon, coord.lat] for coord in request_data.coordinates]

    headers = {
        "Authorization": ORS_TOKEN,
        "Content-Type": "application/json",
        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
    }

    payload = {
        "coordinates": ors_coords,
    }

    try:
        # Using the driving-car profile, adjust if needed (e.g., driving-hgv, cycling-road)
        response = requests.post(f"{ORS_URL}/directions/driving-car/geojson", json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
    except requests.RequestException as e:
        # This handles network errors, timeouts, etc.
        raise HTTPException(status_code=503, detail=f"Failed to connect to OpenRouteService: {str(e)}")
    except requests.HTTPError as e:
        # This handles API errors returned by ORS
        try:
            detail = response.json()
        except requests.exceptions.JSONDecodeError:
            detail = response.text  # Fallback if the error response isn't JSON
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        data = response.json()

        geometry_coords = data["features"][0]["geometry"]["coordinates"]

        return {"route": geometry_coords}

    except (KeyError, IndexError, ValueError, TypeError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse OpenRouteService GeoJSON response: {str(e)}")