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

    /**
     * Fetch route between multiple points, avoiding any restricted polygons.
     *
     * @param points An array of [lat, lng] tuples. Must contain at least start & end.
     * @param avoidZones Optional array of polygons, each polygon is an array of [lat, lng].
     */
    async fetchRoute(points: LocationData["position"][], avoidZones: LocationData["position"][][] = []
    ): Promise<LocationData["position"][]> {
        if (points.length < 2) {
            throw new Error('At least two points (start and end) are required.')
        }

        const payload: ApiRouteRequestPayload = {
            coordinates: points,
            // only include if non-empty
            ...(avoidZones.length > 0 ? { avoid_zones: avoidZones } : {}),
        }

        try {
            const resp = await axios.post<RouteResponse>(
                `${this.baseURL}/route`,
                payload,
                { timeout: 15_000 }
            )
            if (!Array.isArray(resp.data.route)) {
                throw new Error('Invalid route data from server')
            }
            return resp.data.route
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    const detail = err.response.data?.detail ?? err.response.statusText
                    throw new Error(`Server ${err.response.status}: ${JSON.stringify(detail)}`)
                } else if (err.request) {
                    throw new Error('Network error: could not reach server')
                }
            }
            throw err
        }
    }
}
export const api = new ApiService();
