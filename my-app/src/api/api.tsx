import axios from 'axios'
import type { LatLngTuple, RouteResponse } from '../types'



class ApiService {
    private baseURL: string

    constructor(baseURL: string = 'http://localhost:8000') {
        this.baseURL = baseURL
    }

    /**
        * Fetch route between two points using a POST request with a JSON body.
        * @param source [lat, lng] tuple for starting point
        * @param target [lat, lng] tuple for destination
        * @returns Promise resolving to array of [lng, lat] coordinates
        */
    async fetchRoute(source: LatLngTuple, target: LatLngTuple): Promise<[number, number][]> {
        try {
            // Construct the payload to match the FastAPI Pydantic model.
            // The source/target tuples are [lat, lng], but the API needs { lon, lat }.
            const payload = {
                start: {
                    lat: source[0],
                    lon: source[1]
                },
                end: {
                    lat: target[0],
                    lon: target[1]
                }
            };

            // Use axios.post, sending the payload as the request body.
            const response = await axios.post<RouteResponse>(
                `${this.baseURL}/route`,
                payload, // The JSON body for the POST request
                {
                    timeout: 10000 // 10 second timeout
                }
            );

            if (!Array.isArray(response.data.route)) {
                throw new Error('Invalid route data received');
            }

            // The API returns an array of [lng, lat] coordinates, which matches the required return type.
            return response.data.route;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Route fetch failed:', error.message);
                if (error.response) {
                    // The server responded with a status code outside the 2xx range
                    // The detail from the FastAPI HTTPException will be in error.response.data
                    const errorDetail = JSON.stringify(error.response.data.detail) || error.response.statusText;
                    throw new Error(`Server error: ${error.response.status} - ${errorDetail}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new Error('Network error: Unable to reach server');
                }
            }
            // Something else happened in setting up the request that triggered an Error
            throw error;
        }
    }
}

// Export singleton instance
export const api = new ApiService()
