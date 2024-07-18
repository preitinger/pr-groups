'use client'

import { useEffect, useState } from "react";
import { SessionContext } from "./SessionContext";
import { LocalContext } from "./LocalContext";
import { userAndTokenFromStorages } from "./userAndToken";

export default function useUser() {
    const [user, setUser] = useState<string | null>(null)


    useEffect(() => {
        const [user1, token1] = userAndTokenFromStorages();

        if (user1 != null && token1 != null) {
            setUser(user1);
        }
    }, [])


    return user;
}