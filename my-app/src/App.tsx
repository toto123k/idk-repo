import { useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import { MapShell } from './components/MapShell/MapShell'
import { RoutingLayer } from './components/RoutingLayer/RoutingLayer'
import { MapLayerControlPanel } from './components/MapLayerControlPanel/MapLayerControlPanel'
import { AttributionControl, ZoomControl } from 'react-leaflet'
import type { SxProps, Theme } from '@mui/material/styles';
import { AddWaypointButton } from './components/AddWaypointButton/AddWaypointButton'
import { RestrictedZonesLayer } from './components/RestrictedZonesLayer/RestrictedZonesLayer'
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

  const topLeftContainerSx: SxProps<Theme> = {
    position: 'absolute',
    top: (theme) => theme.spacing(2),
    left: (theme) => theme.spacing(2),
    zIndex: (theme) => theme.zIndex.tooltip,
    display: "flex",
    flexDirection: "column",
    gap: 1
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <ToastContainer
        position="bottom-center"
        theme={theme.palette.mode}
        hideProgressBar={false}
        autoClose={1000}
      />

      <MapShell center={center} zoom={9}>
        <RoutingLayer />
        <RestrictedZonesLayer />
        <Box sx={
          topLeftContainerSx
        }>
          <MapLayerControlPanel />
          <AddWaypointButton />

        </Box>
        <AttributionControl position="topright" />
        <ZoomControl position='bottomleft' />

      </MapShell>
    </ThemeProvider>
  )
}