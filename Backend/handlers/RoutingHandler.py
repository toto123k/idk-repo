import logging
from basic_objects.Models import RouteRequest, RouteResponse, Coordinate
import clients.OrsClient as ors

logger = logging.getLogger(__name__)

def get_route(request: RouteRequest) -> RouteResponse:
    payload = request.to_ors_payload()
    data = ors.get_ors_route_data(payload)

    try:
        raw_coords = data["features"][0]["geometry"]["coordinates"]
    except (KeyError, IndexError, TypeError):
        logger.error("Unexpected ORS response format: %s", data)
        raise ors.ORSClientError("Unexpected routing service response")

    route = [Coordinate(lat=lat, lng=lng) for lng, lat in raw_coords]
    return RouteResponse(route=route)