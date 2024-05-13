'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import { SessionContext } from "@/app/_lib/SessionContext";
import { GroupMemberAddReq, GroupMemberAddResp } from "@/app/_lib/api";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";

export default function Page() {
    const user = useUser();
    const [group, setGroup] = useState('')
    const [member, setMember] = useState('');
    const [comment, setComment] = useState('');

    async function onAddClick() {
        const ctx = new SessionContext();
        const token = ctx.token;
        if (user == null || token == null) {
            setComment('Du bist nicht eingeloggt.')
            return;
        }
        const req: GroupMemberAddReq = {
            user: user,
            token: token,
            group: group,
            member: member
        }
        const resp = await apiFetchPost<GroupMemberAddReq, GroupMemberAddResp>('/api/group/member/add', req)
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert.');
                break;
            case 'success':
                setComment(`${member} ist jetzt Mitglied in Gruppe ${group}.`)
                break;
            case 'groupNotFound':
                setComment(`Gruppe ${group} existiert nicht.`);
                break;
            case 'userNotFound':
                setComment(`User ${member} existiert nicht.`);
                break;
            case 'wasMember':
                setComment(`${member} war bereits vorher Mitglied in Gruppe ${group}.`)
                break;
            case 'error':
                setComment(`Unerwarteter Fehler: ${resp.error}`);
                break;
        }
    }

    return (
        <div>
            <Profile user={user} />
            <p>Gruppenadministration</p>
            <h1>Gruppenmitglied hinzufügen</h1>
            <div className={styles.form}>
                <label className={styles.groupLabel} htmlFor='group'>Gruppe</label>
                <input className={styles.group} type='text' value={group} onChange={(e) => setGroup(e.target.value)} id='group' />
                <label className={styles.userLabel} htmlFor='user'>User</label>
                <input className={styles.user} type='text' value={member} onChange={(e) => setMember(e.target.value)} id='user' />
                <button className={styles.addButton} disabled={user == null} onClick={onAddClick}>Gruppenmitglied hinzufügen</button>
            </div>
            <p>{comment}</p>
        </div>
    )
}