import { GroupAdminGroupReq, GroupAdminGroupResp, Member } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function executeGroup(req: GroupAdminGroupReq): Promise<ApiResp<GroupAdminGroupResp>> {
    if (!checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const group = await col.findOne<{members: Member[]}>({
        _id: req.groupId,
        admins: req.user
    }, {
        projection: {
            members: 1
        }
    })
    if (group == null) {
        return {
            type: 'authFailed'
        }
    }
    return {
        type: 'success',
        members: group.members
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroup);
}
