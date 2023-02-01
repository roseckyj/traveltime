import { Connection, Town } from '../types';
import { Await } from '../utils/Await';
import { Display } from './Display';

interface IMapContentWrapperProps {}

export function ContentWrapper(props: IMapContentWrapperProps) {
    return (
        <Await for={(async () => (await fetch(`/data/towns.json`)).json())()}>
            {(towns: { [key: number]: Town }) => (
                <Await for={(async () => (await fetch(`/data/connections.json`)).json())()}>
                    {(connections: { [key: number]: Connection }) => {
                        const conns: { [key: string]: number } = {};
                        Object.values(connections).forEach((conn) => {
                            for (let i = 0; i < conn.stations.length - 1; i++) {
                                const key = `${conn.stations[i].id}-${conn.stations[i + 1].id}`;
                                conns[key] = conns[key] ? conns[key] + 1 : 1;
                            }
                        });

                        return <Display towns={towns} connections={connections} segments={conns} />;
                    }}
                </Await>
            )}
        </Await>
    );
}
