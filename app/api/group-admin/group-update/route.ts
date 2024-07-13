import { Activity, GroupAdminGroupUpdateReq, GroupAdminGroupUpdateResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ArchivedActivityDoc, GroupDoc } from "../../documents";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";

async function execute(req: GroupAdminGroupUpdateReq): Promise<ApiResp<GroupAdminGroupUpdateResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }
    const client = await clientPromise;
    const db = client.db('pr-groups')
    const col = db.collection<GroupDoc>('groups');
    const activitiesArchived: ArchivedActivityDoc[] = [];
    const activitiesNotArchived: Activity[] = [];
    for (let i = 0; i < req.activities.length; ++i) {
        const a = req.activities[i];
        if (a != null) {
            if (req.activityIdxToArchive.includes(i)) {
                activitiesArchived.push({ groupId: req.groupId, activity: a });
            } else {
                activitiesNotArchived.push(a)
            }

        }
    }
    const archiveCol = db.collection<ArchivedActivityDoc>('archivedActivities');
    for (let i = 0; i < activitiesArchived.length; ++i) {
        if (activitiesArchived[i].activity == null) throw new Error('unexpected: activity null in activitiesArchived');
    }
    if (activitiesArchived.length > 0) {
        const archiveRes = await archiveCol.insertMany(activitiesArchived)
        if (!archiveRes.acknowledged) {
            return {
                type: 'error',
                error: 'insertion of archived activities not acknowledged?!'
            }
        }
        if (archiveRes.insertedCount !== activitiesArchived.length) {
            return {
                type: 'error',
                error: `activitiesArchived.length=${activitiesArchived.length}, but insertedCount=${archiveRes.insertedCount} !?`
            }
        }
    }
    const res = await col.updateOne({
        _id: req.groupId,
        admins: req.user
    }, {
        $set: {
            logo: req.logo,
            line1: req.line1,
            margin: req.margin,
            line2: req.line2,
            docTitle: req.docTitle,
            admins: req.admins,
            members: req.members,
            activities: activitiesNotArchived
        }
    })
    if (!res.acknowledged) {
        return {
            type: 'error',
            error: 'update group not acknowledged'
        }
    }
    if (res.matchedCount !== 1) {
        // Abgesehen von Programmfehler, nur moeglich, dass req.user kein Gruppenadmin ist
        return {
            type: 'authFailed'
        }
    }

    return {
        type: 'success'
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
