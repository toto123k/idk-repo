import { useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import { MapShell } from './components/MapShell/MapShell'
import type { LatLngTuple } from './types'
import { RoutingLayer } from './components/RoutingLayer/RoutingLayer'
import { MapLayerControlPanel } from './components/MapLayerControlPanel/MapLayerControlPanel'
import { AttributionControl, ZoomControl } from 'react-leaflet'
import type { SxProps, Theme } from '@mui/material/styles';
import { AddWaypointButton } from './components/AddWaypointButton/AddWaypointButton'
import { RestrictedZonesLayer } from './components/RestrictedZonesLayer/RestrictedZonesLayer'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const INITIAL_SOURCE: LatLngTuple = [32.0853, 34.7818]
const INITIAL_TARGET: LatLngTuple = [31.7683, 35.2137]

export const App = () => {
  const center = useMemo<LatLngTuple>(
    () => [
      (INITIAL_SOURCE[0] + INITIAL_TARGET[0]) / 2,
      (INITIAL_SOURCE[1] + INITIAL_TARGET[1]) / 2,
    ],
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
        <RoutingLayer initialSource={INITIAL_SOURCE} initialTarget={INITIAL_TARGET} />
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