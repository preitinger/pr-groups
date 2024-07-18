import { ActivitiesInGroup, Activity, GroupAdminAllGroupsActivitiesReq, GroupAdminAllGroupsActivitiesResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function execute(req: GroupAdminAllGroupsActivitiesReq): Promise<ApiResp<GroupAdminAllGroupsActivitiesResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');

    const col = db.collection<GroupDoc>('groups');
    const res = col.find({
        admins: req.user
    }, {
        projection: {
            _id: 1,
            members: 1,
            activities: 1,
            docTitle: 1
        }
    }).batchSize(10)

    let group: GroupDoc | null;

    const resp: ActivitiesInGroup[] = [];

    while ((group = await res.next()) != null) {
        resp.push({
            group: group._id,
            groupTitle: group.docTitle,
            members: group.members,
            activities: group.activities.filter(a => a != null) as Activity[]
        })
    }

    return {
        type: 'success',
        activitiesInGroups: resp
    }
}


export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
