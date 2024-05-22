export function leadingZeros(val: number, digits: number): string {
    let limit = 10;
    let res = `${val}`;
    while (res.length < digits) {
        res = '0' + res;
    }
    return res;
}

export function formatDateTime(date1: Date | string): string {
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
    return `${twoDigs(d)}.${twoDigs(m)}.${yyyy} ${twoDigs(h)}:${twoDigs(min)}`
}

export function formatDate(date: Date): string {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const yyyy = date.getFullYear();

    const twoDigs = (val: number) => leadingZeros(val, 2);
    return `${twoDigs(d)}.${twoDigs(m)}.${yyyy}`
}

export function formatTime(date: Date): string {
    const twoDigs = (val: number) => leadingZeros(val, 2);
    return `${twoDigs(date.getHours())}:${twoDigs(date.getMinutes())}`
}

/*

Die mitteleuropäische Sommerzeit (MESZ) beginnt jeweils am letzten Sonntag im Monat März um 2 Uhr mitteleuropäischer Zeit. 
An diesem Tag werden die Uhren um 2 Uhr um eine Stunde auf 3 Uhr vorgestellt.

Die Sommerzeit endet jeweils am letzten Sonntag im Monat Oktober um 3 Uhr mitteleuropäischer Sommerzeit. 
An diesem Tag werden die Uhren um 3 Uhr auf 2 Uhr zurückgestellt. 
Bei dieser doppelt erscheinenden Stunde wird die erste Stunde als 2A und die zweite Stunde als 2B bezeichnet.

MESZ = Mitteleuropäische Sommerzeit

*/
export function lastSundayInMonth(year: number, month_1_to_12: number): Date {
    let nextMonthIdx = month_1_to_12;
    if (nextMonthIdx >= 12) {
        nextMonthIdx -= 12;
        ++year;
    }
    let borderDate = new Date(year, nextMonthIdx, 1);
    let weekDay = borderDate.getDay()
    if (weekDay === 0) weekDay += 7;
    const ms = borderDate.getTime() - weekDay * (24 * 3600 * 1000);
    return new Date(ms);
}

export type MEZState = 'MEZ' | 'MESZ' | 'unclear';
export function detectMESZ(year: number, month: number, day: number, hour: number, minute: number, second?: number): MEZState {
    if (month < 3 || 10 < month) {
        // Januar oder Februar oder November oder Dezember
        return 'MEZ'
    }
    if (3 < month && month < 10) {
        // April bis September
        return 'MESZ';
    }
    if (month === 3) {
        const lastSundayInMarch = lastSundayInMonth(year, 3)
        console.assert(lastSundayInMarch.getFullYear() === year && lastSundayInMarch.getMonth() + 1 === month);
        const lastSundayDay = lastSundayInMarch.getDate();
        if (day < lastSundayDay) return 'MEZ';
        if (day > lastSundayDay) return 'MESZ';
        console.assert(day === lastSundayDay);
        if (hour < 3) return 'MEZ';
        return 'MESZ'
    }
    console.assert(month === 10);
    const lastSundayInOct = lastSundayInMonth(year, 10);
    console.assert(lastSundayInOct.getFullYear() === year && lastSundayInOct.getMonth() + 1 === month);
    const lastSundayDay = lastSundayInOct.getDate();
    if (day < lastSundayDay) return 'MESZ';
    if (day > lastSundayDay) return 'MEZ';
    console.assert(day === lastSundayDay);
    if (hour < 2) return 'MESZ';
    if (hour === 2 || hour === 3 && minute === 0 && (second ?? 0) === 0) return 'unclear'
    return 'MEZ'
}

export function standardJavascriptDateTimeString(year: number, month_1_to_12: number, date: number, hour: number, minute: number, summerTime: boolean) {
    return `${leadingZeros(year, 4)}-${leadingZeros(month_1_to_12, 2)}-${leadingZeros(date, 2)}T${leadingZeros(hour, 2)}:${leadingZeros(minute, 2)}+0${summerTime ? '2' : '1'}:00`;    
}

/**
 * First, tries to detect year, month, date, hour, and minute.
 * Then, detects if the date/time combination is clearly MEZ or MESZ or unclear.
 * If unclear, [year, month_1_to_12, date, hour, minute] is returned as hint that the user has to define if it is MEZ (winter time) or MESZ (summer time).
 * If clear, the Date with according +01:00 for MEZ or +02:00 for MESZ is returned directly.
 * If there is a format error, null is returned.
 * @param s 
 * @returns 
 */
export function parseGermanDate(s: string): Date | number[] | null {
    const re = /(\d+)\.(\d+)\.(\d+) +(\d+):(\d+)/
    const result = re.exec(s);
    if (result == null) return null;
    const dd = parseInt(result[1]);
    const mm = parseInt(result[2]);
    const yyyy = parseInt(result[3]);
    const hh = parseInt(result[4]);
    const min = parseInt(result[5]);
    const state = detectMESZ(yyyy, mm, dd, hh, min);
    switch (state) {
        case 'MEZ': return new Date(standardJavascriptDateTimeString(yyyy, mm, dd, hh, min, false));
        case 'MESZ': return new Date(standardJavascriptDateTimeString(yyyy, mm, dd, hh, min, true));
        case 'unclear': return [yyyy, mm, dd, hh, min];
        default: throw new Error('Illegal state');
    }

}
