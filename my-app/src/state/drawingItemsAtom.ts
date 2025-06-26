// src/state/mapState.ts
import { atom, createStore } from 'jotai';
import * as L from 'leaflet';
import type { FeatureGroup } from 'leaflet';

export const drawnItemsAtom = atom<FeatureGroup>(new L.FeatureGroup());

export const polygonStore = createStore();

export function getUpdatedZonesGeoJSON(): GeoJSON.FeatureCollection {
    const drawnItems = polygonStore.get(drawnItemsAtom);
    return drawnItems.toGeoJSON() as GeoJSON.FeatureCollection;
}