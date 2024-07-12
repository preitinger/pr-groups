'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import Input from "@/app/_lib/Input";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { GroupActivityAddReq, GroupActivityAddResp } from "@/app/_lib/api";
import { SessionContext } from "@/app/_lib/SessionContext";
import Header from "@/app/_lib/Header";
import { parseGermanDate } from "@/app/_lib/utils";
import DateTimeInput from "@/app/_lib/pr-client-utils/DateTimeInput";

export default function Page() {
    const user = useUser();
    const [group, setGroup] = useState('');
    const [activity, setActivity] = useState('');
    const [capacity, setCapacity] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [comment, setComment] = useState('');
    const [unclearMESZ, setUnclearMESZ] = useState(false);

    async function onAddClick() {
        const ctx = new SessionContext();
        const token = ctx.token;
        if (user == null || token == null) {
            setComment('Bitte erst einloggen.');
            return;
        }

        setComment('Erstelle Aktivität ...');
        let capacityNum: number | null = null;
        try {
            capacityNum = parseInt(capacity);
        } catch (reason) {}
        console.log('date', date, 'typeof date', typeof date);
        const test = JSON.parse(JSON.stringify(date));
        console.log('test', test, 'typeof test', typeof test);
        const req: GroupActivityAddReq = {
            user: user,
            token: token,
            group: group,
            activity: activity,
            date: date?.getTime() ?? null,
            capacity: capacityNum != null && capacityNum > 0 ? capacityNum : null
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
            <Header user={user} line1={{ text: 'pr-groups / Gruppen-Admin', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Aktivität hinzufügen', fontSize: '1.5rem', bold: true }} />
            <div className={styles.form}>
                <Input label='Gruppe' text={group} setText={setGroup} />
                <Input label='Aktivität' text={activity} setText={setActivity} />
                <Input label='Teilnehmerkapazität' text={capacity} setText={setCapacity} />
                <DateTimeInput initialText='' setDate={setDate} />
                <button className={styles.addButton} onClick={onAddClick}>Aktivität hinzufügen</button>
                <p className={styles.comment}>
                    {comment}
                </p>
            </div>
        </div>
    )
}