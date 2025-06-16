export type LocationType = 'source' | 'target' | 'waypoint'

export interface LocationData {
    type: LocationType
    position: [number, number]
    order?: number // only relevant for waypoints
}

// Define the structure for a map layer
export interface MapLayer {
    id: string;
    name: string;
    url: string;
    attribution: string;
}

