from typing import List
from pydantic import BaseModel, conlist

class Coordinate(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    coordinates: conlist(Coordinate, min_length=2)
    avoid_zones: List[conlist(Coordinate, min_length=3)] = []

    def to_ors_payload(self) -> dict:
        payload = {"coordinates": [[c.lng, c.lat] for c in self.coordinates]}
        if not self.avoid_zones:
            return payload

        rings = [[[p.lng, p.lat] for p in zone] for zone in self.avoid_zones]
        if len(rings) == 1:
            payload["options"] = {"avoid_polygons": {"type": "Polygon", "coordinates": [rings[0]]}}
        else:
            payload["options"] = {"avoid_polygons": {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}}
        return payload

class RouteResponse(BaseModel):
    route: List[Coordinate]
