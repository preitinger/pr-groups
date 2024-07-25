// Achtung Bug in regex implementierung (zumindest in chrome: wenn das leerzeichen gleich nach '[' ist, wird ein + ebenfalls erkannt?!)
const re = /[-/ ]/g

export function whatsappLink(nr: string, msg: string) {
    if (nr.substring(0, 2) === '00') {
        nr = '+' + nr.substring(2)
    } else if (nr.substring(0, 1) === '0') {
        nr = '+49' + nr.substring(1);
    }
    nr = nr.replaceAll(re, '')
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(nr)}&text=${encodeURIComponent(msg)}`
}