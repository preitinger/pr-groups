export interface RegisterReq {
    user: string;
    passwd: string;
}

export type RegisterResp = {
    type: 'success';
} | {
    type: 'nameNotAvailable';
} | {
    type: 'error';
    error: string;
}
