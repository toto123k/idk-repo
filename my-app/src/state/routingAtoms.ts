import { atom } from 'jotai'
import { api } from '../api/api'
import type { LatLngLiteral } from 'leaflet'
import { initialSource, initialTarget } from '../constants/initalLocations'

export const srcPosAtom = atom<LatLngLiteral>(initialSource)
export const tgtPosAtom = atom<LatLngLiteral>(initialTarget)
export const routeAtom = atom<LatLngLiteral[] | null>(null)
export const loadingAtom = atom<boolean>(false)
export const errorAtom = atom<string | null>(null)

export const fetchRouteAtom = atom(
    null,
    async (get, set) => {
        set(loadingAtom, true)
        set(errorAtom, null)
        set(routeAtom, null)
        try {
            const src = get(srcPosAtom)
            const tgt = get(tgtPosAtom)
            const data = await api.fetchRoute(src, tgt)
            set(routeAtom, data)
        } catch (err) {
            set(errorAtom, err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
            set(loadingAtom, false)
        }
    }
)
