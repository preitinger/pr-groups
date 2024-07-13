'use client'

import Link from "next/link";
import styles from './page.module.css'
import { useEffect, useState } from "react";
import { SessionContext } from "../_lib/SessionContext";
import Profile from "../_lib/Profile";
import useUser from "../_lib/useUser";
import Header from "../_lib/Header";
import { HandleDeletedUsersReq, HandleDeletedUsersResp } from "../_lib/api";
import { apiFetchPost } from "../_lib/user-management-client/apiRoutesClient";

export default function Page() {
    const user = useUser();
    const [comment, setComment] = useState('')
    const [spinning, setSpinning] = useState(false);

    function handleDeletedUsers() {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) return;
        const req: HandleDeletedUsersReq = {
            user: user1,
            token: token1,
        }
        setSpinning(true);
        apiFetchPost<HandleDeletedUsersReq, HandleDeletedUsersResp>('/api/handle-deleted-users', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setComment('Deleted users have been handled.');
                    break;
            }
        }).catch(reason => {
            console.error(reason);
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
        }).finally(() => {
            setSpinning(false);
        })
    }

    return (
        <>
            <Header user={user} line1={{text: 'pr-groups', fontSize: '1.2rem', bold: false}} margin='1rem' line2={{text: 'Administration', fontSize: '1.5rem', bold: true}} />
            <div className={styles.form}>
                <div className={styles.row}>
                    <Link className={styles.linkGroupCreate} href='/admin/group/create'>Create Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupDelete} href='/admin/group/delete'>Delete Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupChange} href='/admin/group/change'>Change Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminList} href='/admin/group/admin/list'>List Group Admins</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminAdd} href='/admin/group/admin/add'>Add Group Admin</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminDelete} href='/group/admin/delete'>Delete Group Admin</Link>
                </div>
                <div className={styles.row}>
                    <a className={styles.linkHandleDeletedUsers} onClick={handleDeletedUsers}>Handle deleted users</a>
                </div>

                <p>{comment}</p>
            </div>
            {
                spinning &&
                <div className={styles.spinner}></div>
            }
       </>
    )
}