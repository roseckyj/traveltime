import React from 'react';
import * as Maps from 'react-simple-maps';
import { Line, Marker } from 'react-simple-maps';
import { gradient, palette } from '../../styles/palette';
import { Connection, Station, Town } from '../../types';
import { formatMinutes } from '../../utils/formatMinutes';
import { useMapUtils } from '../../utils/hooks/useMapUtils';
import { byValue } from '../../utils/sortBy/byKey copy';
import { byPopulation } from '../../utils/sortBy/byPopulation';
import { firstN } from '../../utils/takeN';
import { truthy } from '../../utils/truthy';

interface IMapContentProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
    dragging: boolean;
    range: number;
    selectedMarker: number | null;
    setSelectedMarker: (value: number | null) => void;
}

export function MapContent(props: IMapContentProps) {
    const { isLineOnScreen, isPointOnScreen } = useMapUtils();
    const { projection } = (Maps as any).useMapContext();
    const { k } = (Maps as any).useZoomPanContext();
    const [hoverMarker, setHoverMarker] = React.useState<number | null>(null);
    const { towns, connections, segments, range, selectedMarker, setSelectedMarker } = props;

    const dragging = props.dragging; // Disable if good performance

    // Calculate scales
    const normalizedZoom = Math.max(k, 10);
    const scale = 10 / normalizedZoom;
    const nonLinearScale = scale + Math.log(normalizedZoom) * 0.01;
    const maxPopulation = Object.values(towns).reduce((prev, curr) => Math.max(prev, curr.population.total), 0);
    const maxPopulationLog = Math.log2(maxPopulation);
    const maxTime = range;

    // Filter towns
    const townsLOD = firstN(Object.values(towns), byPopulation(true, truthy(selectedMarker)), 10 * normalizedZoom);
    const townsFiltered = townsLOD.filter((town) => isPointOnScreen([town.point[1], town.point[0]]));

    // Filter segments
    const segmentsLOD = firstN(Object.entries(segments), byValue(true), 30 * normalizedZoom);
    const segmentsRange = segmentsLOD.filter(([key]) =>
        key
            .split('-')
            .map((id) => connections[parseInt(id)].time)
            .every((time) => time <= maxTime),
    );
    const segmentsFiltered = segmentsRange.filter(([key, value], i) => {
        const t = key.split('-').map((key) => towns[parseInt(key)]);
        return isLineOnScreen([t[0].point[1], t[0].point[0]], [t[1].point[1], t[1].point[0]]);
    });

    // Functions
    const stationsToSegments = (station: Station[]) => {
        const result: [string, number][] = [];
        for (let i = 0; i < station.length - 1; i++) {
            const key = `${station[i].id}-${station[i + 1].id}`;
            result.push([key, segments[key]] as [string, number]);
        }
        return result;
    };

    const idsToStations = (ids: number[]) => {
        return ids.map((id) => towns[id]);
    };

    const renderSegment =
        (selected: boolean) =>
        ([key, value]: [string, number], i: number) => {
            const cityIds = key.split('-').map((id) => parseInt(id));
            let points = cityIds.map((id) => towns[id].point);
            const conns = cityIds.map((id) => connections[id]);
            if (!(conns[0] && conns[1])) return;
            let time = conns.map((conn) => conn.time / maxTime);
            let diff = time[1] - time[0];

            if (diff < 0) {
                points = [points[1], points[0]];
                time = [time[1], time[0]];
                diff = -diff;
            }

            const p1 = projection([points[0][1], points[0][0]]);
            const p2 = projection([points[1][1], points[1][0]]);

            const p1l = 0 - time[0] / diff;
            const p2l = 1 + (1 - time[1]) / diff;

            return (
                <>
                    {' '}
                    {selected && (
                        <defs key={i + '_defs'}>
                            <linearGradient
                                id={`grad_${key}${selected ? '_s' : ''}`}
                                gradientUnits="userSpaceOnUse"
                                spreadMethod="pad"
                                x1={p1l * p2[0] + (1 - p1l) * p1[0]}
                                y1={p1l * p2[1] + (1 - p1l) * p1[1]}
                                x2={p2l * p2[0] + (1 - p2l) * p1[0]}
                                y2={p2l * p2[1] + (1 - p2l) * p1[1]}
                            >
                                (1-p2l) *
                                {Object.entries(gradient).map(([stop, color], i) => (
                                    <stop stop-color={color} offset={stop} key={i} />
                                ))}
                            </linearGradient>
                        </defs>
                    )}
                    <Line
                        key={i}
                        from={[points[0][1], points[0][0]]}
                        to={[points[1][1], points[1][0]]}
                        strokeWidth={value * 0.006 * nonLinearScale}
                        strokeLinecap="round"
                        stroke={
                            selected
                                ? `url(#grad_${key}${selected ? '_s' : ''}) ${palette.secondary.hex()}`
                                : palette.primary.darken(0.2).hex()
                        }
                    />
                </>
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
                    <>
                        <text
                            textAnchor="middle"
                            y={-markerSize - 2.5 * scale}
                            fill="#fff"
                            fontSize={scale * 1.2}
                            fontWeight="bold"
                            style={{
                                textShadow: '0px 0px 5px rgba(0,0,0,0.7)',
                            }}
                        >
                            {town.name}
                        </text>
                        <text
                            textAnchor="middle"
                            y={-markerSize - 1 * scale}
                            fill="#fff"
                            fontSize={scale * 1.2}
                            style={{
                                textShadow: '0px 0px 5px rgba(0,0,0,0.7)',
                            }}
                        >
                            {formatMinutes(connections[town.id].time)}
                        </text>
                    </>
                )}
            </Marker>
        );
    };

    // Render
    return (
        <>
            <g data-reason={'Unselected paths'}>{!dragging && segmentsFiltered.map(renderSegment(!selectedMarker))}</g>

            <g data-reason={'Unselected markers'}>
                {townsFiltered.map(
                    renderTown(selectedMarker ? palette.primary.lighten(0.5).desaturate(0.3).hex() : 'white', false),
                )}
            </g>

            <g data-reason={'Selected paths'}>
                {!dragging &&
                    selectedMarker &&
                    connections[selectedMarker] &&
                    stationsToSegments(connections[selectedMarker].stations).map(renderSegment(true))}
            </g>

            <g data-reason={'Selected markers'}>
                {selectedMarker &&
                    (connections[selectedMarker]
                        ? idsToStations(connections[selectedMarker].stations.map((station) => station.id))
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
