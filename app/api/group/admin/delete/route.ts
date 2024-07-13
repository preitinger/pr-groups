import { GroupAdminDeleteReq, GroupAdminDeleteResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { checkAdmin } from "@/app/api/dbTools";
import { GroupDoc } from "@/app/api/documents";
import { Filter } from "mongodb";
import { NextRequest } from "next/server";

async function execute(req: GroupAdminDeleteReq): Promise<ApiResp<GroupAdminDeleteResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const query: Filter<GroupDoc> =  { _id: req.group }
    if (await checkAdmin(req.user)) {
        query.admins = req.user

    } 
    const res = await col.findOneAndUpdate({
        _id: req.group,
        admins: req.user
    }, {
        $pull: {
            admins: req.groupAdminUser
        }
    })
    if (res == null) {
        const res2 = await col.findOne({_id: req.group}, {
            projection: {
                _id: 1,
                admins: req.getList ? 1 : 0
            }
        })
        if (res2 == null) {
            return {
                type: 'groupNotFound'
            }
        } else {
            return {
                type: 'authFailed'
            }
        }
    }

    if (!res.admins.includes(req.groupAdminUser)) {
        return {
            type: 'wasNotGroupAdmin'
        }
    }
    
    return {
        type: 'success',
        admins: res.admins?.filter(admin => admin !== req.groupAdminUser)
    }

}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
