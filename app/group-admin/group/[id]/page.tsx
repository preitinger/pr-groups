'use client'

import Header from "@/app/_lib/Header";
import { SessionContext } from "@/app/_lib/SessionContext";
import { Activity, GroupActivityDeleteReq, GroupActivityDeleteResp, GroupAdminActivityUpdateReq, GroupAdminActivityUpdateResp, GroupAdminAddReq, GroupAdminAddResp, GroupAdminDeleteReq, GroupAdminDeleteResp, GroupAdminGroupReq, GroupAdminGroupResp, GroupAdminMemberAddReq, GroupAdminMemberAddResp, GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp, GroupMemberAddReq, GroupMemberAddResp, Member } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { useCallback, useEffect, useRef, useState } from "react";
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
import Menu, { CustomMenuItem } from "@/app/_lib/Menu";
import MemberAdd from "@/app/_lib/MemberAdd";
import { useRouter } from "next/navigation";
import { LocalContext } from "@/app/_lib/LocalContext";
import { userAndTokenFromStorages } from "@/app/_lib/userAndToken";

function invitationLink(group: string, member: Member): string {
    return `/member/${encodeURIComponent(group)}/${encodeURIComponent(member.phoneNr)}/${encodeURIComponent(member.token)}`
}

export default function Page({ params }: { params: { id: string } }) {
    const [comment, setComment] = useState('');
    const user = useUser();
    const [members, setMembers] = useState<Member[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [admins, setAdmins] = useState<string[]>([]);
    type PhoneNr = string;
    const [copied, setCopied] = useState<Member | null>(null);
    const [sel, setSel] = useState<string>('members');
    const [editedMember, setEditedMember] = useState<Member | null>(null);
    const [editedActivity, setEditedActivity] = useState<Activity | null>(null);
    const [capacityStr, setCapacityStr] = useState('');
    const [spinning, setSpinning] = useState(true);
    const groupIdRef = useRef<string | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [addingMember, setAddingMember] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!cookiesAccepted) return;
        setGroupId(groupIdRef.current = decodeURIComponent(params.id))
        const [user1, token1] = userAndTokenFromStorages();
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
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setMembers(resp.members)
                    setActivities(resp.activities)
                    setAdmins(resp.admins)
                    break;
            }
        }).finally(() => {
            setSpinning(false);
        })
    }, [params.id, cookiesAccepted])

    const onCopyClick = (member: Member) => () => {
        if (groupIdRef.current == null) return;
        setCopied(null);
        navigator.clipboard.writeText(location.origin + invitationLink(groupIdRef.current, member)).then(() => {
            setCopied(member);
        })
    }

    const onMemberEditClick = (phoneNr: string) => () => {
        const m = members.find((m) => m.phoneNr === phoneNr);
        setEditedMember(m ?? null);
    }

    function activityFromCreationDate(creationDate: number) {
        const activity = activities.find(a => a.creationDate === creationDate)
        if (activity == null) {
            throw new Error('No activity with creationDate: ' + creationDate);
        }
        return activity;
    }

    const onActivityDeleteClick = (creationDate: number) => () => {
        const activity = activityFromCreationDate(creationDate);
        if (!confirm(`Aktivität ${activity.name} am ${formatDateTime(dateFromMillisOrNull(activity.date))} wirklich löschen?`)) return;
        const [user1, token1] = userAndTokenFromStorages();

        if (user1 == null || token1 == null || groupIdRef.current == null) return;
        const req: GroupActivityDeleteReq = {
            user: user1,
            token: token1,
            group: groupIdRef.current,
            activityCreationDate: creationDate
        }
        setSpinning(true);
        apiFetchPost<GroupActivityDeleteReq, GroupActivityDeleteResp>('/api/group-admin/activity-delete', req).then(resp => {
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

    const onActivityEditClick = (creationDate: number) => () => {
        const activity = activityFromCreationDate(creationDate);
        setEditedActivity({
            ...activity,
        })
        setCapacityStr(activity.capacity?.toString() ?? '')
    }

    function saveEditedMember() {
        if (editedMember == null) return;
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null || groupIdRef.current == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const req: GroupAdminMemberUpdateReq = {
            user: user1,
            token: token1,
            groupId: groupIdRef.current,
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
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null || groupIdRef.current == null) {
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
            groupId: groupIdRef.current,
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
            const newDate = millisFromDateOrNull(d);
            return {
                ...ed,
                date: newDate
            }
        })
    }, [])

    const onAdminDeleteClick = (admin: string) => () => {
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null || groupIdRef.current == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const sentGroup = groupIdRef.current;
        const req: GroupAdminDeleteReq = {
            user: user1,
            token: token1,
            group: sentGroup,
            groupAdminUser: admin,
            getList: true
        }
        setSpinning(true);
        apiFetchPost<GroupAdminDeleteReq, GroupAdminDeleteResp>('/api/group/admin/delete', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setComment(`${admin} ist nun nicht mehr Gruppen-Admin von ${groupIdRef.current}`)
                    if (resp.admins != null) setAdmins(resp.admins)
                    break;
                case 'groupNotFound':
                    setComment(`Gruppe ${sentGroup} existiert nicht.`);
                    break;
                case 'wasNotGroupAdmin':
                    setComment(`${admin} war kein Gruppen-Admin von ${sentGroup}.`)
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).catch(reason => {
            console.error(reason);
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason))
        }).finally(() => {
            setSpinning(false);
        })
    }

    function onAdminAddClick() {
        const newAdmin = prompt(`Which user do you like to add as a new group admin for ${groupIdRef.current}?`);
        if (newAdmin == null) return;
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null || groupIdRef.current == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const sentGroup = groupIdRef.current;
        const req: GroupAdminAddReq = {
            user: user1,
            token: token1,
            group: sentGroup,
            groupAdminUser: newAdmin,
            getList: true
        }
        setSpinning(true);
        apiFetchPost<GroupAdminAddReq, GroupAdminAddResp>('/api/group/admin/add', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'groupNotFound':
                    setComment(`Gruppe ${sentGroup} existiert nicht.`);
                    break;
                case 'success':
                    if (resp.admins != null) {
                        setAdmins(resp.admins)
                    }
                    setComment(`${newAdmin} ist nun Gruppen-Admin von ${sentGroup}.`)
                    break;
                case 'userNotFound':
                    setComment(`${newAdmin} ist kein bekannter User.`);
                    break;
                case 'wasGroupAdmin':
                    setComment(`${newAdmin} war bereits Gruppen-Admin von ${sentGroup}.`);
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).catch(reason => {
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason))
        }).finally(() => {
            setSpinning(false);
        })
    }

    function onAddMember() {
        setAddingMember(true);
    }

    async function onMemberAdded({ group, newPhoneNr, prename, surname }: { group: string; newPhoneNr: string; prename: string; surname: string }) {
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) {
            setComment('Du bist nicht eingeloggt.')
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
        setComment('Sende Daten ...');
        setAddingMember(false);
        setSpinning(true);
        try {
            const resp = await apiFetchPost<GroupAdminMemberAddReq, GroupAdminMemberAddResp>('/api/group-admin/member-add', req)
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setMembers(resp.members)
                    break;
                case 'groupNotFound':
                    setComment(`Gruppe ${group} existiert nicht.`);
                    break;
                case 'phoneNrContained':
                    setComment(`Abgebrochen. Es gibt bereits ein Mitglied mit Telefonnr ${newPhoneNr} in Gruppe ${group}.`)
                    break;
                case 'error':
                    setComment(`Unerwarteter Fehler: ${resp.error}`);
                    break;
            }
        } finally {
            setSpinning(false);
        }
    }

    const customMenuItems: CustomMenuItem[] = [
        {
            label: 'LAYOUT FÜR HANDY',
            onClick: () => router.push(`/group-admin/group-m/${params.id}`)
        }
    ]

    return (
        <Menu onDeleteMemberClick={null} group={null}
            customItems={customMenuItems}
            setCookiesAccepted={setCookiesAccepted}>
            <Header
                user={user}
                line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2rem', bold: false }}
                margin='1rem'
                line2={{ text: groupId ?? '', fontSize: '1.5rem', bold: true }}
            />
            <div className={styles.main}>
                <div className={styles.buttonRow}>
                    <TabButton label="Mitglieder" ownKey='members' selectedKey={sel} setSelectedKey={setSel} />
                    <TabButton label="Aktivitäten" ownKey='activities' selectedKey={sel} setSelectedKey={setSel} />
                    <TabButton label="Gruppen-Admins" ownKey='admins' selectedKey={sel} setSelectedKey={setSel} />
                </div>
                <div className={styles.selPage}>
                    <TabPage ownKey="members" selectedKey={sel}>
                        <p>{comment}</p>
                        <div className={`${styles.clickable} ${styles.buttonRow}`} onClick={onAddMember}><Image alt='Mitglied hinzufügen' src='/square_14034302.png' width={32} height={32} /><div className={styles.imgLabel}>Mitglied hinzufügen</div></div>
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
                                                <a href={location.origin + invitationLink((groupId ?? '<FEHLER>'), member)}>{location.origin + invitationLink(groupId ?? '<FEHLER>', member)}</a>
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
                        <p>{comment}</p>
                        <table border={1} cellPadding={3}>
                            <tbody>
                                <tr>
                                    <th>Was</th><th>Wann</th><th>Kapazität</th><th>Erstellt</th><th>Löschen</th><th>Bearbeiten</th>
                                </tr>
                                {
                                    activities.map((a) =>
                                    (<tr key={a.creationDate}>
                                        <td>{a.name}</td>
                                        <td>{formatDateTime(a.date, true)}</td>
                                        <td className={styles.capacity}>{a.capacity}</td>
                                        <td>{formatDateTime(a.creationDate, true)}</td>
                                        <td onClick={onActivityDeleteClick(a.creationDate)} className={styles.clickable}><Image src='/cross_8995303.png' alt='Löschen' width={32} height={32} /></td>
                                        <td onClick={onActivityEditClick(a.creationDate)} className={styles.clickable}><Image src='/edit_12000664.png' alt='Bearbeiten' width={32} height={32} /></td>
                                    </tr>)
                                    )
                                }
                            </tbody>
                        </table>
                    </TabPage>
                    <TabPage ownKey='admins' selectedKey={sel}>
                        <p>{comment}</p>
                        <table border={1} cellPadding={3}>
                            <tbody>
                                <tr>
                                    <th>User</th><th>Hinzufügen/Entfernen</th>
                                </tr>
                                <tr>
                                    <td className={styles.add}>(Neuer Gruppen-Admin)</td><td onClick={onAdminAddClick} className={styles.clickable}><Image src='/square_14034302.png' alt='Gruppen-Admin hinzufügen' width={32} height={32} /></td>
                                </tr>
                                {
                                    admins.map((admin) =>
                                        <tr key={admin}>
                                            <td>{admin}</td>
                                            <td onClick={onAdminDeleteClick(admin)} className={styles.clickable}><Image src='/cross_8995303.png' alt='Löschen' width={32} height={32} /></td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </TabPage>
                </div>
            </div>
            <Popup visible={editedMember != null} >
                <h3>{editedMember?.phoneNr} bearbeiten</h3>
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
                    <button onClick={() => { setEditedMember(null) }}>ABBRECHEN</button>
                </div>
            </Popup>
            <Popup visible={editedActivity != null} >
                <h3>Aktivität erstellt am ({formatDateTime(dateFromMillisOrNull(editedActivity?.creationDate ?? null))}) bearbeiten</h3>
                <Input label='Name' text={editedActivity?.name ?? ''} setText={t => {
                    if (editedActivity != null) setEditedActivity({
                        ...editedActivity,
                        name: t
                    })
                }} />
                {/* date, capacity */}
                <DateTimeInput initialText={editedActivity?.date == null ? '' : formatDateTime(new Date(editedActivity?.date))} setDate={setDate} />
                <Input label='Kapazität' text={capacityStr} setText={setCapacityStr} />
                <div className={styles.buttonRow}>
                    <button onClick={saveEditedActivity}>SPEICHERN</button>
                    <button onClick={() => { setEditedActivity(null) }}>ABBRECHEN</button>
                </div>
            </Popup>
            {groupId != null &&
                <Popup visible={addingMember} >
                    <MemberAdd initialGroup={groupId} onAdd={onMemberAdded} onCancel={() => { setAddingMember(false) }} />
                </Popup>
            }
            {
                spinning &&
                <div className={styles.spinner}></div>
            }

        </Menu>
    )
}