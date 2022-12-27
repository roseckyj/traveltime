export function bySimple(desc?: boolean) {
    return (a: string | number, b: string | number) => {
        if (typeof a === 'number' && typeof b === 'number') {
            return (a - b) * (desc ? -1 : 1);
        }
        return a.toString().localeCompare(b.toString()) * (desc ? -1 : 1);
    };
}
