'use client'

import Header from "@/app/_lib/Header";
import { SessionContext } from "@/app/_lib/SessionContext";
import { Activity, GroupActivityDeleteReq, GroupActivityDeleteResp, GroupAdminActivityUpdateReq, GroupAdminActivityUpdateResp, GroupAdminGroupReq, GroupAdminGroupResp, GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp, Member } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { useCallback, useEffect, useState } from "react";
import styles from './page.module.css'
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import TabButton from "@/app/_lib/TabButton";
import TabPage from "@/app/_lib/TabPage";
import { dateFromMillisOrNull, formatDateTime, millisFromDateOrNull } from "@/app/_lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Popup } from "@/app/Popup";
import Input from "@/app/_lib/Input";
import DateTimeInput from "@/app/_lib/pr-client-utils/DateTimeInput";
import Menu from "@/app/_lib/Menu";

function invitationLink(group: string, member: Member): string {
    return `/member/${encodeURIComponent(group)}/${encodeURIComponent(member.phoneNr)}/${encodeURIComponent(member.token)}`
}

type EditedActivity = Activity & {
    idx: number;
}

export default function Page({ params }: { params: { id: string } }) {
    const [comment, setComment] = useState('');
    const user = useUser();
    const [members, setMembers] = useState<Member[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    type PhoneNr = string;
    const [copied, setCopied] = useState<Member | null>(null);
    const [sel, setSel] = useState<string>('members');
    const [editedMember, setEditedMember] = useState<Member | null>(null);
    const [editedActivity, setEditedActivity] = useState<EditedActivity | null>(null);
    const [capacityStr, setCapacityStr] = useState('');
    const [spinning, setSpinning] = useState(true);

    useEffect(() => {
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
            groupId: params.id
        }
        setSpinning(true);
        apiFetchPost<GroupAdminGroupReq, GroupAdminGroupResp>('/api/group-admin/group/', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setMembers(resp.members)
                    setActivities(resp.activities)
                    break;
            }
        }).finally(() => {
            setSpinning(false);
        })
    }, [params.id])

    const onCopyClick = (member: Member) => () => {
        setCopied(null);
        navigator.clipboard.writeText(location.origin + invitationLink(params.id, member)).then(() => {
            setCopied(member);
        })
    }

    const onMemberEditClick = (phoneNr: string) => () => {
        const m = members.find((m) => m.phoneNr === phoneNr);
        setEditedMember(m ?? null);
    }

    const onActivityDeleteClick = (activityIdx: number) => () => {
        const activity = activities[activityIdx];
        if (!confirm(`Aktivität ${activity.name} am ${formatDateTime(dateFromMillisOrNull(activity.date))} wirklich löschen?`)) return;
        console.log('delete activity #', activityIdx)
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;

        if (user1 == null || token1 == null) return;
        const req: GroupActivityDeleteReq = {
            user: user1,
            token: token1,
            group: params.id,
            activityIdx: activityIdx,
            creationDate: activities[activityIdx].creationDate
        }
        setSpinning(true);
        apiFetchPost<GroupActivityDeleteReq, GroupActivityDeleteResp>('/api/group-admin/activity-delete', req).then(resp => {
            console.log('resp', resp);
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert');
                    break;
                case 'success':
                    setActivities(resp.activities);
                    break;
                case 'groupNotFound':
                    setComment('Gruppe nicht gefunden');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error)
                    break;
            }
        }).finally(() => {
            setSpinning(false);
        })
    }

    const onActivityEditClick = (activityIdx: number) => () => {
        console.log('edit activity #', activityIdx);
        setEditedActivity({
            ...activities[activityIdx],
            idx: activityIdx
        })
        setCapacityStr(activities[activityIdx].capacity?.toString() ?? '')
    }

    function saveEditedMember() {
        if (editedMember == null) return;
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const req: GroupAdminMemberUpdateReq = {
            user: user1,
            token: token1,
            groupId: params.id,
            member: editedMember
        }
        setSpinning(true);
        apiFetchPost<GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp>('/api/group-admin/member-update', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'notFound':
                    setComment('Nicht gefunden');
                    break;
                case 'success':
                    setEditedMember(null);
                    setMembers(resp.members);
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).catch(reason => {
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
        }).finally(() => {
            setSpinning(false);
        })
    }

    function saveEditedActivity() {
        if (editedActivity == null) return;
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const a = editedActivity;
        const parsedCapacity = parseInt(capacityStr);
        if (!confirm(`Wirklich speichern?\n` +
            `Name: ${a.name}\n` +
            `Datum/Uhrzeit: ${formatDateTime(a.date, true)}\n` +
            `Kapazität: ${parsedCapacity}`)) return;
        const req: GroupAdminActivityUpdateReq = {
            user: user1,
            token: token1,
            groupId: params.id,
            activityIdx: a.idx,
            creationDate: a.creationDate,
            activityData: {
                name: a.name,
                date: a.date,
                capacity: parsedCapacity
            }
        }
        setSpinning(true);
        apiFetchPost<GroupAdminActivityUpdateReq, GroupAdminActivityUpdateResp>('/api/group-admin/activity-update', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'notFound':
                    setComment('Nicht gefunden.');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
                case 'success':
                    setActivities(resp.activities);
                    setEditedActivity(null);
                    break;
            }
        }).catch(reason => {
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
        }).finally(() => {
            setSpinning(false);
        })
    }

    const setDate = useCallback((d: Date | null) => {
        setEditedActivity((ed) => {
            if (ed == null) return null;
            return {
                ...ed,
                date: millisFromDateOrNull(d)
            }
        })
    }, [])

    return (
        <>
            <Header
                user={user}
                line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2em', bold: false }}
                margin='1em'
                line2={{ text: params.id, fontSize: '1.5em', bold: true }}
            />
            <div className={styles.main}>
                <div className={styles.buttonRow}>
                    <TabButton label="Mitglieder" ownKey='members' selectedKey={sel} setSelectedKey={setSel} />
                    <TabButton label="Aktivitäten" ownKey='activities' selectedKey={sel} setSelectedKey={setSel} />
                </div>
                <div className={styles.selPage}>
                    <TabPage ownKey="members" selectedKey={sel}>
                        <p>{comment}</p>
                        <table border={1} cellPadding={3}>
                            <tbody>
                                <tr>
                                    <th>phoneNr</th><th>Name</th><th>Einladungslink</th><th>Link kopieren</th><th>Bearbeiten</th>
                                </tr>
                                {
                                    members.map(member =>
                                        <tr key={member.phoneNr}>
                                            <td>
                                                {member.phoneNr}
                                            </td>
                                            <td>
                                                {member.prename} {member.surname}
                                            </td>
                                            <td>
                                                <a href={location.origin + invitationLink(params.id, member)}>{location.origin + invitationLink(params.id, member)}</a>
                                            </td>
                                            <td><button className={`${styles.copy} ${copied?.phoneNr === member.phoneNr && styles.copied}`} onClick={onCopyClick(member)} /></td>
                                            <td onClick={onMemberEditClick(member.phoneNr)} className={styles.clickable}><Image src='/edit_12000664.png' alt='Bearbeiten' width={32} height={32} /></td>

                                        </tr>
                                    )
                                }

                            </tbody>
                        </table>
                    </TabPage>
                    <TabPage ownKey='activities' selectedKey={sel}>
                        <table border={1} cellPadding={3}>
                            <tbody>
                                <tr>
                                    <th>Was</th><th>Wann</th><th>Kapazität</th><th>Erstellt</th><th>Löschen</th><th>Bearbeiten</th>
                                </tr>
                                {
                                    activities.map((a, i) =>
                                    (<tr key={i}>
                                        <td>{a.name}</td>
                                        <td>{formatDateTime(a.date, true)}</td>
                                        <td className={styles.capacity}>{a.capacity}</td>
                                        <td>{formatDateTime(a.creationDate, true)}</td>
                                        <td onClick={onActivityDeleteClick(i)} className={styles.clickable}><Image src='/cross_8995303.png' alt='Löschen' width={32} height={32} /></td>
                                        <td onClick={onActivityEditClick(i)} className={styles.clickable}><Image src='/edit_12000664.png' alt='Bearbeiten' width={32} height={32} /></td>
                                    </tr>)
                                    )
                                }
                            </tbody>
                        </table>
                    </TabPage>
                </div>
            </div>
            <Popup visible={editedMember != null} >
                <h3>{editedMember?.phoneNr} bearbeiten</h3>
                <Input id='prename' label='Vorname' text={editedMember?.prename ?? ''} setText={t => {
                    if (editedMember != null) setEditedMember({
                        ...editedMember,
                        prename: t
                    })
                }} />
                <Input id='surname' label='Nachname' text={editedMember?.surname ?? ''} setText={t => {
                    if (editedMember != null) setEditedMember({
                        ...editedMember,
                        surname: t
                    })
                }} />

                <div className={styles.buttonRow}>
                    <button onClick={saveEditedMember}>SPEICHERN</button>
                    <button onClick={() => { setEditedMember(null) }}>ABBRECHEN</button>
                </div>
            </Popup>
            <Popup visible={editedActivity != null} >
                <h3>Aktivität {editedActivity?.idx} ({formatDateTime(dateFromMillisOrNull(editedActivity?.creationDate ?? null))}) bearbeiten</h3>
                <Input id='name' label='Name' text={editedActivity?.name ?? ''} setText={t => {
                    if (editedActivity != null) setEditedActivity({
                        ...editedActivity,
                        name: t
                    })
                }} />
                {/* date, capacity */}
                <DateTimeInput initialText={editedActivity?.date == null ? '' : formatDateTime(new Date(editedActivity?.date))} setDate={setDate} />
                <Input id='capacity' label='Kapazität' text={capacityStr} setText={setCapacityStr} />
                <div className={styles.buttonRow}>
                    <button onClick={saveEditedActivity}>SPEICHERN</button>
                    <button onClick={() => { setEditedActivity(null) }}>ABBRECHEN</button>
                </div>
            </Popup>
            {
                spinning &&
                <div className={styles.spinner}></div>
            }

        </>
    )
}