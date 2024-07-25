'use client';

import Link from 'next/link'
import styles from './page.module.css'
import { MouseEvent, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Acceptance, Activity, ActivityAcceptReq, ActivityAcceptResp, ImgData, Member, MemberDataReq, MemberDataResp, MemberDeleteMeReq, MemberDeleteMeResp, Participation } from '@/app/_lib/api';
import { formatDate, formatDateTime, formatTime, withStopPropagation } from '@/app/_lib/utils';
import { SessionContext } from '@/app/_lib/SessionContext';
import Profile from '@/app/_lib/Profile';
import { apiFetchPost } from '@/app/_lib/user-management-client/apiRoutesClient';
import Header from '@/app/_lib/Header';
import { HeaderLine } from '@/app/_lib/HeaderLine';
import FixedAbortController from '@/app/_lib/pr-client-utils/FixedAbortController';
import Image from 'next/image';
import ScrollableContainer from '@/app/_lib/pr-client-utils/ScrollableContainer';
import ModalDialog from '@/app/_lib/ModalDialog';
import Impressum from '@/app/_lib/pr-client-utils/Impressum';
import { Popup } from '@/app/Popup';
import Menu from '@/app/_lib/Menu';
import { after } from 'node:test';
import WhatsAppLinkComp from '@/app/_lib/WhatsAppLinkComp';
import ActivityDetailsComp from '@/app/_lib/ActivityDetailsComp';
import Head from 'next/head';

const FAKE = true;

interface DateTimeProps {
    date: Date
    small: boolean;
}
function DateTimeComp({ date, small }: DateTimeProps) {
    return (
        <>
            <div className={small ? styles.nextDateSmall : styles.nextDate}>{formatDate(date)}</div>
            <div className={small ? styles.nextTimeSmall : styles.nextTime}>UM {formatTime(date)} UHR</div>
        </>
    )
}

interface NameProps {
    name: string;
    small: boolean;
}
function NameComp({ name, small }: NameProps) {
    return (
        <div className={small ? styles.nextDateSmall : styles.nextDate}>{name}</div>
    )
}

interface ActivityProps {
    user: string;
    activity: Activity;
    onAcceptClick: (accept: Acceptance) => void;
    // onDetailsClick: () => void;
}

function ActivityComp({ user, activity, onAcceptClick }: ActivityProps) {
    // activity.participations can contain objects with equal user, but different accept values. Then, the last array element is the latest decision of the specific user.
    // Now, filter the last decisions:
    const decisions: { [user: string]: Acceptance } = activity.participations.reduce<{ [user: string]: Acceptance }>((d, participation) => {
        d[participation.phoneNr] = participation.accept
        return d

        // return ({
        //     ...d,
        //     [participation.phoneNr]: participation.accept
        // })
    },
        {}
    )
    const [acceptNum, rejectNum] = Object.entries(decisions).reduce(
        ([acceptNum, rejectNum], entry) => [acceptNum + (entry[1] === 'accepted' ? 1 : 0), rejectNum + (entry[1] === 'rejected' ? 1 : 0)],
        [0, 0]
    )
    const date = activity.date != null ? new Date(activity.date) : null
    const freePlaces = (activity.capacity ?? 0) - acceptNum;
    // console.log('decisions', decisions);
    return (
        <>
            <div className={styles.activity}>
                {/* <div onClick={onDetailsClick}> */}
                <div >
                    {date != null &&
                        <DateTimeComp date={date} small={false} />
                    }
                    <div className={styles.participants}>{`${acceptNum} TEILNEHMER`}</div>
                    {activity.capacity != null && <div className={freePlaces >= 0 ? styles.free : styles.overbooked}>{freePlaces >= 0 ? `NOCH ${freePlaces} FREIE PLÄTZE!` : `${activity.capacity} Plätze überbucht!`}</div>}
                </div>
                {/* <p>Erstellt: {formatDate(activity.creationDate)}</p> */}
                {/* <Link href={url}>
                    <p>{acceptNum} Zusagen</p>
                    <p>{rejectNum} Absagen</p>
                </Link> */}
                <div className={styles.activityButtons}>
                    {
                        (decisions[user] == null || decisions[user] === 'undecided') &&
                        <>
                            <button className={styles.accept} onClick={(e) => { onAcceptClick('accepted'); e.stopPropagation() }}>MITMACHEN</button>
                            <button className={styles.reject} onClick={(e) => { onAcceptClick('rejected'); e.stopPropagation() }}>ABSAGEN</button>
                            <div className={styles.undecided}>Entscheide mich noch</div>
                        </>
                    }
                    {
                        decisions[user] === 'accepted' &&
                        <>
                            <div className={styles.accepted}>Ich komme!</div>
                            <button className={styles.reject} onClick={(e) => { onAcceptClick('rejected'); e.stopPropagation() }}>ABSAGEN</button>
                            <button className={styles.doubt} onClick={(e) => { onAcceptClick('undecided'); e.stopPropagation() }}>SPÄTER ENTSCHEIDEN</button>
                        </>
                    }
                    {
                        decisions[user] === 'rejected' &&
                        <>
                            <button className={styles.accept} onClick={(e) => { onAcceptClick('accepted'); e.stopPropagation() }}>ZUSAGEN</button>
                            <div className={styles.rejected}>Ich komme nicht.</div>
                            <button className={styles.doubt} onClick={(e) => { onAcceptClick('undecided'); e.stopPropagation() }}>SPÄTER ENTSCHEIDEN</button>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

interface AdditionalHeaderProps {
    logo?: ImgData;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
}

interface WelcomeProps {
    prename: string;
}

function Welcome(p: WelcomeProps) {
    return (
        <div className={styles.welcome}>
            <div className={styles.hello}>HALLO,</div>
            <div className={styles.user}>
                {p.prename.toUpperCase()}!
            </div>
        </div>
    )
}

type Choice = 'undecided' | 'accepted' | 'rejected';

function formatName(member?: Member): string {
    if (member == null) return '';
    return member.prename + ' ' + member.surname;
}

function compareMemberName(a?: Member, b?: Member) {
    if (a == null || b == null) return 0;
    const na = formatName(a);
    const nb = formatName(b);
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
}

export default function Page({ params }: { params: { group: string; phoneNr: string; token: string } }) {
    const router = useRouter();
    const [group, setGroup] = useState('');
    const [phoneNr, setPhoneNr] = useState('');
    const [token, setToken] = useState('');
    const [activities, setActivities] = useState<Activity[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [comment, setComment] = useState('')
    const [prename, setPrename] = useState('');
    const [surname, setSurname] = useState('');
    const [additionalHeaderProps, setAdditionalHeaderProps] = useState<AdditionalHeaderProps | null>(null);
    const [firstOpen, setFirstOpen] = useState(0)
    const [activityIdx, setActivityIdx] = useState(0)
    const [spinning, setSpinning] = useState(true);
    const [detailsPopup, setDetailsPopup] = useState(false);
    const [docTitle, setDocTitle] = useState('pr-groups');
    const [afterDeleteSelf, setAfterDeleteSelf] = useState(false);


    useEffect(() => {
        // console.log('effect ...');
        let decodedGroup: string;
        let decodedPhoneNr: string;
        let decodedToken: string;
        try {
            setGroup(decodedGroup = decodeURIComponent(params.group));
            setPhoneNr(decodedPhoneNr = decodeURIComponent(params.phoneNr));
            setToken(decodedToken = decodeURIComponent(params.token));
        } catch (reason) {
            setComment('Ungültiger Link!');
            return;
        }
        const req: MemberDataReq = {
            group: decodedGroup,
            phoneNr: decodedPhoneNr,
            token: decodedToken,
        }
        const ctx = new SessionContext();
        setSpinning(true);
        const abortController = new FixedAbortController();
        apiFetchPost<MemberDataReq, MemberDataResp>('/api/member', req, abortController.signal).then(resp => {
            // console.log('resp', resp);
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    setAfterDeleteSelf(true);
                    break;
                case 'success':
                    setAdditionalHeaderProps({
                        logo: resp.logo ?? undefined,
                        line1: resp.line1,
                        margin: resp.margin,
                        line2: resp.line2,
                    })
                    setPrename(resp.prename);
                    setSurname(resp.surname);
                    resp.activities.sort((a, b) => {
                        if (a.date != null && b.date != null) {
                            return a.date - b.date
                        }
                        if (a.date != null && b.date == null) return -1;
                        if (a.date == null && b.date != null) return 1;
                        return 0;
                    })
                    setActivities(resp.activities);
                    setMembers(resp.members);
                    setComment('');
                    ctx.group = decodedGroup
                    ctx.activities = resp.activities;
                    const now = Date.now();
                    const first = resp.activities.findIndex((a) => (a.date ?? 0) > now)
                    setFirstOpen(first);
                    setActivityIdx(first >= 0 ? first : 0);
                    setDocTitle(resp.docTitle ?? resp.line1.text);
                    break;
                case 'error':
                    if (FAKE) {
                        setAdditionalHeaderProps({
                            logo: {
                                src: '/logo-von-Homepage.png.webp',
                                alt: 'Logo',
                                width: 50,
                                height: 60,
                            },
                            line1: {
                                text: 'AFTER-WORK',
                                fontSize: '1.5rem',
                                bold: true
                            },
                            margin: '0.1rem',
                            line2: {
                                text: 'TENNIS',
                                fontSize: '1.2rem',
                                bold: false
                            }

                        })
                        setPrename('Peter');
                        setComment('');
                        ctx.group = 'TC Rot-Weiß Cham'
                        // const date = new Date('2024-05-22T18:00Z+02:00');
                        // const date = new Date('2024-05-22');
                        const date = new Date('2024-05-22T18:00+02:00');
                        // console.log('date', date);
                        const activity: Activity = {
                            name: '',
                            date: date.getTime(),
                            creationDate: Date.now(),
                            capacity: 8,
                            participations: []
                        }
                        setActivities([activity, {
                            ...activity,
                            date: date.getTime() + 7 * 24 * 3600 * 1000
                        }]);
                        setActivityIdx(1);
                    } else {
                        setComment('Unerwarteter Fehler: ' + resp.error)
                    }
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

        return () => {
            abortController.abort();
        }
    }, [params.group, params.phoneNr, params.token])

    function onAcceptClick(i: number, accept: Acceptance) {
        // if (tokenRef.current == null) {
        //     setComment('Nicht eingeloggt.');
        //     return;
        // }
        // setComment('Sende Daten...');
        setSpinning(true);
        const req: ActivityAcceptReq = {
            phoneNr: phoneNr,
            token: token,
            group: group,
            activityCreationDate: activities[i].creationDate,
            accept: accept
        }
        apiFetchPost<ActivityAcceptReq, ActivityAcceptResp>('/api/group/activity/accept', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'groupNotFound':
                    setComment('Gruppe nicht gefunden.');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + JSON.stringify(resp.error));
                    break;
                case 'success':
                    resp.activities.sort((a, b) => {
                        if (a.date != null && b.date != null) {
                            return a.date - b.date
                        }
                        if (a.date != null && b.date == null) return -1;
                        if (a.date == null && b.date != null) return 1;
                        return 0;
                    })
                    setActivities(resp.activities);
                    new SessionContext().activities = resp.activities;
                    setComment('');
                    break;
            }
        }).finally(() => {
            setSpinning(false);
        })
        // setActivities(d => d.map((activity, j) => j === i ? {
        //     ...activity,
        //     participations: [
        //         ...activity.participations,
        //         {
        //             user: user,
        //             date: new Date(),
        //             accept: accept
        //         }
        //     ]

        // } : activity))
    }

    const selActivity: Activity | null = activityIdx >= 0 && activityIdx < activities.length != null ? activities[activityIdx] : null

    const testRef = useRef<HTMLDivElement>(null)
    function onMeasure() {
        if (testRef.current == null) return;
        let element: HTMLElement | null = testRef.current;
        while (element != null) {
            const parent: Element | null = element.offsetParent;
            if (parent instanceof HTMLElement) {
                element = parent;
            } else {
                element = null;
            }
        }
    }

    const onBarElemClick = (i: number) => () => {
        setActivityIdx(i);
    }

    function onDetailsClick() {
        if (afterDeleteSelf) return;
        setDetailsPopup(true)
    }


    const onMenuClick = useCallback((i: number) => () => {
        if (afterDeleteSelf) return;
        switch (i) {
            case 0: {
                const req: MemberDataReq = {
                    group: group,
                    phoneNr: phoneNr,
                    token: token,
                }
                const ctx = new SessionContext();
                setSpinning(true);
                const abortController = new FixedAbortController();
                apiFetchPost<MemberDataReq, MemberDataResp>('/api/member', req, abortController.signal).then(resp => {
                    // console.log('resp', resp);
                    switch (resp.type) {
                        case 'authFailed':
                            setComment('Nicht authorisiert.');
                            break;
                        case 'success':
                            setAdditionalHeaderProps({
                                logo: resp.logo ?? undefined,
                                line1: resp.line1,
                                margin: resp.margin,
                                line2: resp.line2,
                            })
                            setPrename(resp.prename);
                            setSurname(resp.surname);

                            resp.activities.sort((a, b) => {
                                if (a.date != null && b.date != null) {
                                    return a.date - b.date
                                }
                                if (a.date != null && b.date == null) return -1;
                                if (a.date == null && b.date != null) return 1;
                                return 0;
                            })
                            setActivities(resp.activities);
                            setMembers(resp.members);
                            setComment('');
                            ctx.activities = resp.activities;
                            const now = Date.now();
                            const first = resp.activities.findIndex((a) => (a.date ?? 0) > now)
                            setActivityIdx(first >= 0 ? first : 0);
                            break;
                        case 'error':
                            if (FAKE) {
                                setAdditionalHeaderProps({
                                    logo: {
                                        src: '/logo-von-Homepage.png.webp',
                                        alt: 'Logo',
                                        width: 50,
                                        height: 60,
                                    },
                                    line1: {
                                        text: 'AFTER-WORK',
                                        fontSize: '1.5rem',
                                        bold: true
                                    },
                                    margin: '0.1rem',
                                    line2: {
                                        text: 'TENNIS',
                                        fontSize: '1.2rem',
                                        bold: false
                                    }

                                })
                                setPrename('Peter');
                                setComment('');
                                ctx.group = 'TC Rot-Weiß Cham'
                                // const date = new Date('2024-05-22T18:00Z+02:00');
                                // const date = new Date('2024-05-22');
                                const date = new Date('2024-05-22T18:00+02:00');
                                // console.log('date', date);
                                const activity: Activity = {
                                    name: '',
                                    date: date.getTime(),
                                    creationDate: Date.now(),
                                    capacity: 8,
                                    participations: []
                                }
                                setActivities([activity, {
                                    ...activity,
                                    date: date.getTime() + 7 * 24 * 3600 * 1000
                                }]);
                                setActivityIdx(1);
                            } else {
                                setComment('Unerwarteter Fehler: ' + resp.error)
                            }
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
                break;
            }
        }
    }, [afterDeleteSelf, group, phoneNr, token])

    function onDeleteClick() {
        // Sicherheitsabfrage bereits im Impressum (/ Datenschutz)
        const ctx = new SessionContext();
        const phoneNr1 = phoneNr;
        const token1 = token;
        const req: MemberDeleteMeReq = {
            group: group,
            phoneNr: phoneNr,
            token: token
        }
        setSpinning(true);
        apiFetchPost<MemberDeleteMeReq, MemberDeleteMeResp>('/api/member/delete-me', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'success':
                    setComment('Alle Daten entfernt. Dieser Link wird natürlich dann in Zukunft nicht mehr funktionieren. Bitte Seite schließen bzw. verlassen.');
                    setAfterDeleteSelf(true);
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
            }
        }).catch(reason => {
            setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
        }).finally(() => {
            setSpinning(false);
        })

    }

    let tmpPrename: string;
    let tmpSurname: string;

    return (
        <>
            <title>{docTitle}</title>
            <div className={styles.page} onClick={withStopPropagation(onDetailsClick)}>

                {!afterDeleteSelf && <>
                    {additionalHeaderProps != null &&
                        <Header user={null} {...additionalHeaderProps} />
                    }
                    {
                        prename != '' &&
                        <Welcome prename={prename} />
                    }

                    {/* <div className={styles.adminLinks}>
                <Link className={styles.adminLink} href='/admin'>Admin</Link>
                <Link className={styles.adminLink} href='/group-admin'>Gruppen-Admin</Link>
            </div> */}
                    {/* <h1 className={styles.headerWelcome}>Hallo {name}!</h1> */}
                    {/* <h2 className={styles.headerGroup}>{group}</h2> */}
                    <Menu group={group} onDeleteMemberClick={onDeleteClick} customLabels={['DATEN AKTUALISIEREN']} onCustomClick={onMenuClick} />
                </>
                }
                <div className={styles.main}>
                    {comment != '' && <p className={styles.comment}>{comment}</p>}
                    {
                        !afterDeleteSelf && selActivity != null &&
                        <>
                            <div className={styles.labelNext}>{selActivity.date == null ? selActivity.name : activityIdx === firstOpen ? 'NÄCHSTE VERANSTALTUNG' : activityIdx < firstOpen || firstOpen === -1 ? 'ALTE VERANSTALTUNG' : 'WEITERE VERANSTALTUNG'}:</div>
                            <ActivityComp activity={selActivity} user={phoneNr} onAcceptClick={(accept) => onAcceptClick(activityIdx, accept)} />
                            {/* <div ref={testRef} className={styles.testRow}><div className={styles.barElem}><DateTimeComp date={new Date()} small={true} /> */}

                        </>
                    }
                    {!afterDeleteSelf && selActivity == null &&
                        <>
                            <div className={styles.noActivities}>Noch keine Aktivitäten in dieser Gruppe</div>
                        </>
                    }
                </div>
                {!afterDeleteSelf && <>
                    <ScrollableContainer className={styles.activityBar} snapOffset={80 - 18} snapWidth={160} snap={activityIdx} setSnap={setActivityIdx} >
                        {
                            activities.map((a, i) => <div key={i}><div onClick={withStopPropagation(onBarElemClick(i))} className={styles.barElem + (i === activityIdx ? ' ' + styles.barElemActive : '')}>
                                {a.date != null ? <DateTimeComp date={new Date(a.date)} small={true} /> : <NameComp name={a.name} small={true} />}
                            </div></div>)
                        }
                    </ScrollableContainer>

                    <Popup visible={detailsPopup && selActivity != null} setVisible={setDetailsPopup}>
                        <ActivityDetailsComp group={group} selActivity={selActivity} members={members} />
                    </Popup>
                </>
                }            {
                    spinning &&
                    <div className={styles.spinner}></div>
                }
            </div>
        </>
    )
}