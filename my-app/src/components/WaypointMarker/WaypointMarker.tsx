import { useAtom } from 'jotai'
import type { WritableAtom } from 'jotai'
import type { LatLngLiteral } from 'leaflet'
import { LocationMarker } from '../LocationMarker/LocationMarker'

interface WaypointMarkerProps {
    waypointAtom: WritableAtom<LatLngLiteral, any, void>
    order: number
}

export const WaypointMarker: React.FC<WaypointMarkerProps> = ({ waypointAtom, order }) => {
    const [position, setPosition] = useAtom(waypointAtom)
    return (
        <LocationMarker
            type="waypoint"
            order={order}
            position={position}
            onMarkerEndDrag={setPosition}
        />
    )
}
