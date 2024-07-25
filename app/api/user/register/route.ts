import { GroupAdminAddReq, GroupCreateReq } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { LoginReq } from "@/app/_lib/user-management-server/user-management-common/login";
import { RegisterReq, RegisterResp } from "@/app/_lib/user-management-server/user-management-common/register";
import { executeLogin, executeRegister } from "@/app/_lib/user-management-server/userManagementServer";
import { NextRequest } from "next/server";
import { executeGroupAdminAdd, executeGroupCreate } from "@/app/_lib/serverExecutes";

async function myRegister(req: RegisterReq): Promise<ApiResp<RegisterResp>> {
    const resp = await executeRegister(req);

    if (resp.type === 'success') {
        const groupName = `demo-${req.user}`
        const client = await clientPromise;
        const demoGroupReq: GroupCreateReq = {
            user: 'admin',
            token: 'intern nicht verwendet ;-)',
            name: groupName,
            line1: {
                text: 'Demo-Gruppe',
                fontSize: '1.5rem',
                bold: true,
            },
            margin: '0',
            line2: {
                text: `für ${req.user}`,
                fontSize: '1.2rem',
                bold: false
            },
            docTitle: 'Demogruppe',
            logo: null
        }
        const demoGroupResp = await executeGroupCreate(demoGroupReq, 'intern')
        if (demoGroupResp.type === 'success') {
            const groupAdminReq: GroupAdminAddReq = {
                user: 'admin',
                token: 'intern nicht verwendet',
                group: groupName,
                groupAdminUser: req.user
            }
            const groupAdminResp = await executeGroupAdminAdd(groupAdminReq, 'intern')
            if (groupAdminResp.type !== 'success') {
                throw new Error(`Unexpected problem in adding of group admin ${req.user} for group ${groupName}: ${JSON.stringify(groupAdminResp)}`)
            }
        }
        else if (demoGroupResp.type !== 'duplicate') {
            throw new Error(`Unexpected problem in creation of demo group for ${req.user}: ${JSON.stringify(demoGroupResp)}`)
        } else {
        }

    }

    return resp;
}
export function POST(req: NextRequest) {
    return apiPOST(req, myRegister);
}
