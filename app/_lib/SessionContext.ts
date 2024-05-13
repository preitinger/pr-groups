import { Activity } from "./api";

export class SessionContext {
    get user(): string | null {
        return sessionStorage.getItem('user');
    }
    set user(u: string | null) {
        if (u == null) sessionStorage.removeItem('user');
        else sessionStorage.setItem('user', u);
    }
    get token(): string | null {
        return sessionStorage.getItem('token');
    }
    set token(t: string | null) {
        if (t == null) sessionStorage.removeItem('token');
        else sessionStorage.setItem('token', t);
    }
    get group(): string | null {
        return sessionStorage.getItem('group')
    }
    set group(g: string | null) {
        if (g == null) sessionStorage.removeItem('group');
        else sessionStorage.setItem('group', g);
    }
    get activities(): Activity[] | null {
        const s = sessionStorage.getItem('activities');
        return s == null ? null : JSON.parse(s);
    }
    set activities(a: Activity[]) {
        if (a == null) sessionStorage.removeItem('activities');
        else sessionStorage.setItem('activities', JSON.stringify(a));
    }
}