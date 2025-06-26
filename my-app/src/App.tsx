import { useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { MapShell } from './components/MapShell/MapShell'
import { RoutingLayer } from './components/RoutingLayer/RoutingLayer'
import type { LocationData } from './types/types'
import { initialSource, initialTarget } from './constants/initalLocations'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App = () => {
  const center = useMemo<LocationData["position"]>(
    () => {
      return {
        lat: (initialSource.lat + initialTarget.lat) / 2,
        lng: (initialSource.lng + initialTarget.lng) / 2,
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
        <RoutingLayer />
      </MapShell>
    </ThemeProvider>
  )
}