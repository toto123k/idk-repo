import { useAtom, useAtomValue } from 'jotai'
import { Polyline } from 'react-leaflet'
import { useRouteToast } from '../../hooks/useRouteToast'
import { LocationMarker } from '../LocationMarker/LocationMarker'
import {
    srcPosAtom,
    tgtPosAtom,
    routeAtom,
    loadingAtom,
    errorAtom,
} from '../../state/routingAtoms'
import { RoutingControlPanel } from './RoutingControlPanel/RoutingControlPanel'


export const RoutingLayer = () => {

    const [srcPos, setSrcPos] = useAtom(srcPosAtom)
    const [tgtPos, setTgtPos] = useAtom(tgtPosAtom)
    const route = useAtomValue(routeAtom)
    const loading = useAtomValue(loadingAtom)
    const error = useAtomValue(errorAtom)

    useRouteToast(loading, error)

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
        </>
    )
}
