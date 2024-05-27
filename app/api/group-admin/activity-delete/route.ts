import { Activity, GroupActivityDeleteReq, GroupActivityDeleteResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { filterNonNull } from "@/app/_lib/utils";

async function execute(req: GroupActivityDeleteReq): Promise<ApiResp<GroupActivityDeleteResp>> {
    if (!checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res1 = await col.updateOne({
        _id: req.group,
        admins: req.user,
        [`activities.${req.activityIdx}.creationDate`]: req.creationDate
    }, {
        $unset: {
            [`activities.${req.activityIdx}`]: ''
        }
    })
    if (!(res1.acknowledged && res1.matchedCount === 1)) {
        const res2 = await col.findOne({
            _id: req.group
        }, {
            projection: {
                _id: 1
            }
        })
        console.log('res2', res2);
        if (res2 == null) {
            return {
                type: 'groupNotFound'
            }
        }
        return {
            type: 'authFailed'
        }
    }
    const res2 = await col.findOneAndUpdate({
        _id: req.group,
        admins: req.user
    }, {
        $pull: {
            activities: null
        },

    }, {
        projection: {
            activities: 1
        },
        returnDocument: 'after'
    })
    if (res2 == null) {
        return {
            type: 'error',
            error: 'group not found in snd command, but in fst command?!'
        }
    }
    const activities: Activity[] = [];
    for (let i = 0; i < res2.activities.length; ++i) {
        const a = res2.activities[i];
        if (a == null) {
            return {
                type: 'error',
                error: '$pull did not work as expected when removing null from activities'
            }
        }
        activities.push(a)
    }
    return {
        type: 'success',
        activities: filterNonNull(res2.activities)
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
