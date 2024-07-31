'use client'

import { useState } from 'react'
import styles from './page.module.css'
import { userRegisterFetch } from '../_lib/user-management-client/userManagementClient';
import { RegisterReq } from '../_lib/user-management-client/user-management-common/register';
import { useRouter } from 'next/navigation';
import Header from '../_lib/Header';
import Input from '../_lib/Input';
import Input2 from '../_lib/pr-client-utils/Input2';
import FormComp from '../_lib/pr-client-utils/FormComp';
import Menu from '../_lib/Menu';

const validateUser = (text: string) => text === '' ? 'User erforderlich!' : '';
const validatePasswdRepeat = (passwd: string) => (text: string) => text !== passwd ? 'Passwörter stimmen nicht überein!' : '';

export default function Page() {
    const [user, setUser] = useState('');
    const [passwd, setPasswd] = useState('');
    const [passwdRepeat, setPasswdRepeat] = useState('');
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    const router = useRouter();

    function onRegisterClick() {
        if (validateUser(user) !== '' || validatePasswdRepeat(passwd)(passwdRepeat) !== '') {
            alert('Bitte Eingaben überprüfen!');
            return;
        }
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
            <Menu  setCookiesAccepted={setCookiesAccepted} />
            {/* <Header user={user} line1={{ text: '', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: '', fontSize: '1.5rem', bold: true }} /> */}
            <div className={styles.main}>
                <h1>pr-groups</h1>
                <FormComp decoImg={{ src: '/group-friends-jumping-top-hill.jpg', alt: 'Gruppe', width: 714, height: 576 }} maxWidth={1200} >
                    <div className={styles.innerForm}>
                        <h1>Konto erstellen</h1>
                        <Input2 label='User' type='text' text={user} setText={setUser} validate={validateUser} />
                        <Input2 type='password' label='Passwort' text={passwd} setText={setPasswd} />
                        <Input2 type='password' label='Passwort wiederholen' text={passwdRepeat} setText={setPasswdRepeat} validate={validatePasswdRepeat(passwd)} />
                        <button className={styles.registerButton} onClick={onRegisterClick}>Konto erstellen</button>
                    </div>
                </FormComp>
            </div>
        </>
    )
}