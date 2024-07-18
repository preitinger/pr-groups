import { LocalContext } from "./LocalContext";
import { SessionContext } from "./SessionContext";

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