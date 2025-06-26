import { atom } from 'jotai'
import * as L from 'leaflet'

export const drawnItemsAtom = atom<L.FeatureGroup>(new L.FeatureGroup())

export const drawnZonesGeoJsonAtom = atom((get) =>
    get(drawnItemsAtom).toGeoJSON() as GeoJSON.FeatureCollection
)