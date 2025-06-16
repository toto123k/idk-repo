import axios from 'axios';
import type { LatLngTuple } from '../types'; // Assuming this is [lat, lng]

// Assuming RouteResponse is defined in your types file, e.g.:
// export interface RouteResponse {
//   route: [number, number][]; // Array of [lng, lat]
// }
import type { RouteResponse } from '../types';

// The API now expects a list of coordinates in the body
interface ApiRouteRequestPayload {
    coordinates: {
        lat: number;
        lon: number;
    }[];
}

class ApiService {
    private baseURL: string;

    constructor(baseURL: string = 'http://localhost:8000') {
        this.baseURL = baseURL;
    }

    /**
     * Fetch route between multiple points (start, waypoints, end).
     * @param points An array of [lat, lng] tuples. Must contain at least a start and end point.
     * @returns Promise resolving to array of [lng, lat] coordinates for the full route.
     */
    async fetchRoute(points: LatLngTuple[]): Promise<[number, number][]> {
        if (points.length < 2) {
            throw new Error("At least two points (start and end) are required to fetch a route.");
        }

        try {
            const apiCoordinates = points.map(point => ({
                lat: point[0],
                lon: point[1]
            }));

            const payload: ApiRouteRequestPayload = {
                coordinates: apiCoordinates
            };

            const response = await axios.post<RouteResponse>(
                `${this.baseURL}/route`,
                payload,
                {
                    timeout: 15000
                }
            );

            if (!Array.isArray(response.data.route)) {
                throw new Error('Invalid route data received from server');
            }

            return response.data.route;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Route fetch API call failed:', error.message);
                if (error.response) {
                    const errorDetail = error.response.data?.detail ? JSON.stringify(error.response.data.detail) : error.response.statusText;
                    throw new Error(`Server error: ${error.response.status} - ${errorDetail}`);
                } else if (error.request) {
                    throw new Error('Network error: Unable to reach routing server');
                }
            }
            console.error('An unexpected error occurred during route fetch:', error);
            throw error;
        }
    }
}
export const api = new ApiService();