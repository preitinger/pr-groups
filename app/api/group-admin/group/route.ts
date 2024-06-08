import { Activity, GroupAdminGroupReq, GroupAdminGroupResp, Member } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { filterNonNull } from "@/app/_lib/utils";

async function executeGroup(req: GroupAdminGroupReq): Promise<ApiResp<GroupAdminGroupResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const group = await col.findOne<{members: Member[], activities: (Activity|null)[], admins: string[]}>({
        _id: req.groupId,
        admins: req.user
    }, {
        projection: {
            members: 1,
            activities: 1,
            admins: 1,
        }
    })
    if (group == null) {
        return {
            type: 'authFailed'
        }
    }
    return {
        type: 'success',
        members: group.members,
        activities: filterNonNull(group.activities),
        admins: group.admins
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroup);
}
