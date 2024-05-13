import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { executeLogin } from "@/app/_lib/user-management-server/userManagementServer";

export function POST(req: NextRequest) {
    return apiPOST(req, executeLogin);
}
