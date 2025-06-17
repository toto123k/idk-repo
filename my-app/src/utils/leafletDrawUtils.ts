// src/utils/leafletDrawUtils.ts
import L from 'leaflet'
import 'leaflet-draw'
import type { DrawHandlers } from '../state/restrictedZonesAtoms'

export const getDrawHandlers = (
    drawControlRef: React.MutableRefObject<L.Control.Draw | null>
): DrawHandlers => {
    const ctl = drawControlRef.current as any
    const tb = ctl?._toolbars
    const { handler: drawH } = tb?.draw?._modes?.polygon || {}
    const { handler: editH } = tb?.edit?._modes?.edit || {}
    const { handler: remH } = tb?.edit?._modes?.remove || {}

    const toggle = (h: any, method: 'enable' | 'disable') => h?.[method]?.()
    const commit = (h: any, method: 'save' | 'completeShape') => h?.[method]?.()

    return {
        startDraw: () => toggle(drawH, 'enable'),
        cancelDraw: () => toggle(drawH, 'disable'),
        completeDraw: () => { commit(drawH, 'completeShape'); toggle(drawH, 'disable') },

        startEdit: () => toggle(editH, 'enable'),
        saveEdit: () => { commit(editH, 'save'); toggle(editH, 'disable') },
        cancelEdit: () => toggle(editH, 'disable'),

        startDelete: () => toggle(remH, 'enable'),
        saveDelete: () => { commit(remH, 'save'); toggle(remH, 'disable') },
    }
}


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