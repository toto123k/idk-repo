# tests/test_route.py

import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
import main

app = main.app

@pytest.fixture
def client():
    return TestClient(app)

# --- fake ORS responses ----------------------------------------------------

def fake_ors_success(payload):
    return {
        "features": [
            {"geometry": {"coordinates": [[10.0, 20.0], [30.0, 40.0]]}}
        ]
    }

def fake_ors_error(payload):
    raise HTTPException(status_code=504, detail="Timeout")

# --- tests -----------------------------------------------------------------

def test_create_route_success_no_avoid_zones(client, monkeypatch):
    # stub out the ORS call
    monkeypatch.setattr(main, "_call_ors_get_route", fake_ors_success)

    body = {
        "coordinates": [
            {"lon": 0.0, "lat": 0.0},
            {"lon": 1.0, "lat": 1.0}
        ]
    }
    resp = client.post("/route", json=body)
    assert resp.status_code == 200
    assert resp.json() == {"route": [[10.0, 20.0], [30.0, 40.0]]}


def test_create_route_success_single_avoid_zone_closure(client, monkeypatch):
    captured = {}
    def capture_ors(payload):
        captured["payload"] = payload
        return fake_ors_success(payload)

    monkeypatch.setattr(main, "_call_ors_get_route", capture_ors)

    polygon = [
        {"lon": 0.0, "lat": 0.0},
        {"lon": 1.0, "lat": 0.0},
        {"lon": 1.0, "lat": 1.0},
    ]
    body = {
        "coordinates": [
            {"lon": 0.0, "lat": 0.0},
            {"lon": 2.0, "lat": 2.0}
        ],
        "avoid_zones": [polygon]
    }
    resp = client.post("/route", json=body)
    assert resp.status_code == 200

    # ensure ring is closed (first == last)
    ring = captured["payload"]["options"]["avoid_polygons"]["coordinates"][0]
    assert ring[0] == ring[-1]


def test_create_route_invalid_avoid_zone_polygon_too_few_points(client):
    body = {
        "coordinates": [
            {"lon": 0.0, "lat": 0.0},
            {"lon": 1.0, "lat": 1.0}
        ],
        "avoid_zones": [
            [
                {"lon": 0.0, "lat": 0.0},
                {"lon": 1.0, "lat": 1.0}
            ]
        ]
    }
    resp = client.post("/route", json=body)
    assert resp.status_code == 400
    assert "requires at least 3 points" in resp.json()["detail"]


def test_create_route_propagates_ors_http_exception(client, monkeypatch):
    monkeypatch.setattr(main, "_call_ors_get_route", fake_ors_error)

    body = {
        "coordinates": [
            {"lon": 0.0, "lat": 0.0},
            {"lon": 1.0, "lat": 1.0}
        ]
    }
    resp = client.post("/route", json=body)
    assert resp.status_code == 504
    assert resp.json()["detail"] == "Timeout"


def test_create_route_unexpected_exception_yields_500(client, monkeypatch):
    def raise_unexpected(payload):
        raise RuntimeError("boom")

    monkeypatch.setattr(main, "_call_ors_get_route", raise_unexpected)

    body = {
        "coordinates": [
            {"lon": 0.0, "lat": 0.0},
            {"lon": 1.0, "lat": 1.0}
        ]
    }
    resp = client.post("/route", json=body)
    assert resp.status_code == 500
    assert "internal server error" in resp.json()["detail"].lower()
