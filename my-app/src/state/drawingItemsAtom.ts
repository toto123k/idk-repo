import type { FeatureCollection } from "geojson";
import { atom } from "jotai";

export const zonesGeoJSONAtom = atom<FeatureCollection>({
  type: "FeatureCollection",
  features: [],
});
