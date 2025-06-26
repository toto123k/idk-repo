import { useAtom, useAtomValue } from 'jotai'
import { Polyline } from 'react-leaflet'
import { useRouteToast } from '../../hooks/useRouteToast'
import type { LatLngLiteral } from 'leaflet'

import {
    sourcePositionAtom,
    targetPositionAtom,
    splitWaypointsAtom,
    allPointsAtom,
    routeAtom,
    loadingAtom,
    errorAtom,
    waypointsAtom,
} from '../../state/routingAtoms'

import { WaypointMarker } from '../WaypointMarker/WaypointMarker'
import { LocationMarker } from '../LocationMarker/LocationMarker'
import { RoutingControlPanel } from './RoutingControlPanel/RoutingControlPanel'
import { useHydrateAtoms } from 'jotai/utils'
import "./RoutingLayer.css"

export const RoutingLayer: React.FC<{
    initialSource: LatLngLiteral
    initialTarget: LatLngLiteral
    initialWaypoints?: LatLngLiteral[]
}> = ({ initialSource, initialTarget, initialWaypoints = [] }) => {
    useHydrateAtoms([
        [sourcePositionAtom, initialSource],
        [targetPositionAtom, initialTarget],
        [waypointsAtom, initialWaypoints],
    ])

    const [sourcePosition, setSourcePosition] = useAtom(sourcePositionAtom)
    const [targetPosition, setTargetPosition] = useAtom(targetPositionAtom)

    const waypointAtoms = useAtomValue(splitWaypointsAtom)
    const allPoints = useAtomValue(allPointsAtom)
    const route = useAtomValue(routeAtom)
    const loading = useAtomValue(loadingAtom)
    const error = useAtomValue(errorAtom)

    useRouteToast(loading, error)

    return (
        <>
            {allPoints.length >= 2 && (
                <Polyline positions={allPoints} className="polyline-outline waypoints-polyline" pathOptions={{ weight: 6, color: 'green' }} />
            )}

            {sourcePosition && (
                <LocationMarker
                    type="source"
                    position={sourcePosition}
                    onMarkerEndDrag={pos => setSourcePosition(pos)}
                />
            )}

            {waypointAtoms.map((atom, idx) => (
                <WaypointMarker key={idx} waypointAtom={atom} order={idx + 1} />
            ))}

            {targetPosition && (
                <LocationMarker
                    type="target"
                    position={targetPosition}
                    onMarkerEndDrag={pos => setTargetPosition(pos)}
                />
            )}

            {route && route.length > 0 && (
                <Polyline positions={route} className="polyline-outline route-polyline" pathOptions={{ weight: 5, color: '#FF0000' }} />
            )}

            <RoutingControlPanel />
        </>
    )
}
