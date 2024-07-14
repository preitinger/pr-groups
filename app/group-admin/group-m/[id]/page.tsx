'use client'

import Header from "@/app/_lib/Header";
import Menu from "@/app/_lib/Menu";
import { SessionContext } from "@/app/_lib/SessionContext";
import { Activity, EditedActivity, GroupAdminGroupReq, GroupAdminGroupResp, GroupAdminGroupUpdateReq, GroupAdminGroupUpdateResp, GroupAdminMemberAddReq, GroupAdminMemberAddResp, GroupAdminMemberDeleteReq, GroupAdminMemberDeleteResp, GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp, ImgData, Member } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { ChangeEvent, FocusEventHandler, KeyboardEvent, PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import styles from './page.module.css'
import { type HeaderLine } from "@/app/_lib/HeaderLine";
import { dateFromMillisOrNull, formatDateTime, millisFromDateOrNull, parseGermanDate, withStopPropagation } from "@/app/_lib/utils";
import Input from "@/app/_lib/Input";
import { Popup } from "@/app/Popup";
import LoginComp from "@/app/_lib/user-management-client/LoginComp";
import assert from "assert";
import FixedAbortController from "@/app/_lib/pr-client-utils/FixedAbortController";
import Image from "next/image";
import ScrollableContainer from "@/app/_lib/pr-client-utils/ScrollableContainer";
import { ScrollableContainerProps } from "@/app/_lib/pr-client-utils/ScrollableContainerProps";
import { whatsappLink } from "@/app/_lib/whatsapp";
import MemberAdd from "@/app/_lib/MemberAdd";
import { useRouter } from "next/navigation";
import DateTimeInput from "@/app/_lib/pr-client-utils/DateTimeInput";
import Checkbox from "@/app/_lib/Checkbox";
import Label from "@/app/_lib/Label";
import EditableOptionalDateTimeComp from "@/app/_lib/pr-client-utils/EditableOptionalDateTimeComp";
import useEditableOptionalDateTime from "@/app/_lib/pr-client-utils/useEditableOptionalDateTime";

const MAX_GROUP_LENGTH = 20
const MAX_HEADER_LEN = 20
const MAX_DOC_TITLE_LENGTH = 20

function invitationLink(group: string, member: Member): string {
    return `/member/${encodeURIComponent(group)}/${encodeURIComponent(member.phoneNr)}/${encodeURIComponent(member.token)}`
}

function Content({ children }: PropsWithChildren<{}>) {
    return <div className={styles.content}>{children}</div>
}

type Validation = 'validating' | 'valid' | 'invalid'

interface EditableProps<T> {
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

function Editable<T>({ disabled, label, info, value, setValue, format, parse }: EditableProps<T>) {
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
            <dialog onClose={() => { onCancel(); }} className='dialog' ref={dialogRef} aria-modal>
                <Label>{label}</Label>
                <input autoFocus className={styles.input} ref={inputRef} value={editedText} onChange={(e) => onChange(e.target.value)} onKeyUp={(e) => {
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

interface OptionalEditableProps<T> {
    label: string;
    value: T | null;
    defaultValue: T;
    setValue: (t: T | null) => void;
    format: (t: T) => string
    /**
     * 
     * @param s text to be parsed and checked
     * @returns object of type T or raises an error string that is shown in the editor
     */
    parse: (s: string) => Promise<T>
}

function OptionalEditable<T>({ label, value, defaultValue, setValue, format, parse }: OptionalEditableProps<T>) {
    const lastValueRef = useRef<T | null>(null);
    const [text, setText] = useState('');
    const [editing, setEditing] = useState(false);

    const updateEnabled = useCallback((enabled: boolean) => {
        if (enabled) {
            const last = lastValueRef.current;
            setValue(last == null ? defaultValue : last)
        } else {
            setValue(null);
        }
    }, [defaultValue, setValue])
    return <div className={styles.optionalEditable}>
        <Checkbox
            label={label}
            value={value != null}
            setValue={updateEnabled}
        />
        {
            value != null &&
            <Editable value={value} setValue={setValue} format={format} parse={parse} />
        }
    </div>
}

interface EditableImgProps {
    label: string;
    img: ImgData | null;
    setImg: (img: ImgData | null) => void

}
function EditableImg({ label, img, setImg }: EditableImgProps) {
    const [imgUsed, setImgUsed] = useState(img != null);
    const [imgVal, setImgVal] = useState<ImgData>({
        src: '/',
        alt: label,
        width: 50,
        height: 50
    })
    const [editing, setEditing] = useState(false)


    useEffect(() => {
        setImgUsed(img != null);
    }, [img])

    function onImgClick() {
        setEditing(!editing);
    }

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files != null && e.target.files.length === 1) {
            if (img == null) throw new Error('img null');
            setImg({
                ...img,
                src: URL.createObjectURL(e.target.files[0])
            })
            setEditing(false)
        }
    }

    return (
        <>
            <Checkbox label={label} value={imgUsed} setValue={(b) => {
                if (!b) {
                    if (img == null) {
                        console.error('unexpected: img null')
                    } else {
                        setImgVal(img);
                        setImg(null);
                    }
                } else {
                    setImg(imgVal)
                }
                setImgUsed(b)
            }} />

            {editing && img != null && <fieldset className={styles.fieldSet}>
                <legend>{label}</legend>
                {<div><Image tabIndex={0} role="button" onKeyUp={(e: KeyboardEvent<HTMLDivElement>) => {
                    e.stopPropagation()
                    let f = () => { }
                    switch (e.key) {
                        case 'Enter': case ' ':
                            onImgClick();
                            break;
                    }
                }} onClick={onImgClick} src={img.src} alt={img.alt} width={img.width} height={img.height} /></div>}
                <Editable label='src' value={img.src} setValue={(src) => {
                    if (img != null && src != null) {
                        setImg({
                            ...img,
                            src: src
                        })
                    }
                }} format={id<string>} parse={(s) => (s === '' ? Promise.reject('Leere URL nicht möglich') : Promise.resolve(s))} />
                <input type='file' accept='image/*' onChange={(e) => onFileChange(e)} />
                <Editable label='alt' value={img.alt} setValue={(alt) => {
                    if (img != null) {
                        setImg({
                            ...img,
                            alt: alt
                        })

                    }
                }} format={id<string>} parse={(s) => (s === '' ? Promise.reject('Bitte etwas eingeben!') : Promise.resolve(s))} />
                <Editable label='width (Pixel)' value={img.width} setValue={(width) => {
                    if (img != null) {
                        setImg({
                            ...img,
                            width: width
                        })
                    }
                }} format={(width) => width.toString()} parse={(s) => {
                    if (s === '') {
                        return Promise.reject('Bitte Zahl eingeben!')
                    }
                    try {
                        const i = parseInt(s)
                        if (isFinite(i)) {
                            return Promise.resolve(i)
                        } else {
                            return Promise.reject('Bitte Zahl eingeben!')
                        }
                    } catch (reason) {
                        return Promise.reject('Bitte Zahl eingeben!')
                    }
                }} />
                <Editable label='height (Pixel)' value={img.height} setValue={(height) => {
                    if (img != null) {
                        setImg({
                            ...img,
                            height: height
                        })
                    }
                }} format={(height) => height.toString()} parse={(s) => {
                    if (s === '') {
                        return Promise.reject('Bitte Zahl eingeben!')
                    }
                    try {
                        const i = parseInt(s)
                        if (isFinite(i)) {
                            return Promise.resolve(i)
                        } else {
                            return Promise.reject('Bitte Zahl eingeben!')
                        }
                    } catch (reason) {
                        return Promise.reject('Bitte Zahl eingeben!')
                    }

                }} />
            </fieldset>}
            {!editing && img != null && <div><Image tabIndex={0} role="button" onKeyUp={(e: KeyboardEvent<HTMLDivElement>) => {
                e.stopPropagation()
                let f = () => { }
                switch (e.key) {
                    case 'Enter': case ' ':
                        onImgClick();
                        break;
                }
            }} onClick={onImgClick} src={img.src} alt={img.alt} width={img.width} height={img.height} /></div>}



        </>
    )
}

// interface EditableDateTimeProps {
//     disabled?: boolean
//     label?: string
//     info?: string
//     msValue: number
//     setValue: (ms: number) => void
// }

// function EditableDateTime({ disabled, label, info, msValue, setValue }: EditableDateTimeProps) {
//     const [editing, setEditing] = useState(false)
//     const [validation, setValidation] = useState<Validation>('valid');
//     const [error, setError] = useState<string>('')
//     const [editedDate, setEditedDate] = useState<Date | null>(null);
//     const inputRef = useRef<HTMLInputElement>(null)
//     const divRef = useRef<HTMLDivElement>(null)
//     const dialogRef = useRef<HTMLDialogElement>(null)
//     const wasEditingRef = useRef<boolean>(false)
//     const [infoVisible, setInfoVisible] = useState(false)


//     function onEditClick() {
//         console.log('onEditClick: disabled', disabled)
//         if (disabled) return;
//         console.log('onEditClick')
//         setEditing(true);
//         if (dialogRef.current != null) {
//             dialogRef.current.showModal()
//         }
//         setEditedDate(dateFromMillisOrNull(msValue))
//         // setEditedText(format(value))
//     }

//     // function onChange(s: string) {
//     //     setEditedText(s);
//     //     setValidation('validating');
//     //     setError('');
//     //     parse(s).then(value => {
//     //         setValidation('valid');
//     //     }).catch((s: any) => {
//     //         setValidation('invalid')
//     //         if (typeof s === 'string') {
//     //             console.log('setError', s)
//     //             setError(s);
//     //         } else {
//     //             console.error(s);
//     //         }
//     //     })
//     // }

//     function onCancel() {
//         setEditing(false);
//         if (dialogRef.current != null) {
//             dialogRef.current.close();
//         }
//         setValidation('valid');
//         setError('')
//     }

//     function onOk() {
//         if (editedDate == null) {
//             setValidation('invalid')
//             setError('Ungültige Eingabe!');
//         } else {
//             setValue(millisFromDateOrNull(editedDate) ?? 0)
//             setEditing(false)
//             if (dialogRef.current != null) {
//                 dialogRef.current.close();
//             }
//         }
//         // parse(editedText).then(val => {
//         //     setValue(val)
//         //     setEditing(false);
//         // }).catch((s: any) => {
//         //     setValidation('invalid')
//         //     if (typeof s === 'string') {
//         //         console.log('setError', s)
//         //         setError(s);
//         //     } else {
//         //         console.error(s);
//         //     }
//         // })

//     }

//     useEffect(() => {
//         console.log('editing', editing, 'inputRef.current', inputRef.current, 'divRef.current', divRef.current)
//         if (editing && inputRef.current != null) {
//             inputRef.current.focus();
//             wasEditingRef.current = true;
//             inputRef.current.scrollIntoView()
//         } else if (wasEditingRef.current && !editing && divRef.current != null) {
//             console.log('calling divRef.current.focus()')
//             divRef.current.focus();
//             wasEditingRef.current = false;
//         }
//     }, [editing])



//     return (
//         <>
//             <div className={styles.labelAndInfo}>
//                 {label != null && <Label>{label}</Label>}
//                 {
//                     info != null &&
//                     <>
//                         <button className={styles.infoButton}
//                             onClick={() => setInfoVisible(true)}>
//                             <Image src='/information-point_72168.png' width={32} height={32} alt='Info' />
//                         </button>
//                         <Popup visible={infoVisible} setVisible={setInfoVisible}>
//                             <p className={styles.info}>{info}</p>
//                         </Popup>
//                     </>
//                 }
//             </div>

//             <dialog ref={dialogRef} className='dialog'>
//                 <Label>{label}</Label>
//                 <DateTimeInput ref={inputRef} initialText={formatDateTime(msValue)} setDate={setEditedDate} />
//                 {
//                     error !== '' &&
//                     <p className={styles.error}>{error}</p>
//                 }
//                 <div className={styles.buttonRow}>
//                     {validation === 'valid' &&
//                         <button className={styles.okImg} onClick={withStopPropagation(onOk)}></button>}
//                     <button className={styles.cancelImg} onClick={withStopPropagation(onCancel)}></button>
//                 </div>
//             </dialog>
//             {
//                 !editing &&
//                 <div className={`${styles.content} scrollableHor`} role='button' tabIndex={0} ref={divRef} onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
//                     e.stopPropagation()
//                     let f = () => { }
//                     switch (e.key) {
//                         case 'Enter': case ' ':
//                             onEditClick();
//                             break;
//                     }
//                 }} onClick={disabled ? undefined : withStopPropagation(onEditClick)}>{formatDateTime(msValue)}</div>
//             }
//         </>
//     )
// }

function HeaderLine({ children, label, line, setLine }: PropsWithChildren<{ label: string; line: HeaderLine; setLine: (line: HeaderLine) => void }>) {
    // const [lineUsed, setLineUsed] = useState(false);
    const [lineVal, setLineVal] = useState<HeaderLine>({
        text: '"' + label + '"',
        fontSize: '1rem',
        bold: false
    })

    // useEffect(() => {
    //     setLineUsed(line != null);
    // }, [line])

    const lineUsed = (line != null && line.text !== '')

    return (
        <>
            <Checkbox label={`${label} anzeigen`} value={lineUsed} setValue={(b) => {
                if (!b) {
                    if (line.text === '') {
                        console.error('unexpected: empty line text');
                    } else {
                        setLineVal(line)
                        setLine({
                            ...line,
                            text: '',
                        })
                    }
                } else {
                    setLine(lineVal)
                }
                // setLineUsed(b)
            }} />
            {lineUsed &&
                <fieldset className={styles.fieldSet}>
                    <legend>{label}</legend>
                    {
                        // line != null &&
                        <>
                            <Editable
                                label={`${label} / Text`}
                                value={line.text}
                                setValue={(text) => {
                                    setLine({
                                        ...line,
                                        text: text
                                    })
                                }}
                                format={id}
                                parse={text => { if (text === '') { return Promise.reject('darf nicht leer sein!') } else if (text.length > MAX_HEADER_LEN) { return Promise.reject(`Max. ${MAX_HEADER_LEN} Zeichen!`) } { return Promise.resolve(text) } }}
                            />
                            <Editable
                                label={`${label} / font-size`}
                                value={line.fontSize}
                                setValue={(v) => {
                                    setLine({
                                        ...line,
                                        fontSize: v
                                    })
                                }}
                                format={id}
                                parse={text => {
                                    if (CSS.supports('font-size', text)) {
                                        return Promise.resolve(text)
                                    } else {
                                        return Promise.reject('Kein gültiger CSS-Wert für font-size');
                                    }
                                }}
                            />


                            <Checkbox label='bold' value={line.bold} setValue={(bold) => {
                                setLine({
                                    ...line,
                                    bold: bold
                                })
                            }} />
                        </>

                    }
                </fieldset>
            }
        </>
    )
}

function id<T>(t: T) {
    return t
}

interface ActivityCompProps {
    i: number;
    a: EditedActivity;
    updateName: (name: string) => void;
    updateDate: (ms: number | null) => void;
    updateCapacity: (capacity: number | null) => void;
    onDelete: () => void;
    onArchive: () => void;
}
function ActivityComp({ i, a, updateName, updateDate, updateCapacity, onDelete, onArchive }: ActivityCompProps) {
    const [menuVisible, setMenuVisible] = useState(false)
    const [testDate, setTestDate] = useState<string>('2024-06-25T18:00');

    const [
        date_enabled,
        date_setEnabled,
        date_editedText,
        date_setEditedText,
        date_editing,
        date_setEditing,
        date_onOk,
        date_onCancel,
        date_unclearMESZ,
        date_userMESZ,
        date_setUserMESZ,
        date_error

    ] = useEditableOptionalDateTime({
        optionalMs: a.date,
        setOptionalMs: updateDate
    })

    const andCloseMenu = (f: () => void) => () => {
        setMenuVisible(false);
        f();
    }

    return <div key={i} className={styles.activity}>
        <div tabIndex={0} className={styles.menuDiv} onClick={() => setMenuVisible(true)}><Image src='/main-menu.svg' width={32 * 0.65} height={32 * 0.65} alt='Menu' /></div>
        <Popup visible={menuVisible} setVisible={setMenuVisible}>
            <p>{a.name}</p>
            <p>{formatDateTime(a.date)}</p>
            <button className={styles.delete + ' ' + styles.marginTop} onClick={andCloseMenu(onDelete)}>LÖSCHEN</button>
            <button className={styles.archive + ' ' + styles.marginTop} onClick={andCloseMenu(onArchive)}>ARCHIVIEREN</button>

        </Popup>
        <Editable label='Was'
            value={a.name}
            setValue={updateName}
            format={(name) => {
                return name
            }} parse={(s) => (
                Promise.resolve(s)
            )} />
        <EditableOptionalDateTimeComp
            label='Wann'
            enabled={date_enabled}
            setEnabled={date_setEnabled}
            editedText={date_editedText}
            setEditedText={date_setEditedText}
            editing={date_editing}
            setEditing={date_setEditing}
            onOk={date_onOk}
            onCancel={date_onCancel}
            unclearMESZ={date_unclearMESZ}
            userMESZ={date_userMESZ}
            setUserMESZ={date_setUserMESZ}
            error={date_error}
            optionalMs={a.date}
        />
        <OptionalEditable label='Kapazität'
            value={a.capacity}
            setValue={updateCapacity}
            defaultValue={2}
            format={(capacity) => capacity?.toString() ?? 'null'}
            parse={(s) => {
                const v = parseInt(s);
                if (Number.isInteger(v) && v > 0) {
                    return Promise.resolve(parseInt(s))
                } else {
                    return Promise.reject('Bitte positive ganze Zahl eingeben')
                }
            }}
        />
        <hr className={styles.hr} />
    </div>
}

export default function Page({ params }: { params: { id: string } }) {
    const user = useUser();
    const groupIdRef = useRef<string | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [comment, setComment] = useState('');
    const [memberComment, setMemberComment] = useState('')
    const [logo, setLogo] = useState<ImgData | null>(null);
    const [line1, setLine1] = useState<HeaderLine | null>(null);
    const [margin, setMargin] = useState('')
    const [line2, setLine2] = useState<HeaderLine | null>(null);
    const [docTitle, setDocTitle] = useState<string | null>(null);
    const [lastDocTitle, setLastDocTitle] = useState<string>('pr-groups');
    const [admins, setAdmins] = useState<string[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [activities, setActivities] = useState<EditedActivity[]>([]);
    const [activityIdxToArchive, setActivityIdxToArchive] = useState<number[]>([]);
    const [login, setLogin] = useState(false)
    const [dirty, setDirty] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null)
    const [snapWidth, setSnapWidth] = useState<number | undefined>(undefined)
    const scrollableContainerRef = useRef<React.JSX.Element>(null)
    const [horPage, setHorPage] = useState(0)
    const [addingMember, setAddingMember] = useState(false);
    const router = useRouter();
    const [editedMemberIdx, setEditedMemberIdx] = useState<number | null>(null);
    const [editedMember, setEditedMember] = useState<Member | null>(null);
    const activityScrollableRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(() => {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setLogin(true);
            setSpinning(false);
            return;
        }
        assert(groupIdRef.current != null);
        const req: GroupAdminGroupReq = {
            user: user1,
            token: token1,
            groupId: groupIdRef.current
        }
        setSpinning(true);
        const abortController = abortControllerRef.current;
        if (abortController == null) throw new Error('abortController null?!');
        apiFetchPost<GroupAdminGroupReq, GroupAdminGroupResp>('/api/group-admin/group/', req, abortController.signal).then(resp => {
            console.log('resp', resp);
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success': {
                    setLogo(resp.logo)
                    setLine1(resp.line1);
                    setMargin(resp.margin);
                    setLine2(resp.line2);
                    setDocTitle(resp.docTitle);
                    setAdmins(resp.admins)
                    setMembers(resp.members)
                    setActivities(resp.activities)
                    setActivityIdxToArchive([]);
                    const ctx = new SessionContext();
                    ctx.activities = resp.activities;
                    setDirty(false)
                    setComment('Zum Bearbeiten jeweils anklicken.')
                    break;
                }
            }
        }).catch(reason => {
            if ('name' in reason && reason.name === 'AbortError') {
                // expected
            } else {
                console.error('Unexpected error', reason)
            }
        }).finally(() => {
            setSpinning(false);
        })

    }, [])

    useEffect(() => {
        // const w = scrollableContainerRef.current?.t
    })

    useEffect(() => {
        const abortController = abortControllerRef.current = new FixedAbortController();
        setGroupId(groupIdRef.current = decodeURIComponent(params.id))
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            setLogin(true)
            return;
        }
        fetchData();

        return () => {
            abortController.abort()
        }
    }, [params.id, fetchData])

    const onMenuClick = (idx: number) => () => {
        switch (idx) {
            case 0: // DESKTOP SITE
                router.push(`/group-admin/group/${params.id}`)
                break;
        }
    }

    function onLogin() {
        setLogin(false);
        setComment('');
        fetchData();
    }

    function withSetDirty<T>(set: (t: T) => void) {
        return function (t: T) {
            set(t);
            setDirty(true)
        }
    }

    function onSave() {
        if (groupIdRef.current !== groupId) {
            if (confirm(`Änderung des Gruppennamens wird derzeit nicht unterstützt. Wieder zurücksetzen auf "${groupIdRef.current}"?`)) {
                setGroupId(groupIdRef.current)
            }
            return;
        }

        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;

        if (user1 == null || token1 == null) {
            setLogin(true);
            return;
        }

        if (groupId == null) throw new Error('groupId null?!');
        if (line1 == null) throw new Error('line1 null?!');
        if (line2 == null) throw new Error('line2 null?!');

        const req: GroupAdminGroupUpdateReq = {
            user: user1,
            token: token1,
            groupId: groupId,
            logo: logo,
            line1: line1,
            margin: margin,
            line2: line2,
            docTitle: docTitle,
            admins: admins,
            members: members,
            activities: activities,
            activityIdxToArchive: activityIdxToArchive
        }
        setSpinning(true)
        apiFetchPost<GroupAdminGroupUpdateReq, GroupAdminGroupUpdateResp>('/api/group-admin/group-update', req, abortControllerRef.current?.signal).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setDirty(false);
                    break;
                case 'error':
                    setComment(`Unerwarteter Fehler: ${resp.error}`);
                    break;
            }
        }).catch(reason => {
            if ('name' in reason && reason.name === 'AbortError') return;
            setComment(`Unerwarteter Fehler: ${JSON.stringify(reason)}`)
        }).finally(() => {
            setSpinning(false);
        })
    }

    function onDismiss() {
        if (confirm('Änderungen auf dieser Seite wirklich verwerfen und Daten neu laden?')) {
            fetchData()
        }
    }

    function onAddMember() {
        setAddingMember(true);
    }

    async function onMemberAdded({ group, newPhoneNr, prename, surname }: { group: string; newPhoneNr: string; prename: string; surname: string }) {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setMemberComment('Du bist nicht eingeloggt.')
            return;
        }
        const req: GroupAdminMemberAddReq = {
            user: user1,
            token: token1,
            groupId: group,
            phoneNr: newPhoneNr,
            prename: prename,
            surname: surname,
        }
        setMemberComment('');
        setAddingMember(false);
        setSpinning(true);
        try {
            const resp = await apiFetchPost<GroupAdminMemberAddReq, GroupAdminMemberAddResp>('/api/group-admin/member-add', req)
            switch (resp.type) {
                case 'authFailed':
                    setMemberComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setMembers(resp.members)
                    break;
                case 'groupNotFound':
                    setMemberComment(`Gruppe ${group} existiert nicht.`);
                    break;
                case 'phoneNrContained':
                    setMemberComment(`Abgebrochen. Es gibt bereits ein Mitglied mit Telefonnr ${newPhoneNr} in Gruppe ${group}.`)
                    break;
                case 'error':
                    setMemberComment(`Unerwarteter Fehler: ${resp.error}`);
                    break;
            }
        } finally {
            setSpinning(false);
        }
    }

    const editMember = (idx: number) => () => {
        setEditedMemberIdx(idx)
        setEditedMember({
            ...members[idx]
        })
    }

    /**
     * only save the member temporarily. Will be finally saved on "Aenderungen speichern"
     * @returns 
     */
    function saveEditedMember() {
        if (editedMember == null) return;

        // new temporary saving:

        setMembers(members.map(member => editedMember.phoneNr === member.phoneNr ? editedMember : member));
        setEditedMemberIdx(null);
        setEditedMember(null);
        setDirty(true);


        // old final saving:
        // const ctx = new SessionContext();
        // const user1 = ctx.user;
        // const token1 = ctx.token;
        // if (user1 == null || token1 == null || groupIdRef.current == null) {
        //     setMemberComment('Nicht eingeloggt.');
        //     return;
        // }
        // const req: GroupAdminMemberUpdateReq = {
        //     user: user1,
        //     token: token1,
        //     groupId: groupIdRef.current,
        //     member: editedMember
        // }
        // setSpinning(true);
        // apiFetchPost<GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp>('/api/group-admin/member-update', req).then(resp => {
        //     switch (resp.type) {
        //         case 'authFailed':
        //             setComment('Nicht authorisiert.');
        //             break;
        //         case 'notFound':
        //             setComment('Nicht gefunden');
        //             break;
        //         case 'success':
        //             setEditedMemberIdx(null);
        //             setEditedMember(null);
        //             setMembers(resp.members);
        //             break;
        //         case 'error':
        //             setComment('Unerwarteter Fehler: ' + resp.error);
        //             break;
        //     }
        // }).catch(reason => {
        //     setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
        // }).finally(() => {
        //     setSpinning(false);
        // })
    }

    /**
     * only delete the edited member temporarily. Final deletion will be done on click on "Aenderungen speichern"
     * @returns 
     */
    function deleteEditedMember() {
        if (editedMember == null || groupId == null) return;

        // new temporary deletion:
        setMembers(members.filter(member => member.phoneNr !== editedMember.phoneNr));
        setEditedMemberIdx(null);
        setEditedMember(null);
        setDirty(true);


        // old final deletion:
        // const ctx = new SessionContext();
        // const user1 = ctx.user;
        // const token1 = ctx.token;
        // if (user1 == null || token1 == null) return;

        // if (confirm(`Mitglied mit Nr ${editedMember?.phoneNr} wirklich aus Gruppe ${groupId} ${(line1?.text || line2?.text) && `(${line1?.text} ${line1?.text && line2?.text && ' - '}${line2?.text})`} entfernen?`)) {
        //     const req: GroupAdminMemberDeleteReq = {
        //         user: user1,
        //         token: token1,
        //         groupId: groupId,
        //         phoneNr: editedMember.phoneNr
        //     }
        //     setSpinning(true);
        //     apiFetchPost<GroupAdminMemberDeleteReq, GroupAdminMemberDeleteResp>('/api/group-admin/member-delete', req, abortControllerRef.current?.signal).then(resp => {
        //         switch (resp.type) {
        //             case 'authFailed':
        //                 setComment('Nicht authorisiert.');
        //                 break;
        //             case 'success':
        //                 setMembers(members.filter(m => m.phoneNr !== editedMember?.phoneNr))
        //                 setEditedMemberIdx(null);
        //                 setEditedMember(null);
        //                 break;
        //             case 'error':
        //                 setComment(`Unerwarteter Fehler: ${resp.error}`);
        //                 break;
        //         }
        //     }).finally(() => {
        //         setSpinning(false)
        //     })
        // }
    }

    const updateActivity = useCallback((i: number, attr: string) => <T,>(t: T) => {
        setActivities(d => d.map((a, j) => (
            j === i ? ({
                ...a,
                [attr]: t
            }) : a
        )))
        setDirty(true);
    }, [])

    const deleteActivity = useCallback((i: number) => () => {
        setActivities(activities => activities.filter((a, j) => i !== j))
        setActivityIdxToArchive(old => {
            const a: number[] = [];
            old.forEach(j => {
                if (j < i) a.push(j);
                else if (j > i) a.push(j - 1);
            })
            return a;
        })
        setDirty(true)
    }, [])

    const archiveActivity = useCallback((i: number) => () => {
        setActivityIdxToArchive(old => [...old, i])
        setDirty(true);
    }, [])

    const addActivity = useCallback(() => {
        setActivities(activities => [...activities, {
            creationDate: null,
            name: 'Unbenannte Aktivität',
            date: null,
            capacity: null,
            participations: [],

        }])
        setDirty(true);
        setTimeout(() => {
            if (activityScrollableRef.current != null) {
                activityScrollableRef.current.scrollTo({
                    top: activityScrollableRef.current.scrollHeight,
                    behavior: 'smooth'
                })
            }

        })
    }, [])

    const addAdmin = useCallback(() => {
        const newAdmin = window.prompt('Enter the user name of the admin to add to this group.');
        if (newAdmin != null) {
            setAdmins(admins => [...admins, newAdmin]);
            setDirty(true);
        }
    }, [])

    const deleteAdmin = (admin: string) => () => {
        setAdmins(admins => admins.filter(a => a !== admin));
        setDirty(true);
    }

    return (
        <Menu
            onDeleteMemberClick={null} group={null}
            customLabels={[{ label: 'LAYOUT FÜR DESKTOP', src: '/edit_12000664.png', alt: 'EDIT', width: 32, height: 32 }]}
            customSpinning={spinning}
            onCustomClick={onMenuClick}
        >
            {groupId != null &&
                <>
                    <Header
                        user={user}
                        line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2rem', bold: false }}
                        margin='1rem'
                        line2={{ text: groupId ?? '', fontSize: '1.5rem', bold: true }}
                    />
                    <div className={styles.main}>
                        <ScrollableContainer className={styles.scrollableContainer} points snap={horPage} setSnap={(i) => { setHorPage(i) }} snapWidth={260} snapOffset={0} >
                            <div className={styles.page}>
                                <div className={`scrollable ${styles.groupData}`}>

                                    <p>{comment}</p>
                                    <EditableImg label='Logo' img={logo} setImg={withSetDirty(setLogo)} />
                                    <Editable label='Gruppenname'
                                        info='Achtung! Wenn der Gruppenname geändert wird, ändern sich auch die Links für die Gruppenmitglieder, welche dann neu verschickt werden müssen.'
                                        value={groupId} setValue={withSetDirty(setGroupId)} format={id<string>} parse={(s) => s.length <= MAX_GROUP_LENGTH ? Promise.resolve(s) : Promise.reject(`Gruppenname max. ${MAX_GROUP_LENGTH} Zeichen!`)} />
                                    <HeaderLine label='Überschrift 1' line={line1 ?? { text: '', fontSize: '1rem', bold: false }} setLine={withSetDirty(setLine1)} />
                                    <Editable label='Abstand zwischen Überschrift 1 und Überschrift 2'
                                        value={margin} setValue={withSetDirty(setMargin)} format={id<string>} parse={(s) => {
                                            if (CSS.supports('margin', s)) {
                                                return Promise.resolve(s)
                                            } else {
                                                return Promise.reject('Ungültiger CSS-Wert für margin')
                                            }
                                        }}
                                    />
                                    <HeaderLine label='Überschrift 2' line={line2 ?? { text: '', fontSize: '1rem', bold: false }} setLine={withSetDirty(setLine2)} />
                                    <Checkbox label='Titel in Browser-Tab' value={docTitle != null} setValue={withSetDirty((b) => {
                                        if (b) {
                                            setDocTitle(lastDocTitle);
                                        } else {
                                            if (docTitle == null) {
                                                throw new Error('docTitle null');
                                            }
                                            setLastDocTitle(docTitle);
                                            setDocTitle(null);
                                        }
                                    })} />
                                    {docTitle != null &&
                                        <Editable label='Titel in Browser-Tab' value={docTitle} setValue={withSetDirty(setDocTitle)} format={id<string>} parse={(s) => s.length === 0 ? Promise.reject(`Kein leerer Titel!`) : s.length > MAX_DOC_TITLE_LENGTH ? Promise.reject(`Max. ${MAX_DOC_TITLE_LENGTH} Zeichen!`) : Promise.resolve(s)} />
                                    }
                                </div>
                            </div>
                            <div className={styles.page}>
                                <h3>Mitglieder</h3>
                                {comment && <p>{comment}</p>}
                                <p>{memberComment}</p>
                                <button className={`${styles.clickable} ${styles.addButton}`} onClick={onAddMember}>Mitglied hinzufügen</button>
                                {/* <div className={`${styles.clickable} ${styles.add}`} onClick={onAddMember}><Image alt='Mitglied hinzufügen' src='/square_14034302.png' width={32} height={32} /><div className={styles.imgLabel}>Mitglied hinzufügen</div></div> */}
                                <p className={styles.lightHint}>Zum Bearbeiten Name anklicken</p>
                                <div className={`scrollable ${styles.box}`}>
                                    {
                                        members.map((m, i) => {
                                            const link = location.origin + invitationLink(groupId ?? '<FEHLER>', m)
                                            return (
                                                <div key={m.phoneNr}>
                                                    <hr className={styles.hr}></hr>
                                                    <div className={styles.memberPhoneNr}>
                                                        {m.phoneNr}
                                                    </div>
                                                    <div className={styles.memberName} tabIndex={0} onClick={editMember(i)}>
                                                        {m.prename} {m.surname}
                                                    </div>
                                                    <div className={styles.memberLinkLabel}>Einladungslink</div>
                                                    <div className={styles.memberLink}>
                                                        <a style={{/* maxWidth: '100%', */ overflow: 'auto', display: 'block' }} href={location.origin + invitationLink((groupId ?? '<FEHLER>'), m)}>{location.origin + invitationLink(groupId ?? '<FEHLER>', m)}</a>
                                                    </div>
                                                    <button className={styles.whatsapp} onClick={() => {
                                                        window.open(whatsappLink(m.phoneNr, `Hallo ${m.prename}, hier ist dein persönlicher Einladungslink für die Gruppe ${groupId} (${line1?.text}):\n\n${link}\n\n(Dieser Link ersetzt die Anmeldung mit Benutzername und Passwort, ist also nur speziell für dich und sollte nicht weiter gegeben werden.)`))
                                                    }}>Link per Whatsapp versenden</button>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className={styles.page}>
                                <h3>Aktivitäten</h3>

                                <div ref={activityScrollableRef} className={`scrollable ${styles.activities}`}>
                                    {activities.map((a, i) =>
                                        !activityIdxToArchive.includes(i) && <ActivityComp key={i} i={i} a={a}
                                            updateName={updateActivity(i, 'name')}
                                            updateDate={updateActivity(i, 'date')}
                                            updateCapacity={updateActivity(i, 'capacity')}
                                            onDelete={deleteActivity(i)}
                                            onArchive={archiveActivity(i)} />
                                    )}
                                    <button className={`${styles.clickable} ${styles.addButton}`} onClick={addActivity}>Aktivität hinzufügen</button>
                                </div>
                            </div>

                            <div className={styles.page}>
                                <h3>Gruppen-Admins</h3>
                                <div className={`scrollable ${styles.admins}`}>
                                    {
                                        admins.map((a, i) => (
                                            <div key={a}>
                                                <div /* className={styles.row} */>
                                                    <Content>{a}</Content>
                                                    <button className={styles.delete} onClick={deleteAdmin(a)}>Delete</button>
                                                </div>
                                                <hr />
                                            </div>
                                        ))
                                    }
                                </div>
                                <button className={`${styles.clickable} ${styles.addButton}`} onClick={addAdmin}>Aktivität hinzufügen</button>
                            </div>
                        </ScrollableContainer>
                        <div className={styles.bottomBar}>
                            {dirty &&
                                <>
                                    <button className={styles.clickable} onClick={onSave}>ÄNDERUNGEN SPEICHERN</button>
                                    <button className={styles.clickable} onClick={onDismiss}>ÄNDERUNGEN VERWERFEN</button>
                                </>
                            }
                        </div>
                    </div>
                </>
            }
            <Popup visible={login} >
                <LoginComp onLogin={onLogin} setSpinning={setSpinning} />
            </Popup>
            {groupId != null &&
                <Popup visible={addingMember} >
                    <MemberAdd initialGroup={groupId} onAdd={onMemberAdded} onCancel={() => { setAddingMember(false) }} />
                </Popup>
            }
            <Popup visible={editedMember != null} >
                <h3>{editedMember?.phoneNr} bearbeiten</h3>
                <div className={styles.column}>
                    <Input label='Vorname' text={editedMember?.prename ?? ''} setText={t => {
                        if (editedMember != null) setEditedMember({
                            ...editedMember,
                            prename: t
                        })
                    }} />
                    <Input label='Nachname' text={editedMember?.surname ?? ''} setText={t => {
                        if (editedMember != null) setEditedMember({
                            ...editedMember,
                            surname: t
                        })
                    }} />

                    <div className={styles.buttonRow}>
                        <button onClick={saveEditedMember}>SPEICHERN</button>
                        <button onClick={() => {
                            setEditedMemberIdx(null); setEditedMember(null);
                        }}>ABBRECHEN</button>
                    </div>
                    <div >
                        <button onClick={deleteEditedMember} className={styles.delete}>LÖSCHEN</button>
                    </div>
                </div>
            </Popup>

        </Menu>
    )
}