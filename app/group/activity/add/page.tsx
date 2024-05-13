'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import Input from "@/app/_lib/Input";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { GroupActivityAddReq, GroupActivityAddResp } from "@/app/_lib/api";
import { SessionContext } from "@/app/_lib/SessionContext";

export default function Page() {
    const user = useUser();
    const [group, setGroup] = useState('');
    const [activity, setActivity] = useState('');
    const [comment, setComment] = useState('');

    async function onAddClick() {
        const ctx = new SessionContext();
        const token = ctx.token;
        if (user == null || token == null) {
            setComment('Bitte erst einloggen.');
            return;
        }

        setComment('Erstelle Aktivität ...');
        const req: GroupActivityAddReq = {
            user: user,
            token: token,
            group: group,
            activity: activity
        }
        const resp = await apiFetchPost<GroupActivityAddReq, GroupActivityAddResp>('/api/group/activity/add', req);
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert.');
                break;
            case 'success':
                setComment(`Aktivität "${activity}" in Gruppe "${group}" erstellt.`);
                break;
            case 'groupNotFound':
                setComment(`Gruppe "${group}" nicht gefunden.`);
                break;
            case 'wasActivity':
                setComment(`Es gibt bereits die Aktivität "${activity}" in Gruppe "${group}".`);
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
            <h1>Aktivität hinzufügen</h1>
            <div className={styles.form}>
                <Input id='group' label='Gruppe' text={group} setText={setGroup} />
                <Input id='activity' label='Aktivität' text={activity} setText={setActivity} />
                <button className={styles.addButton} onClick={onAddClick}>Aktivität hinzufügen</button>
            </div>
            <p className={styles.comment}>
                {comment}
            </p>
        </div>
    )
}