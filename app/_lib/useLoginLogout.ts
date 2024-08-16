import { useCallback, useEffect, useRef, useState } from "react";
import { login, logout, userAndTokenFromStorages } from "./userAndToken";
import { isAbortError } from "./utils";
import FixedAbortController from "./pr-client-utils/FixedAbortController";

export type User = string | null;
export type OnLoginClick = () => void;
export type OnLogoutClick = () => void;
export type Spinning = boolean;
export type UserText = string;
export type SetUserText = (user: string) => void;
export type PasswdText = string;
export type SetPasswdText = (user: string) => void;
export type LoginError = string;
export type LogoutError = string;

export type LoginLogoutRes = [
    User,
    OnLoginClick,
    OnLogoutClick,
    Spinning,
    UserText,
    SetUserText,
    PasswdText,
    SetPasswdText,
    LoginError,
    LogoutError
]
export default function useLoginLogout(): LoginLogoutRes {
    const [user, setUser] = useState<User>(null);
    const [spinning, setSpinning] = useState(false);
    const [userText, setUserText] = useState('');
    const [passwdText, setPasswdText] = useState('');
    const [loginError, setLoginError] = useState('');
    const [logoutError, setLogoutError] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const id = Math.random();
        const [user1, token1] = userAndTokenFromStorages();
        setUser(token1 == null ? null : user1);
        abortControllerRef.current = new FixedAbortController();
        return () => {
            abortControllerRef.current?.abort();
        }
    }, [])

    async function onLoginClick() {
        setSpinning(true);
        setLoginError('');
        try {
            const resp = await login(userText, passwdText, abortControllerRef.current?.signal)
            switch (resp.type) {
                case 'error':
                    setLoginError(resp.error);
                    setUser(null);
                    break;
                case 'success':
                    setUser(userText);
                    break;
            }
        } catch (reason: any) {
            if (!isAbortError(reason)) {
                setLoginError('Unerwarteter Fehler: ' + JSON.stringify(reason));
                setUser(null);
            }
        } finally {
            setSpinning(false);
        }
    }

    const onLogoutClick = useCallback(async () => {
        setSpinning(true);

        try {
            const error = await logout(abortControllerRef.current?.signal)
            if (error == '') {
            } else {
                setLogoutError(error);
            }
        } catch (reason: any) {
            if (!isAbortError(reason)) {
                setLogoutError('Unerwarteter Fehler: ' + JSON.stringify(reason));
            }
        } finally {
            setSpinning(false);
            setUser(null);
        }

    }, [])

    return [user, onLoginClick, onLogoutClick, spinning, userText, setUserText, passwdText, setPasswdText, loginError, logoutError]
}