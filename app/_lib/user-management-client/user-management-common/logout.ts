export interface LogoutReq {
    user: string;
    token: string;
}

export type LogoutResp = {
    type: 'success';
} | {
    type: 'wrongUserOrToken';
} | {
    type: 'error';
    error: string;
}
