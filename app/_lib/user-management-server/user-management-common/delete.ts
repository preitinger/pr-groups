export interface DeleteReq {
    user: string;
    token: string;
}

export type DeleteResp = {
    type: 'success'
} | {
    type: 'authFailed'
}
