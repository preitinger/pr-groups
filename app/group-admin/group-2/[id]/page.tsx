'use client'

import Header from "@/app/_lib/Header";
import Menu from "@/app/_lib/Menu";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from './page.module.css'
import FormComp from "@/app/_lib/pr-client-utils/FormComp";
import Input2 from "@/app/_lib/pr-client-utils/Input2";
import { userAndTokenFromStorages } from "@/app/_lib/userAndToken";
import assert from "assert";
import { EditedActivity, GroupAdminGroupReq, GroupAdminGroupResp, ImgData, Member } from "@/app/_lib/api";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { HeaderLine } from "@/app/_lib/HeaderLine";
import { SessionContext } from "@/app/_lib/SessionContext";
import FixedAbortController from "@/app/_lib/pr-client-utils/FixedAbortController";
import useLoginLogout from "@/app/_lib/useLoginLogout";

export default function Page({ params }: { params: { id: string } }) {
    const [spinning, setSpinning] = useState(false);
    const [groupId, setGroupId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null)
    const [user, onLoginClick, onLogoutClick, loginLogoutSpinning, userText, setUserText, passwdText, setPasswdText, loginError, logoutError] = useLoginLogout()
    const groupIdRef = useRef<string | null>(null);
    const [comment, setComment] = useState('');
    const [logo, setLogo] = useState<ImgData | null>(null);
    const [line1, setLine1] = useState<HeaderLine | null>(null);
    const [margin, setMargin] = useState('')
    const [line2, setLine2] = useState<HeaderLine | null>(null);
    const [docTitle, setDocTitle] = useState<string | null>(null);
    const [lastDocTitle, setLastDocTitle] = useState<string>('pr-groups');
    const [admins, setAdmins] = useState<string[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [activities, setActivities] = useState<EditedActivity[]>([]);
    const [activityIdxToArchive, setActivityIdxToArchive] = useState<number[]>([]);
    const [dirty, setDirty] = useState(false);

    const fetchData = useCallback(() => {
        const signal = abortControllerRef.current?.signal;
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) {
            onLogoutClick();
            setSpinning(false);
            return;
        }
        assert(groupIdRef.current != null);
        const req: GroupAdminGroupReq = {
            user: user1,
            token: token1,
            groupId: groupIdRef.current
        }
        setSpinning(true);
        const id = Math.random();
        const abortController = abortControllerRef.current;
        if (abortController == null) throw new Error('abortController null?!');
        apiFetchPost<GroupAdminGroupReq, 
        GroupAdminGroupResp>('/api/group-admin/group/', req, signal).then(resp => {
            signal?.throwIfAborted();
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    onLogoutClick();
                    break;
                case 'success': {
                    setLogo(resp.logo)
                    setLine1(resp.line1);
                    setMargin(resp.margin);
                    setLine2(resp.line2);
                    setDocTitle(resp.docTitle);
                    setAdmins(resp.admins)
                    setMembers(resp.members)
                    setActivities(resp.activities)
                    setActivityIdxToArchive([]);
                    const ctx = new SessionContext();
                    ctx.activities = resp.activities;
                    setDirty(false)
                    setComment('Zum Bearbeiten jeweils anklicken.')
                    break;
                }
            }
        }).catch(reason => {
            if ('name' in reason && reason.name === 'AbortError') {
                // expected
            } else {
                console.error('Unexpected error', reason)
                onLogoutClick();
            }
        }).finally(() => {
            setSpinning(false);
        })

    }, [onLogoutClick])

    useEffect(() => {
        const abortController = abortControllerRef.current = new FixedAbortController();
        setGroupId(groupIdRef.current = decodeURIComponent(params.id))
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) {
            setComment('Nicht eingeloggt.');
            return;
        }
        const id = Math.random();
        fetchData();

        return () => {
            abortController.abort()
        }
    }, [params.id, fetchData])

    return (
        <>
            <Menu customSpinning={spinning} customItems={[]} setCookiesAccepted={() => {}} >
                <Header user={null}
                line1={{
                    text: 'pr-groups / Gruppe bearbeiten',
                    fontSize: '1.2rem', 
                    bold: false
                }}
                margin='1rem'
                line2={{
                    text: groupId == null ? '' : `Gruppe ${groupId}`,
                    fontSize: '1.5rem',
                    bold: true
                }}
                 />
                <div className={styles.main}>
                    <FormComp decoImg={{ src: '/group-friends-jumping-top-hill.jpg', alt: 'Gruppe', width: 714, height: 576 }} maxWidth={1280} >
                        <div className={styles.form}>
                            <Input2 label='Gruppe' text={groupId ?? ''} setText={setGroupId} />
                        </div>
                    </FormComp>
                </div>
            </Menu>
        </>
    )
}
