// src/components/RoutingLayer/InsertWaypointDialog.tsx
import { useAtom } from 'jotai';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box, // For more flexible layout if needed
} from '@mui/material';
import { waypointsAtom, allPointsAtom } from '../../../state/routingAtoms'; // Adjust path if needed
import type { LatLngTuple } from '../../../types'; // Adjust path if needed

interface InsertWaypointDialogProps {
    open: boolean;
    onClose: () => void;
}

const listItemButtonStyles = {
    // textAlign: 'center', // Centering might look odd with varied text lengths
    justifyContent: 'center', // If you want to center the text content within the button
};

const dialogContentStyles = {
    maxHeight: '400px', // Or use theme.spacing, e.g., theme.spacing(50)
    overflowY: 'auto',
    paddingTop: '8px', // Add some padding if dividers are used
};

const boldTextStyle = {
    fontWeight: 'bold',
    mx: '4px', // Add a little horizontal margin around bold text
};

export const InsertWaypointDialog: React.FC<InsertWaypointDialogProps> = ({ open, onClose }) => {
    const [waypoints, setWaypoints] = useAtom(waypointsAtom);
    const [allPoints] = useAtom(allPointsAtom); // [src, ...waypoints, tgt]

    // This function now returns a ReactNode for easier bolding
    const getPointLabelNode = (point: LatLngTuple | null, indexInAllPoints: number): React.ReactNode => {
        if (!point) return <Typography component="span" sx={boldTextStyle}>N/A</Typography>;
        if (indexInAllPoints === 0) return <Typography component="span" sx={boldTextStyle}>Source</Typography>;
        if (indexInAllPoints === allPoints.length - 1) return <Typography component="span" sx={boldTextStyle}>Target</Typography>;
        return (
            <>
                <Typography component="span" sx={boldTextStyle}>Waypoint {indexInAllPoints}</Typography>
            </>
        );
    };

    const handleInsertWaypoint = (insertAtIndexInWaypoints: number) => {
        const point1 = allPoints[insertAtIndexInWaypoints];
        const point2 = allPoints[insertAtIndexInWaypoints + 1];

        if (!point1 || !point2) return;

        const newWaypointLat = (point1[0] + point2[0]) / 2;
        const newWaypointLng = (point1[1] + point2[1]) / 2;
        const newWaypoint: LatLngTuple = [newWaypointLat, newWaypointLng];

        const newWaypoints = [...waypoints];
        newWaypoints.splice(insertAtIndexInWaypoints, 0, newWaypoint);
        setWaypoints(newWaypoints);
        onClose();
    };

    const segments: { labelNode: React.ReactNode; insertAtIndex: number }[] = [];
    if (allPoints.length >= 2) {
        for (let i = 0; i < allPoints.length - 1; i++) {
            const p1LabelNode = getPointLabelNode(allPoints[i], i);
            const p2LabelNode = getPointLabelNode(allPoints[i + 1], i + 1);
            segments.push({
                labelNode: (
                    <Typography component="span" variant="body2">
                        Between {p1LabelNode} and {p2LabelNode}
                    </Typography>
                ),
                insertAtIndex: i,
            });
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Insert New Waypoint Between</DialogTitle>
            <DialogContent dividers sx={dialogContentStyles}>
                {segments.length > 0 ? (
                    <List disablePadding>
                        {segments.map((segment, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    onClick={() => handleInsertWaypoint(segment.insertAtIndex)}
                                    sx={listItemButtonStyles}
                                >
                                    <ListItemText primary={segment.labelNode} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" align="center" sx={{ p: 2 }}>
                        Not enough points to define segments.
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};