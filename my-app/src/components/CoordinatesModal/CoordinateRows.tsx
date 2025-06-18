// src/components/CoordinatesModal/CoordinateRows.tsx
import { Box, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { CoordinateRow } from './CoordinateRow' // Import the new component


interface CoordinateRowsProps {
    rows: { lat: string; lng: string }[]
    errors: { lat?: string; lng?: string }[]
    onChange: (idx: number, field: 'lat' | 'lng', value: string) => void
    onRemove: (idx: number) => void
    onAdd: () => void
}

export const CoordinateRows: React.FC<CoordinateRowsProps> = ({
    rows,
    errors,
    onChange,
    onRemove,
    onAdd,
}) => {
    return (
        <>
            {rows.map((r, idx) => (
                <CoordinateRow
                    key={idx}
                    idx={idx}
                    lat={r.lat}
                    lng={r.lng}
                    errorLat={errors[idx]?.lat}
                    errorLng={errors[idx]?.lng}
                    onChange={(field, value) => onChange(idx, field, value)}
                    onRemove={() => onRemove(idx)}
                    isRemoveDisabled={rows.length <= 3}
                />
            ))}

            <Box textAlign="center">
                <Button startIcon={<AddIcon />} onClick={onAdd}>
                    Add Coordinate
                </Button>
            </Box>
        </>
    )
}