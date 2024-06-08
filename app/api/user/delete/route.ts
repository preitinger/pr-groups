import { ApiResp } from "@/app/_lib/user-management-client/user-management-common/apiRoutesCommon";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { DeleteReq, DeleteResp } from "@/app/_lib/user-management-server/user-management-common/delete";
import { executeDelete } from "@/app/_lib/user-management-server/userManagementServer";
import { NextRequest } from "next/server";
import { deleteUserRoles } from "../../dbTools";

async function execute(req: DeleteReq): Promise<ApiResp<DeleteResp>> {
    deleteUserRoles([req.user]);
    const delUserResp = executeDelete(req);
    return delUserResp;
}

export function POST(req: NextRequest) {
    return apiPOST(req, execute);
}
