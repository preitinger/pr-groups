import { Activity, GroupAdminGroupUpdateReq, GroupAdminGroupUpdateResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ArchivedActivityDoc, GroupDoc } from "../../documents";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { Document, MatchKeysAndValues } from "mongodb";

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
    // const activitiesNotArchived: Activity[] = [];
    const toSet: MatchKeysAndValues<GroupDoc> = {
        logo: req.logo,
        line1: req.line1,
        margin: req.margin,
        line2: req.line2,
        docTitle: req.docTitle,
        admins: req.admins,
        members: req.members,
        'activities.$[notKept]': null,
        'activities.$[archived]': null,
    }
    /*
        arrayFilters: [
            {
                'elem.creationDate': req.creationDate
            }
        ]
    */
    const arrayFilters: Document[] = [
        {
            'notKept.creationDate': {
                $nin: req.activities.map(a => a.creationDate)
            },
        },
        {
            'archived.creationDate': {
                $in: req.activityIdxToArchive.map(idx => req.activities[idx].creationDate)
            }
        }
    ]

    let nextCreationDate = Date.now();

    for (let i = 0; i < req.activities.length; ++i) {
        const a = req.activities[i];
        if (a != null) {
            if (req.activityIdxToArchive.includes(i)) {
                activitiesArchived.push({
                    groupId: req.groupId, activity: {
                        creationDate: a.creationDate ?? nextCreationDate++,
                        name: a.name,
                        date: a.date,
                        capacity: a.capacity,
                        participations: [] // will be filled with result from the following query
                    }
                });
            } else {
                // activitiesNotArchived.push(a)

                if (a.creationDate != null) {
                    toSet[`activities.$[a${i}].name`] = a.name
                    toSet[`activities.$[a${i}].date`] = a.date
                    toSet[`activities.$[a${i}].capacity`] = a.capacity
                    arrayFilters.push({
                        [`a${i}.creationDate`]: a.creationDate
                    })
                }
            }

        }
    }

    const res = await col.findOneAndUpdate({
        _id: req.groupId,
        admins: req.user
    }, {
        $set: toSet,
    }, {
        arrayFilters: arrayFilters
    })
    if (res == null) {
        return {
            type: 'authFailed'
        }

    }
    const archiveCol = db.collection<ArchivedActivityDoc>('archivedActivities');
    for (let i = 0; i < activitiesArchived.length; ++i) {
        if (activitiesArchived[i].activity == null) throw new Error('unexpected: activity null in activitiesArchived');

        const creationDate = activitiesArchived[i].activity.creationDate;
        const found = res.activities.find((a) => a?.creationDate === creationDate)
        if (found != null) {
            activitiesArchived[i].activity.participations = found.participations;
        }
    }
    if (activitiesArchived.length > 0) {
        const archiveRes = await archiveCol.insertMany(activitiesArchived);
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

    const resPush = await col.updateOne({
        _id: req.groupId,
        admins: req.user
    }, {
        $push: {
            activities: {
                $each:
                    req.activities.filter((a, i) => a.creationDate == null && !req.activityIdxToArchive.includes(i)).map(a => ({
                        creationDate: nextCreationDate++,
                        name: a.name,
                        date: a.date,
                        capacity: a.capacity,
                        participations: []
                    }))

            }
        }
    })

    if (!resPush.acknowledged) {
        return {
            type: 'error',
            error: 'push not acknowledged'
        }
    }

    if (resPush.matchedCount !== 1) {
        return {
            type: 'error',
            error: 'matchedCount of push not 1'
        }
    }


    return {
        type: 'success'
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
