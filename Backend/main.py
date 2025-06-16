from fastapi import FastAPI, Query, HTTPException
from typing import List
import requests
import openrouteservice
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"
ORS_URL = "https://api.openrouteservice.org/v2"

# This middleware configuration allows requests from any origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/route")
def get_route(start: str, end: str):
    try:
        # Note: OpenRouteService expects coordinates in (longitude, latitude) format
        start_coords = list(map(float, start.split(",")))
        end_coords = list(map(float, end.split(",")))
        if len(start_coords) != 2 or len(end_coords) != 2:
            raise ValueError()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid coordinates. Use format: lon,lat")

    headers = {
        "Authorization": ORS_TOKEN,
        "Content-Type": "application/json"
    }

    payload = {
        "coordinates": [start_coords, end_coords]
    }

    try:
        response = requests.post(f"{ORS_URL}/directions/driving-car", json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
    except requests.RequestException as e:
        # This handles network errors, timeouts, etc.
        raise HTTPException(status_code=503, detail=f"Failed to connect to OpenRouteService: {str(e)}")
    except requests.HTTPError as e:
        # This handles API errors returned by ORS (e.g., bad request, invalid token)
        raise HTTPException(status_code=response.status_code, detail=response.json())


    try:
        data = response.json()
        geometry = data["routes"][0]["geometry"]
        # The decoded polyline coordinates are also in (longitude, latitude) format
        decoded = openrouteservice.convert.decode_polyline(geometry)
        return {"route": decoded["coordinates"]}
    except (KeyError, IndexError, ValueError) as e:
        # This handles cases where the response from ORS is not in the expected format
        raise HTTPException(status_code=500, detail=f"Failed to parse or decode OpenRouteService response: {str(e)}")