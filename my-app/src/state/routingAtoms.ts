// src/state/routeAtoms.ts
import { atom } from 'jotai'
import type { LatLngTuple } from '../types'
import { api } from '../api/api'
import { getUpdatedZonesGeoJSON } from '../components/RestrictedZonesLayer/RestrictedZonesLayer'

export const srcPosAtom = atom<LatLngTuple | null>(null)
export const tgtPosAtom = atom<LatLngTuple | null>(null)
export const waypointsAtom = atom<LatLngTuple[]>([])
export const loadingAtom = atom<boolean>(false)
export const errorAtom = atom<string | null>(null)

export const allPointsAtom = atom<LatLngTuple[]>((get) => {
    const src = get(srcPosAtom)
    const tgt = get(tgtPosAtom)
    const wps = get(waypointsAtom)
    return [src, ...wps, tgt].filter((p): p is LatLngTuple => p !== null)
})

const _routeDataAtom = atom<LatLngTuple[] | null>(null)
export const routeAtom = atom((get) => get(_routeDataAtom))

export const fetchRouteAtom = atom(
    null,
    async (get, set) => {
        const points = get(allPointsAtom)
        if (points.length < 2) {
            set(_routeDataAtom, null)
            return
        }
        const geojson = getUpdatedZonesGeoJSON()
        const avoidZones: LatLngTuple[][] = geojson.features.flatMap(feat => {
            const geom = feat.geometry
            if (geom.type === 'Polygon') {
                return [
                    geom.coordinates[0].map(([lng, lat]) => [lat, lng] as LatLngTuple)
                ]
            }
            if (geom.type === 'MultiPolygon') {
                return geom.coordinates.map(polygon =>
                    polygon[0].map(([lng, lat]) => [lat, lng] as LatLngTuple)
                )
            }
            return []
        })
        set(loadingAtom, true)
        set(errorAtom, null)
        try {
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
