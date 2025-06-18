// src/hooks/useLeafletDrawControl.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';

import { getDrawHandlers } from '../utils/leafletDrawUtils';
import type { DrawingMode, DrawHandlers } from '../state/restrictedZonesAtoms'; 

export interface UseLeafletDrawControlOptions {
    featureGroupRef: React.RefObject<L.FeatureGroup | null>;
    onZoneCreated: (layer: L.Polygon) => void;
    onZoneEdited: (editedLayers: L.LayerGroup) => void;
    onZoneDeleted: (deletedLayers: L.LayerGroup) => void;
    setDrawHandlersAtom: (handlers: DrawHandlers) => void;
    drawingMode: DrawingMode;
}

export const useLeafletDrawControl = ({
    featureGroupRef,
    onZoneCreated,
    onZoneEdited,
    onZoneDeleted,
    setDrawHandlersAtom,
    drawingMode,
}: UseLeafletDrawControlOptions): void => {
    const drawControlRef = useRef<L.Control.Draw | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const handlersSetRef = useRef(false);

    useEffect(() => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        const map = (featureGroup as any)._map as L.Map | undefined;
        if (!map) {
            return;
        }
        mapInstanceRef.current = map;

        if (!drawControlRef.current) {
            drawControlRef.current = new L.Control.Draw({
                draw: {
                    polygon: {
                        allowIntersection: false,
                        shapeOptions: { color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.2 },
                    },
                    polyline: false,
                    circle: false,
                    rectangle: false,
                    marker: false,
                    circlemarker: false,
                },
                edit: { featureGroup: featureGroup },
            });
            map.addControl(drawControlRef.current);
        }

        if ((drawControlRef.current as any)?._toolbars && !handlersSetRef.current) {
            setDrawHandlersAtom(getDrawHandlers(drawControlRef));
            handlersSetRef.current = true;
        }
        const handleCreated = (e: L.LeafletEvent) => {
            const event = e as L.DrawEvents.Created;
            if (event.layerType === 'polygon' && event.layer instanceof L.Polygon) {
                onZoneCreated(event.layer);
            }
        };
        
        const handleEdited = (e: L.LeafletEvent) => {
            const event = e as L.DrawEvents.Edited;
            onZoneEdited(event.layers);
        };

        const handleDeleted = (e: L.LeafletEvent) => {
            const event = e as L.DrawEvents.Deleted;
            onZoneDeleted(event.layers);
        };

        map.on(L.Draw.Event.CREATED, handleCreated);
        map.on(L.Draw.Event.EDITED, handleEdited);
        map.on(L.Draw.Event.DELETED, handleDeleted);

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
            map.off(L.Draw.Event.EDITED, handleEdited);
            map.off(L.Draw.Event.DELETED, handleDeleted);

            if (drawControlRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(drawControlRef.current);
            }
        };
    }, [featureGroupRef, onZoneCreated, onZoneEdited, onZoneDeleted, setDrawHandlersAtom]);

    // Effect for managing drawing modes
    useEffect(() => {
        const tb = (drawControlRef.current as any)._toolbars;
        if (!tb) return;

        // Disable all modes first
        tb.draw?._modes?.polygon?.handler?.disable?.();
        tb.edit?._modes?.edit?.handler?.disable?.();
        tb.edit?._modes?.remove?.handler?.disable?.();

        // Enable the current mode
        switch (drawingMode) {
            case 'drawing':
                tb.draw?._modes?.polygon?.handler?.enable?.();
                break;
            case 'editing':
                tb.edit?._modes?.edit?.handler?.enable?.();
                break;
            case 'deleting':
                tb.edit?._modes?.remove?.handler?.enable?.();
                break;
            default: // 'idle' or other modes
                break;
        }
    }, [drawingMode]);
};