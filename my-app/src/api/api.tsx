import axios from 'axios'
import type { LatLngTuple } from '../types'
import type { RouteResponse } from '../types'

interface ApiRouteRequestPayload {
    coordinates: { lat: number; lon: number }[]
    avoid_zones?: { lon: number; lat: number }[][]
}

export class ApiService {
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
    async fetchRoute(
        points: LatLngTuple[],
        avoidZones: LatLngTuple[][] = []
    ): Promise<LatLngTuple[]> {
        if (points.length < 2) {
            throw new Error('At least two points (start and end) are required.')
        }
        // map to API‐friendly keys
        const apiCoords = points.map(([lat, lon]) => ({ lat, lon }))
        const apiZones = avoidZones.map(polygon =>
            polygon.map(([lat, lon]) => ({ lat, lon }))
        )
        const payload: ApiRouteRequestPayload = {
            coordinates: apiCoords,
            // only include if non-empty
            ...(apiZones.length > 0 ? { avoid_zones: apiZones } : {}),
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

export const api = new ApiService()
