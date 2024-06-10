import { MemberDataReq, MemberDataResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { filterNonNull } from "@/app/_lib/utils";

async function execute(req: MemberDataReq): Promise<ApiResp<MemberDataResp>> {

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    let group: GroupDoc | null = null;
    group = await col.findOne({
        _id: req.group,
        'members.phoneNr': req.phoneNr,
        'members.token': req.token
    }, {
        projection: {
            _id: 1,
            members: 1,
            logo: 1,
            line1: 1,
            margin: 1,
            line2: 1,
            activities: 1,
            docTitle: 1
        }
    })

    if (group == null) {
        return {
            type: 'authFailed',
        }
    }

    console.log('group', group);

    const member = group.members.find((member) => member.phoneNr === req.phoneNr)

    if (member == null) {
        return {
            type: 'authFailed'
        }
    }

    return {
        type: 'success',
        prename: member.prename,
        surname: member.surname,
        logo: group.logo,
        line1: group.line1,
        margin: group.margin,
        line2: group.line2,
        activities: filterNonNull(group.activities),
        members: group.members,
        docTitle: group.docTitle
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
