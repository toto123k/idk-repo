import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Polyline } from 'react-leaflet'
import { useRouteToast } from '../../hooks/useRouteToast'
import type { LatLngLiteral } from 'leaflet'
import { LocationMarker } from '../LocationMarker/LocationMarker'
import {
    srcPosAtom,
    tgtPosAtom,
    routeAtom,
    loadingAtom,
    errorAtom,
} from '../../state/routingAtoms'
import { RoutingControlPanel } from './RoutingControlPanel/RoutingControlPanel'

const RouteToastManager = () => {
    const [loading] = useAtom(loadingAtom)
    const [error] = useAtom(errorAtom)
    useRouteToast(loading, error)
    return null
}

interface RoutingLayerProps {
    initialSource: LatLngLiteral
    initialTarget: LatLngLiteral
}

export const RoutingLayer: React.FC<RoutingLayerProps> = ({
    initialSource,
    initialTarget,
}) => {
    useHydrateAtoms([
        [srcPosAtom, initialSource],
        [tgtPosAtom, initialTarget],
    ])

    const [srcPos, setSrcPos] = useAtom(srcPosAtom)
    const [tgtPos, setTgtPos] = useAtom(tgtPosAtom)
    const [route] = useAtom(routeAtom)
    
    return (
        <>
            <LocationMarker
                type='source'
                position={{ lat: srcPos.lat, lng: srcPos.lng }}
                onMarkerEndDrag={({ lat, lng }) => setSrcPos({ lat, lng })}
            />
            <LocationMarker
                type='target'
                position={{ lat: tgtPos.lat, lng: tgtPos.lng }}
                onMarkerEndDrag={({ lat, lng }) => setTgtPos({ lat, lng })}
            />
            {route && (
                <Polyline positions={route} pathOptions={{ color: 'red', weight: 4 }} />
            )}
            <RoutingControlPanel />
            <RouteToastManager />
        </>
    )
}
