import { GroupAdminAddReq, GroupAdminAddResp } from "@/app/_lib/api";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { checkAdmin } from "@/app/api/dbTools";
import { GroupDoc } from "@/app/api/documents";
import { Filter } from "mongodb";
import { NextRequest } from "next/server";

async function executeAdd(req: GroupAdminAddReq): Promise<ApiResp<GroupAdminAddResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const query: Filter<GroupDoc> = { _id: req.group }
    if (!await checkAdmin(req.user)) {
        query.admins = req.user
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
                    admins: req.getList ? 1 : 0
                }
            }
        );
        if (resp == null) {
            const res2 = await groupsCol.findOne({_id: req.group}, {
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
        if (resp.admins.includes(req.groupAdminUser)) {
            return {
                type: 'wasGroupAdmin'
            }
        }

        resp.admins?.push(req.groupAdminUser);

        return {
            type: 'success',
            admins: resp.admins
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
