import { MemberDeleteMeReq, MemberDeleteMeResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function execute(req: MemberDeleteMeReq): Promise<ApiResp<MemberDeleteMeResp>> {
    // db.groups.updateOne({ _id: 'g2', admins: 'b' }, { $pull: { members: { phoneNr: '000' }, ['activities.$[].participations']: { phoneNr: '000' } } })
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.updateOne({
        _id: req.group,
        'members.phoneNr': req.phoneNr,
        'members.token': req.token
    }, { $pull: { members: { phoneNr: req.phoneNr }, ['activities.$[].participations']: { phoneNr: req.phoneNr } } })

    if (!res.acknowledged) {
        return {
            type: 'error',
            error: 'Update was not acknowledged.'
        }
    }

    if (res.matchedCount === 1) {
        return {
            type: 'success'
        }
    } else {
        return {
            type: 'authFailed'
        }
    }
}


export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
