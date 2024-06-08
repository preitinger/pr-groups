import { GroupAdminGroupsReq, GroupAdminGroupsResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "@/app/api/documents";
import { NextRequest } from "next/server";

async function executeGroups(req: GroupAdminGroupsReq): Promise<ApiResp<GroupAdminGroupsResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const groups = await col.distinct('_id', {
        admins: req.user
    })

    return {
        type: 'success',
        groupIds: groups
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroups);
}
