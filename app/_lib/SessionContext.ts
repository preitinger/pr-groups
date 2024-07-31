import { Activity } from "./api";

export class SessionContext {
    get user2(): string | null {
        return sessionStorage.getItem('user');
    }
    set user2(u: string | null) {
        if (u == null) sessionStorage.removeItem('user');
        else sessionStorage.setItem('user', u);
    }
    get token2(): string | null {
        return sessionStorage.getItem('token');
    }
    set token2(t: string | null) {
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
    get cookiesShown(): boolean {
        return sessionStorage.getItem('cookiesShown') === JSON.stringify(true)
    }
    set cookiesShown(shown: boolean) {
        sessionStorage.setItem('cookiesShown', JSON.stringify(shown));
    }
}