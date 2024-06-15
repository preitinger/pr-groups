'use client'

import Header from "@/app/_lib/Header";
import Menu from "@/app/_lib/Menu";
import { SessionContext } from "@/app/_lib/SessionContext";
import { Activity, GroupAdminGroupReq, GroupAdminGroupResp, Member } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import styles from './page.module.css'
import { type HeaderLine } from "@/app/_lib/HeaderLine";
import { withStopPropagation } from "@/app/_lib/utils";
import Input from "@/app/_lib/Input";

const MAX_GROUP_LENGTH = 20

function Label({ children }: PropsWithChildren<{}>) {
    return <div className={styles.label}>{children}</div>
}

function Content({ children }: PropsWithChildren<{}>) {
    return <div className={styles.content}>{children}</div>
}

interface EditableProps<T> {
    label: string
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

type Validation = 'validating' | 'valid' | 'invalid'

function Editable<T>({ label, value, setValue, format, parse }: EditableProps<T>) {
    const [editing, setEditing] = useState(false)
    const [validation, setValidation] = useState<Validation>('valid');
    const [error, setError] = useState<string>('')
    const [editedText, setEditedText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    function onEditClick() {
        console.log('onEditClick')
        setEditing(true);
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

    function onCancel() {
        setEditing(false);
        setValidation('valid');
    }

    function onOk() {
        parse(editedText).then(val => {
            setValue(val)
            setEditing(false);
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
        }
    }, [editing])

    return (
        <>
            <Label>{label}</Label>
            {
                editing ?
                    <>
                        <input className={styles.input} ref={inputRef} value={editedText} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => {
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
                    </>
                    :
                    <div onClick={withStopPropagation(onEditClick)}><Content>{format(value)}</Content></div>
            }
        </>
    )
}

function HeaderLine({ children, label, line }: PropsWithChildren<{ label: string; line: HeaderLine | null }>) {
    return <>
        {
            line == null &&
            <>
                <Label>{label}</Label>
                <Content><i>keine</i></Content>
            </>
        }
        {
            line != null &&
            <>
                <Label>{label} / Text</Label>
                <Content>{line.text}</Content>
                <Label>{label} / font-size</Label>
                <Content>{line.fontSize}</Content>
                <Label>{label} / font-weight</Label>
                <Content>{line.bold ? 'bold' : 'normal'}</Content>
            </>

        }
    </>
}

function id<T>(t: T) {
    return t
}

export default function Page({ params }: { params: { id: string } }) {
    const user = useUser();
    const groupIdRef = useRef<string | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [comment, setComment] = useState('');
    const [line1, setLine1] = useState<HeaderLine | null>(null);
    const [margin, setMargin] = useState('')
    const [line2, setLine2] = useState<HeaderLine | null>(null);
    const [admins, setAdmins] = useState<string[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {

        setGroupId(groupIdRef.current = decodeURIComponent(params.id))
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const req: GroupAdminGroupReq = {
            user: user1,
            token: token1,
            groupId: groupIdRef.current
        }
        setSpinning(true);
        apiFetchPost<GroupAdminGroupReq, GroupAdminGroupResp>('/api/group-admin/group/', req).then(resp => {
            console.log('resp', resp);
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success': {
                    setLine1(resp.line1);
                    setMargin(resp.margin);
                    setLine2(resp.line2);
                    setAdmins(resp.admins)
                    setMembers(resp.members)
                    setActivities(resp.activities)
                    const ctx = new SessionContext();
                    ctx.activities = resp.activities;
                    break;
                }
            }
        }).finally(() => {
            setSpinning(false);
        })
    }, [params.id])

    const onMenuClick = (idx: number) => () => {
        switch (idx) {
            case 0: // EDIT
                alert('NYI');
                break;
        }
    }

    return (
        <Menu
            onDeleteMemberClick={null} group={null}
            customLabels={[{ label: 'EDIT', src: '/edit_12000664.png', alt: 'EDIT', width: 32, height: 32 }]}
            customSpinning={spinning}
            onCustomClick={onMenuClick}
        >
            {groupId != null &&
                <><Header
                    user={user}
                    line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2rem', bold: false }}
                    margin='1rem'
                    line2={{ text: groupId ?? '', fontSize: '1.5rem', bold: true }}
                />
                    <div className={`${styles.main} scrollable`}>
                        <Editable label='Gruppenname' value={groupId} setValue={setGroupId} format={id<string>} parse={(s) => s.length <= MAX_GROUP_LENGTH ? Promise.resolve(s) : Promise.reject(`Gruppenname max. ${MAX_GROUP_LENGTH} Zeichen!`)} />
                        <Label>Gruppenname</Label>
                        <Content>{groupId}</Content>
                        <HeaderLine label='Überschrift 1' line={line1} />
                        <Label>Abstand zwischen Überschrift 1 und Überschrift 2</Label>
                        <Content>{margin}</Content>
                        <HeaderLine label='Überschrift 2' line={line2} />
                    </div>
                </>
            }
        </Menu>
    )
}