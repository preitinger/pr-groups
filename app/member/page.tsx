'use client'
import Link from 'next/link'
import styles from './page.module.css'
import Header from '../_lib/Header'
import useUser from '../_lib/useUser'
import Menu from '../_lib/Menu'
import { useState } from 'react'
export default function Page() {
    const user = useUser();
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    return (
        <>
            <Menu setCookiesAccepted={setCookiesAccepted}>
                <Header line1={{ text: 'pr-groups', fontSize: '1.5em', bold: true }} margin='0' line2={{ text: '', fontSize: '1em', bold: false }} user={user} />

                {cookiesAccepted &&
                    <div className={styles.links}>
                        <p>
                            <Link href='/admin'>Admin</Link>
                        </p>
                        <p>
                            <Link href='/group-admin'>Gruppen-Admin</Link>
                        </p>
                    </div>
                }
            </Menu>
        </>
    )
}