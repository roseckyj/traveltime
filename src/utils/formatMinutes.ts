export function formatMinutes(minutes: number) {
    if (minutes === 0) {
        return 'Origin';
    }

    let result = '';

    if (minutes >= 60) {
        result += Math.floor(minutes / 60) + 'h ';
        minutes = minutes % 60;
    }
    if (Math.floor(minutes) > 0) {
        result += Math.floor(minutes) + 'min';
    }

    return result;
}
