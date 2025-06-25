import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException

from main import app
import clients.OrsClient as ors_client_module

class MockOrsClient:
    def __init__(self):
        self.payload_to_send = None
        self.error_to_raise = None
        self.captured_payload = None

    def get_ors_route_data(self, payload: dict) -> dict:
        self.captured_payload = payload
        if self.error_to_raise:
            raise self.error_to_raise
        if self.payload_to_send is not None:
            return self.payload_to_send
        return {
            "features": [
                {"geometry": {"coordinates": [[10.0, 20.0], [30.0, 40.0]]}}
            ]
        }

mock_ors = MockOrsClient()

@pytest.fixture(autouse=True)
def patch_ors_client(monkeypatch):
    monkeypatch.setattr(
        ors_client_module,
        "get_ors_route_data",
        mock_ors.get_ors_route_data
    )
    yield
    mock_ors.payload_to_send = None
    mock_ors.error_to_raise = None
    mock_ors.captured_payload = None

@pytest.fixture
def client():
    return TestClient(app)

def test_create_route_parses_and_returns_coordinates(client):
    body = {
        "coordinates": [
            {"lat": 0.0, "lng": 0.0},
            {"lat": 1.0, "lng": 1.0}
        ]
    }
    response = client.post("/route", json=body)
    assert response.status_code == 200
    assert response.json() == {
        "route": [
            {"lat": 20.0, "lng": 10.0},
            {"lat": 40.0, "lng": 30.0}
        ]
    }

def test_payload_sends_avoid_zone_ring_coordinates(client):
    polygon = [
        {"lat": 0.0, "lng": 0.0},
        {"lat": 0.0, "lng": 1.0},
        {"lat": 1.0, "lng": 1.0},
    ]
    body = {
        "coordinates": [
            {"lat": 0.0, "lng": 0.0},
            {"lat": 2.0, "lng": 2.0}
        ],
        "avoid_zones": [polygon]
    }

    resp = client.post("/route", json=body)
    assert resp.status_code == 200

    ring = mock_ors.captured_payload["options"]["avoid_polygons"]["coordinates"][0]
    # we expect exactly the input points, in [lng, lat] order, no closing point appended
    expected_ring = [[pt["lng"], pt["lat"]] for pt in polygon]
    assert ring == expected_ring


def test_validation_fails_for_too_few_avoid_zone_points(client):
    body = {
        "coordinates": [
            {"lat": 0.0, "lng": 0.0},
            {"lat": 1.0, "lng": 1.0}
        ],
        "avoid_zones": [
            [
                {"lat": 0.0, "lng": 0.0},
                {"lat": 1.0, "lng": 1.0}
            ]
        ]
    }
    response = client.post("/route", json=body)
    assert response.status_code == 422

def test_ors_http_exception_propagates_status_and_detail(client):
    mock_ors.error_to_raise = HTTPException(status_code=504, detail="Timeout from ORS")
    body = {
        "coordinates": [
            {"lat": 0.0, "lng": 0.0},
            {"lat": 1.0, "lng": 1.0}
        ]
    }
    response = client.post("/route", json=body)
    assert response.status_code == 504
    assert response.json()["detail"] == "Timeout from ORS"

def test_unexpected_exception_bubbles_up(client):
    mock_ors.error_to_raise = RuntimeError("The ORS API exploded")
    body = {
        "coordinates": [
            {"lat": 0.0, "lng": 0.0},
            {"lat": 1.0, "lng": 1.0}
        ]
    }
    with pytest.raises(RuntimeError) as excinfo:
        client.post("/route", json=body)
    assert "The ORS API exploded" in str(excinfo.value)
