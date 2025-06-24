import axios from 'axios'
import type { LocationData } from '../types/types';
import type { RouteResponse } from '../types';
import type { LatLngLiteral } from 'leaflet';

interface ApiRouteRequestPayload {
    coordinates: LatLngLiteral[];
    avoid_zones?: LatLngLiteral[][];
}

class ApiService {
    private baseURL: string
    constructor(baseURL: string = 'http://localhost:8000') {
        this.baseURL = baseURL
    }

    async fetchRoute(points: LocationData["position"][], avoidZones: LocationData["position"][][] = []
    ): Promise<LocationData["position"][]> {
        if (points.length < 2) {
            throw new Error('At least two points (start and end) are required.')
        }

        const payload: ApiRouteRequestPayload = {
            coordinates: points,
            ...(avoidZones.length > 0 ? { avoid_zones: avoidZones } : {}),
        }

        try {
            const resp = await axios.post<RouteResponse>(
                `${this.baseURL}/route`,
                payload,
            )
            if (!Array.isArray(resp.data.route)) {
                throw new Error('Invalid route data received from server.')
            }
            return resp.data.route
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    throw new Error('The request timed out. The server may be busy, please try again later.');
                }

                if (err.response) {
                    const status = err.response.status;
                    const detail = err.response.data?.detail ?? 'An unknown error occurred.';

                    switch (status) {
                        case 502:
                            throw new Error(`Routing service error: ${detail}`);

                        case 500:
                            throw new Error('An unexpected server error occurred. Please contact support if the problem persists.');

                        case 422: // Unprocessable Entity - Validation error from FastAPI
                            console.error("Validation Error:", err.response.data);
                            throw new Error('Invalid data sent to the server. This is likely a bug.');

                        default:
                            throw new Error(`An unexpected error occurred (Status ${status}).`);
                    }
                } else if (err.request) {
                    throw new Error('Network error: Could not connect to the server. Please check your internet connection.');
                }
            }
            throw err;
        }
    }
}

export const api = new ApiService();