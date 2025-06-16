import L from 'leaflet'
import { renderMarkerIcon } from '../components/MarkerIcon/MarkerIcon'

export function createDivIcon(type: 'source' | 'target') {
    return L.divIcon({
        html: renderMarkerIcon({ type }),
        className: 'marker-div-icon',
        iconSize: [85, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    })
}
