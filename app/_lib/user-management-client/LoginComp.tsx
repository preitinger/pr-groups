'use client'

import Input from "../Input";
import { SessionContext } from "../SessionContext";
import styles from './LoginComp.module.css'
import { LoginReq } from "./user-management-common/login";
import { userLoginFetch } from "./userManagementClient";
import { useRef, useState } from "react";
import { LocalContext } from "../LocalContext";
import { userAndTokenToStorages } from "../userAndToken";

export interface LoginProps {
    onLogin: () => void;
    setSpinning: (spinning: boolean) => void;
}

export default function LoginComp({ onLogin, setSpinning }: LoginProps) {
    const [user, setUser] = useState('');
    const [passwd, setPasswd] = useState('');
    const token = useRef<string | null>(null);
    const [comment, setComment] = useState('');

    function onLoginClick() {
        const req: LoginReq = {
            user: user,
            passwd: passwd
        }
        setSpinning(true);
        userLoginFetch(req).then(resp => {
            switch (resp.type) {
                case 'success':
                    token.current = resp.token;
                    userAndTokenToStorages(user, resp.token);
                    onLogin();
                    break;

                case 'wrongUserOrPasswd':
                    setComment('Unbekannter User oder falsches Passwort!');
                    break;

                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).finally(() => {
            setSpinning(false)
        })
    }
    return <>
        <Input label='User' text={user} setText={setUser} />
        <label className={styles.passwdLabel} htmlFor='passwd'>Passwort</label>
        <input type='password' id='passwd' className={styles.passwd} value={passwd} onChange={(e) => setPasswd(e.target.value)} />
        <button className={styles.loginButton} onClick={onLoginClick}>Login</button>
        <p className={styles.comment}>{comment}</p>

    </>
}