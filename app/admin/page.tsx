'use client'

import Link from "next/link";
import styles from './page.module.css'
import { useEffect, useState } from "react";
import { SessionContext } from "../_lib/SessionContext";
import Profile from "../_lib/Profile";
import useUser from "../_lib/useUser";

export default function Page() {
    const user = useUser();

    return (
        <div>
            <Profile user={user} />
            <h1>Administration</h1>
            <div className={styles.form}>
                <div className={styles.row}>
                    <Link className={styles.linkGroupCreate} href='/group/create'>Create Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupDelete} href='/group/delete'>Delete Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupChange} href='/group/change'>Change Group</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminList} href='/group/admin/list'>List Group Admins</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminAdd} href='/group/admin/add'>Add Group Admin</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkGroupAdminDelete} href='/group/admin/delete'>Delete Group Admin</Link>
                </div>






            </div>
        </div>
    )
}