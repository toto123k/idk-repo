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
    Box,
} from '@mui/material';
import { waypointsAtom, allPointsAtom } from '../../../state/routingAtoms';
import type { LatLngTuple } from '../../../types';

interface InsertWaypointDialogProps {
    open: boolean;
    onClose: () => void;
}

const listItemButtonStyles = {
    justifyContent: 'center'
};

const dialogContentStyles = {
    maxHeight: '20vh',
    overflowY: 'auto',
};

const boldTextStyle = {
    fontWeight: 'bold',
};

export const InsertWaypointDialog: React.FC<InsertWaypointDialogProps> = ({ open, onClose }) => {
    const [waypoints, setWaypoints] = useAtom(waypointsAtom);
    const [allPoints] = useAtom(allPointsAtom);

    const getPointLabelNode = (point: LatLngTuple | null, indexInAllPoints: number): React.ReactNode => {
        const label = (() => {
            if (!point) return 'N/A';
            if (indexInAllPoints === 0) return 'Source';
            if (indexInAllPoints === allPoints.length - 1) return 'Target';
            return `Waypoint ${indexInAllPoints}`;
        })();

        return <Typography component="span" sx={boldTextStyle}>{label}</Typography>;
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
            const fromLabel = getPointLabelNode(allPoints[i], i);
            const toLabel = getPointLabelNode(allPoints[i + 1], i + 1);

            const labelNode = (
                <Typography component="span" variant="body2">
                    Between {fromLabel} and {toLabel}
                </Typography>
            );

            segments.push({ labelNode, insertAtIndex: i });
        }
    }


    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Insert New Waypoint Between</DialogTitle>
            <DialogContent dividers sx={dialogContentStyles}>
                {segments.length > 0 && (
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
                )}
            </DialogContent>
        </Dialog>
    );
};