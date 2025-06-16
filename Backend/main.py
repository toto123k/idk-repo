from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import openrouteservice
from starlette.middleware.cors import CORSMiddleware


# --- Pydantic Models for Input and Output ---

class Coordinate(BaseModel):
    """A model representing a single geographic coordinate."""
    lon: float
    lat: float


class RouteRequest(BaseModel):
    """The input model for the route request, containing start and end coordinates."""
    start: Coordinate
    end: Coordinate


class RouteResponse(BaseModel):
    """The output model for the route response, containing the list of coordinate pairs."""
    route: List[List[float]]


# --- FastAPI Application Setup ---

app = FastAPI(
    title="Routing API",
    description="An API to get driving routes from OpenRouteService.",
    version="1.0.0"
)

ORS_TOKEN = "5b3ce3597851110001cf6248d28a72ed53124d669dc1147811ae5ebe"  # Replace with your token if needed
ORS_URL = "https://api.openrouteservice.org/v2"

# This middleware configuration allows requests from any origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# --- API Endpoint ---

@app.post("/route", response_model=RouteResponse)
def create_route(request_data: RouteRequest):
    """
    Accepts start and end coordinates in a JSON body and returns a route.

    - **start**: The starting coordinate.
    - **end**: The ending coordinate.
    """
    # FastAPI has already validated the input against the RouteRequest model.
    # We can now safely access the data.

    # Note: OpenRouteService expects coordinates in (longitude, latitude) format
    start_coords = [request_data.start.lon, request_data.start.lat]
    end_coords = [request_data.end.lon, request_data.end.lat]

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
        # We assume the error response from ORS is JSON
        try:
            detail = response.json()
        except requests.exceptions.JSONDecodeError:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        data = response.json()
        geometry = data["routes"][0]["geometry"]
        # The decoded polyline coordinates are also in (longitude, latitude) format
        decoded = openrouteservice.convert.decode_polyline(geometry)

        # The return value will be automatically validated against the RouteResponse model
        return {"route": decoded["coordinates"]}

    except (KeyError, IndexError, ValueError) as e:
        # This handles cases where the response from ORS is not in the expected format
        raise HTTPException(status_code=500, detail=f"Failed to parse or decode OpenRouteService response: {str(e)}")

