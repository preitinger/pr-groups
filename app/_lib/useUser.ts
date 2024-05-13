'use client'

import { useEffect, useState } from "react";
import { SessionContext } from "./SessionContext";

export default function useUser() {
    const [user, setUser] = useState<string | null>(null)


    useEffect(() => {
        const ctx = new SessionContext();
        setUser(ctx.user);
    }, [])


    return user;
}