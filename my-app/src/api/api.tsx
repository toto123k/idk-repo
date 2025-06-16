import axios from 'axios'
import type { LatLngTuple, RouteResponse } from '../types'



class ApiService {
    private baseURL: string

    constructor(baseURL: string = 'http://localhost:8000') {
        this.baseURL = baseURL
    }

    /**
     * Fetch route between two points
     * @param source [lat, lng] tuple for starting point
     * @param target [lat, lng] tuple for destination
     * @returns Promise resolving to array of [lng, lat] coordinates
     */
    async fetchRoute(source: LatLngTuple, target: LatLngTuple): Promise<[number, number][]> {
        try {
            // API expects "lng,lat" format, so flip the coordinates
            const startParam = `${source[1]},${source[0]}`
            const endParam = `${target[1]},${target[0]}`

            const response = await axios.get<RouteResponse>(`${this.baseURL}/route`, {
                params: {
                    start: startParam,
                    end: endParam
                },
                timeout: 10000 // 10 second timeout
            })

            if (!Array.isArray(response.data.route)) {
                throw new Error('Invalid route data received')
            }

            return response.data.route
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Route fetch failed:', error.message)
                if (error.response) {
                    throw new Error(`Server error: ${error.response.status}`)
                } else if (error.request) {
                    throw new Error('Network error: Unable to reach server')
                }
            }
            throw error
        }
    }
}

// Export singleton instance
export const api = new ApiService()
