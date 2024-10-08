'use client'

import Link from "next/link";
import Profile from "../_lib/Profile";
import useUser from "../_lib/useUser";
import styles from './page.module.css'
import Header from "../_lib/Header";
import { useCallback, useEffect, useState } from "react";
import { GroupAdminGroupsReq, GroupAdminGroupsResp } from "../_lib/api";
import { SessionContext } from "../_lib/SessionContext";
import { apiFetchPost } from "../_lib/user-management-client/apiRoutesClient";
import TabButton from "../_lib/TabButton";
import TabPage from "../_lib/TabPage";
import FixedAbortController from "../_lib/pr-client-utils/FixedAbortController";
import Menu, { CustomMenuItem } from "../_lib/Menu";
import { Popup } from "../Popup";
import LoginComp from "../_lib/user-management-client/LoginComp";
import { LocalContext } from "../_lib/LocalContext";
import { userAndTokenFromStorages } from "../_lib/userAndToken";
import useLoginLogout from "../_lib/useLoginLogout";
import FormComp from "../_lib/pr-client-utils/FormComp";

export default function Page() {
    const [comment, setComment] = useState('');
    const [groups, setGroups] = useState<string[] | null>(null);
    const [spinning, setSpinning] = useState(true);
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    const [user, onLoginClick, onLogoutClick, loginLogoutSpinning, userText, setUserText, passwdText, setPasswdText, loginError, logoutError] = useLoginLogout()


    const fetchData = useCallback(function fetchData(abortController?: AbortController) {
        const [user1, token1] = userAndTokenFromStorages();

        if (user1 == null || token1 == null) {
            setSpinning(false);
            return;
        }

        const req: GroupAdminGroupsReq = {
            user: user1,
            token: token1
        }
        setSpinning(true);
        apiFetchPost<GroupAdminGroupsReq, GroupAdminGroupsResp>('/api/group-admin/groups', req, abortController?.signal).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    onLogoutClick();
                    break;
                case 'success':
                    setGroups(resp.groupIds);
                    break;
            }
        }).catch(reason => {
            if ('name' in reason && reason.name === 'AbortError') {
                // ignore
            } else {
                setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
            }
        }).finally(() => {
            setSpinning(false);
        })

    }, [onLogoutClick])

    useEffect(() => {
        const abortController = new FixedAbortController();
        if (user != null) {
            fetchData(abortController);
        }
        return (() => {
            abortController.abort();
        })
    }, [fetchData, user])

    const customMenuItems: CustomMenuItem[] = user == null ? [] : [
        {
            type: 'normal',
            label: `${user} abmelden`,
            onClick: onLogoutClick
        }
    ]

    return (
        <>
            <Menu customSpinning={spinning} setCookiesAccepted={setCookiesAccepted} customItems={customMenuItems} >
                <Header user={null} line1={{ text: 'pr-groups', fontSize: '1.2em', bold: false }} margin='1em' line2={{ text: 'Gruppenadministration', fontSize: '1.5em', bold: true }} />
                <div className={styles.main}>

                    <FormComp decoImg={{ src: '/group-friends-jumping-top-hill.jpg', alt: 'Gruppe', width: 714, height: 576 }} maxWidth={1280} >
                        <div className={styles.form}>
                            <p>{comment}</p>
                            {/* <div className={styles.row}> */}
                            <Link className={styles.linkMemberAdd} href='/group/member/add'>Gruppenmitglied hinzufügen</Link>
                            {/* </div> */}
                            {/* <div className={styles.row}>
                    <Link className={styles.linkMemberRemove} href='/group/member/remove'>Gruppenmitglied entfernen</Link>
                </div> */}
                            {/* <div className={styles.row}> */}
                            <Link className={styles.linkActivityAdd} href='/group/activity/add'>Aktivität hinzufügen</Link>
                            {/* </div> */}
                            {/* <div className={styles.row}>
                    <Link className={styles.linkActivityDelete} href='/group/activity/delete'>Aktivität entfernen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkActivityChange} href='/group/activity/change'>Aktivität bearbeiten</Link>
                </div> */}
                            <div className={styles.groups}>
                                {
                                    groups == null ?
                                        <div className='loader'></div>
                                        :
                                        <>
                                            <h3 className={styles.groupHeader}>Du bist Administrator folgender Gruppen:</h3>
                                            {
                                                groups.map(group =>
                                                    <Link key={group} href={`/group-admin/group-m/${group}`} >{group}</Link>)
                                            }
                                        </>
                                }
                            </div>
                            <Link className={styles.linkAllActivities} href='/group-admin/all-activities'>Alle aktuellen Aktivitäten all deiner Gruppen auf einen Blick</Link>
                        </div>
                    </FormComp>
                </div>
                <Popup visible={user == null} >
                    <LoginComp user={userText} setUser={setUserText} passwd={passwdText} setPasswd={setPasswdText} onLoginClick={onLoginClick} comment={loginError} spinning={loginLogoutSpinning} />
                </Popup>
            </Menu>
        </>
    )
}