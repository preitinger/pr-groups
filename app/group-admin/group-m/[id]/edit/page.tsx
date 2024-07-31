'use client'

import Header from "@/app/_lib/Header";
import Menu from "@/app/_lib/Menu";
import useUser from "@/app/_lib/useUser";
import { useState } from "react";

export default function Page() {
    const user = useUser();

    const [groupId, setGroupId] = useState('');

    return (
        <Menu onDeleteMemberClick={null} setCookiesAccepted={() => {}} >
            <Header
                user={user}
                line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2rem', bold: false }}
                margin='1rem'
                line2={{ text: groupId ?? '', fontSize: '1.5rem', bold: true }}
            />
            

        </Menu>
    )
}