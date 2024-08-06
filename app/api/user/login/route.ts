import { apiPOST } from "@/app/_lib/user-management-server/apiRoutesForServer";
import { NextRequest } from "next/server";
import { executeLogin } from "@/app/_lib/user-management-server/userManagementServer";
import { setTimeout } from "timers/promises";

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    const res = await setTimeout(ms, null, {
        signal: signal
    })
}

export function POST(req: NextRequest) {
    return apiPOST(req, executeLogin);
}
