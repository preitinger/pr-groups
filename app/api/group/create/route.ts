import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { executeGroupCreate } from "@/app/_lib/serverExecutes";

export function POST(req: NextRequest) {
    return apiPOST(req, executeGroupCreate);
}
