from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import requests
from starlette.middleware.cors import CORSMiddleware

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_URL   = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

class Coordinate(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_items=2)

class RouteResponse(BaseModel):
    route: List[Coordinate]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"],   allow_headers=["*"],
)

@app.post("/route", response_model=RouteResponse)
def create_route(request_data: RouteRequest):
    coords  = [[c.lng, c.lat] for c in request_data.coordinates]
    headers = {"Authorization": f"Bearer {ORS_TOKEN}", "Content-Type": "application/json"}
    try:
        response = requests.post(ORS_URL, json={"coordinates": coords}, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.HTTPError:
        err = response.json().get("error")
        raise HTTPException(status_code=502, detail=err["message"])
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail={"message": str(e["message"])})

    data = response.json()
    try:
        raw = data["features"][0]["geometry"]["coordinates"]
    except (KeyError, IndexError, TypeError):
        err = data.get("error", {"message": "unexpected ORS response"})
        raise HTTPException(status_code=502, detail=err["message"])

    return {"route": [{"lat": lat, "lng": lng} for lng, lat in raw]}
