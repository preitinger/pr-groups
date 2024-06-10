import { GroupCreateReq, GroupCreateResp } from "@/app/_lib/api";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { ObjectId, WithId } from "mongodb";
import { NextRequest } from "next/server";
import { AdminsDoc, GroupDoc } from "../../documents";

async function executeCreate(req: GroupCreateReq): Promise<ApiResp<GroupCreateResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const adminsCol = db.collection<AdminsDoc>('admins');
    const adminsDoc = await adminsCol.findOne();
    if (adminsDoc == null) {
        await adminsCol.insertOne({
            _id: 'admins',
            admins: [req.user]
        })
    } else {
        if (!adminsDoc.admins.includes(req.user)) {
            return {
                type: "authFailed"
            }
        }
    }

    const groupsCol = db.collection<GroupDoc>('groups');
    try {
        const insertRes = await groupsCol.insertOne({
            _id: req.name,
            admins: [],
            members: [],
            logo: req.logo,
            line1: req.line1,
            margin: req.margin,
            line2: req.line2,
            activities: [],
            docTitle: req.docTitle
        })
        return {
            type: 'success'
        }
    
    } catch (reason: any) {
        if (reason.code === 11000) {
            // duplicate key
            return {
                type: 'duplicate'
            }
        }
        console.error('group/create failed', reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }

}

export function POST(req: NextRequest) {
    return apiPOST(req, executeCreate);
}