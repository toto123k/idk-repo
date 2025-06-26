import L from 'leaflet'
import { renderMarkerIcon } from '../components/MarkerIcon/MarkerIcon'
import type { LocationData } from '../types/types'

export function createDivIcon(data: Pick<LocationData, 'type' | 'order'>) {
    return L.divIcon({
        html: renderMarkerIcon(data),
        className: 'marker-div-icon',
        iconSize: [85, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    })
}
