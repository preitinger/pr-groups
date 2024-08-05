export class LocalContext {
    get user(): string | null {
        return localStorage.getItem('user');
    }
    set user(u: string | null) {
        if (u == null) localStorage.removeItem('user');
        else localStorage.setItem('user', u);
    }
    get token(): string | null {
        return localStorage.getItem('token');
    }
    set token(t: string | null) {
        if (t == null) localStorage.removeItem('token');
        else localStorage.setItem('token', t);
    }
    get cookiesAccepted(): boolean {
        return localStorage.getItem('cookiesAccepted') === JSON.stringify(true)
    }
    set cookiesAccepted(shown: boolean) {
        localStorage.setItem('cookiesAccepted', JSON.stringify(shown));
    }
    get allActivitiesAsStartPage(): boolean {
        return localStorage.getItem('allActivitiesAsStartPage') === JSON.stringify(true)
    }
    set allActivitiesAsStartPage(b: boolean) {
        localStorage.setItem('allActivitiesAsStartPage', JSON.stringify(b));
    }
    get simpleActivityDetails(): boolean {
        return localStorage.getItem('simpleActivityDetails') === JSON.stringify(true)
    }
    set simpleActivityDetails(b: boolean) {
        localStorage.setItem('simpleActivityDetails', JSON.stringify(b));
    }
}