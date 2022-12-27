export function firstN<T>(values: T[], sorter: (a: T, b: T) => number, n: number) {
    return values.sort(sorter).slice(0, n);
}

export function lastN<T>(values: T[], sorter: (a: T, b: T) => number, n: number) {
    return values.sort(sorter).reverse().slice(0, n).reverse();
}
