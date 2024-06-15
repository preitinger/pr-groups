import { Activity, GroupAdminGroupReq, GroupAdminGroupResp, Logo, Member } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { GroupDoc } from "../../documents";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { filterNonNull } from "@/app/_lib/utils";
import { HeaderLine } from "@/app/_lib/HeaderLine";

async function executeGroup(req: GroupAdminGroupReq): Promise<ApiResp<GroupAdminGroupResp>> {
    if (!await checkToken(req.user, req.token)) {
        return {
            type: 'authFailed'
        }
    }

    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const group = await col.findOne<{ logo: Logo | null; line1: HeaderLine; margin: string; line2: HeaderLine; docTitle: string | null; admins: string[]; members: Member[]; activities: (Activity | null)[]; }>({
        _id: req.groupId,
        admins: req.user
    }, {
        projection: {
            logo: 1,
            line1: 1,
            margin: 1,
            line2: 1,
            docTitle: 1,
            admins: 1,
            members: 1,
            activities: 1,
        }
    })
    if (group == null) {
        return {
            type: 'authFailed'
        }
    }
    return {
        type: 'success',
        logo: group.logo,
        line1: group.line1,
        margin: group.margin,
        line2: group.line2,
        docTitle: group.docTitle,
        members: group.members,
        activities: filterNonNull(group.activities),
        admins: group.admins
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroup);
}
