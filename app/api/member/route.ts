import { MemberDataReq, MemberDataResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function execute(req: MemberDataReq): Promise<ApiResp<MemberDataResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    let group: GroupDoc | null = null;
    if (req.curGroup == null) {
        group = await col.findOne({
            members: req.user
        }, {
            projection: {
                _id: 1,
                activities: 1
            }
        })
    } else {
        group = await col.findOne({
            _id: req.curGroup,
            members: req.user
        }, {
            projection: {
                _id: 1,
                activities: 1
            }
        })
    }

    if (group == null) {
        return {
            type: 'success',
            curGroup: null,
            activities: []
        }
    }


    return {
        type: 'success',
        curGroup: group._id,
        activities: group.activities
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
