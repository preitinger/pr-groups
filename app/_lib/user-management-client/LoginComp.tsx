'use client'

import Input from "../Input";
import { SessionContext } from "../SessionContext";
import styles from './LoginComp.module.css'
import { LoginReq } from "./user-management-common/login";
import { userLoginFetch } from "./userManagementClient";
import { useEffect, useRef, useState } from "react";
import { LocalContext } from "../LocalContext";
import { login, userAndTokenToStorages } from "../userAndToken";
import Input2 from "../pr-client-utils/Input2";
import FixedAbortController from "../pr-client-utils/FixedAbortController";
import { isAbortError } from "../utils";

export interface LoginProps {
    user: string;
    setUser: (user: string) => void;
    passwd: string;
    setPasswd: (passwd: string) => void;
    onLoginClick: () => void;
    comment: string;
    spinning: boolean;
}

export default function LoginComp({ user, setUser, passwd, setPasswd, onLoginClick, comment, spinning }: LoginProps) {
    return <div className={styles.container}>
        <h2>Anmelden</h2>
        {/* <Input label='User' text={user} setText={setUser} onEnter={onLoginClick} /> */}
        <Input2 label='User' text={user} setText={setUser} onEnter={onLoginClick} />
        {/* <label className={styles.passwdLabel} htmlFor='passwd'>Passwort</label> */}
        {/* <input type='password' id='passwd' className={styles.passwd} value={passwd} onChange={(e) => setPasswd(e.target.value)} /> */}
        <Input2 type='password' label='Passwort' text={passwd} setText={setPasswd} onEnter={onLoginClick} />
        <button className={styles.loginButton} onClick={onLoginClick}>Login</button>
        <p className={styles.comment}>{comment}</p>
        {
            spinning &&
            <div className='loader'></div>
        }

    </div>
}