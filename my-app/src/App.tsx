// src/App.tsx
import { RouteMap } from './components/RouteMap/RouteMap'
import type { LatLngTuple } from './types'

const source: LatLngTuple = [32.0853, 34.7818]
const target: LatLngTuple = [31.7683, 35.2137]

export const App = () => (
  <RouteMap source={source} target={target} />
)
