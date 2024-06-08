import { HandleDeletedUsersReq, HandleDeletedUsersResp } from "@/app/_lib/api";
import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { checkAdmin, handleDeletedUsers } from "@/app/api/dbTools";
import { NextRequest } from "next/server";

async function execute(req: HandleDeletedUsersReq): Promise<ApiResp<HandleDeletedUsersResp>> {
    if (!(await checkToken(req.user, req.token) && await checkAdmin(req.user))) {
        return {
            type: 'authFailed'
        }
    }

    if (!await checkAdmin(req.user)) {
        return {
            type: 'authFailed'
        }
    }

    await handleDeletedUsers();
    return {
        type: 'success'
    }
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
