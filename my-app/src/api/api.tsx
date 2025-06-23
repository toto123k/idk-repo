import axios from 'axios'
import type { RouteResponse } from '../types'
import type { LocationData } from '../types/types';



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
    async fetchRoute(source: LocationData["position"], target: LocationData["position"]): Promise<LocationData["position"][]> {
        try {
            const payload = {
                start: {
                    lat: source.lat,
                    lon: source.lng
                },
                end: {
                    lat: target.lat,
                    lon: target.lng
                }
            };

            const response = await axios.post<RouteResponse>(
                `${this.baseURL}/route`,
                payload, // The JSON body for the POST request
                {
                    timeout: 10000 // 10 second timeout
                }
            );

            return response.data.route;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Route fetch failed:', error.message);
                if (error.response) {

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
