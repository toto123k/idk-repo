import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { useState, useMemo } from 'react'
import { useRoute } from '../../hooks/useRoute'
import { useRouteToast } from '../../hooks/useRouteToast'
import { LocationMarker } from '../LocationMarker/LocationMarker'
import type { LatLngTuple } from '../../types'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'

interface RouteMapProps {
    source: LatLngTuple
    target: LatLngTuple
}

export const RouteMap: React.FC<RouteMapProps> = ({ source, target }) => {
    const [srcPos, setSrcPos] = useState(source)
    const [tgtPos, setTgtPos] = useState(target)
    const { route, loading, error } = useRoute(srcPos, tgtPos)

    // <-- new hook handles all toast side-effects
    useRouteToast(loading, error)

    const center = useMemo<LatLngTuple>(
        () => [(srcPos[0] + tgtPos[0]) / 2, (srcPos[1] + tgtPos[1]) / 2],
        [srcPos, tgtPos]
    )

    return (
        <MapContainer center={center} zoom={8} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                attribution='© <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            <LocationMarker
                data={{ type: 'source', position: srcPos }}
                onMarkerEndDrag={d => setSrcPos(d.position)}
            />

            <LocationMarker
                data={{ type: 'target', position: tgtPos }}
                onMarkerEndDrag={d => setTgtPos(d.position)}
            />

            {!loading && route && (
                <Polyline
                    positions={route.map(([lng, lat]) => [lat, lng] as LatLngTuple)}
                    pathOptions={{ color: 'red', weight: 4 }}
                />
            )}
        </MapContainer>
    )
}
