// src/components/RestrictedZones/ZonesList.tsx
import { List, Typography } from '@mui/material'
import { type RestrictedZone } from '../../../state/restrictedZonesAtoms'
import { ZoneListItem } from './ZoneListItem/ZoneListItem'

type Mode = 'idle' | 'drawing' | 'editing' | 'deleting'

interface Props {
    zones: RestrictedZone[]
    selectedZoneId: string | null
    drawingMode: Mode
    editingNameId: string | null
    tempName: string
    onZoneClick: (id: string) => void
    onStartNameEdit: (zone: RestrictedZone) => void
    onSaveName: () => void
    onCancelNameEdit: () => void
    onTempNameChange: (value: string) => void
}

export const ZonesList: React.FC<Props> = ({
    zones,
    selectedZoneId,
    drawingMode,
    editingNameId,
    tempName,
    onZoneClick,
    onStartNameEdit,
    onSaveName,
    onCancelNameEdit,
    onTempNameChange,
}) => {
    if (zones.length === 0) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
            >
                No restricted zones defined
            </Typography>
        )
    }
    const zoneListSx = { maxHeight: 200, overflow: 'auto' };
    
    return (
        <List dense sx={zoneListSx}>
            {zones.map(zone => (
                <ZoneListItem
                    key={zone.id}
                    zone={zone}
                    selected={zone.id === selectedZoneId}
                    drawingMode={drawingMode}
                    editingNameId={editingNameId}
                    tempName={tempName}
                    onZoneClick={() => onZoneClick(zone.id)}
                    onStartNameEdit={onStartNameEdit}
                    onSaveName={onSaveName}
                    onCancelNameEdit={onCancelNameEdit}
                    onTempNameChange={onTempNameChange}
                />
            ))}
        </List>
    )
}

