import { atom } from 'jotai'
import { api } from '../api/api'
import type { LatLngLiteral } from 'leaflet'
import { splitAtom } from 'jotai/utils'
import { getUpdatedZonesGeoJSON } from '../components/RestrictedZonesLayer/RestrictedZonesLayer'
import { extractAvoidZones } from '../utils/geo'

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
        const coords = get(allPointsAtom)
        if (coords.length < 2) {
            set(routeAtom, null)
            return
        }

        const geojson = getUpdatedZonesGeoJSON()
        console.log(geojson)
        const avoidZones: LatLngLiteral[][] = extractAvoidZones(geojson)

        set(loadingAtom, true)
        set(errorAtom, null)
        try {
            const route = await api.fetchRoute(coords, avoidZones)
            set(routeAtom, route)
        } catch (err: any) {
            set(errorAtom, err.message ?? 'Failed to fetch route')
            set(routeAtom, null)
        } finally {
            set(loadingAtom, false)
        }
    }
)