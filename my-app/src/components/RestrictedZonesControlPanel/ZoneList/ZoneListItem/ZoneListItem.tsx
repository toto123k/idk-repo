// src/components/RestrictedZones/ZoneListItem.tsx
import {
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    IconButton,
    Box,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CancelIcon from '@mui/icons-material/Cancel'
import type { RestrictedZone } from '../../../../state/restrictedZonesAtoms'

type Mode = 'idle' | 'drawing' | 'editing' | 'deleting'

interface Props {
    zone: RestrictedZone
    selected: boolean
    drawingMode: Mode
    editingNameId: string | null
    tempName: string
    onZoneClick: () => void
    onStartNameEdit: (zone: RestrictedZone) => void
    onSaveName: () => void
    onCancelNameEdit: () => void
    onTempNameChange: (value: string) => void
}

const ZoneListItem: React.FC<Props> = ({
    zone,
    selected,
    drawingMode,
    editingNameId,
    tempName,
    onZoneClick,
    onStartNameEdit,
    onSaveName,
    onCancelNameEdit,
    onTempNameChange,
}) => {
    const isEditing = editingNameId === zone.id

    return (
        <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
                selected={selected}
                disabled={drawingMode !== 'idle'}
                onClick={onZoneClick}
                sx={{
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.light' },
                    },
                }}
            >
                {/* Left side: either text or inline TextField */}
                {isEditing ? (
                    <TextField
                        value={tempName}
                        onChange={e => onTempNameChange(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && onSaveName()}
                        size="small"
                        fullWidth
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        sx={{ flex: 1, mr: 1 }}
                    />
                ) : (
                    <Box sx={{ flex: 1, mr: 1 }}>
                        <ListItemText
                            primary={zone.name}
                            secondary={`${zone.coordinates.length} points`}
                        />
                    </Box>
                )}

                {/* Right side: edit / save / cancel buttons */}
                <Box>
                    {isEditing ? (
                        <>
                            <IconButton
                                size="small"
                                onClick={e => {
                                    e.stopPropagation()
                                    onSaveName()
                                }}
                            >
                                <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={e => {
                                    e.stopPropagation()
                                    onCancelNameEdit()
                                }}
                            >
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : drawingMode === 'idle' ? (
                        <IconButton
                            size="small"
                            onClick={e => {
                                e.stopPropagation()
                                onStartNameEdit(zone)
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    ) : null}
                </Box>
            </ListItemButton>
        </ListItem>
    )
}

export default ZoneListItem
  