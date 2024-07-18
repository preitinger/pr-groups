'use client'

import Profile from "@/app/_lib/Profile";
import { SessionContext } from "@/app/_lib/SessionContext";
import { Activity, ActivityDetailsReq, ActivityDetailsResp, Participation } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { formatDateTime } from "@/app/_lib/utils";
import { useEffect, useState } from "react";
import styles from './page.module.css'
import { userAndTokenFromStorages } from "@/app/_lib/userAndToken";

export default function Page({ params }: { params: { activityIdx: string } }) {
    const user = useUser();
    const [group, setGroup] = useState('');
    const [activity, setActivity] = useState<Activity | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const ctx = new SessionContext();
        const group1 = ctx.group;
        setGroup(group1 ?? '');
        const [user1, token1] = userAndTokenFromStorages();

        if (user1 == null || token1 == null || group1 == null) return;
        const activities = ctx.activities;
        if (activities == null) return;
        const activityIdx = parseInt(params.activityIdx);
        setActivity(activities[activityIdx] ?? null)

    }, [params.activityIdx])

    const decisions: { [user: string]: Participation } | undefined = activity?.participations.reduce((d, participation) => ({
        ...d,
        [participation.phoneNr]: participation
    }),
        {}
    )

    const accept: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'accepted'))
    const reject: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'rejected'))

    return (
        <div>
            <Profile user={user} />
            <h1 className={styles.headerGroup}>{group}</h1>
            <h2 className={styles.headerActivity}>{activity?.name}</h2>
            <h3 className={styles.headerAccepts}>Zusagen</h3>
            <div>
                {accept.length === 0 ? <span className={styles.none}>keine</span> :
                accept.map((participation, i) => <div key={i}>{participation.phoneNr} <span className={styles.date}>{formatDateTime(new Date(participation.date))}</span></div>)}
            </div>
            <h3 className={styles.headerRejects}>Absagen</h3>
            <div>
                {reject.length === 0 ? <span className={styles.none}>keine</span> :
                reject.map((participation, i) => <div key={i}>{participation.phoneNr} <span className={styles.date}>{formatDateTime(new Date(participation.date))}</span></div>)}
            </div>
        </div>
    )
}