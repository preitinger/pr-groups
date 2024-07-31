'use client'

import Input2 from "@/app/_lib/pr-client-utils/Input2";
import { useCallback, useRef, useState } from "react";

import styles from './page.module.css'

export default function Page() {
    const [text, setText] = useState('');
    const [passwd, setPasswd] = useState('');
    function wrapSetText(t: string) {
        setText(t);
    }
    const validateUser = useCallback((user: string) => {
        return user.length < 3 ? 'At least 3 characters!' : '';
    }, [])

    const validatePasswd = useCallback((passwd: string): string => {
        return passwd.length < 8 ? 'At least 8 characters!' : '';
    }, [])
    const validateNumber = useCallback((s: string) => {
        const n = Number.parseInt(s)
        const res = (n < 1 || n > 10) ? 'not between 1 and 10' : isNaN(n) ? 'no number' : ''
        console.log('validateNumber', n, res);
        return res
    }, [])
    return (
        <>
            <h1>testForm</h1>
            <div className={styles.testBorder}>
                <Input2 label='User' text={text} setText={setText} comment='OK' commentClass={styles.comment1} validate={validateUser} />
                <Input2 label='Passwort' type='password' text={passwd} setText={setPasswd} comment='Use lowercase, uppercase letters and digits' validate={validatePasswd} />
                <Input2 label='date' type='date' text={text} setText={setText} />
                <Input2 label='month' type='month' text={text} setText={setText} />
                <Input2 label='week' type='week' text={text} setText={setText} />
                <Input2 label='datetime-local' type='datetime-local' text={text} setText={setText} />
                <Input2 label='email' type='email' text={text} setText={setText} />
                <Input2 label='number' type='number' text={text} setText={setText} validate={validateNumber} />
            </div>
        </>
    )
}