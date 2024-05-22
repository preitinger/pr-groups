import { GroupAdminAddReq, GroupAdminAddResp } from "@/app/_lib/api";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { checkAdmin } from "@/app/api/dbTools";
import { GroupDoc } from "@/app/api/documents";
import { NextRequest } from "next/server";

async function executeAdd(req: GroupAdminAddReq): Promise<ApiResp<GroupAdminAddResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    if (!await checkAdmin(req.user)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const groupsCol = db.collection<GroupDoc>('groups');
    try {
        const resp = await groupsCol.findOneAndUpdate(
            { _id: req.group },
            { $addToSet: { admins: req.groupAdminUser } },
            {
                projection: {
                    _id: 0,
                    admins: true
                }
            }
        );
        if (resp == null) {
            // Group not found
            return {
                type: 'groupNotFound'
            }
        }
        if (resp.admins.includes(req.groupAdminUser)) {
            return {
                type: 'wasGroupAdmin'
            }
        }

        return {
            type: 'success'
        }
    } catch (reason: any) {
        console.error('Fehler in addToSet for groupAdminUser', reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeAdd);
}
