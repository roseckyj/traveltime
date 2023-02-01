import { Connection, Town } from '../types';
import { formatMinutes } from '../utils/formatMinutes';

interface IPathPreviewProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
    selectedMarker: number | null;
}

export function PathPreview(props: IPathPreviewProps) {
    const { towns, connections, selectedMarker } = props;

    if (!selectedMarker) return <></>;

    const conn = connections[selectedMarker];

    return (
        <div
            style={{
                position: 'absolute',
                top: 20,
                left: 20,
            }}
        >
            <p>
                <strong>Žďár nad Sázavou - {towns[selectedMarker].name}</strong>
            </p>
            <p>{formatMinutes(conn.time)}</p>
        </div>
    );
}
