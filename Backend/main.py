import logging
from typing import List, Dict, Any
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, conlist
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
ORS_TIMEOUT = 15

class Coordinate(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    coordinates: conlist(Coordinate, min_items=2)
    avoid_zones: List[conlist(Coordinate, min_items=3)] = Field(default_factory=list)

    def to_ors_payload(self) -> Dict[str, Any]:
        payload = {"coordinates": [[c.lng, c.lat] for c in self.coordinates]}
        if self.avoid_zones:
            rings = [[[p.lng, p.lat] for p in polygon] for polygon in self.avoid_zones]
            if len(rings) == 1:
                payload["options"] = {"avoid_polygons": {"type": "Polygon", "coordinates": [rings[0]]}}
            else:
                payload["options"] = {"avoid_polygons": {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}}
        return payload

class RouteResponse(BaseModel):
    route: List[Coordinate]

app = FastAPI(
    title="Routing API",
    description="Get driving routes from OpenRouteService with optional avoid zones"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/route", response_model=RouteResponse)
def create_route(request_data: RouteRequest):
    payload = request_data.to_ors_payload()
    try:
        response = requests.post(
            ORS_URL,
            json=payload,
            headers={"Authorization": f"Bearer {ORS_TOKEN}"},
            timeout=ORS_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout:
        logger.error("Routing service timed out after %s seconds", ORS_TIMEOUT)
        raise HTTPException(status_code=504, detail="Routing service timed out")
    except requests.HTTPError as e:
        try:
            error_info = response.json().get("error", {})
            message = error_info.get("message", str(e))
        except ValueError:
            message = str(e)
        logger.error("Routing service returned error %s: %s", response.status_code, message)
        raise HTTPException(status_code=502, detail=message)
    except requests.RequestException as e:
        logger.error("Routing service connection failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Routing service connection failed: {e}")
    try:
        raw_coords = data["features"][0]["geometry"]["coordinates"]
    except (KeyError, IndexError, TypeError):
        logger.error("Unexpected routing service response format: %s", data)
        raise HTTPException(status_code=502, detail="Unexpected routing service response")
    return {
        "route": [
            {"lat": lat, "lng": lng}
            for lng, lat in raw_coords
        ]
    }
