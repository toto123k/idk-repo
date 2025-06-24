from fastapi import APIRouter
from basic_objects.Models import RouteRequest, RouteResponse
from handlers.RoutingHandler import get_route

router = APIRouter()

@router.post("/route", response_model=RouteResponse)
def create_route_endpoint(request: RouteRequest) -> RouteResponse:
    return get_route(request)