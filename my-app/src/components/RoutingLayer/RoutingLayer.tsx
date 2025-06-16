// src/components/RoutingLayer/RoutingLayer.tsx

import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { Polyline } from 'react-leaflet';

import { useRouteToast } from '../../hooks/useRouteToast';
import type { LatLngTuple } from '../../types';
import { LocationMarker } from '../LocationMarker/LocationMarker';
import {
    srcPosAtom,
    tgtPosAtom,
    waypointsAtom,
    allPointsAtom,
    routeAtom,
    loadingAtom,
    errorAtom,
} from '../../state/routingAtoms';
import { RoutingControlPanel } from './RoutingControlPanel/RoutingControlPanel';
import './RoutingLayer.css';

interface RoutingLayerProps {
    initialSource: LatLngTuple;
    initialTarget: LatLngTuple;
    initialWaypoints?: LatLngTuple[];
}

export const RoutingLayer: React.FC<RoutingLayerProps> = ({
    initialSource,
    initialTarget,
    initialWaypoints = [],
}) => {
    useHydrateAtoms([
        [srcPosAtom, initialSource],
        [tgtPosAtom, initialTarget],
        [waypointsAtom, initialWaypoints],
    ]);

    const [srcPos, setSrcPos] = useAtom(srcPosAtom);
    const [tgtPos, setTgtPos] = useAtom(tgtPosAtom);
    const [waypoints, setWaypoints] = useAtom(waypointsAtom);
    const [allPoints] = useAtom(allPointsAtom);
    const [route] = useAtom(routeAtom);

    const handleWaypointDrag = (
        index: number,
        newPosition: LatLngTuple
    ) => {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = newPosition;
        setWaypoints(newWaypoints);
    };

    const [loading] = useAtom(loadingAtom);
    const [error] = useAtom(errorAtom);
    useRouteToast(loading, error);

    return (
        <>
            {allPoints.length >= 2 && (
                <Polyline
                    positions={allPoints}
                    className="polyline-outline"

                    pathOptions={{
                        color: 'green',
                        weight: 6,
                    }}
                />
            )}

            {srcPos && (
                <LocationMarker
                    data={{ type: 'source', position: srcPos }}
                    onMarkerEndDrag={(d) => setSrcPos(d.position)}
                />
            )}

            {waypoints.map((pos, index) => (
                <LocationMarker
                    key={`waypoint-${index}-${pos[0]}-${pos[1]}`}
                    data={{ type: 'waypoint', order: index + 1, position: pos }}
                    onMarkerEndDrag={(d) => handleWaypointDrag(index, d.position)}
                />
            ))}

            {tgtPos && (
                <LocationMarker
                    data={{ type: 'target', position: tgtPos }}
                    onMarkerEndDrag={(d) => setTgtPos(d.position)}
                />
            )}

            {route && route.length > 0 && (
                <Polyline
                    positions={route.map(([lng, lat]) => [lat, lng] as LatLngTuple)}
                    className="polyline-outline"

                    pathOptions={{ color: '#FF0000', weight: 5 }}
                />
            )}

            <RoutingControlPanel />
        </>
    );
};