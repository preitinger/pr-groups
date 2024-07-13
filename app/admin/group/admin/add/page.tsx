'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import { GroupAdminAddReq, GroupAdminAddResp } from "@/app/_lib/api";
import { SessionContext } from "@/app/_lib/SessionContext";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import Header from "@/app/_lib/Header";

export default function Page() {
    const user = useUser();
    const [group, setGroup] = useState('')
    const [groupAdminUser, setGroupAdminUser] = useState('');
    const [comment, setComment] = useState('');

    async function onAddClick() {
        const ctx = new SessionContext();
        const token = ctx.token;
        if (user == null || token == null) {
            setComment('Du bist nicht eingeloggt.')
            return;
        }
        const req: GroupAdminAddReq = {
            user: user,
            token: token,
            group: group,
            groupAdminUser: groupAdminUser
        }
        const resp = await apiFetchPost<GroupAdminAddReq, GroupAdminAddResp>('/api/group/admin/add', req)
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert.');
                break;
            case 'success':
                setComment(`${groupAdminUser} ist jetzt ein Gruppen-Admin von ${group}.`)
                break;
            case 'wasGroupAdmin':
                setComment(`${groupAdminUser} war bereits vorher ein Gruppen-Admin von ${group}.`)
                break;
            case 'groupNotFound':
                setComment(`Gruppe ${group} nicht gefunden.`);
                break;
            case 'userNotFound':
                setComment(`User ${groupAdminUser} nicht gefunden.`);
                break;
            case 'error':
                setComment(`Unerwarteter Fehler: ${resp.error}`);
                break;
        }
    }

    return (
        <div>
            <Header user={user} line1={{ text: 'pr-groups / Admin', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Gruppen-Admin hinzufügen', fontSize: '1.5rem', bold: true }} />
            <div className={styles.form}>
                <label className={styles.groupLabel} htmlFor='group'>Gruppe</label>
                <input className={styles.group} type='text' value={group} onChange={(e) => setGroup(e.target.value)} id='group' />
                <label className={styles.userLabel} htmlFor='user'>User</label>
                <input className={styles.user} type='text' value={groupAdminUser} onChange={(e) => setGroupAdminUser(e.target.value)} id='user' />
                <button className={styles.addButton} disabled={user == null} onClick={onAddClick}>Gruppen-Admin hinzufügen</button>
                <p className={styles.comment}>
                    {comment}
                </p>
            </div>
        </div>
    )
}