import { bySimple } from './bySimple';

export function byKey(desc?: boolean) {
    return (a: [string | number, any], b: [string | number, any]) => bySimple(desc)(a[0], b[0]);
}
