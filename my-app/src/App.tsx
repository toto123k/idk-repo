import { useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import { MapShell } from './components/MapShell/MapShell'
import { RoutingLayer } from './components/RoutingLayer/RoutingLayer'
import { MapLayerControlPanel } from './components/MapLayerControlPanel/MapLayerControlPanel'
import { AttributionControl, ZoomControl } from 'react-leaflet'
import type { SxProps, Theme } from '@mui/material/styles';
import { AddWaypointButton } from './components/AddWaypointButton/AddWaypointButton'
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
        <RoutingLayer initialSource={source} initialTarget={target} />
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