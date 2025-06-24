import { type FC, memo } from 'react'
import { Box, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { CoordinateRow } from './CoordinateRow'

interface CoordinateRowsProps {
    rows: { lat: string; lng: string }[]
    onChange: (index: number, field: 'lat' | 'lng', value: string) => void
    onRemove: (index: number) => void
    onAdd: () => void
}

export const CoordinateRows: FC<CoordinateRowsProps> = memo(
    ({ rows, onChange, onRemove, onAdd }) => (
        <>
            {rows.map((row, idx) => (
                <CoordinateRow
                    key={idx}
                    index={idx}
                    lat={row.lat}
                    lng={row.lng}
                    onChange={onChange}
                    onRemove={onRemove}
                    disableRemove={rows.length <= 3}
                />
            ))}
            <Box textAlign="center" mt={1}>
                <Button startIcon={<AddIcon />} onClick={onAdd}>
                    Add Coordinate
                </Button>
            </Box>
        </>
    )
)
