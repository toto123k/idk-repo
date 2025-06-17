// src/types/leaflet.custom.d.ts
import 'leaflet';

declare module 'leaflet' {

    interface PathOptions {
        zoneId?: string;
    }
}