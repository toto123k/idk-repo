// components/LocationMarker/LocationMarker.tsx
import { Marker, Popup } from 'react-leaflet'
import { useRef, useState, useCallback } from 'react'
import type { LocationData } from '../../types/types'
import { LocationDetailsPopup } from '../LocationDetailsPopup/LocationDetailsPopup'
import { createDivIcon } from '../../utils/createDivIcon'

interface Props {
    data: LocationData
    onMarkerEndDrag?: (updated: LocationData) => void
}

export const LocationMarker: React.FC<Props> = ({
    data,
    onMarkerEndDrag,
}) => {
    const markerRef = useRef<L.Marker>(null)
    const [currentData, setCurrentData] = useState(data)

    const onDragEnd = useCallback(() => {
        const pos = markerRef.current?.getLatLng()
        if (pos) {
            setCurrentData(prev => {
                const updated = { ...prev, position: [pos.lat, pos.lng] as [number, number] }
                onMarkerEndDrag?.(updated)
                return updated
            })
        }
    }, [onMarkerEndDrag])

    return (
        <Marker
            position={currentData.position}
            icon={createDivIcon(currentData)}
            draggable
            ref={(marker) => {
                if (marker) {
                    markerRef.current = marker

                    marker.once('add', () => {
                        const el = marker.getElement()
                        if (el) el.setAttribute('data-testid', `location-marker-${data.type}${data.type === "waypoint" ? "-" + data.order : ""}`)
                    })
                }
            }}
            eventHandlers={{ dragend: onDragEnd }}

        >
            <Popup>
                <LocationDetailsPopup data={currentData} />
            </Popup>
        </Marker>
    )
}
