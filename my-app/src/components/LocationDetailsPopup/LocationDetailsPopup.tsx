import { useState } from 'react'
import { Box, Tabs, Tab, Stack, Divider, Typography, IconButton, Chip } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { waypointsAtom } from '../../state/routingAtoms'
import { useSetAtom } from 'jotai'
import type { LocationData } from '../../types/types'
import { LatLngGroup } from '../CoordinatesFields/LatLngGroup/LatLngGroup'
import { UtmGroup } from '../CoordinatesFields/UtmGroup/UtmGroup'


interface Props extends LocationData {
    onPositionUpdate: (pos: LocationData['position']) => void
}

export const LocationDetailsPopup = ({ position, type, order, onPositionUpdate }: Props) => {
    const setWaypoints = useSetAtom(waypointsAtom)
    const [tab, setTab] = useState(0)
    const [activeEditor, setActiveEditor] = useState<'latlng' | 'utm' | null>(null)

    const handleDelete = () => {
        if (order !== undefined) {
            setWaypoints(prev => prev.filter((_, i) => i !== order - 1))
        }
    }

    const title = type === 'waypoint' && order
        ? `Waypoint #${order}`
        : `${type.charAt(0).toUpperCase()} Point`

    return (
        <Box sx={{ p: 2, minWidth: 250 }} onClick={e => e.stopPropagation()}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6">{title}</Typography>
                <Stack direction="row" gap={1}>
                    <Chip label={type.toUpperCase()} color={type === 'source' ? 'primary' : type === 'target' ? 'error' : 'warning'} size="small" />
                    {type === 'waypoint' && (
                        <IconButton onClick={handleDelete} size="small" color="error">
                            <Delete fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Lat/Lng" />
                <Tab label="UTM" />
            </Tabs>

            <Box mt={2}>
                {tab === 0 && (
                    <LatLngGroup
                        lat={position.lat}
                        lng={position.lng}
                        disabled={activeEditor !== null && activeEditor !== 'latlng'}
                        onUpdate={pos => {
                            onPositionUpdate(pos)
                            setActiveEditor(null)
                        }}
                    />
                )}
                {tab === 1 && (
                    <UtmGroup
                        lat={position.lat}
                        lng={position.lng}
                        disabled={activeEditor !== null && activeEditor !== 'utm'}
                        onUpdate={pos => {
                            onPositionUpdate(pos)
                            setActiveEditor(null)
                        }}
                    />
                )}
            </Box>
        </Box>
    )
}
