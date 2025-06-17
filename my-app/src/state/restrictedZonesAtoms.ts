// src/state/restrictedZonesAtoms.ts
import { atom } from 'jotai'
import type { getDrawHandlers } from '../components/RestrictedZonesLayer/RestrictedZonesLayer';

// — your zone types —
export type LatLng = { lat: number; lng: number }
export type RestrictedZone = {
  id: string
  name: string
  coordinates: LatLng[]
  color: string
  fillColor: string
  fillOpacity: number
}

export type DrawHandlers = {
  startDraw?: () => void;
  cancelDraw?: () => void;
  completeDraw?: () => void;
  startEdit?: () => void;
  saveEdit?: () => void;
  cancelEdit?: () => void;
  startDelete?: () => void;
  saveDelete?: () => void;
};
export type DrawingMode = 'idle' | 'drawing' | 'editing' | 'deleting';

export const restrictedZonesAtom = atom<RestrictedZone[]>([])
export const drawingModeAtom = atom<'idle' | 'drawing' | 'editing' | 'deleting'>('idle')
export const selectedZoneIdAtom = atom<string | null>(null)
export const selectedZoneAtom = atom<RestrictedZone | null>((get) => {
  const zones = get(restrictedZonesAtom)
  const id = get(selectedZoneIdAtom)
  return zones.find(z => z.id === id) ?? null
})
export const isDrawingAtom = atom((get) => get(drawingModeAtom) === 'drawing')
export const isEditingAtom = atom((get) => get(drawingModeAtom) === 'editing')
export const isDeletingAtom = atom((get) => get(drawingModeAtom) === 'deleting')
export const tempPolygonAtom = atom<LatLng[]>([])


export const drawHandlersAtom = atom<ReturnType<typeof getDrawHandlers> | null>(null)
