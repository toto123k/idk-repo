import type { LatLngLiteral } from "leaflet";

export interface LocationData {
    type: 'source' | 'target';
    position: LatLngLiteral
}