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

const createMarkerIcon = (data: LocationData) => {
    const colors = COLORS[data.type]
    const Icon = data.type === 'source' ? MyLocation : Flag

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
            <span className="marker-label">{data.type}</span>
        </div>
    )

    return L.divIcon({
        html,
        className: 'marker-div-icon',
        iconSize: [85, 28], // Adjusted size for new label and padding
        iconAnchor: [14, 14], // Center of the circular icon
        popupAnchor: [0, -14], // Position popup nicely above the icon
    })
}

interface LocationMarkerProps {
    data: LocationData
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ data }) => {
    const markerRef = useRef<L.Marker>(null)
    // State to manage position changes from dragging
    const [currentData, setCurrentData] = useState<LocationData>(data)

    const handleDragEnd = useCallback(() => {
        const marker = markerRef.current
        if (marker) {
            const newPosition = marker.getLatLng()
            const newPos: [number, number] = [newPosition.lat, newPosition.lng]
            setCurrentData(prev => ({ ...prev, position: newPos }))
        }
    }, [])

    return (
        <Marker
            position={currentData.position}
            icon={createMarkerIcon(currentData)}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
                dragend: handleDragEnd
            }}
        >
            <Popup>
                {/* The popup now uses the potentially updated data */}
                <LocationDetailsPopup data={currentData} />
            </Popup>
        </Marker>
    )
}

export default LocationMarker;