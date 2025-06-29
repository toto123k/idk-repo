import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useAtom } from "jotai";
import "leaflet";
import type { LatLngLiteral } from "leaflet";
import * as L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { zonesGeoJSONAtom } from "../../state/drawingItemsAtom";
import { CoordinatesModal } from "../CoordinatesModal/CoordinatesModal";

const InputTypeSelectionDialog = ({
  open,
  onClose,
  onDrawOnMap,
  onEnterCoordinates,
}: {
  open: boolean;
  onClose: () => void;
  onDrawOnMap: () => void;
  onEnterCoordinates: () => void;
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Add New Zone</DialogTitle>
    <DialogContent>
      <Typography variant="body1" gutterBottom>
        How would you like to define the zone?
      </Typography>
      <Stack spacing={2} mt={2}>
        <Button
          variant="outlined"
          onClick={() => {
            onDrawOnMap();
            onClose();
          }}
        >
          Draw on Map
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            onEnterCoordinates();
            onClose();
          }}
        >
          Enter Coordinates Manually
        </Button>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
    </DialogActions>
  </Dialog>
);

export const RestrictedZonesLayer = () => {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [, setZonesGeoJSON] = useAtom(zonesGeoJSONAtom);

  const [isInputTypeModalOpen, setInputTypeModalOpen] = useState(false);
  const [isCoordinatesModalOpen, setCoordinatesModalOpen] = useState(false);
  const customControlAddedRef = useRef(false);

  const syncStateWithMap = useCallback(() => {
    const featureGroup = featureGroupRef.current;
    if (!featureGroup) return;
    const geojson = featureGroup.toGeoJSON();
    setZonesGeoJSON(geojson as GeoJSON.FeatureCollection);
  }, [setZonesGeoJSON]);

  const handleDrawOnMap = () => {
    if (!map?.pm) return;
    map.pm.enableDraw("Polygon", {
      snappable: true,
      snapDistance: 20,
    });
  };

  const handleEnterCoordinates = () => {
    setCoordinatesModalOpen(true);
  };

  const handleCoordinatesSubmit = (coords: LatLngLiteral[]) => {
    setCoordinatesModalOpen(false);
    if (!featureGroupRef.current || coords.length < 3) return;

    const polygon = L.polygon(coords, { pmIgnore: false });
    polygon.pm.enable();
    polygon.pm.setOptions({ draggable: true });
    featureGroupRef.current.addLayer(polygon);
    syncStateWithMap();
  };

  useEffect(() => {
    if (!map?.pm || !featureGroupRef.current) return;

    const drawnItems = featureGroupRef.current;
    map.addLayer(drawnItems);
    L.PM.setOptIn(true);

    if (!customControlAddedRef.current && map.pm.Toolbar) {
      map.pm.Toolbar.createCustomControl({
        name: "AddZoneWithOptions",
        block: "edit",
        title: "Add Zone (Draw or Coordinates)",
        onClick: () => setInputTypeModalOpen(true),
        className: "control-icon leaflet-pm-icon-polygon",
        toggle: false,
      });
      customControlAddedRef.current = true;
    }

    map.pm.addControls({
      position: "topright",
      drawPolygon: false,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      drawCircle: false,
      drawRectangle: false,
      drawPolyline: false,
      drawMarker: false,
      drawCircleMarker: false,
      drawText: false,
      rotateMode: true,
    });

    const onCreate = (e: any) => {
      const layer = e.layer;
      layer.options.pmIgnore = false;
      L.PM.reInitLayer(layer);
      drawnItems.addLayer(layer);
      syncStateWithMap();
    };

    const onRemove = (e: any) => {
      drawnItems.removeLayer(e.layer);
      syncStateWithMap();
    };

    map.on("pm:create", onCreate);
    map.on("pm:remove", onRemove);
  }, [map, syncStateWithMap]);

  return (
    <>
      <FeatureGroup
        ref={featureGroupRef}
        eventHandlers={{
          "pm:edit": syncStateWithMap,
          "pm:cut": syncStateWithMap,
          "pm:rotateend": syncStateWithMap,
          "pm:dragend": syncStateWithMap,
        }}
        pmIgnore={false}
      />
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
