import { useState } from 'react';
import { useAtom } from 'jotai';
import { Box, Button } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { waypointsAtom, sourcePositionAtom, targetPositionAtom } from '../../state/routingAtoms';
import { InsertWaypointDialog } from './AddWaypointDialog/AddWaypointDialog';
import type { LatLngLiteral } from 'leaflet';

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
};

export const AddWaypointButton = () => {
    const [waypoints, setWaypoints] = useAtom(waypointsAtom);
    const [sourcePosition] = useAtom(sourcePositionAtom);
    const [targetPosition] = useAtom(targetPositionAtom);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddWaypointClick = () => {
        if (waypoints.length === 0) {
            const newWaypointLat = (sourcePosition.lat + targetPosition.lat) / 2;
            const newWaypointLng = (sourcePosition.lng + targetPosition.lng) / 2;
            const newWaypoint: LatLngLiteral = { lat: newWaypointLat, lng: newWaypointLng };
            setWaypoints([newWaypoint]);
        } else {
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
                    disabled={!sourcePosition || !targetPosition}
                    id='add-waypoint-button'
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