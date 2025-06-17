// src/state/routeAtoms.ts
import { atom } from 'jotai'
import type { LatLngTuple } from '../types'
import { api } from '../api/api'
import { restrictedZonesAtom } from './restrictedZonesAtoms'

// — source / target / waypoints  
export const srcPosAtom = atom<LatLngTuple | null>(null)
export const tgtPosAtom = atom<LatLngTuple | null>(null)
export const waypointsAtom = atom<LatLngTuple[]>([])

// — loading + error  
export const loadingAtom = atom<boolean>(false)
export const errorAtom = atom<string | null>(null)

// — aggregate [src, ...waypoints, tgt] into one flat array  
export const allPointsAtom = atom<LatLngTuple[]>((get) => {
    const src = get(srcPosAtom)
    const tgt = get(tgtPosAtom)
    const wps = get(waypointsAtom)
    return [src, ...wps, tgt].filter((p): p is LatLngTuple => p !== null)
})

// — private storage for the fetched route  
const _routeDataAtom = atom<LatLngTuple[] | null>(null)

// — public read-only view of the route  
export const routeAtom = atom((get) => get(_routeDataAtom))

/**
 * Write-only atom: fetches from your backend `/route`,
 * passing in both:
 *  • allPoints: [start, …, end]
 *  • avoidZones: array of polygons to skip
 */
export const fetchRouteAtom = atom(
    null,
    async (get, set) => {
        const points = get(allPointsAtom)
        const zones = get(restrictedZonesAtom)

        // reset if not enough points
        if (points.length < 2) {
            set(_routeDataAtom, null)
            return
        }

        const avoidZones: LatLngTuple[][] = zones.map(zone =>
            zone.coordinates.map(c => [c.lat, c.lng] as LatLngTuple)
        )

        set(loadingAtom, true)
        set(errorAtom, null)
        try {
            // pass the zones (or [] if none)
            const route = await api.fetchRoute(points, avoidZones)
            set(_routeDataAtom, route)
        } catch (err: any) {
            set(errorAtom, err.message ?? 'Failed to fetch route')
            set(_routeDataAtom, null)
        } finally {
            set(loadingAtom, false)
        }
    }
)
