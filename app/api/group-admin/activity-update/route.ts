import { GroupAdminActivityUpdateReq, GroupAdminActivityUpdateResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { GroupDoc } from "../../documents";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { filterNonNull } from "@/app/_lib/utils";
import { NextRequest } from "next/server";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";

async function execute(req: GroupAdminActivityUpdateReq): Promise<ApiResp<GroupAdminActivityUpdateResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const group = await col.findOneAndUpdate({
        _id: req.groupId,
        admins: req.user,
        'activities.creationDate': req.creationDate
    }, {
        $set: {
            'activities.$[elem].name': req.activityData.name,
            'activities.$[elem].date': req.activityData.date,
            'activities.$[elem].capacity': req.activityData.capacity,
        }
    }, {
        returnDocument: 'after',
        arrayFilters: [
            {
                'elem.creationDate': req.creationDate
            }
        ]
    }
    )
if (group == null) {
    return {
        type: 'notFound'
    }
}
return {
    type: 'success',
    activities: filterNonNull(group.activities)
}
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}