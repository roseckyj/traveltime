import { Town } from '../../types';

export function byPopulation(desc?: boolean, prioritize?: number[]) {
    return (a: Town, b: Town) => {
        if (prioritize?.includes(a.id)) return -1;
        if (prioritize?.includes(b.id)) return 1;

        return (a.population.total - b.population.total) * (desc ? -1 : 1);
    };
}
