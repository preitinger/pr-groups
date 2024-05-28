'use client';

import Link from 'next/link'
import styles from './page.module.css'
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Acceptance, Activity, ActivityAcceptReq, ActivityAcceptResp, Logo, Member, MemberDataReq, MemberDataResp, Participation } from '@/app/_lib/api';
import { formatDate, formatDateTime, formatTime } from '@/app/_lib/utils';
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
    url: string;
    onAcceptClick: (accept: Acceptance) => void;
    onDetailsClick: () => void;
}

function ActivityComp({ user, activity, url, onAcceptClick, onDetailsClick }: ActivityProps) {
    // activity.participations can contain objects with equal user, but different accept values. Then, the last array element is the latest decision of the specific user.
    // Now, filter the last decisions:
    const decisions: { [user: string]: Acceptance } = activity.participations.reduce((d, participation) => ({
        ...d,
        [participation.phoneNr]: participation.accept
    }),
        {}
    )
    const [acceptNum, rejectNum] = Object.entries(decisions).reduce(
        ([acceptNum, rejectNum], entry) => [acceptNum + (entry[1] === 'accepted' ? 1 : 0), rejectNum + (entry[1] === 'rejected' ? 1 : 0)],
        [0, 0]
    )
    const date = activity.date != null ? new Date(activity.date) : null
    // console.log('decisions', decisions);
    return (
        <>
            <div className={styles.activity}>
                <div onClick={onDetailsClick}>
                    {date != null &&
                        <DateTimeComp date={date} small={false} />
                    }
                    <div className={styles.participants}>{`${acceptNum} TEILNEHMER`}</div>
                    {activity.capacity != null && <div className={styles.free}>{`NOCH ${activity.capacity - acceptNum} FREIE PLÄTZE!`}</div>}
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
                            <button className={styles.accept} onClick={() => onAcceptClick('accepted')}>MITMACHEN</button>
                            <button className={styles.reject} onClick={() => onAcceptClick('rejected')}>ABSAGEN</button>
                            <div className={styles.undecided}>Entscheide mich noch</div>
                        </>
                    }
                    {
                        decisions[user] === 'accepted' &&
                        <>
                            <div className={styles.accepted}>Ich komme!</div>
                            <button className={styles.reject} onClick={() => onAcceptClick('rejected')}>ABSAGEN</button>
                            <button className={styles.doubt} onClick={() => onAcceptClick('undecided')}>SPÄTER ENTSCHEIDEN</button>
                        </>
                    }
                    {
                        decisions[user] === 'rejected' &&
                        <>
                            <button className={styles.accept} onClick={() => onAcceptClick('accepted')}>ZUSAGEN</button>
                            <div className={styles.rejected}>Ich komme nicht.</div>
                            <button className={styles.doubt} onClick={() => onAcceptClick('undecided')}>SPÄTER ENTSCHEIDEN</button>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

interface AdditionalHeaderProps {
    logo?: Logo;
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
    const [activityIdx, setActivityIdx] = useState(0)
    const [spinning, setSpinning] = useState(true);
    const [detailsPopup, setDetailsPopup] = useState(false);


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

                    setActivities(resp.activities);
                    setMembers(resp.members);
                    setComment('');
                    ctx.group = decodedGroup
                    ctx.activities = resp.activities;
                    const now = Date.now();
                    const first = resp.activities.findIndex((a) => (a.date ?? 0) > now)
                    console.log('first', first);
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
            activityIdx: i,
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
            console.log('measure', element.offsetTop, element.offsetHeight)
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

    const onDetailsClick = (i: number) => () => {
        setDetailsPopup(true)
    }


    const decisions: { [user: string]: Participation } | undefined = selActivity?.participations.reduce((d, participation) => ({
        ...d,
        [participation.phoneNr]: participation
    }),
        {}
    )

    const accept: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'accepted'))
    const reject: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'rejected'))

    function phoneNrToName(phoneNr: string): string {
        if (selActivity == null) return '';
        const member = members.find(member => member.phoneNr === phoneNr)
        if (member == null) return '';
        return member.prename + ' ' + member.surname;
    }

    const onMenuClick = useCallback((i: number) => () => {
        switch (i) {
            case 0: {
                if (!confirm(`Wirklich alles zum Benutzer ${prename} ${surname} löschen?`)) return;
                const ctx = new SessionContext();
                const phoneNr1 = phoneNr;
                const token1 = token;
                alert('Not yet implemented')
                break;
            }
        }
    }, [prename, surname, phoneNr, token])

    return (
        <>
            {additionalHeaderProps != null &&
                <Header user={null} {...additionalHeaderProps} />
            }
            <Welcome prename={prename} />

            {/* <div className={styles.adminLinks}>
                <Link className={styles.adminLink} href='/admin'>Admin</Link>
                <Link className={styles.adminLink} href='/group-admin'>Gruppen-Admin</Link>
            </div> */}
            {/* <h1 className={styles.headerWelcome}>Hallo {name}!</h1> */}
            {/* <h2 className={styles.headerGroup}>{group}</h2> */}
            <Menu customLabels={[`Alles über mich (${prename} ${surname}) löschen`]} onCustomClick={onMenuClick} />
            <div className={styles.main}>
                {comment != '' && <p className={styles.comment}>{comment}</p>}
                {
                    selActivity != null &&
                    <>
                        <div className={styles.labelNext}>{activityIdx === 0 ? 'NÄCHSTE VERANSTALTUNG' : 'WEITERE VERANSTALTUNG'}:</div>
                        <ActivityComp activity={selActivity} url={`/member/activity-details/${activityIdx}`} user={phoneNr} onAcceptClick={(accept) => onAcceptClick(activityIdx, accept)} onDetailsClick={onDetailsClick(activityIdx)} />
                        {/* <div ref={testRef} className={styles.testRow}><div className={styles.barElem}><DateTimeComp date={new Date()} small={true} /> */}

                    </>
                }
            </div>
            <ScrollableContainer className={styles.activityBar} snapOffset={80 - 18} snapWidth={160} snap={activityIdx} setSnap={setActivityIdx}>
                {
                    activities.map((a, i) => <div key={i}><div onClick={onBarElemClick(i)} className={styles.barElem + (i === activityIdx ? ' ' + styles.barElemActive : '')}>
                        {a.date != null ? <DateTimeComp date={new Date(a.date)} small={true} /> : <NameComp name={a.name} small={true} />}
                    </div></div>)
                }
            </ScrollableContainer>

            <Popup visible={detailsPopup && selActivity != null}>
                <h1 className={styles.headerGroup}>{group}</h1>
                <h2 className={styles.headerActivity}>{selActivity?.name} {selActivity?.date != null && formatDateTime(selActivity?.date, true)}</h2>
                <div className={styles.detailLists}>
                    <h3 className={styles.headerAccepts}>{accept.length} Zusagen</h3>
                    <div>
                        {
                            accept.length === 0 ? <span className={styles.none}>keine</span> :
                                <table>
                                    <tbody>

                                        {
                                            accept.map((participation, i) => (
                                                <tr key={i}>
                                                    <td className={styles.detailName}>{phoneNrToName(participation.phoneNr)}</td>
                                                    <td className={styles.detailDate}>{formatDateTime(new Date(participation.date))}</td>
                                                </tr>))
                                        }

                                    </tbody>
                                </table>
                        }
                    </div>
                    <h3 className={styles.headerRejects}>{reject.length} Absagen</h3>
                    <div>
                        {
                            reject.length === 0 ? <span className={styles.none}>keine</span> :
                                <table>
                                    <tbody>

                                        {
                                            reject.map((participation, i) => (
                                                <tr key={i}>
                                                    <td className={styles.detailName}>{phoneNrToName(participation.phoneNr)}</td>
                                                    <td className={styles.detailDate}>{formatDateTime(new Date(participation.date))}</td>
                                                </tr>))
                                        }

                                    </tbody>
                                </table>
                        }

                    </div>
                </div>
                <div className={styles.popupButtonRow}>
                    <button onClick={() => setDetailsPopup(false)}>SCHLIEẞEN</button>
                </div>
            </Popup>
            {
                spinning &&
                <div className={styles.spinner}></div>
            }
        </>
    )
}