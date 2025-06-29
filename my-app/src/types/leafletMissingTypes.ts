import "leaflet";

declare module "leaflet" {
  interface PathOptions {
    zoneId?: string;
  }

  interface LeafletEventHandlerFnMap {
    "pm:edit"?: (event: any) => void;
    "pm:cut"?: (event: any) => void;
    "pm:rotateend"?: (event: any) => void;
    "pm:dragend"?: (event: any) => void;
  }
}
