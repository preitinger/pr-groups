import { GroupAdminAddReq, GroupAdminAddResp } from "@/app/_lib/api";
import { executeGroupAdminAdd } from "@/app/_lib/serverExecutes";
import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import clientPromise from "@/app/_lib/user-management-server/mongodb";
import { ApiResp } from "@/app/_lib/user-management-server/user-management-common/apiRoutesCommon";
import { checkToken } from "@/app/_lib/user-management-server/userManagementServer";
import { checkAdmin } from "@/app/api/dbTools";
import { GroupDoc } from "@/app/api/documents";
import { Filter } from "mongodb";
import { NextRequest } from "next/server";

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroupAdminAdd);
}
