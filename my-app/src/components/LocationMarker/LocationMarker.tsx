import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import ReactDOMServer from 'react-dom/server'
import { MyLocation, Flag } from '@mui/icons-material'
import type { LocationData } from '../../types/types'
import { LocationDetailsPopup } from '../LocationDetailsPopup/LocationDetailsPopup'
import { useRef, useCallback, useState } from 'react'
import './LocationMarker.css'

const COLORS = {
    source: { bg: '#1976d2', border: '#1565c0' },
    target: { bg: '#d32f2f', border: '#c62828' }
}

const createMarkerIcon = (type: LocationData['type']) => {
    const colors = COLORS[type]
    const Icon = type === 'source' ? MyLocation : Flag

    const html = ReactDOMServer.renderToString(
        <div className="marker-container">
            <div
                className="marker-icon-wrapper"
                style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border
                }}
            >
                <Icon className="marker-icon" />
            </div>
            <span className="marker-label">{type}</span>
        </div>
    )

    return L.divIcon({
        html,
        className: 'marker-div-icon',
        iconSize: [85, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    })
}

type LocationMarkerProps = LocationData;

export const LocationMarker: React.FC<LocationMarkerProps> = ({ position, type }) => {
    const markerRef = useRef<L.Marker>(null)
    const [currentPosition, setCurrentPosition] = useState<LocationData["position"]>(position)

    const handleDragEnd = useCallback(() => {
        const marker = markerRef.current
        if (marker) {
            const newPosition = marker.getLatLng()
            setCurrentPosition(newPosition)
        }
    }, [])

    return (
        <Marker
            position={position}
            icon={createMarkerIcon(type)}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
                dragend: handleDragEnd
            }}
        >
            <Popup>
                <LocationDetailsPopup position={currentPosition} type={type} />
            </Popup>
        </Marker>
    )
}

