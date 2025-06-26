import logging
from basic_objects.Models import RouteRequest, RouteResponse, Coordinate
import clients.OrsClient as ors

logger = logging.getLogger(__name__)

def get_route(request: RouteRequest):
    payload = request.to_ors_payload()
    return ors.get_ors_route_data(payload)