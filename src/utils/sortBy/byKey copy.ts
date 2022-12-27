import { bySimple } from './bySimple';

export function byValue(desc?: boolean) {
    return (a: [any, string | number], b: [any, string | number]) => bySimple(desc)(a[1], b[1]);
}
