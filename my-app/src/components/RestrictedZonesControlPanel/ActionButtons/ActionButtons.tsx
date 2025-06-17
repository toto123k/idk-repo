import {
    type SxProps,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckIcon from '@mui/icons-material/Check'
import type { Theme } from '@mui/material/styles'

type Mode = 'idle' | 'drawing' | 'editing' | 'deleting'

interface Props {
    drawingMode: Mode
    isDrawing: boolean
    isEditing: boolean
    isDeleting: boolean
    zonesCount: number
    onNewZone: () => void
    onStartEditing: () => void
    onStartDeleting: () => void
    onCancelDrawing: () => void
    onFinishEditing: () => void
    onFinishDeleting: () => void
}

const styles = {
    container: {
        mb: 2,
    } as SxProps<Theme>,
    buttonWrapper: {
        flex: 1,
    },
    messageText: {
        flex: 1,
    } as SxProps<Theme>,
}

export const ActionButtons: React.FC<Props> = ({
    drawingMode,
    // isDrawing, // These props are redundant if drawingMode is the source of truth
    isDrawing,
    isEditing,
    isDeleting,
    zonesCount,
    onNewZone,
    onStartEditing,
    onStartDeleting,
    onCancelDrawing,
    onFinishEditing,
    onFinishDeleting,
}) => (
    <Stack direction="column" spacing={1} sx={styles.container}>
        {drawingMode === 'idle' && (
            <>
                <Tooltip title="Create new zone">
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={onNewZone}
                        fullWidth
                    >
                        New Zone
                    </Button>
                </Tooltip>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit selected zone">
                        <span style={styles.buttonWrapper}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={onStartEditing}
                                disabled={zonesCount === 0}
                                fullWidth
                            >
                                Edit
                            </Button>
                        </span>
                    </Tooltip>

                    <Tooltip title="Delete zones">
                        <span style={styles.buttonWrapper}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={onStartDeleting}
                                disabled={zonesCount === 0}
                                fullWidth
                            >
                                Delete
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>
            </>
        )}

        {isDrawing && (
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={styles.messageText}>
                    Click points to draw zone
                </Typography>
                <Tooltip title="Cancel drawing">
                    <IconButton size="small" onClick={onCancelDrawing} color="error">
                        <CancelIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        )}

        {isEditing && (
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={styles.messageText}>
                    Drag points to edit
                </Typography>
                <Tooltip title="Done editing">
                    <IconButton size="small" onClick={onFinishEditing} color="primary">
                        <CheckIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        )}

        {isDeleting && (
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={styles.messageText}>
                    Click zones to delete
                </Typography>
                <Tooltip title="Done deleting">
                    <IconButton size="small" onClick={onFinishDeleting} color="primary">
                        <CheckIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        )}
    </Stack>
)

