import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { useState, useMemo } from 'react'
import { useRoute } from '../../hooks/useRoute'
import { useRouteToast } from '../../hooks/useRouteToast'
import { LocationMarker } from '../LocationMarker/LocationMarker'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import type { LocationData } from '../../types/types'

interface RouteMapProps {
    source: LocationData["position"]
    target: LocationData["position"]
}

export const RouteMap: React.FC<RouteMapProps> = ({ source, target }) => {
    const [srcPos, setSrcPos] = useState(source)
    const [tgtPos, setTgtPos] = useState(target)
    const { route, loading, error } = useRoute(srcPos, tgtPos)

    // <-- new hook handles all toast side-effects
    useRouteToast(loading, error)

    const center = useMemo<LocationData["position"]>(
        () => {
            return { lat: ((srcPos.lat + tgtPos.lat) / 2), lng: ((srcPos.lng + tgtPos.lng) / 2) }
        },
        [srcPos, tgtPos]
    )

    return (
        <MapContainer center={center} zoom={8} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                attribution='© <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            <LocationMarker
                type='source'
                position={srcPos}
                onMarkerEndDrag={pos => setSrcPos(pos)}
            />

            <LocationMarker
                position={tgtPos}
                type='target'
                onMarkerEndDrag={pos => setTgtPos(pos)}
            />

            {!loading && route && (
                <Polyline
                    positions={route.map(([lng, lat]) => { return { lat, lng } })}
                    pathOptions={{ color: 'red', weight: 4 }}
                />
            )}
        </MapContainer>
    )
}
