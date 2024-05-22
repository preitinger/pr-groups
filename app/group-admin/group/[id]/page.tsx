'use client'

import Header from "@/app/_lib/Header";
import { SessionContext } from "@/app/_lib/SessionContext";
import { GroupAdminGroupReq, GroupAdminGroupResp, Member } from "@/app/_lib/api";
import useUser from "@/app/_lib/useUser";
import { useEffect, useState } from "react";
import styles from './page.module.css'
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";

function invitationLink(group: string, member: Member): string {
    return `/member/${encodeURIComponent(group)}/${encodeURIComponent(member.phoneNr)}/${encodeURIComponent(member.token)}`
}

export default function Page({ params }: { params: { id: string } }) {
    const [comment, setComment] = useState('');
    const user = useUser();
    const [members, setMembers] = useState<Member[]>([]);
    type PhoneNr = string;
    const [copied, setCopied] = useState<Member | null>(null);

    useEffect(() => {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const req: GroupAdminGroupReq = {
            user: user1,
            token: token1,
            groupId: params.id
        }
        apiFetchPost<GroupAdminGroupReq, GroupAdminGroupResp>('/api/group-admin/group/', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setMembers(resp.members)
                    break;
            }
        })
    }, [params.id])

    const onCopyClick = (member: Member) => () => {
        setCopied(null);
        navigator.clipboard.writeText(location.origin + invitationLink(params.id, member)).then(() => {
            setCopied(member);
        })
    }

    return (
        <>
            <Header
                user={user}
                line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2em', bold: false }}
                margin='1em'
                line2={{ text: params.id, fontSize: '1.5em', bold: true }}
            />
            <div className={styles.main}>
                <p>{comment}</p>
                <table border={1} cellPadding={3}>
                    <tbody>
                        <tr>
                            <th>phoneNr</th><th>Name</th><th>Einladungslink</th><th></th>
                        </tr>
                        {
                            members.map(member =>
                                <tr key={member.phoneNr}>
                                    <td>
                                        {member.phoneNr}
                                    </td>
                                    <td>
                                        {member.prename} {member.surname}
                                    </td>
                                    <td>
                                        <a href={location.origin + invitationLink(params.id, member)}>{location.origin + invitationLink(params.id, member)}</a>
                                    </td>
                                    <td><button className={`${styles.copy} ${copied?.phoneNr === member.phoneNr && styles.copied}`} onClick={onCopyClick(member)} /></td>
                                </tr>
                            )
                        }

                    </tbody>
                </table>
            </div>

        </>
    )
}