from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import openrouteservice
from starlette.middleware.cors import CORSMiddleware

class Coordinate(BaseModel):
    lon: float
    lat: float

class Position(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: Coordinate
    end: Coordinate

class RouteResponse(BaseModel):
    route: List[Position]

app = FastAPI(title="Routing API", description="Get driving routes from OpenRouteService.", version="1.0.0")

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_URL = "https://api.openrouteservice.org/v2"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/route", response_model=RouteResponse)
def create_route(request_data: RouteRequest):
    start = [request_data.start.lon, request_data.start.lat]
    end   = [request_data.end.lon,   request_data.end.lat]
    headers = {"Authorization": ORS_TOKEN, "Content-Type": "application/json"}
    payload = {"coordinates": [start, end]}

    try:
        resp = requests.post(f"{ORS_URL}/directions/driving-car", json=payload, headers=headers)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"ORS connection failed: {e}")

    try:
        data    = resp.json()
        geom    = data["routes"][0]["geometry"]
        decoded = openrouteservice.convert.decode_polyline(geom)["coordinates"]
        formatted = [{"lat": lat, "lng": lon} for lon, lat in decoded]
        return {"route": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ORS response parse error: {e}")
