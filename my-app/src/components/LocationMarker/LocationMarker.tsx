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
    order,
    onMarkerEndDrag,
}) => {
    const markerRef = useRef<L.Marker>(null)
    const [currentPosition, setCurrentPosition] = useState<LocationData["position"]>(position)

    const onDragEnd = useCallback(() => {
        const newPosition = markerRef.current?.getLatLng()
        if (newPosition) {
            setCurrentPosition(() => {
                onMarkerEndDrag?.(newPosition)
                return newPosition
            })
        }
    }, [onMarkerEndDrag])

    return (
        <Marker
            position={position}
            icon={createDivIcon({ type, order })}
            draggable={true}
            ref={(marker) => {
                if (marker) {
                    markerRef.current = marker

                    marker.once('add', () => {
                        const element = marker.getElement()
                        if (element) element.setAttribute('data-testid', `location-marker-${type}${type === "waypoint" ? "-" + order : ""}`)
                    })
                }
            }}
            eventHandlers={{ dragend: onDragEnd }}

        >
            <Popup>
                <LocationDetailsPopup position={currentPosition} type={type} order={order} />
            </Popup>
        </Marker>
    )
}
