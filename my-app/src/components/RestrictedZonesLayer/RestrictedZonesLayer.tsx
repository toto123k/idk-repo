import { useEffect, useRef, useCallback } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { useAtom, useSetAtom } from 'jotai';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

import {
    restrictedZonesAtom,
    drawingModeAtom,
    selectedZoneIdAtom,
    drawHandlersAtom,
    type RestrictedZone,
    type DrawingMode,
} from '../../state/restrictedZonesAtoms';
import { toast } from 'react-toastify';

import { hideLeafletDrawToolbar } from '../../utils/leafletDrawUtils';
import { useRenderRestrictedZones } from '../../hooks/useRenderRestrictedZones';
import { useLeafletDrawControl } from '../../hooks/useLeafletControl';

export const RestrictedZonesLayer = () => {
    const [zones, setZones] = useAtom(restrictedZonesAtom);
    const [drawingMode, setDrawingMode] = useAtom(drawingModeAtom);
    const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);
    const setDrawHandlers = useSetAtom(drawHandlersAtom);

    const featureGroupRef = useRef<L.FeatureGroup>(null!);

    useEffect(() => {
        hideLeafletDrawToolbar();
    }, []);

    // 2. Callbacks for Leaflet.Draw events (managed by useLeafletDrawControl)
    const handleZoneCreated = useCallback((layer: L.Polygon) => {
        const coords = (layer.getLatLngs()[0] as L.LatLng[]).map(p => ({ lat: p.lat, lng: p.lng }));
        setZones(prevZones => {
            const newZone: RestrictedZone = {
                id: `zone-${Date.now()}`,
                name: `Zone ${prevZones.length + 1}`,
                coordinates: coords,
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.2,
            };
            return [...prevZones, newZone];
        });
        setDrawingMode('idle');
        toast.success('Restricted zone created');
    }, [setZones, setDrawingMode]);

    const handleZoneEdited = useCallback((editedLayers: L.LayerGroup) => {
        let updatedCount = 0;
        editedLayers.eachLayer(layer => {
            const polygonLayer = layer as L.Polygon;
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
            const zoneId = (layer as L.Polygon).options.zoneId;
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