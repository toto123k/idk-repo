export interface LocationData {
    type: 'source' | 'target';
    position: [number, number];
}

// Define the structure for a map layer
export interface MapLayer {
    id: string;
    name: string;
    url: string;
    attribution: string;
}

