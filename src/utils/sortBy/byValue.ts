export function byKey(desc?: boolean) {
    return (a: [string | number, any], b: [string | number, any]) => {
        if (typeof a === 'number' && typeof b === 'number') {
            return (a[0] - b[0]) * (desc ? -1 : 1);
        }
        return a[0].toString().localeCompare(b[0].toString()) * (desc ? -1 : 1);
    };
}
