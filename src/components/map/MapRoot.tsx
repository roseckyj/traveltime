import React from 'react';
import { ComposableMap, Geographies, Geography, Point, ZoomableGroup } from 'react-simple-maps';
import { palette } from '../../styles/palette';
import { Connection, Town } from '../../types';
import { MapContent } from './MapContent';

const geographyStyle = {
    default: { outline: 'none' },
    hover: { outline: 'none' },
    pressed: { outline: 'none' },
};

interface IMapRootProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
    selectedMarker: number | null;
    setSelectedMarker: (value: number | null) => void;
    range: number;
}

export function MapRoot(props: IMapRootProps) {
    const [viewport, setViewport] = React.useState<Point | null>([window.innerWidth, window.innerHeight]);
    const [dragging, setDragging] = React.useState<boolean>(false);

    React.useEffect(() => {
        const listener = () => {
            setViewport([window.innerWidth, window.innerHeight]);
        };
        window.addEventListener('resize', listener);

        return () => window.removeEventListener('resize', listener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ComposableMap
            projection="geoMercator"
            width={viewport ? viewport[0] : 1000}
            height={viewport ? viewport[1] : 1000}
            viewBox={`0 0 ${viewport ? viewport[0] : 1000} ${viewport ? viewport[1] : 1000}`}
            style={{
                backgroundColor: '#ebf8ff',
                width: '100%',
                height: '100vh',
            }}
            projectionConfig={{ scale: 1000 }}
        >
            <ZoomableGroup
                center={[15.625233, 49.8022514]}
                zoom={10}
                minZoom={1}
                maxZoom={700}
                onMoveEnd={() => setDragging(false)}
                onMove={() => setDragging(true)}
            >
                <Geographies
                    geography={'/data/geojson/world-countries-sans-antarctica.json'}
                    fill={palette.primary.lighten(1.6).hex()}
                    stroke={palette.primary.lighten(1.6).hex()}
                    strokeWidth={0.1}
                >
                    {({ geographies }) =>
                        geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} style={geographyStyle} />)
                    }
                </Geographies>
                <Geographies
                    geography={'/data/geojson/czech-republic-regions.json'}
                    fill={palette.primary.hex()}
                    stroke={palette.primary.lighten(0.1).hex()}
                    strokeWidth={0.1}
                >
                    {({ geographies }) =>
                        geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} style={geographyStyle} />)
                    }
                </Geographies>
                <MapContent {...props} dragging={dragging} />
            </ZoomableGroup>
        </ComposableMap>
    );
}
