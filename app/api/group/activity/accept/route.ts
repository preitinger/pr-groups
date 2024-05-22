import { ActivityAcceptReq, ActivityAcceptResp, Participation } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { GroupDoc } from "@/app/api/documents";
import { NextRequest } from "next/server";

async function executeAccept(req: ActivityAcceptReq): Promise<ApiResp<ActivityAcceptResp>> {
    try {

        const client = await clientPromise;
        const db = client.db('pr-groups');

        const groupCol = db.collection<GroupDoc>('groups');
        const participation: Participation = {
            phoneNr: req.phoneNr,
            date: Date.now(),
            accept: req.accept
        }
        const newGroup = await groupCol.findOneAndUpdate({
            _id: req.group,
            'members.phoneNr': req.phoneNr
        }, {
            $push: {
                ['activities.' + req.activityIdx + '.participations']: participation
            }
        }, {
            returnDocument: 'after',
            projection: {
                activities: true
            }
        })
        if (newGroup == null) {
            return {
                type: 'groupNotFound'
            }
        }
        return {
            type: 'success',
            activities: newGroup?.activities
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
    return apiPOST(req, executeAccept);
}