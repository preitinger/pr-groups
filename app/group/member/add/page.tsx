'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import { SessionContext } from "@/app/_lib/SessionContext";
import { GroupMemberAddReq, GroupMemberAddResp } from "@/app/_lib/api";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import Input from "@/app/_lib/Input";
import Header from "@/app/_lib/Header";

export default function Page() {
    const user = useUser();
    const [group, setGroup] = useState('')
    const [newPhoneNr, setNewPhoneNr] = useState('');
    const [prename, setPrename] = useState('');
    const [surname, setSurname] = useState('');
    const [comment, setComment] = useState('');
    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function onAddClick() {
        const ctx = new SessionContext();
        const token = ctx.token;
        if (user == null || token == null) {
            setComment('Du bist nicht eingeloggt.')
            return;
        }
        const req: GroupMemberAddReq = {
            user: user,
            token: token,
            group: group,
            phoneNr: newPhoneNr,
            prename: prename,
            surname: surname,
        }
        setComment('Sende Daten ...');
        setInvitationLink(null);
        setCopied(false);
        const resp = await apiFetchPost<GroupMemberAddReq, GroupMemberAddResp>('/api/group/member/add', req)
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert.');
                break;
            case 'success':
                setComment(`Einladungslink für ${prename} ${surname}: ${location.origin + resp.invitationUrl}`)
                setInvitationLink(location.origin + resp.invitationUrl);
                break;
            case 'groupNotFound':
                setComment(`Gruppe ${group} existiert nicht.`);
                break;
            case 'phoneNrContained':
                setComment(`Abgebrochen. Es gibt bereits ein Mitglied mit Telefonnr ${newPhoneNr} in Gruppe ${group}.`)
                break;
            case 'error':
                setComment(`Unerwarteter Fehler: ${resp.error}`);
                break;
        }
    }

    function onCopyClick() {
        if (invitationLink == null) return;
        navigator.clipboard.writeText(invitationLink).then(() => {
            setCopied(true);
        })
    }

    return (
        <>
            <Header user={user} line1={{ text: 'pr-groups / Gruppenadmin', fontSize: '1.2em', bold: false }} margin='1em' line2={{ text: 'Gruppenmitglied hinzufügen', fontSize: '1.5em', bold: true }} />
            <Profile user={user} />
            <div className={styles.form}>
                <Input label='Gruppe' text={group} setText={setGroup} />
                <Input label='Telefonnr. des neuen Gruppenmitglieds' text={newPhoneNr} setText={setNewPhoneNr} />
                <Input label='Vorname des neuen Mitglieds' text={prename} setText={setPrename} />
                <Input label='Nachname (ggf. Kürzel) des neuen Mitglieds' text={surname} setText={setSurname} />
                <button className={styles.addButton} disabled={user == null} onClick={onAddClick}>Gruppenmitglied hinzufügen</button>
                <p>{comment}</p>
                {invitationLink != null &&
                    <div className={styles.copyLink}>
                        <textarea readOnly value={invitationLink} />
                        <button className={`${styles.copy} ${copied && styles.copied}`} onClick={onCopyClick} />
                    </div>
                }
            </div>
        </>
    )
}