import { atom } from 'jotai';
import { api } from '../api/api';
import type { LatLngTuple } from '../types';

// State Atoms
export const srcPosAtom = atom<LatLngTuple>([0, 0]);
export const tgtPosAtom = atom<LatLngTuple>([0, 0]);
export const routeAtom = atom<LatLngTuple[] | null>(null);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// Action Atom
export const fetchRouteAtom = atom(
    null,
    async (get, set) => {
        set(loadingAtom, true);
        set(errorAtom, null);
        set(routeAtom, null);
        try {
            const src = get(srcPosAtom);
            const tgt = get(tgtPosAtom);
            const data = await api.fetchRoute(src, tgt);
            set(routeAtom, data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            set(errorAtom, msg);
        } finally {
            set(loadingAtom, false);
        }
    }
);
