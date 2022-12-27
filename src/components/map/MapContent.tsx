import React from 'react';
import * as Maps from 'react-simple-maps';
import { Line, Marker } from 'react-simple-maps';
import { palette } from '../../styles/palette';
import { Connection, Town } from '../../types';
import { useMapUtils } from '../../utils/hooks/useMapUtils';
import { byValue } from '../../utils/sortBy/byKey copy';
import { byPopulation } from '../../utils/sortBy/byPopulation';
import { firstN } from '../../utils/takeN';
import { truthy } from '../../utils/truthy';

interface IMapContentProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
}

export function MapContent(props: IMapContentProps) {
    const { isLineOnScreen, isPointOnScreen } = useMapUtils();
    const { k } = (Maps as any).useZoomPanContext();
    const [selectedMarker, setSelectedMarker] = React.useState<number | null>(null);
    const [hoverMarker, setHoverMarker] = React.useState<number | null>(null);
    const { towns, connections, segments } = props;

    // Calculate scales
    const normalizedZoom = Math.max(k, 10);
    const scale = 10 / normalizedZoom;
    const nonLinearScale = scale + Math.log(normalizedZoom) * 0.01;
    const maxPopulation = Object.values(towns).reduce((prev, curr) => Math.max(prev, curr.population.total), 0);
    const maxPopulationLog = Math.log2(maxPopulation);

    // Filter towns
    const townsLOD = firstN(Object.values(towns), byPopulation(true, truthy(selectedMarker)), 10 * normalizedZoom);
    const townsFiltered = townsLOD.filter((town) => isPointOnScreen([town.point[1], town.point[0]]));

    // Filter segments
    const segmentsLOD = firstN(Object.entries(segments), byValue(true), 30 * normalizedZoom);
    const segmentsFiltered = segmentsLOD.filter(([key, value], i) => {
        const t = key.split('-').map((key) => towns[parseInt(key)]);
        return isLineOnScreen([t[0].point[1], t[0].point[0]], [t[1].point[1], t[1].point[0]]);
    });

    // Functions
    const idsToSegments = (ids: number[]) => {
        const result: [string, number][] = [];
        for (let i = 0; i < ids.length - 1; i++) {
            const key = `${ids[i]}-${ids[i + 1]}`;
            result.push([key, segments[key]] as [string, number]);
        }
        return result;
    };

    const idsToStations = (ids: number[]) => {
        return ids.map((id) => towns[id]);
    };

    const renderSegment =
        (color: string) =>
        ([key, value]: [string, number], i: number) => {
            const points = key.split('-').map((id) => towns[parseInt(id)].point);

            return (
                <Line
                    key={i}
                    from={[points[0][1], points[0][0]]}
                    to={[points[1][1], points[1][0]]}
                    strokeWidth={value * 0.006 * nonLinearScale}
                    strokeLinecap="round"
                    stroke={color}
                />
            );
        };

    const renderTown = (color: string, label: boolean) => (town: Town, i: number) => {
        const population = town.population.total;
        const populationLog = Math.log2(population + 1);

        const markerSize =
            ((populationLog / maxPopulationLog) * 1 + (population / maxPopulation) * 5) * 0.5 * nonLinearScale + 0.01;
        return (
            <Marker
                coordinates={[town.point[1], town.point[0]]}
                key={i}
                onMouseOver={() => setHoverMarker(town.id)}
                onMouseOut={() => setHoverMarker(null)}
                onClick={() => (selectedMarker === town.id ? setSelectedMarker(null) : setSelectedMarker(town.id))}
            >
                <circle
                    r={markerSize}
                    style={{
                        cursor: 'pointer',
                    }}
                    fill={color}
                />
                {label && (
                    <text textAnchor="middle" y={-markerSize - 0.5 * scale} fill="#fff" fontSize={scale * 1.2}>
                        {town.name}
                    </text>
                )}
            </Marker>
        );
    };

    // Render
    return (
        <>
            <g data-reason={'Unselected paths'}>
                {segmentsFiltered.map(renderSegment(palette.primary.darken(0.2).hex()))}
            </g>

            <g data-reason={'Unselected markers'}>
                {townsFiltered.map(
                    renderTown(selectedMarker ? palette.primary.lighten(0.5).desaturate(0.3).hex() : 'white', false),
                )}
            </g>

            <g data-reason={'Selected paths'}>
                {selectedMarker &&
                    connections[selectedMarker] &&
                    idsToSegments(connections[selectedMarker].stations).map(renderSegment(palette.secondary.hex()))}
            </g>

            <g data-reason={'Selected markers'}>
                {selectedMarker &&
                    (connections[selectedMarker]
                        ? idsToStations(connections[selectedMarker].stations)
                              .filter((t) => townsFiltered.includes(t))
                              .map(renderTown('white', true))
                        : [towns[selectedMarker]].map(renderTown('white', true)))}
            </g>

            <g data-reason={'Hover over marker'}>
                {hoverMarker && [towns[hoverMarker]].map(renderTown('white', true))}
            </g>
        </>
    );
}
