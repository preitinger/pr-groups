import { Filter } from "mongodb";
import { checkAdmin } from "../api/dbTools";
import { AdminsDoc, GroupDoc } from "../api/documents";
import { GroupAdminAddReq, GroupAdminAddResp, GroupCreateReq, GroupCreateResp } from "./api";
import { ApiResp } from "./user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "./user-management-server/mongodb";
import { checkToken } from "./user-management-server/userManagementServer";

export async function executeGroupCreate(req: GroupCreateReq, intern?: 'intern'): Promise<ApiResp<GroupCreateResp>> {
    if (intern !== 'intern' && !await checkToken(req.user, req.token)) {
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

export async function executeGroupAdminAdd(req: GroupAdminAddReq, intern?: 'intern'): Promise<ApiResp<GroupAdminAddResp>> {
    if (intern !== 'intern' && !await checkToken(req.user, req.token)) {
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
                    admins: 1
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
