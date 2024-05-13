'use client';

import Link from 'next/link'
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionContext } from '../_lib/SessionContext';
import Profile from '../_lib/Profile';
import { Acceptance, Activity, ActivityAcceptReq, ActivityAcceptResp, MemberDataReq, MemberDataResp } from '../_lib/api';
import { apiFetchPost } from '../_lib/user-management-client/apiRoutesClient';
import { formatDate } from '../_lib/utils';

interface ActivityProps {
    user: string;
    activity: Activity;
    url: string;
    onAcceptClick: (accept: Acceptance) => void;
}

function ActivityComp({ user, activity, url, onAcceptClick }: ActivityProps) {
    // activity.participations can contain objects with equal user, but different accept values. Then, the last array element is the latest decision of the specific user.
    // Now, filter the last decisions:
    const decisions: { [user: string]: Acceptance } = activity.participations.reduce((d, participation) => ({
        ...d,
        [participation.user]: participation.accept
    }),
        {}
    )
    const [acceptNum, rejectNum] = Object.entries(decisions).reduce(
        ([acceptNum, rejectNum], entry) => [acceptNum + (entry[1] === 'accepted' ? 1 : 0), rejectNum + (entry[1] === 'rejected' ? 1 : 0)],
        [0, 0]
    )
    return (
        <div className={styles.activity}>
            <h3>{activity.name}</h3>
            <p>Erstellt: {formatDate(activity.creationDate)}</p>
            <Link href={url}>
                <p>{acceptNum} Zusagen</p>
                <p>{rejectNum} Absagen</p>
                </Link>
            <div className={styles.activityButtons}>
                {
                    (decisions[user] == null || decisions[user] === 'undecided') &&
                    <>
                        <button className={styles.accept} onClick={() => onAcceptClick('accepted')}>Zusagen</button>
                        <button className={styles.reject} onClick={() => onAcceptClick('rejected')}>Absagen</button>
                        <div className={styles.undecided}>Unentschieden</div>
                    </>
                }
                {
                    decisions[user] === 'accepted' &&
                    <>
                        <div className={styles.accepted}>Zugesagt</div>
                        <button className={styles.reject} onClick={() => onAcceptClick('rejected')}>Absagen</button>
                        <button className={styles.doubt} onClick={() => onAcceptClick('undecided')}>Zögern</button>
                    </>
                }
                {
                    decisions[user] === 'rejected' &&
                    <>
                        <button className={styles.accept} onClick={() => onAcceptClick('accepted')}>Zusagen</button>
                        <div className={styles.rejected}>Abgesagt</div>
                        <button className={styles.doubt} onClick={() => onAcceptClick('undecided')}>Zögern</button>
                    </>
                }
            </div>
        </div>
    )
}

export default function Page() {
    const [user, setUser] = useState('');
    const router = useRouter();
    const [group, setGroup] = useState('');
    const [activities, setActivities] = useState<Activity[]>([]);
    const tokenRef = useRef<string | null>(null);
    const [comment, setComment] = useState('')

    useEffect(() => {
        const ctx = new SessionContext();
        const u = ctx.user;
        tokenRef.current = ctx.token;
        if (u == null || tokenRef.current == null) {
            router.push('/login');
        } else {
            setUser(u)
            const req: MemberDataReq = {
                user: u,
                curGroup: ctx.group,
                token: tokenRef.current,
            }
            setComment('Lade Daten ...');
            apiFetchPost<MemberDataReq, MemberDataResp>('/api/member', req).then(resp => {
                switch (resp.type) {
                    case 'authFailed':
                        setComment('Nicht authorisiert.');
                        break;
                    case 'success':
                        setGroup(resp.curGroup ?? '');
                        setActivities(resp.activities);
                        setComment('');
                        ctx.group = resp.curGroup;
                        ctx.activities = resp.activities;
                        break;
                }
            }).catch(reason => {
                setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
            })
        }
    }, [router])

    function onAcceptClick(i: number, accept: Acceptance) {
        if (tokenRef.current == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        setComment('Sende Daten...');
        const req: ActivityAcceptReq = {
            user: user,
            token: tokenRef.current,
            group: group,
            activityIdx: i,
            accept: accept
        }
        apiFetchPost<ActivityAcceptReq, ActivityAcceptResp>('/api/group/activity/accept', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'groupNotFound':
                    setComment('Gruppe nicht gefunden.');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + JSON.stringify(resp.error));
                    break;
                case 'success':
                    setActivities(resp.activities);
                    new SessionContext().activities = resp.activities;
                    setComment('');
                    break;
            }
        })
        // setActivities(d => d.map((activity, j) => j === i ? {
        //     ...activity,
        //     participations: [
        //         ...activity.participations,
        //         {
        //             user: user,
        //             date: new Date(),
        //             accept: accept
        //         }
        //     ]

        // } : activity))
    }

    return (
        <div>
            <Profile user={user} />
            <div className={styles.adminLinks}>
                <Link className={styles.adminLink} href='/admin'>Admin</Link>
                <Link className={styles.adminLink} href='/group-admin'>Gruppen-Admin</Link>
            </div>
            <h1 className={styles.headerWelcome}>Hallo {user}!</h1>
            <h2 className={styles.headerGroup}>{group}</h2>
            <Link className={styles.linkMembers} href='/group/members'>Gruppenmitglieder</Link>
            <p className={styles.comment}>{comment}</p>
            <ul>
                {
                    activities.map((activity, i) => (
                        <ActivityComp key={i} user={user} url={`/member/activity-details/${i}`} activity={activity} onAcceptClick={(accept) => onAcceptClick(i, accept)} />
                    ))
                }
            </ul>
        </div>
    )
}