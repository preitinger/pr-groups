'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css'
import { apiFetchPost } from '../../_lib/user-management-client/apiRoutesClient';
import { GroupCreateReq, GroupCreateResp } from '@/app/_lib/api';
import { SessionContext } from '@/app/_lib/SessionContext';
import { useRouter } from 'next/navigation';
import Profile from '@/app/_lib/Profile';
import useUser from '@/app/_lib/useUser';

export default function Page() {
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const router = useRouter();
    const user = useUser();

    async function onCreateGroupClick() {
        const ctx = new SessionContext();
        const user = ctx.user;
        const token = ctx.token;
        if (user == null || token == null) {
            alert('Du bist nicht eingeloggt.');
            router.push('/login');
            return;
        }
        const req: GroupCreateReq = {
            user: user,
            token: token,
            name: name
        }
        const resp = await apiFetchPost<GroupCreateReq, GroupCreateResp>('/api/group/create', req)
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert!');
                break;
            case 'error':
                setComment('Unerwarteter Fehler: ' + resp.error);
                break;
            case 'success':
                setComment(`Gruppe ${name} erfolgreich erstellt.`);
                setName('');
                break;
            case 'duplicate':
                setComment(`Eine Gruppe mit dem Namen ${name} existiert bereits.`)
                break;
        }
    }
    return (
        <div>
            <Profile user={user}/>
            <h1>Administration</h1>
            <h2>Neue Gruppe erstellen</h2>
            <div className={styles.form}>
                <label className={styles.nameLabel} htmlFor='name'>Name</label>
                <input className={styles.name} type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} />
                <button className={styles.createGroup} onClick={onCreateGroupClick}>Gruppe erstellen</button>
            </div>
            <p>{comment}</p>
        </div>
    )
}