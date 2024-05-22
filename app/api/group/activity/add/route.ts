import { Activity, GroupActivityAddReq, GroupActivityAddResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "@/app/api/documents";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

async function executeAdd(req: GroupActivityAddReq): Promise<ApiResp<GroupActivityAddResp>> {
    try {

        if (!await checkToken(req.user, req.token)) {
            return {
                type: 'authFailed'
            }
        }

        const client = await clientPromise;
        const db = client.db('pr-groups');
        console.log('typeof req.date', typeof req.date);

        const activity: Activity = {
            name: req.activity,
            date: req.date,
            creationDate: Date.now(),
            capacity: req.capacity,
            participations: [],
        }
        let success = false;

        const groupsCol = db.collection<GroupDoc>('groups');
        const res = await groupsCol.findOneAndUpdate({
            _id: req.group,
            admins: req.user
        }, {
            $addToSet: {
                activities: activity
            }
        })

        if (res == null) {
            const findRes = await groupsCol.findOne({
                _id: req.group
            }, {
                projection: {
                    _id: 1,
                    admins: 0,
                    members: 0,
                    logo: 0,
                    line1: 0,
                    margin: 0,
                    line2: 0,
                    activities: 0
                }
            })

            return findRes == null ? {
                type: 'groupNotFound'
            } : {
                type: 'authFailed'
            }
        }
        success = true;
        return {
            type: 'success'
        }
    } catch (reason) {
        console.error(reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }

}

export function POST(req: NextRequest) {
    return apiPOST(req, executeAdd);
}
