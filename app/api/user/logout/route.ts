import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { executeLogout } from "@/app/_lib/user-management-server/userManagementServer";
import { NextRequest } from "next/server";

export function POST(req: NextRequest) {
    return apiPOST(req, executeLogout);
}
