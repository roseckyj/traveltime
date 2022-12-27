export interface Town {
    name: string;
    id: number;
    district: District;
    region: District;
    postcode: number;
    point: [number, number];
    population: Population;
}

export interface District {
    name: string;
    id: string;
}

export interface Population {
    total: number;
    men: number;
    women: number;
}

export interface Connection {
    time: number;
    stations: number[];
}
