import { GroupAdminMemberAddReq, GroupAdminMemberAddResp } from "@/app/_lib/api";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { randomBytes } from "crypto";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

function createRandomToken(): string {
    return randomBytes(32).toString('hex');
}

async function execute(req: GroupAdminMemberAddReq): Promise<ApiResp<GroupAdminMemberAddResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const newToken = createRandomToken();

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.findOneAndUpdate({
        _id: req.groupId,
        admins: req.user,
        $nor: [
            {
                'members.phoneNr': req.phoneNr
            }
        ]
    }, {
        $addToSet: {
            members: {
                phoneNr: req.phoneNr,
                prename: req.prename,
                surname: req.surname,
                token: newToken
            }
        }
    })

    if (res == null) {
        // Possibilities: 
        // group _id not found 
        // or req.user is not admin
        // or already containing member with req.phoneNr
        const res2 = await col.findOne({
            _id: req.groupId
        }, {
            projection: {
                _id: 1,
                admins: 1,
            }
        })
        if (res2 == null) {
            return {
                type: 'groupNotFound'
            }
        }
        if (!res2.admins.includes(req.user)) {
            return {
                type: 'authFailed'
            }
        }
        return {
            type: 'phoneNrContained'
        }
    }

    return {
        type: 'success',
        members: [
            ...res.members,
            {
                phoneNr: req.phoneNr,
                prename: req.prename,
                surname: req.surname,
                token: newToken
            }
        ]
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
