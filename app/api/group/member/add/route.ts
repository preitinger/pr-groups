import { GroupMemberAddReq, GroupMemberAddResp } from "@/app/_lib/api";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken, checkUser } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "@/app/api/documents";
import { randomBytes } from "crypto";
import { NextRequest } from "next/server";

function createRandomToken(): string {
    return randomBytes(32).toString('hex');
}

async function executeAdd(req: GroupMemberAddReq): Promise<ApiResp<GroupMemberAddResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const newToken = createRandomToken();

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const res = await col.updateOne({
        _id: req.group,
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
    if (res.modifiedCount === 0) {
        // Possibilities: 
        // group _id not found 
        // or req.user is not admin
        // or already containing member with req.phoneNr
        const res2 = await col.findOne({
            _id: req.group
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
        invitationUrl: `/member/${encodeURIComponent(req.group)}/${encodeURIComponent(req.phoneNr)}/${encodeURIComponent(newToken)}`
    }

}

export function POST(req: NextRequest) {
    return apiPOST(req, executeAdd);
}
