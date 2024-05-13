import { GroupMemberAddReq, GroupMemberAddResp } from "@/app/_lib/api";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken, checkUser } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "@/app/api/documents";
import { NextRequest } from "next/server";

async function executeAdd(req: GroupMemberAddReq): Promise<ApiResp<GroupMemberAddResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    if (!await checkUser(req.member)) {
        return {
            type: 'userNotFound'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.findOneAndUpdate({
        _id: req.group,
        admins: req.user
    }, {
        $addToSet: {
            members: req.member
        }
    })

    if (res == null) {
        return {
            type: 'groupNotFound'
        }
    }

    if (res.members.includes(req.member)) {
        return {
            type: 'wasMember'
        }
    }

    return {
        type: 'success'
    }

}

export function POST(req: NextRequest) {
    return apiPOST(req, executeAdd);
}
