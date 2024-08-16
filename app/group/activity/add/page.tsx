'use client'

import Profile from "@/app/_lib/Profile";
import useUser from "@/app/_lib/useUser"
import styles from './page.module.css'
import { useState } from "react";
import Input from "@/app/_lib/Input";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { GroupActivityAddReq, GroupActivityAddResp } from "@/app/_lib/api";
import { SessionContext } from "@/app/_lib/SessionContext";
import Header from "@/app/_lib/Header";
import { parseGermanDate } from "@/app/_lib/utils";
import DateTimeInput from "@/app/_lib/pr-client-utils/DateTimeInput";
import { userAndTokenFromStorages } from "@/app/_lib/userAndToken";
import Menu, { CustomMenuItem } from "@/app/_lib/Menu";
import useLoginLogout from "@/app/_lib/useLoginLogout";
import FormComp from "@/app/_lib/pr-client-utils/FormComp";
import Input2 from "@/app/_lib/pr-client-utils/Input2";
import { Popup } from "@/app/Popup";
import LoginComp from "@/app/_lib/user-management-client/LoginComp";

export default function Page() {
    const [group, setGroup] = useState('');
    const [activity, setActivity] = useState('');
    const [capacity, setCapacity] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [timeText, setTimeText] = useState('');
    const [comment, setComment] = useState('');
    const [unclearMESZ, setUnclearMESZ] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(false);
    const [user, onLoginClick, onLogoutClick, loginLogoutSpinning, userText, setUserText, passwdText, setPasswdText, loginError, logoutError] = useLoginLogout()

    async function onAddClick() {
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) {
            setComment('Bitte erst einloggen.');
            return;
        }

        setComment('Erstelle Aktivität ...');
        let capacityNum: number | null = null;
        try {
            capacityNum = parseInt(capacity);
        } catch (reason) { }
        const test = JSON.parse(JSON.stringify(date));
        const req: GroupActivityAddReq = {
            user: user1,
            token: token1,
            group: group,
            activity: activity,
            date: date?.getTime() ?? null,
            capacity: capacityNum != null && capacityNum > 0 ? capacityNum : null
        }
        const resp = await apiFetchPost<GroupActivityAddReq, GroupActivityAddResp>('/api/group/activity/add', req);
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert.');
                break;
            case 'success':
                setComment(`Aktivität "${activity}" in Gruppe "${group}" erstellt.`);
                break;
            case 'groupNotFound':
                setComment(`Gruppe "${group}" nicht gefunden.`);
                break;
            case 'wasActivity':
                setComment(`Es gibt bereits die Aktivität "${activity}" in Gruppe "${group}".`);
                break;
            case 'error':
                setComment(`Unerwarteter Fehler: ${resp.error}`);
                break;
        }
    }

    const customMenuItems: CustomMenuItem[] = user == null ? [] : [
        {
            type: 'normal',
            label: `${user} abmelden`,
            onClick: onLogoutClick
        }
    ]

    return (
        <>
            <Menu customSpinning={false} setCookiesAccepted={setCookiesAccepted} customItems={customMenuItems} >
                <Header user={null} line1={{ text: 'pr-groups / Gruppen-Admin', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Aktivität hinzufügen', fontSize: '1.5rem', bold: true }} />
                <div className={styles.main}>
                    <FormComp decoImg={{ src: '/group-friends-jumping-top-hill.jpg', alt: 'Gruppe', width: 714, height: 576 }} maxWidth={1280} >
                        <div className={styles.form}>
                            <Input2 label='Gruppe' text={group} setText={setGroup} />
                            <Input2 label='Aktivität' text={activity} setText={setActivity} />
                            <Input2 type='number' label='Teilnehmerkapazität' text={capacity} setText={setCapacity} validate={(text) => {
                                if (text === '') return '';
                                const n = parseInt(text);
                                if (n < 1) return 'Mindestens 1!'
                                if (isNaN(n)) return 'Zahl eingeben!'
                                return '';
                            }} />
                            {/* <DateTimeInput initialText='' setDate={setDate} /> */}
                            <Input2 type='datetime-local' label='Uhrzeit' text={timeText} setText={setTimeText} />
                            <button className={styles.addButton} onClick={onAddClick}>Aktivität hinzufügen</button>
                            <p className={styles.comment}>
                                {comment}
                            </p>
                        </div>
                    </FormComp>
                </div>
                <Popup visible={user == null}>
                    <LoginComp user={userText} setUser={setUserText} passwd={passwdText} setPasswd={setPasswdText} comment={loginError} onLoginClick={onLoginClick} spinning={loginLogoutSpinning} />
                </Popup>
            </Menu>

        </>
    )
}