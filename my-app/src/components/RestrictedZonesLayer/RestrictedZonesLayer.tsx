// src/components/RestrictedZonesLayer.tsx
import { useEffect, useRef, useCallback } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { useAtom, useSetAtom } from 'jotai';
import L from 'leaflet'; // For L.Polygon, L.LayerGroup, L.LatLng
import 'leaflet-draw/dist/leaflet.draw.css'; // Main CSS for Leaflet.Draw

import {
    restrictedZonesAtom,
    drawingModeAtom,
    selectedZoneIdAtom,
    drawHandlersAtom,
    type RestrictedZone,
    type DrawingMode,
    // tempPolygonAtom, // Include if used elsewhere or for future features
} from '../../state/restrictedZonesAtoms'; // Adjust path
import { toast } from 'react-toastify';

import { hideLeafletDrawToolbar } from '../../utils/leafletDrawUtils'; // Adjust path
import { useRenderRestrictedZones } from '../../hooks/useRenderRestrictedZones'; // Adjust path
import { useLeafletDrawControl } from '../../hooks/useLeafletControl';

export const RestrictedZonesLayer = () => {
    const [zones, setZones] = useAtom(restrictedZonesAtom);
    const [drawingMode, setDrawingMode] = useAtom(drawingModeAtom);
    const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);
    const setDrawHandlers = useSetAtom(drawHandlersAtom);
    // const setTempPolygon = useSetAtom(tempPolygonAtom); // Keep if needed

    const featureGroupRef = useRef<L.FeatureGroup>(null!); // `null!` used as in original

    // 1. Hide built-in Leaflet.Draw toolbar
    useEffect(() => {
        const cleanupStyle = hideLeafletDrawToolbar();
        return cleanupStyle;
    }, []);

    // 2. Callbacks for Leaflet.Draw events (managed by useLeafletDrawControl)
    const handleZoneCreated = useCallback((layer: L.Polygon) => {
        const coords = (layer.getLatLngs()[0] as L.LatLng[]).map(p => ({ lat: p.lat, lng: p.lng }));
        setZones(prevZones => {
            const newZone: RestrictedZone = {
                id: `zone-${Date.now()}`,
                name: `Zone ${prevZones.length + 1}`,
                coordinates: coords,
                color: '#ff0000', // Default color from draw options
                fillColor: '#ff0000', // Default fill color
                fillOpacity: 0.2, // Default fill opacity
            };
            return [...prevZones, newZone];
        });
        setDrawingMode('idle');
        toast.success('Restricted zone created');
    }, [setZones, setDrawingMode]);

    const handleZoneEdited = useCallback((editedLayers: L.LayerGroup) => {
        let updatedCount = 0;
        editedLayers.eachLayer(layer => {
            // Layer type assertion and options access
            const polygonLayer = layer as L.Polygon; // Assuming only polygons are edited
            const zoneId = polygonLayer.options.zoneId;

            if (zoneId) {
                const newCoords = (polygonLayer.getLatLngs()[0] as L.LatLng[]).map(p => ({ lat: p.lat, lng: p.lng }));
                setZones(prevZones =>
                    prevZones.map(z => (z.id === zoneId ? { ...z, coordinates: newCoords } : z))
                );
                updatedCount++;
            } else {
                console.warn('Edited layer is missing zoneId from options:', layer);
            }
        });
        if (updatedCount > 0) {
            toast.success(`${updatedCount} zone(s) updated`);
        }
        setDrawingMode('idle');
    }, [setZones, setDrawingMode]);

    const handleZoneDeleted = useCallback((deletedLayers: L.LayerGroup) => {
        const removedIds: string[] = [];
        deletedLayers.eachLayer(layer => {
            const zoneId = (layer as L.Polygon).options.zoneId; // Assuming L.Polygon
            if (zoneId) {
                removedIds.push(zoneId);
            } else {
                console.warn('Deleted layer is missing zoneId from options:', layer);
            }
        });

        if (removedIds.length === 0) {
            setDrawingMode('idle');
            return;
        }

        setZones(prevZones => prevZones.filter(z => !removedIds.includes(z.id)));

        if (selectedZoneId && removedIds.includes(selectedZoneId)) {
            setSelectedZoneId(null);
        }

        toast.success(`${removedIds.length} zone(s) deleted`);
        setDrawingMode('idle');
    }, [setZones, setDrawingMode, selectedZoneId, setSelectedZoneId]);

    useLeafletDrawControl({
        featureGroupRef,
        onZoneCreated: handleZoneCreated,
        onZoneEdited: handleZoneEdited,
        onZoneDeleted: handleZoneDeleted,
        setDrawHandlersAtom: setDrawHandlers,
        drawingMode: drawingMode as DrawingMode,
    });

    const handleZoneClick = useCallback((zoneId: string) => {
        setSelectedZoneId(prevId => (zoneId === prevId ? null : zoneId));
    }, [setSelectedZoneId]);

    useRenderRestrictedZones({
        featureGroupRef,
        zones,
        selectedZoneId,
        drawingMode: drawingMode as DrawingMode,
        onZoneClick: handleZoneClick,
    });

    return <FeatureGroup ref={featureGroupRef} />;
};