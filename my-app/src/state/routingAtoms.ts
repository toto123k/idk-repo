import { atom } from 'jotai';
import type { LatLngTuple } from '../types';
import { api } from '../api/api';

export const srcPosAtom = atom<LatLngTuple | null>(null);
export const tgtPosAtom = atom<LatLngTuple | null>(null);
export const waypointsAtom = atom<LatLngTuple[]>([]);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);


export const allPointsAtom = atom<LatLngTuple[]>((get) => {
    const src = get(srcPosAtom);
    const tg = get(tgtPosAtom);
    const waypoints = get(waypointsAtom);
    return [src, ...waypoints, tg].filter((p): p is LatLngTuple => p !== null);
});


const _routeDataAtom = atom<[number, number][] | null>(null);

export const routeAtom = atom((get) => get(_routeDataAtom));

export const fetchRouteAtom = atom(
    null, // it has no value
    async (get, set) => {
        const allPoints = get(allPointsAtom);

        if (allPoints.length < 2) {
            set(_routeDataAtom, null); 
            return;
        }

        set(loadingAtom, true);
        set(errorAtom, null);
        try {
            const routeData = await api.fetchRoute(allPoints);
            // Now you set the simple, private data atom. This is type-safe and clear.
            set(_routeDataAtom, routeData);
        } catch (e: any) {
            set(errorAtom, e.message || 'An unknown error occurred.');
            set(_routeDataAtom, null); // Clear route on error
        } finally {
            set(loadingAtom, false);
        }
    }
);