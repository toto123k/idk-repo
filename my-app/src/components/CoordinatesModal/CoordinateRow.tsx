// src/components/CoordinatesModal/CoordinateRow.tsx
import { TextField, IconButton, Box } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'

interface CoordinateRowProps {
    idx: number
    lat: string
    lng: string
    errorLat?: string
    errorLng?: string
    isRemoveDisabled: boolean
    onChange: (field: 'lat' | 'lng', value: string) => void
    onRemove: () => void
}

export const CoordinateRow: React.FC<CoordinateRowProps> = ({
    idx,
    lat,
    lng,
    errorLat,
    errorLng,
    isRemoveDisabled,
    onChange,
    onRemove,
}) => {
    const rowStyling = { display: 'flex', gap: 1, mb: 2 };
    return (
        <Box sx={rowStyling}>
            <TextField
                label={`Latitude ${idx + 1}`}
                value={lat}
                onChange={e => onChange('lat', e.target.value)}
                error={!!errorLat}
                helperText={errorLat}
                size="small"
                fullWidth
            />
            <TextField
                label={`Longitude ${idx + 1}`}
                value={lng}
                onChange={e => onChange('lng', e.target.value)}
                error={!!errorLng}
                helperText={errorLng}
                size="small"
                fullWidth
            />
            <IconButton onClick={onRemove} disabled={isRemoveDisabled}>
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}