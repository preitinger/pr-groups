'use client'

import { LocalContext } from "./LocalContext";
import { SessionContext } from "./SessionContext";
import { LoginReq } from "./user-management-client/user-management-common/login";
import { LogoutReq } from "./user-management-client/user-management-common/logout";
import { RegisterReq } from "./user-management-client/user-management-common/register";
import { userLoginFetch, userLogoutFetch, userRegisterFetch } from "./user-management-client/userManagementClient";
import { isAbortError } from "./utils";

//
// General Concept
//
// LocalContext contains user and token if the user is currently logged in from this device.
// If token is null and user not, this means that the last login was with this user, but not currently logged in.

export function userAndTokenFromStorages() {
    const ctx = new SessionContext();
    let user1 = ctx.user2;
    let token1 = ctx.token2;
    if (user1 == null || token1 == null) {
        const lctx = new LocalContext();
        user1 = lctx.user;
        token1 = lctx.token;
        ctx.user2 = user1;
        ctx.token2 = token1;
    }

    return [user1, token1];
}

export function userAndTokenToStorages(user: string | null, token: string | null) {
    const sctx = new SessionContext();
    sctx.user2 = user;
    sctx.token2 = token;
    const lctx = new LocalContext();
    lctx.user = user;
    lctx.token = token;
}

/**
 * 
 * @param user 
 * @param passwd 
 * @returns unempty error string on error, empty string when successful
 * @throws AbortError if userRegisterFetch has been aborted by the signal
 */
export async function register(user: string, passwd: string, signal?: AbortSignal): Promise<string> {
    const req: RegisterReq = {
        user: user,
        passwd: passwd
    }
    try {
        const resp = await userRegisterFetch(req, signal)
        switch (resp.type) {
            case 'nameNotAvailable':
                return 'Dieser Name ist bereits vergeben.';
            case 'success':
                return ''
            case 'error':
                return 'Unerwarteter Fehler: ' + resp.error;
        }
    } catch (reason: any) {
        if (isAbortError(reason)) {
            throw reason;
        } else {
            return 'Unerwarteter Fehler: ' + JSON.stringify(reason);
        }
    }
}

export type LoginResult = {
    type: 'success'
    token: string
} | {
    type: 'error'
    error: string
}

export async function login(user: string, passwd: string, signal?: AbortSignal): Promise<LoginResult> {
    const req: LoginReq = {
        user: user,
        passwd: passwd
    }

    try {
        const resp = await userLoginFetch(req, signal);
        switch (resp.type) {
            case 'success':
                userAndTokenToStorages(user, resp.token);
                return {
                    type: 'success',
                    token: resp.token
                }

            case 'wrongUserOrPasswd':
                return {
                    type: 'error',
                    error: 'Unbekannter User oder falsches Passwort!'
                }

            case 'error':
                return {
                    type: 'error',
                    error: 'Unerwarteter Fehler: ' + resp.error
                };
        }
    } catch (reason: any) {
        if (isAbortError(reason)) {
            // just forward
            throw reason;
        } else {
            return {
                type: 'error',
                error: 'Unerwarteter Fehler: ' + JSON.stringify(reason)
            };
        }

    }
}

/**
 * 
 * @returns error string on error, empty string on success.
 */
export async function logout(signal?: AbortSignal): Promise<string> {
    const [user1, token1] = userAndTokenFromStorages();
    try {
        if (user1 == null || token1 == null) {
            return 'Du warst nicht richtig eingeloggt.';
        }
        const req: LogoutReq = {
            user: user1,
            token: token1
        }
        try {
            const resp = await userLogoutFetch(req, signal);
            switch (resp.type) {
                case 'error':
                    return 'Unerwarteter Fehler: ' + resp.error;
                case 'wrongUserOrToken':
                    return 'Du warst nicht (mehr) richtig eingeloggt.'
                case 'success':
                    return '';
            }
        } catch (reason: any) {
            if (isAbortError(reason)) {
                throw reason;
            } else {
                return 'Unerwarteter Fehler: ' + JSON.stringify(reason);
            }
        }
    } finally {
        userAndTokenToStorages(user1, null);
    }
}
