'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser";
import styles from './page.module.css'
import { useEffect, useState } from "react";
import { SessionContext } from "@/app/_lib/SessionContext";
import { MembersReq, MembersResp } from "@/app/_lib/api";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";

export default function Page() {
    const [user, setUser] = useState('');
    const [group, setGroup] = useState('');
    const [comment, setComment] = useState('');
    const [members, setMembers] = useState<string[]>([]);

    useEffect(() => {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        const group1 = ctx.group;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        if (group1 == null) {
            setComment('Keine Gruppe aktiv.');
            return;
        }
        setGroup(group1)
        const req: MembersReq = {
            user: user1,
            token: token1,
            group: group1
        }
        setComment('Lade Mitglieder ...');
        apiFetchPost<MembersReq, MembersResp>('/api/group/members', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
                case 'success':
                    setComment('');
                    setMembers(resp.members);
                    break;
            }
        })
    }, [])

    return (
        <div>
            <Profile user={user} />
            <h1 className={styles.headerGroup}>{group}</h1>
            <h2 className={styles.headerMembers}>Mitgliederliste</h2>
            <p>{comment}</p>
            <div className={styles.list}>
                {members.map((member) => <div className={styles.member} key={member}>{member}</div>)}
            </div>
        </div>
    )
}