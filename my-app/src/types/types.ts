import type { LatLngLiteral } from "leaflet"

export type LocationType = 'source' | 'target' | 'waypoint'

export interface LocationData {
    type: LocationType
    position: LatLngLiteral
    order?: number
}

export interface RouteResponse {
    route: LocationData["position"][]
}
