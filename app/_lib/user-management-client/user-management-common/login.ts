export interface LoginReq {
    user: string;
    passwd: string;
}

export type LoginResp = {
    type: 'success';
    token: string;
} | {
    type: 'wrongUserOrPasswd';
} | {
    type: 'error';
    error: string;
}
