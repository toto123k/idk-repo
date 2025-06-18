// src/components/RoutingLayer/AddWaypointButton.tsx
import { useState } from 'react';
import { useAtom } from 'jotai';
import { Box, Button } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { waypointsAtom, srcPosAtom, tgtPosAtom } from '../../state/routingAtoms';
import type { LatLngTuple } from '../../types';
import { InsertWaypointDialog } from './AddWaypointDialog/AddWaypointDialog';

const boxStyles = {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: "flex",
    justifyContent: "center"
};

const buttonStyles = {
    minWidth: '100%',
    // padding: '6px 10px', // Example padding
};

export const AddWaypointButton = () => {
    const [waypoints, setWaypoints] = useAtom(waypointsAtom);
    const [srcPos] = useAtom(srcPosAtom);
    const [tgtPos] = useAtom(tgtPosAtom);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddWaypointClick = () => {
        if (!srcPos || !tgtPos) return; // Button should be disabled anyway

        if (waypoints.length === 0) {
            // No existing waypoints: Add one directly between source and target
            const newWaypointLat = (srcPos[0] + tgtPos[0]) / 2;
            const newWaypointLng = (srcPos[1] + tgtPos[1]) / 2;
            const newWaypoint: LatLngTuple = [newWaypointLat, newWaypointLng];
            setWaypoints([newWaypoint]);
        } else {
            // Waypoints exist: Open the dialog to choose insertion point
            setIsDialogOpen(true);
        }
    };

    return (
        <>
            <Box sx={boxStyles}>
                <Button
                    variant="contained"
                    onClick={handleAddWaypointClick}
                    startIcon={<AddLocationAltIcon />}
                    sx={buttonStyles}
                    disabled={!srcPos || !tgtPos}
                >
                    Add Waypoint
                </Button>
            </Box>
            <InsertWaypointDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};