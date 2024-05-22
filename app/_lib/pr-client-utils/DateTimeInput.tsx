import { useCallback, useEffect, useState } from "react";
import Input from "../Input";
import { parseGermanDate, standardJavascriptDateTimeString } from "../utils";
import styles from './DateTimeInput.module.css'

export interface DateTimeInputProps {
    initialText: string;
    setDate: (d: Date | null) => void;
}
export default function DateTimeInput(p: DateTimeInputProps) {
    const [text, setText] = useState(p.initialText);
    const [comment, setComment] = useState('');
    const [unclearMESZ, setUnclearMESZ] = useState(false);
    const [userMESZ, setUserMESZ] = useState(false);
    const setDate = p.setDate;

    useEffect(() => {
        function extendedSetText(t: string) {
            const res = parseGermanDate(t);
            if (res == null) {
                setComment('Datum/Uhrzeit ungültig!');
                setDate(null);
                return;
            }
            if (Array.isArray(res)) {
                setUnclearMESZ(true);
                setComment('Sommerzeit nicht eindeutig, bitte prüfen')
                setDate(new Date(standardJavascriptDateTimeString(res[0], res[1], res[2], res[3], res[4], userMESZ)));
                return;
            }
            setUnclearMESZ(false);
            setUserMESZ(res.getTimezoneOffset() === -120);
            setComment('');
            console.log('typeof res', typeof res)
            setDate(res);
        }

        console.log('run effect of DateTimeInput')
        extendedSetText(text);
    }, [text, userMESZ, setDate])

    return (
        <div>
            <div><Input id='date' label='Datum/Uhrzeit (MM.DD.JJJJ)' text={text} setText={setText} /> {comment}</div>
            <input readOnly={unclearMESZ} type='checkbox' checked={userMESZ} onChange={() => setUserMESZ(d => !d)} /><span className={unclearMESZ ? '' : styles.disabled } >Sommerzeit</span>
        </div>
    )
}