import { useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { MapShell } from './components/MapShell/MapShell'
import { RoutingLayer } from './components/RoutingLayer/RoutingLayer'
import type { LocationData } from './types/types'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const source: LocationData["position"] = { lat: 32.0853, lng: 34.7818 }
const target: LocationData["position"] = { lat: 31.7683, lng: 35.2137 }

export const App = () => {
  const center = useMemo<LocationData["position"]>(
    () => {
      return {
        lat: (source.lat + target.lat) / 2,
        lng: (source.lng + target.lng) / 2,
      }
    },
    []
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <ToastContainer
        position="bottom-center"
        theme={theme.palette.mode}
        hideProgressBar={false}
      />

      <MapShell center={center} zoom={9}>
        <RoutingLayer initialSource={source} initialTarget={target} />
      </MapShell>
    </ThemeProvider>
  )
}