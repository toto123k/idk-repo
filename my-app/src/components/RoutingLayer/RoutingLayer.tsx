import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { Polyline } from 'react-leaflet';
import { useRouteToast } from '../../hooks/useRouteToast';
import type { LatLngTuple } from '../../types';
import { LocationMarker } from '../LocationMarker/LocationMarker';
import {
    srcPosAtom,
    tgtPosAtom,
    routeAtom,
    loadingAtom,
    errorAtom,
} from '../../state/routingAtoms';
import { RoutingControlPanel } from './RoutingControlPanel/RoutingControlPanel';

const RouteToastManager = () => {
    const [loading] = useAtom(loadingAtom);
    const [error] = useAtom(errorAtom);
    useRouteToast(loading, error);
    return null; // Renders nothing
};

interface RoutingLayerProps {
    initialSource: LatLngTuple;
    initialTarget: LatLngTuple;
}

export const RoutingLayer: React.FC<RoutingLayerProps> = ({
    initialSource,
    initialTarget,
}) => {
    // Initialize the global atoms with the props passed to this component
    useHydrateAtoms([
        [srcPosAtom, initialSource],
        [tgtPosAtom, initialTarget],
    ]);

    const [srcPos, setSrcPos] = useAtom(srcPosAtom);
    const [tgtPos, setTgtPos] = useAtom(tgtPosAtom);
    const [route] = useAtom(routeAtom);

    return (
        <>
            <LocationMarker
                data={{ type: 'source', position: srcPos }}
                onMarkerEndDrag={(d) => setSrcPos(d.position)}
            />
            <LocationMarker
                data={{ type: 'target', position: tgtPos }}
                onMarkerEndDrag={(d) => setTgtPos(d.position)}
            />
            {route && (
                <Polyline
                    positions={route.map(([lng, lat]) => [lat, lng] as LatLngTuple)}
                    pathOptions={{ color: 'red', weight: 4 }}
                />
            )}

            <RoutingControlPanel />

            <RouteToastManager />
        </>
    );
};