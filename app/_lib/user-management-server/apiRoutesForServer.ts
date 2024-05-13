import { NextRequest, NextResponse } from "next/server";
import { AccumulatedReq, AccumulatedResp, ApiResp } from "./user-management-common/apiRoutesCommon";

export async function apiPOST<MyReq, MySuccessResp>(request: NextRequest, executor: (req: MyReq) => Promise<ApiResp<MySuccessResp>>): Promise<NextResponse<ApiResp<MySuccessResp>>> {
    type MyResp = ApiResp<MySuccessResp>;

    let myReq: MyReq;
    try {
        myReq = await request.json();
    } catch (reason) {
        console.log('exception in json(): ', reason, 'end of exception in json()');
        const resp: MyResp = {
            type: 'error',
            error: JSON.stringify(reason)
        }
        return NextResponse.json(resp);
    }

    try {
        const mySuccessResp = await executor(myReq);
        // console.log('length of stringified response: ', JSON.stringify(mySuccessResp).length);
        // console.log('returning result from executor: ', JSON.stringify(mySuccessResp));
        return NextResponse.json(mySuccessResp);
    } catch (reason) {
        console.error('caught in executor: ', reason);
        const resp: MyResp = {
            type: 'error',
            error: JSON.stringify(reason)
        }
        return NextResponse.json(resp);
    }
}

export const accumulatedExecutor: (executors: { [key: string]: (req1: any) => any}) => (req2: AccumulatedReq) => Promise<ApiResp<AccumulatedResp>> = (executors) => async (req) => {
    const responses = [];
    for (const r of req.requests) {
        try {
            const executor = executors[r.type];
            if (typeof(executor) !== 'function') {
                const msg = 'executor not found for type ' + r.type;
                console.error(msg);
                responses.push({
                    type: 'error',
                    error: msg
                });
            } else {
                const resp = await executor(r);
                responses.push(resp);
            }
        } catch (reason) {
            let msg: string;
            if (reason instanceof Error) {
                msg = `Unknown server error(${reason.name}): ${reason.message}`;
            } else {
                msg = JSON.stringify(reason);
            }
            responses.push({
                type: 'error',
                error: msg
            })
        }
    }

    const completeResp: ApiResp<AccumulatedResp> = {
        type: 'success',
        responses: responses
    }
    return completeResp;
}


