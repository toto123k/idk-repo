import { Marker, Popup } from 'react-leaflet'
import { useRef, useState, useCallback } from 'react'
import type { LocationData } from '../../types/types'
import { LocationDetailsPopup } from '../LocationDetailsPopup/LocationDetailsPopup'
import { createDivIcon } from '../../utils/createDivIcon'

interface Props extends LocationData {
    onMarkerEndDrag?: (updated: LocationData["position"]) => void
}



export const LocationMarker: React.FC<Props> = ({
    type,
    position,
    onMarkerEndDrag,
}) => {
    const markerRef = useRef<L.Marker>(null)
    const [currentPosition, setCurrentPosition] = useState<LocationData["position"]>(position)

    const onDragEnd = useCallback(() => {
        const pos = markerRef.current?.getLatLng()
        if (pos) {
            setCurrentPosition(() => {
                onMarkerEndDrag?.(pos)
                return pos
            })
        }
    }, [onMarkerEndDrag])

    return (
        <Marker
            position={position}
            icon={createDivIcon(type)}
            draggable={true}
            ref={markerRef}
            eventHandlers={{ dragend: onDragEnd }}
        >
            <Popup>
                <LocationDetailsPopup position={currentPosition} type={type} />
            </Popup>
        </Marker>
    )
}
