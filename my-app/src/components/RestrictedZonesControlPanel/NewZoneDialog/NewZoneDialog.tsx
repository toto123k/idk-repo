import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import AddLocationIcon from '@mui/icons-material/AddLocation'

interface Props {
    open: boolean
    onClose: () => void
    onDrawOnMap: () => void
    onByCoords: () => void
}

const NewZoneDialog: React.FC<Props> = ({
    open,
    onClose,
    onDrawOnMap,
    onByCoords,
}) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Create new zone</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, mb: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<MapIcon />}
                    onClick={onDrawOnMap}
                    fullWidth
                >
                    Draw on map
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<AddLocationIcon />}
                    onClick={onByCoords}
                    fullWidth
                >
                    By coordinates
                </Button>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
    </Dialog>
)

export default NewZoneDialog
