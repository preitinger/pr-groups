// Achtung Bug in regex implementierung (zumindest in chrome: wenn das leerzeichen gleich nach '[' ist, wird ein + ebenfalls erkannt?!)
const re = /[-/ ]/g

export function whatsappLink(nr: string, msg: string) {
    // if (nr[0] !== '+') throw new Error('invalid nr');
    console.log('old nr', nr)
    if (nr.substring(0, 2) === '00') {
        nr = '+' + nr.substring(2)
    } else if (nr.substring(0, 1) === '0') {
        nr = '+49' + nr.substring(1);
    }
    console.log('nr vor replaceAll', nr);
    nr = nr.replaceAll(re, '')
    console.log('adapted nr', nr)
    console.log('nr[0]', nr[0])
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(nr)}&text=${encodeURIComponent(msg)}`
}