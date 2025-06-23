// src/state/restrictedZonesAtoms.ts
import { atom } from 'jotai'
import type { FeatureCollection } from 'geojson'

export type LatLng = { lat: number; lng: number }

export type RestrictedZone = {
  coordinates: LatLng[]
}
