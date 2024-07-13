import Checkbox from "../Checkbox";
import { EditableOptionalDateTimeProps } from "./useEditableOptionalDateTime";
import styles from './EditableOptionalDateTimeComp.module.css'
import Label from "../Label";
import { Dispatch, KeyboardEvent, SetStateAction, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Popup } from "@/app/Popup";
import { formatDateTime, withStopPropagation } from "../utils";
import Input from "../Input";

export interface EditableOptionalDateTimeCompProps {
    label: string;
    info?: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    editedText: string;
    setEditedText: Dispatch<SetStateAction<string>>;
    editing: boolean;
    setEditing: Dispatch<SetStateAction<boolean>>;
    onOk: () => void;
    onCancel: () => void;
    unclearMESZ: boolean;
    userMESZ: boolean;
    setUserMESZ: Dispatch<SetStateAction<boolean>>;
    error: string;
    optionalMs: number | null;
}
export default function EditableOptionalDateTimeComp({ label, info, enabled, setEnabled, editedText, setEditedText,
    editing, setEditing, onOk, onCancel, unclearMESZ, userMESZ, setUserMESZ, error, optionalMs }: EditableOptionalDateTimeCompProps) {

    const [infoVisible, setInfoVisible] = useState(false)
    const dialogRef = useRef<HTMLDialogElement>(null)
    const inputRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const addedCloseListenerRef = useRef<((ev: Event) => any) | null>(null);

    useEffect(() => {
        if (editing && dialogRef.current != null) {
            dialogRef.current.addEventListener('close', addedCloseListenerRef.current = ((e: Event) => {
                if (addedCloseListenerRef.current != null) {
                    dialogRef.current?.removeEventListener('close', addedCloseListenerRef.current);
                    setEditing(false);
                }
            }))
            dialogRef.current.showModal();
        }
        if (!editing && dialogRef.current != null) {
            dialogRef.current.close();
            divRef.current?.focus()
        }
    }, [editing, setEditing])

    const comment = unclearMESZ ? 'Sommerzeit nicht eindeutig, bitte prüfen' : '';
    return (
        <>
            <Checkbox
                label={label}
                value={enabled}
                setValue={setEnabled}
            />
            {
                Number.isSafeInteger(optionalMs) && enabled &&
                <>
                    {/* <div className={styles.labelAndInfo}>
                        {label != null && <Label>{label}</Label>}
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
                    </div> */}

                    <dialog ref={dialogRef} className='dialog'>
                        <Label>{label}</Label>
                        <div>
                            <div><Input ref={inputRef} label='Datum/Uhrzeit (DD.MM.JJJJ hh:mm)' text={editedText} setText={setEditedText} onEnter={onOk} /> <div className={styles.comment}>{comment}</div></div>
                            {
                                unclearMESZ ?
                                <label><input tabIndex={unclearMESZ ? 0 : -1} readOnly={!unclearMESZ} type='checkbox' checked={userMESZ} onChange={() => setUserMESZ(d => !d)} /><span className={unclearMESZ ? '' : styles.disabled} >Sommerzeit</span></label> :
                                <p>({userMESZ ? 'Sommerzeit' : 'Winterzeit'})</p>
                            }
                        </div>

                        <div className={styles.error}>
                            {
                                error !== '' &&
                                <p className={styles.error}>{error}</p>
                            }
                        </div>
                        <div className={styles.buttonRow}>
                            {!error &&
                                <button className={styles.okImg} onClick={withStopPropagation(onOk)}></button>}
                            <button className={styles.cancelImg} onClick={withStopPropagation(onCancel)}></button>
                        </div>
                    </dialog>

                    <div className={`${styles.content} scrollableHor`} style={{ minHeight: '40px', margin: '4px' }} role='button' tabIndex={0} ref={divRef} onKeyUp={(e: KeyboardEvent<HTMLDivElement>) => {
                        e.stopPropagation()
                        let f = () => { }
                        switch (e.key) {
                            case 'Enter': case ' ':
                                setEditing(true);
                                break;
                        }
                    }} onClick={withStopPropagation(() => { setEditing(true) })}>{formatDateTime(optionalMs, true)}</div>

                </>
            }
        </>
    )

}