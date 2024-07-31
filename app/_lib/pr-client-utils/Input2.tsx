'use client'

import { FocusEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import styles from './Input2.module.css'

export interface Input2Props {
    label: string;
    text: string;
    setText: (text: string) => void;
    comment?: string;
    commentClass?: string;
    type?: 'text' | 'password' | 'email' | 'date' | 'datetime-local' | 'month' | 'number' | 'search' | 'tel' | 'time' | 'week';
    /**
     * 
     * @param text 
     * @returns '' if no error, other-wise error message
     */
    validate?: (text: string) => string;
    onEnter?: () => void;
}
export default function Input2({ label, text, setText, comment, commentClass, type, validate, onEnter }: Input2Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [focussed, setFocussed] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    function onFocus() {
        setFocussed(true)
    }
    function onBlur(e: FocusEvent<HTMLInputElement>) {
        if (inputRef.current != null) {
            const error = (validate && validate(text)) ?? '';
            inputRef.current.setCustomValidity(error);
            setValidationMessage(error);
            // if (error !== '') {
            // inputRef.current.reportValidity()
            // }
        }
        setFocussed(false)
    }

    const doValidate = useCallback((s: string) => {
        const error = (validate && validate(s)) ?? '';
        inputRef.current?.setCustomValidity(error);
        setValidationMessage(error);
        // if (error !== '') inputRef.current?.reportValidity();
    }, [validate])

    useEffect(() => {
        doValidate(text)
    }, /* [text, doValidate] */)

    const onEnterIntern = useCallback(() => {
        doValidate(text)
        if (inputRef.current?.validationMessage) {
            inputRef.current?.reportValidity()
        } else {
            inputRef.current?.blur();
            if (onEnter) onEnter();
        }
    }, [doValidate, text])

    const id = useId();
    const empty = text === '' && !focussed && !['month', 'date', 'week', 'datetime-local'].includes(type ?? 'text');

    return (
        <>
            <div className={styles.box}>
                <label htmlFor={id} className={empty ? styles.empty : ''}>{label}</label>
                <input ref={inputRef} id={id} type={type ?? 'text'} spellCheck={false} value={text} onChange={(e) => { setText(e.target.value); doValidate(e.target.value) }} onFocus={onFocus} onBlur={onBlur} onKeyUp={(e) => {
                    if (e.key === 'Enter') onEnterIntern();
                }} />
                <div className={`${commentClass} ${styles.comment}`}>{(comment == null ? '' : comment + '-') + (validationMessage)}</div>
            </div>
        </>
    )
}