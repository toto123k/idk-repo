import { atom } from 'jotai'
import { api } from '../api/api'
import type { LatLngLiteral } from 'leaflet'
import { splitAtom } from 'jotai/utils'

export const sourcePositionAtom = atom<LatLngLiteral>({ lat: 0, lng: 0 })
export const targetPositionAtom = atom<LatLngLiteral>({ lat: 0, lng: 0 })
export const routeAtom = atom<LatLngLiteral[] | null>(null)
export const loadingAtom = atom<boolean>(false)
export const errorAtom = atom<string | null>(null)
export const waypointsAtom = atom<LatLngLiteral[]>([])
export const splitWaypointsAtom = splitAtom(waypointsAtom)

export const allPointsAtom = atom<LatLngLiteral[]>((get) => {
    const src = get(sourcePositionAtom);
    const tg = get(targetPositionAtom);
    const waypoints = get(waypointsAtom);
    return [src, ...waypoints, tg].filter((p): p is LatLngLiteral => p !== null);
});



export const fetchRouteAtom = atom(
    null,
    async (get, set) => {
        const allPoints = get(allPointsAtom);

        if (allPoints.length < 2) {
            set(routeAtom, null);
            return;
        }

        set(loadingAtom, true);
        set(errorAtom, null);
        try {
            const routeData = await api.fetchRoute(allPoints);

            set(routeAtom, routeData);
        } catch (e: any) {
            set(errorAtom, e.message || 'An unknown error occurred.');
            set(routeAtom, null);
        } finally {
            set(loadingAtom, false)
        }
    }
);
