'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css'
import { LoginReq } from '../_lib/user-management-client/user-management-common/login';
import { userLoginFetch } from '../_lib/user-management-client/userManagementClient';
import { useRouter } from 'next/navigation';
import Header from '../_lib/Header';
import Input from '../_lib/Input';
import Menu from '../_lib/Menu';
import { userAndTokenFromStorages, userAndTokenToStorages } from '../_lib/userAndToken';
import FormComp from '../_lib/pr-client-utils/FormComp';
import Input2 from '../_lib/pr-client-utils/Input2';
import { LocalContext } from '../_lib/LocalContext';

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
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    useEffect(() => {
        if (!cookiesAccepted) return;
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) return;
        setUser(user1)
    }, [cookiesAccepted])

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
                    userAndTokenToStorages(user, resp.token);
                    const ctx = new LocalContext();
                    if (ctx.allActivitiesAsStartPage) {
                        router.push('/group-admin/all-activities')
                    } else {
                        router.push('/group-admin');
                    }
                    
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
            {/* <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Login', fontSize: '1.5rem', bold: true }} /> */}
            <Menu setCookiesAccepted={setCookiesAccepted} />
            <div className={styles.main}>
                <h1>pr-groups</h1>
                <FormComp decoImg={{ src: '/group-friends-jumping-top-hill.jpg', alt: 'Gruppe', width: 714, height: 576 }} maxWidth={1200} >
                    <div className={styles.innerForm}>
                        <h1>Anmelden</h1>
                        <Input2 label='User' text={user} setText={setUser} onEnter={onLoginClick} />
                        <Input2 label='Passwort' type='password' text={passwd} setText={setPasswd} onEnter={onLoginClick} />
                        <button className={styles.loginButton} onClick={onLoginClick}>Login</button>
                        <p className={styles.comment}>{comment}</p>

                    </div>
                </FormComp>
            </div>
        </>

    )
}