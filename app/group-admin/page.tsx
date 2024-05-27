'use client'

import Link from "next/link";
import Profile from "../_lib/Profile";
import useUser from "../_lib/useUser";
import styles from './page.module.css'
import Header from "../_lib/Header";
import { useEffect, useState } from "react";
import { GroupAdminGroupsReq, GroupAdminGroupsResp } from "../_lib/api";
import { SessionContext } from "../_lib/SessionContext";
import { apiFetchPost } from "../_lib/user-management-client/apiRoutesClient";
import TabButton from "../_lib/TabButton";
import TabPage from "../_lib/TabPage";

export default function Page() {
    const user = useUser();
    const [comment, setComment] = useState('');
    const [groups, setGroups] = useState<string[]>([]);

    useEffect(() => {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Not logged in.');
            return;
        }

        const req: GroupAdminGroupsReq = {
            user: user1,
            token: token1
        }
        apiFetchPost<GroupAdminGroupsReq, GroupAdminGroupsResp>('/api/group-admin/groups', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setGroups(resp.groupIds);
                    break;
            }
        })
    }, [])

    return (
        <>
            <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.2em', bold: false }} margin='1em' line2={{ text: 'Gruppenadministration', fontSize: '1.5em', bold: true }} />
            <div className={styles.form}>
                <p>{comment}</p>
                <div className={styles.row}>
                    <Link className={styles.linkMemberAdd} href='/group/member/add'>Gruppenmitglied hinzufügen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkMemberRemove} href='/group/member/remove'>Gruppenmitglied entfernen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkActivityAdd} href='/group/activity/add'>Aktivität hinzufügen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkActivityDelete} href='/group/activity/delete'>Aktivität entfernen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkActivityChange} href='/group/activity/change'>Aktivität bearbeiten</Link>
                </div>
                <div className={styles.groups}>
                    {
                        groups.map(group =>
                            <Link key={group} href={`/group-admin/group/${group}`} >{group}</Link>)
                    }
                </div>
            </div>
        </>
    )
}