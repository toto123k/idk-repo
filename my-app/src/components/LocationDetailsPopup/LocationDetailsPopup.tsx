import { Box, Chip, Divider, IconButton, Stack, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { fromLatLon } from 'utm'
import { useSetAtom } from 'jotai'
import { waypointsAtom } from '../../state/routingAtoms'
import { type LocationData } from '../../types/types'

interface Props extends LocationData {
}

const containerSx = {
    p: 2,
    minWidth: 35,
    fontFamily: 'sans-serif',
}

const headerRowSx = {
    mb: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}

const headerTextSx = {
    fontWeight: 'bold',
    textTransform: 'capitalize',
}

const chipRowSx = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
}

const infoBlockSx = {
    mt: 1.5,
}

const labelSx = {
    fontWeight: 500,
    color: 'text.secondary',
}

const valueSx = {
    color: 'text.primary',
    textAlign: 'right',
    ml: 1,
}

export const LocationDetailsPopup = ({ position, type, order }: Props) => {
    const setWaypoints = useSetAtom(waypointsAtom)
    const { easting, northing, zoneNum, zoneLetter } = fromLatLon(position.lat, position.lng)

    const chipColorMap: Record<string, 'primary' | 'error' | 'warning'> = {
        source: 'primary',
        target: 'error',
        waypoint: 'warning',
    }

    const chipColor = chipColorMap[type] ?? 'default'

    const title = type === 'waypoint' && order !== undefined
        ? `Waypoint #${order}`
        : `${type.charAt(0).toUpperCase() + type.slice(1)} Point`

    const handleDelete = () => {
        setWaypoints(prev => prev.filter((_, i) => i !== (order! - 1)))
    }

    return (
        <Box sx={containerSx}>
            <Stack sx={headerRowSx}>
                <Typography variant="h6" sx={headerTextSx}>{title}</Typography>
                <Stack sx={chipRowSx}>
                    <Chip label={type.toUpperCase()} color={chipColor} size="small" />
                    {type === 'waypoint' && order !== undefined && (
                        <IconButton onClick={handleDelete} size="small" sx={{ color: 'error.main' }}>
                            <Delete fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            </Stack>

            <Divider />

            <Box sx={infoBlockSx}>
                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={labelSx} variant="body2">Lat/Lng:</Typography>
                        <Typography sx={valueSx} variant="body2">
                            {`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={labelSx} variant="body2">UTM:</Typography>
                        <Typography sx={valueSx} variant="body2">
                            {`${zoneNum}${zoneLetter} ${easting.toFixed(0)} ${northing.toFixed(0)}`}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    )
}
