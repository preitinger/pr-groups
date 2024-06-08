import { GroupAdminMemberUpdateReq, GroupAdminMemberUpdateResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { NextRequest } from "next/server";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";

async function execute(req: GroupAdminMemberUpdateReq): Promise<ApiResp<GroupAdminMemberUpdateResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.findOneAndUpdate({
        _id: req.groupId,
        admins: req.user
    }, {
        $set: {
            'members.$[i].prename': req.member.prename,
            'members.$[i].surname': req.member.surname
        }
    }, {
        arrayFilters: [
            {
                'i.phoneNr': req.member.phoneNr
            }
        ],
        returnDocument: 'after',
        projection: {
            members: 1
        }
    })
    if (res == null) {
        return {
            type: 'notFound'
        }
    }

    return {
        type: 'success',
        members: res.members
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
