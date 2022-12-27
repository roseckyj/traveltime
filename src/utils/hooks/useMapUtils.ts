import * as Maps from 'react-simple-maps';

export function useMapUtils() {
    const { projection, width, height } = (Maps as any).useMapContext();
    const { x, y, k } = (Maps as any).useZoomPanContext();

    const relativePosition = (point: [number, number]) => {
        const projected = projection(point);
        return [(x + projected[0] * k) / width, (y + projected[1] * k) / height];
    };

    const isPointOnScreen = (point: [number, number]) => {
        const relative = relativePosition(point);
        return relative[0] >= 0 && relative[0] <= 1 && relative[1] >= 0 && relative[1] <= 1;
    };

    const isLineOnScreen = (p1: [number, number], p2: [number, number]) => {
        const relativePos = [p1, p2].map((p) => relativePosition(p));

        const xPos1 = relativePos[0][0] >= 0 && relativePos[0][0] <= 1 ? 0 : relativePos[0][0];
        const xPos2 = relativePos[1][0] >= 0 && relativePos[1][0] <= 1 ? 0 : relativePos[1][0];
        const yPos1 = relativePos[0][1] >= 0 && relativePos[0][1] <= 1 ? 0 : relativePos[0][1];
        const yPos2 = relativePos[1][1] >= 0 && relativePos[1][1] <= 1 ? 0 : relativePos[1][1];

        return xPos1 * xPos2 <= 0 && yPos1 * yPos2 <= 0;
    };

    return {
        relativePosition,
        isPointOnScreen,
        isLineOnScreen,
    };
}
