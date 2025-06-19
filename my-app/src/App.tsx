// src/App.tsx
import { RouteMap } from './components/RouteMap/RouteMap'
import type { LocationData } from './types/types'

const source: LocationData["position"] = { lat: 32.0853, lng: 34.7818 }
const target: LocationData["position"] = { lat: 31.7683, lng: 35.2137 }

export const App = () => (
  <RouteMap source={source} target={target} />
)
