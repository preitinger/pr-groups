import { GroupAdminMemberDeleteReq, MemberDeleteMeResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function execute(req: GroupAdminMemberDeleteReq): Promise<ApiResp<MemberDeleteMeResp>> {
    if (! await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.updateOne({
        _id: req.groupId,
        admins: req.user
    }, {
        $pull: {
            members: { phoneNr: req.phoneNr },
            ['activities.$[].participations']: { phoneNr: req.phoneNr }
        }
    })

    if (!res.acknowledged) {
        return {
            type: 'error',
            error: 'pull from members and activities participations not acknowledged'
        }
    }

    if (res.matchedCount !== 1) {
        return {
            type: 'authFailed'
        }
    }

    return {
        type: 'success',
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
