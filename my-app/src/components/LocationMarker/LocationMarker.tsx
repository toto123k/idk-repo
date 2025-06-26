import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { LatLngLiteral } from 'leaflet'
import type { LocationData } from '../../types/types'
import { LocationDetailsPopup } from '../LocationDetailsPopup/LocationDetailsPopup'
import { createDivIcon } from '../../utils/createDivIcon'

interface Props extends LocationData {
    onMarkerEndDrag?: (pos: LocationData['position']) => void
}

export const LocationMarker: React.FC<Props> = ({
    type, position, order, onMarkerEndDrag
}) => {
    const markerRef = useRef<L.Marker>(null)
    const [currentPosition, setCurrentPosition] = useState(position)

    useEffect(() => {
        setCurrentPosition(position)
    }, [position])

    const handleDragEnd = useCallback(() => {
        const newPos = markerRef.current?.getLatLng()
        if (newPos) {
            setCurrentPosition(newPos)
            onMarkerEndDrag?.(newPos)
        }
    }, [onMarkerEndDrag])

    const handlePositionUpdate = (newPos: LatLngLiteral) => {
        setCurrentPosition(newPos)
        markerRef.current?.setLatLng(newPos)
        onMarkerEndDrag?.(newPos)
    }

    return (
        <Marker
            position={currentPosition}
            draggable
            icon={createDivIcon({ type, order })}
            ref={m => {
                if (m) {
                    markerRef.current = m
                    m.once('add', () => {
                        const el = m.getElement()
                        if (el) el.setAttribute(
                            'data-testid',
                            `location-marker-${type}${type === 'waypoint' ? '-' + order : ''}`
                        )
                    })
                }
            }}
            eventHandlers={{ dragend: handleDragEnd }}
        >
            <Popup>
                <LocationDetailsPopup
                    position={currentPosition}
                    type={type}
                    order={order}
                    onPositionUpdate={handlePositionUpdate}
                />
            </Popup>
        </Marker>
    )
}
