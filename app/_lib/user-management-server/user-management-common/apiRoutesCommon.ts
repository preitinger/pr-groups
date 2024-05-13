
export type ApiResp<MySuccessResp> = MySuccessResp | {
    type: 'error';
    error: string;
}

export interface AccumulatedReq {
    type: 'AccumulatedReq';
    requests: { type: string }[]
}

export type AccumulatedResp = {
    type: 'success';
    responses: any[];
}