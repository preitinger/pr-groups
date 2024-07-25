'use client'

import { useState } from 'react'
import styles from './page.module.css'
import { userRegisterFetch } from '../_lib/user-management-client/userManagementClient';
import { RegisterReq } from '../_lib/user-management-client/user-management-common/register';
import { useRouter } from 'next/navigation';
import Header from '../_lib/Header';
import Input from '../_lib/Input';

export default function Page() {
    const [user, setUser] = useState('');
    const [passwd, setPasswd] = useState('');
    const [passwdRepeat, setPasswdRepeat] = useState('');

    const router = useRouter();

    function onRegisterClick() {
        const req: RegisterReq = {
            user: user,
            passwd: passwd
        }
        userRegisterFetch(req).then(resp => {
            switch (resp.type) {
                case 'nameNotAvailable':
                    alert('Dieser Name ist bereits vergeben.');
                    break;
                case 'success':
                    alert(`User ${user} erfolgreich registriert.`);
                    router.push('/login');
                    break;
                case 'error':
                    alert('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).catch(reason => {
            alert('Unerwarteter Fehler: ' + reason);
        })
    }

    return (
        <>
            <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Als neuer User registrieren', fontSize: '1.5rem', bold: true }} />
            <div className={styles.form}>
                <Input label='User' text={user} setText={setUser} />
                <fieldset>
                    <legend>User</legend>
                    <input type='text' id='user' value={user} onChange={(e) => setUser(e.target.value)} />
                </fieldset>
                <label className={styles.userLabel} htmlFor='user'>User</label>
                <input type='text' id='user' className={styles.user} value={user} onChange={(e) => setUser(e.target.value)} />
                <label className={styles.passwdLabel} htmlFor='passwd'>Passwort</label>
                <input type='password' id='passwd' className={styles.passwd} value={passwd} onChange={(e) => setPasswd(e.target.value)} />
                <label className={styles.passwdRepeatLabel} htmlFor='passwdRepeat'>Passwort wiederholen</label>
                <input type='password' id='passwdRepeat' className={styles.passwdRepeat} value={passwdRepeat} onChange={(e) => setPasswdRepeat(e.target.value)} />
                <button className={styles.registerButton} onClick={onRegisterClick}>Register</button>
            </div>
        </>
    )
}