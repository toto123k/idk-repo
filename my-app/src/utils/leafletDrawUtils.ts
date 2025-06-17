// src/utils/leafletDrawUtils.ts
import L from 'leaflet';
import 'leaflet-draw'; // Ensure types and library are loaded for L.Control.Draw
import type { DrawHandlers } from '../state/restrictedZonesAtoms'; // Adjust path as needed

export const getDrawHandlers = (drawControlRef: React.MutableRefObject<L.Control.Draw | null>): DrawHandlers => {
    const tb = drawControlRef.current?._toolbars as any; // Accessing internal property
    const drawH = tb?.draw?._modes?.polygon?.handler;
    const editH = tb?.edit?._modes?.edit?.handler;
    const remH = tb?.edit?._modes?.remove?.handler;

    return {
        startDraw: () => drawH?.enable?.(),
        cancelDraw: () => drawH?.disable?.(),
        completeDraw: () => { drawH?.completeShape?.(); drawH?.disable?.(); },

        startEdit: () => editH?.enable?.(),
        saveEdit: () => { editH?.save?.(); editH?.disable?.(); },
        cancelEdit: () => editH?.disable?.(),

        startDelete: () => remH?.enable?.(),
        saveDelete: () => { remH?.save?.(); remH?.disable?.(); },
    };
};

export const hideLeafletDrawToolbar = (): (() => void) => {
    const styleId = 'leaflet-draw-toolbar-hider';
    // Prevent adding multiple style tags
    if (document.getElementById(styleId)) {
        // Return a no-op cleanup if style already exists from another instance (though unlikely in typical SPA)
        return () => { };
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .leaflet-draw-section, .leaflet-draw-toolbar { display: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }
    };
};