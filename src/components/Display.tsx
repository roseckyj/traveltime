import React from 'react';
import { Connection, Town } from '../types';
import { Controls } from './Controls';
import { MapRoot } from './map/MapRoot';
import { PathPreview } from './PathPreview';

interface IDisplayProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
}

export function Display(props: IDisplayProps) {
    const [range, setRange] = React.useState(60 * 3);
    const [selectedMarker, setSelectedMarker] = React.useState<number | null>(null);

    return (
        <>
            <Controls {...props} range={range} setRange={(value) => setRange(value)} />
            <MapRoot
                {...props}
                range={range}
                selectedMarker={selectedMarker}
                setSelectedMarker={(id) => setSelectedMarker(id)}
            />
            ;
            <PathPreview {...props} selectedMarker={selectedMarker} />
        </>
    );
}
