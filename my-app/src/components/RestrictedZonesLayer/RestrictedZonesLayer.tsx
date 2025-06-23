import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { type FC } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from '@mui/material';
import { CoordinatesModal } from '../CoordinatesModal/CoordinatesModal';
import { FeatureGroup, type LatLngLiteral } from 'leaflet';
interface InputTypeSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onDrawOnMap: () => void;
    onEnterCoordinates: () => void;
}

export const InputTypeSelectionDialog: FC<InputTypeSelectionDialogProps> = ({
    open,
    onClose,
    onDrawOnMap,
    onEnterCoordinates,
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Add New Zone</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    How would you like to define the zone?
                </Typography>
                <Stack spacing={2} mt={2}>
                    <Button variant="outlined" onClick={() => { onDrawOnMap(); onClose(); }}>
                        Draw on Map
                    </Button>
                    <Button variant="outlined" onClick={() => { onEnterCoordinates(); onClose(); }}>
                        Enter Coordinates Manually
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

let _drawnItems: FeatureGroup | null = null;


export function getUpdatedZonesGeoJSON(): GeoJSON.FeatureCollection {
    if (!_drawnItems) return { type: 'FeatureCollection', features: [] };
    return _drawnItems.toGeoJSON() as GeoJSON.FeatureCollection;
}

export const RestrictedZonesLayer = () => {
    const map = useMap();
    const drawnRef = useRef<FeatureGroup>(new FeatureGroup());
    const customControlAddedRef = useRef(false); // To prevent adding the control multiple times. [4]

    const [isInputTypeModalOpen, setInputTypeModalOpen] = useState(false);
    const [isCoordinatesModalOpen, setCoordinatesModalOpen] = useState(false);

    const openInputTypeModal = useCallback(() => {
        setInputTypeModalOpen(true);
    }, []);

    const handleDrawOnMap = () => {
        if (map?.pm) {
            map.pm.enableDraw('Polygon', {
                snappable: true,
                snapDistance: 20,
            });
        }
    };

    const handleEnterCoordinates = () => {
        setCoordinatesModalOpen(true);
    };

    const handleCoordinatesSubmit = (coords: LatLngLiteral[]) => {
        if (!map || !_drawnItems) {
            setCoordinatesModalOpen(false);
            return;
        }

        if (coords.length < 3) {
            console.warn("Not enough coordinates to form a polygon.");
            setCoordinatesModalOpen(false);
            return;
        }

        const polygon = L.polygon(coords);

        polygon.options.pmIgnore = false;
        L.PM.reInitLayer(polygon);

        _drawnItems.addLayer(polygon);

        map.fire('pm:create', { layer: polygon, shape: 'Polygon' });

        setCoordinatesModalOpen(false);
    };

    useEffect(() => {
        if (!map?.pm) return;

        L.PM.setOptIn(true);
        const drawnItems = drawnRef.current;
        map.addLayer(drawnItems);
        _drawnItems = drawnItems;

        if (!customControlAddedRef.current && map.pm.Toolbar) {
            map.pm.Toolbar.createCustomControl({
                name: 'AddZoneWithOptions',
                block: 'edit',
                title: 'Add Zone (Draw or Coordinates)',
                onClick: openInputTypeModal,
                className: 'control-icon leaflet-pm-icon-polygon',
                toggle: false,
            });
            customControlAddedRef.current = true;
        }

        map.pm.addControls({
            position: 'topright',
            drawPolygon: false,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: true,
            drawCircle: false,
            drawRectangle: false,
            drawPolyline: false,
            drawMarker: false,
            drawCircleMarker: false,
            drawText: false,
            rotateMode: true,
        });



        const handlePmCreate = (e: any) => {
            const layer = e.layer;
            layer.options.pmIgnore = false;
            L.PM.reInitLayer(layer);
            drawnItems.addLayer(layer);
        };

        const handlePmRemove = (e: any) => {
            if (e?.layer && drawnItems.hasLayer(e.layer)) {
                drawnItems.removeLayer(e.layer);
            }
        };

        map.on('pm:create', handlePmCreate);
        map.on('pm:remove', handlePmRemove);


    }, [map, openInputTypeModal]);

    return (
        <>
            <InputTypeSelectionDialog
                open={isInputTypeModalOpen}
                onClose={() => setInputTypeModalOpen(false)}
                onDrawOnMap={handleDrawOnMap}
                onEnterCoordinates={handleEnterCoordinates}
            />
            <CoordinatesModal
                open={isCoordinatesModalOpen}
                onClose={() => setCoordinatesModalOpen(false)}
                onSubmit={handleCoordinatesSubmit}
            />
        </>
    );
};