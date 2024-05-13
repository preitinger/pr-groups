export function leadingZeros(val: number, digits: number): string {
    let limit = 10;
    let res = `${val}`;
    while (res.length < digits) {
        res = '0' + res;
    }
    return res;
}

export function formatDate(date1: Date | string): string {
    let date: Date;
    if (typeof date1 === 'string') {
        date = new Date(date1);
    } else {
        date = date1;
    }
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    const h = date.getHours();
    const min = date.getMinutes();
    const twoDigs = (val: number) => leadingZeros(val, 2);
    return `${twoDigs(date.getDate())}.${twoDigs(date.getMonth() + 1)}.${yyyy} ${twoDigs(date.getHours())}:${twoDigs(date.getMinutes())}`
}
