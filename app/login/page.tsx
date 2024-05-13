'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css'
import { LoginReq } from '../_lib/user-management-client/user-management-common/login';
import { userLoginFetch } from '../_lib/user-management-client/userManagementClient';
import { useRouter } from 'next/navigation';
import { SessionContext } from '../_lib/SessionContext';
import Profile from '../_lib/Profile';

export default function Page() {
    const [user, setUser] = useState('');
    const [passwd, setPasswd] = useState('');
    const token = useRef<string|null>(null);
    const router = useRouter()
    useEffect(() => {
        setUser(new SessionContext().user ?? '')
    }, [])

    function onLoginClick() {
        const req: LoginReq = {
            user: user,
            passwd: passwd
        }
        userLoginFetch(req).then(resp => {
            switch (resp.type) {
                case 'success':
                    token.current = resp.token;
                    const ctx = new SessionContext();
                    ctx.user = user;
                    ctx.token = resp.token;
                    router.push('/member');
                    break;

                case 'wrongUserOrPasswd':
                    alert('Unbekannter User oder falsches Passwort!');
                    break;

                case 'error':
                    alert('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        })
    }

    return (
        <div>
            <Profile user={user} />
            <h1>Login</h1>
            <div className={styles.form}>
                <label className={styles.userLabel} htmlFor='user'>User</label>
                <input type='text' id='user' className={styles.user} value={user} onChange={(e) => setUser(e.target.value)} />
                <label className={styles.passwdLabel} htmlFor='passwd'>Passwort</label>
                <input type='password' id='passwd' className={styles.passwd} value={passwd} onChange={(e) => setPasswd(e.target.value)} />
                <button className={styles.registerButton} onClick={onLoginClick}>Login</button>

            </div>
        </div>
    )
}