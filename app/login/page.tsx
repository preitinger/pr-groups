'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css'
import { LoginReq } from '../_lib/user-management-client/user-management-common/login';
import { userLoginFetch } from '../_lib/user-management-client/userManagementClient';
import { useRouter } from 'next/navigation';
import { SessionContext } from '../_lib/SessionContext';
import Profile from '../_lib/Profile';
import Header from '../_lib/Header';
import Input from '../_lib/Input';
import Menu from '../_lib/Menu';

export default function Page() {
    const [user, setUser] = useState('');
    const [passwd, setPasswd] = useState('');
    const token = useRef<string | null>(null);
    const router = useRouter()
    const [comment, setComment] = useState('');
    const [d4Props, setD4Props] = useState({
        top: '',
        left: '',
        width: '',
        alpha: '',
    })
    useEffect(() => {
        setUser(new SessionContext().user ?? '')
    }, [])

    function onLoginClick() {
        const req: LoginReq = {
            user: user,
            passwd: passwd
        }
        setComment('Sende Daten ...');
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
                    setComment('Unbekannter User oder falsches Passwort!');
                    break;

                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        })
    }

    useEffect(() => {
        if (typeof (window) !== 'object') return;
        const d4 = document.getElementById('d4');
        if (d4 == null) return;
        const cs = window.getComputedStyle(d4);
        const top = cs.getPropertyValue('top');
        setD4Props({
            top: top,
            left: cs.getPropertyValue('left'),
            width: cs.getPropertyValue('width'),
            alpha: cs.getPropertyValue('--alpha'),
        })
    }, [])
    // const compSt = typeof(window) === 'object' ? window.getComputedStyle(document.documentElement) : null;
    // const theta = compSt?.getPropertyValue('--theta')
    // const testTan = compSt?.getPropertyValue('--testTan');
    // const alpha = compSt?.getPropertyValue('--alpha');
    // const h1 = compSt?.getPropertyValue('--h1');
    // const w1 = compSt?.getPropertyValue('--w1');


    return (
        <>
            <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Login', fontSize: '1.5rem', bold: true }} />
            <Menu />
            <div className={styles.form}>
                <Input label='User' text={user} setText={setUser} onEnter={onLoginClick} />
                <label className={styles.passwdLabel} htmlFor='passwd'>Passwort</label>
                <input type='password' id='passwd' className={styles.passwd} value={passwd} onChange={(e) => setPasswd(e.target.value)} onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        onLoginClick();
                    }
                }} />
                <button className={styles.loginButton} onClick={onLoginClick}>Login</button>
                <p className={styles.comment}>{comment}</p>

            </div>
        </>

    )
}