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
import Menu from "../_lib/Menu";
import { Popup } from "../Popup";
import LoginComp from "../_lib/user-management-client/LoginComp";
import { LocalContext } from "../_lib/LocalContext";
import { userAndTokenFromStorages } from "../_lib/userAndToken";

export default function Page() {
    const user = useUser();
    const [comment, setComment] = useState('');
    const [groups, setGroups] = useState<string[] | null>(null);
    const [spinning, setSpinning] = useState(true);
    const [login, setLogin] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    const fetchData = useCallback(function fetchData(abortController?: AbortController) {
        const [user1, token1] = userAndTokenFromStorages();

        if (user1 == null || token1 == null) {
            setLogin(true);
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
                    setLogin(true);
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

    }, [])

    useEffect(() => {
        const abortController = new FixedAbortController();
        fetchData(abortController);
        return (() => {
            abortController.abort();
        })
    }, [fetchData])

    function onLogin() {
        setLogin(false);
        fetchData();
    }

    return (
        <>
            <Menu customSpinning={spinning} setCookiesAccepted={setCookiesAccepted}>
                <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.2em', bold: false }} margin='1em' line2={{ text: 'Gruppenadministration', fontSize: '1.5em', bold: true }} />
                <div className={styles.form}>
                    <p>{comment}</p>
                    <div className={styles.row}>
                        <Link className={styles.linkMemberAdd} href='/group/member/add'>Gruppenmitglied hinzufügen</Link>
                    </div>
                    {/* <div className={styles.row}>
                    <Link className={styles.linkMemberRemove} href='/group/member/remove'>Gruppenmitglied entfernen</Link>
                </div> */}
                    <div className={styles.row}>
                        <Link className={styles.linkActivityAdd} href='/group/activity/add'>Aktivität hinzufügen</Link>
                    </div>
                    {/* <div className={styles.row}>
                    <Link className={styles.linkActivityDelete} href='/group/activity/delete'>Aktivität entfernen</Link>
                </div>
                <div className={styles.row}>
                    <Link className={styles.linkActivityChange} href='/group/activity/change'>Aktivität bearbeiten</Link>
                </div> */}
                    <div className={styles.groups}>
                        {
                            groups == null ?
                                <div className={styles.spinner}></div>
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
                    <div>
                        <Link href='/group-admin/all-activities'>Alle aktuellen Aktivitäten all deiner Gruppen auf einen Blick</Link>
                    </div>
                </div>
                <Popup visible={login} >
                    <LoginComp onLogin={onLogin} setSpinning={setSpinning} />
                </Popup>
            </Menu>
        </>
    )
}