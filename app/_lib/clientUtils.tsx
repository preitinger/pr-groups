'use client'

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import { Popup } from "../Popup";
import Label from "./Label";
import { withStopPropagation } from "./utils";
import Image from "next/image";

import styles from './clientUtils.module.css'
import Input2 from "./pr-client-utils/Input2";

export type Validation = 'validating' | 'valid' | 'invalid'

export interface EditableProps<T> {
    disabled?: boolean
    label?: string
    info?: string;
    value: T
    setValue: (t: T) => void
    format: (t: T) => string
    /**
     * 
     * @param s text to be parsed and checked
     * @returns object of type T or raises an error string that is shown in the editor
     */
    parse: (s: string) => Promise<T>
}

export function Editable<T>({ disabled, label, info, value, setValue, format, parse }: EditableProps<T>) {
    const [editing, setEditing] = useState(false)
    const [validation, setValidation] = useState<Validation>('valid');
    const [error, setError] = useState<string>('')
    const [editedText, setEditedText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const divRef = useRef<HTMLDivElement>(null)
    const dialogRef = useRef<HTMLDialogElement>(null)
    // const popoverRef = useRef<HTMLDivElement>(null)
    const wasEditingRef = useRef<boolean>(false)
    const [infoVisible, setInfoVisible] = useState(false)
    const [editPos, setEditPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

    function onEditClick() {
        if (disabled) return;
        setEditing(true);
        if (dialogRef.current == null) throw new Error('dialogRef.current null')
        dialogRef.current.showModal()
        // if (popoverRef.current != null) {
        //     console.log('added popover toggle event listener')
        //     popoverRef.current.showPopover();
        // }
        setEditedText(format(value))
    }

    function onChange(s: string) {
        setEditedText(s);
        setValidation('validating');
        setError('');
        parse(s).then(value => {
            setValidation('valid');
        }).catch((s: any) => {
            setValidation('invalid')
            if (typeof s === 'string') {
                setError(s);
            } else {
                console.error(s);
            }
        })
    }

    const closeDialog = useCallback(() => {
        if (dialogRef.current == null) return;
        dialogRef.current.close();
        // if (popoverRef.current != null) {
        //     popoverRef.current.hidePopover()

        // }
        setEditing(false);
    }, [])

    function onCancel() {
        if (!editing) return;
        closeDialog();
        setValidation('valid');
        setError('')
    }

    function onOk() {
        if (!editing) return;
        parse(editedText).then(val => {
            setValue(val)
            closeDialog();
        }).catch((s: any) => {
            setValidation('invalid')
            if (typeof s === 'string') {
                setError(s);
            } else {
                console.error(s);
            }
        })
    }

    useEffect(() => {
        if (editing && inputRef.current != null) {
            inputRef.current.focus();
            wasEditingRef.current = true;
        } else if (wasEditingRef.current && !editing && divRef.current != null) {
            divRef.current.focus();
            wasEditingRef.current = false;
        }
    }, [editing])



    return (
        <>
            {
                (label != null || info != null) &&
                <div className={styles.labelAndInfo}>
                    <Label>{label}</Label>
                    {
                        info != null &&
                        <>
                            <button className={styles.infoButton}
                                onClick={() => setInfoVisible(true)}>
                                <Image src='/information-point_72168.png' width={32} height={32} alt='Info' />
                            </button>
                            <Popup visible={infoVisible} setVisible={setInfoVisible}>
                                <p className={styles.info}>{info}</p>
                            </Popup>
                        </>
                    }
                </div>
            }            {/* <button popovertarget='testpopover'>Control popover</button>
            <div ref={popoverRef} id='testpopover' popover='manual' onpopover>
                (popover)
                <input autoFocus className={styles.input} ref={inputRef} value={editedText} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onOk()
                    } else if (e.key === 'Escape') {
                        onCancel();
                    }
                }} />
                {
                    error !== '' &&
                    <p className={styles.error}>{error}</p>
                }
                <div className={styles.buttonRow}>
                    {validation === 'valid' &&
                        <button className={styles.okImg} onClick={withStopPropagation(onOk)}></button>}
                    <button className={styles.cancelImg} onClick={withStopPropagation(onCancel)}></button>
                </div>
            </div> */}
            <dialog onClose={() => { onCancel(); }} className='form' ref={dialogRef} aria-modal>
                {/* <Label>{label}</Label>
                <input autoFocus className={styles.input} ref={inputRef} value={editedText} onChange={(e) => onChange(e.target.value)} onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        onOk()
                    } else if (e.key === 'Escape') {
                        onCancel();
                    }
                }} /> */}
                <Input2 label={label ?? ''} text={editedText} setText={onChange} onEnter={onOk} validate={(text) => {
                    return error
                }} />
                {/* {
                    error !== '' &&
                    <p className={styles.error}>{error}</p>
                } */}
                <div className={styles.buttonRow}>
                    {validation === 'valid' &&
                        <button className={styles.okImg} onClick={withStopPropagation(onOk)}></button>}
                    <button className={styles.cancelImg} onClick={withStopPropagation(onCancel)}></button>
                </div>
            </dialog>
            <div className={`${styles.content} scrollableHor`} role='button' tabIndex={0} ref={divRef} onKeyUp={(e: KeyboardEvent<HTMLDivElement>) => {
                e.stopPropagation()
                let f = () => { }
                switch (e.key) {
                    case 'Enter': case ' ':
                        onEditClick();
                        break;
                }
            }} onClick={disabled ? undefined : withStopPropagation(onEditClick)}>{format(value)}</div>
        </>
    )
}
