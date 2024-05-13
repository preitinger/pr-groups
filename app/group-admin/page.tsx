'use client'

import Link from "next/link";
import Profile from "../_lib/Profile";
import useUser from "../_lib/useUser";
import styles from './page.module.css'

export default function Page() {
    const user = useUser();
    return (
        <div>
            <Profile user={user} />
            <h1>Gruppenadministration</h1>
            <div className={styles.form}>
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
            </div>
        </div>
    )
}