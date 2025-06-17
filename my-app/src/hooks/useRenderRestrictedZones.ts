// src/hooks/useRenderRestrictedZones.ts
import { useEffect } from 'react';
import L from 'leaflet';
import type { RestrictedZone, DrawingMode } from '../state/restrictedZonesAtoms'; // Adjust path

interface UseRenderRestrictedZonesOptions {
    featureGroupRef: React.RefObject<L.FeatureGroup | null>;
    zones: RestrictedZone[];
    selectedZoneId: string | null;
    drawingMode: DrawingMode;
    onZoneClick: (zoneId: string) => void;
}

export const useRenderRestrictedZones = ({
    featureGroupRef,
    zones,
    selectedZoneId,
    drawingMode,
    onZoneClick,
}: UseRenderRestrictedZonesOptions): void => {
    useEffect(() => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.clearLayers();

        zones.forEach(zone => {
            const isSelected = zone.id === selectedZoneId;
            const polygon = L.polygon(
                zone.coordinates.map(c => [c.lat, c.lng] as [number, number]),
                {
                    color: isSelected ? '#0066ff' : zone.color,
                    fillColor: zone.fillColor,
                    fillOpacity: zone.fillOpacity,
                    weight: isSelected ? 3 : 2,
                    zoneId: zone.id, // Store zoneId in options for easy retrieval
                }
            );

            polygon.on('click', () => {
                if (drawingMode === 'idle') {
                    onZoneClick(zone.id);
                }
            });

            featureGroup.addLayer(polygon);
        });
    }, [featureGroupRef, zones, selectedZoneId, drawingMode, onZoneClick]);
};