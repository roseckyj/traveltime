import { Range } from 'react-range';
import { gradient } from '../styles/palette';
import { Connection, Town } from '../types';
import { formatMinutes } from '../utils/formatMinutes';

interface IControlsProps {
    towns: { [key: number]: Town };
    connections: { [key: number]: Connection };
    segments: { [key: string]: number };
    range: number;
    setRange: (value: number) => void;
}

export function Controls(props: IControlsProps) {
    const { connections, range, setRange } = props;
    const maxTime = Object.values(connections).reduce((prev, curr) => Math.max(prev, curr.time), 0);
    const maxValue = Math.ceil(maxTime / 10) * 10;

    const percent = range / maxValue;

    let ticks: number[] = [];
    for (let i = 60; i <= maxValue; i += 60) {
        ticks.push(i);
    }

    console.log(
        `linear-gradient(to right, rgb(84, 139, 244) 0, rgb(84, 139, 244) ${percent}, rgb(204, 204, 204) ${percent}, rgb(204, 204, 204) 1)`,
    );

    return (
        <>
            <Range
                step={10}
                min={0}
                max={maxValue}
                values={[range]}
                onChange={(values) => setRange(Math.max(values[0], 60))}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: 10,
                            width: 300,
                            background: `linear-gradient(to right, ${Object.entries(gradient)
                                .map(([tick, color]) => `${color} ${(tick as any as number) * percent * 100}%`)
                                .join(', ')}, #fff ${percent * 100}%, #fff 100%)`,
                            position: 'absolute',
                            top: 60,
                            right: 60,
                            borderRadius: 10,
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.4)',
                        }}
                    >
                        {children}
                        {ticks.map((time) => (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `calc(${(time / maxValue) * 100}% - 10px)`,
                                    whiteSpace: 'nowrap',
                                    marginTop: 25,
                                }}
                                onClick={() => setRange(time)}
                            >
                                {formatMinutes(time)}
                            </div>
                        ))}
                    </div>
                )}
                renderThumb={({ props }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: 30,
                            width: 20,
                            borderRadius: 4,
                            backgroundColor: '#FFF',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            outline: 'none',
                            border: 'none',
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.4)',
                        }}
                    >
                        <div style={{ marginBottom: 65, fontWeight: 'bold', whiteSpace: 'nowrap' }} id="output">
                            {formatMinutes(range)}
                        </div>
                    </div>
                )}
            />
        </>
    );
}
