'use client'

import { ActivitiesInGroup, Activity, GroupAdminAllGroupsActivitiesReq, GroupAdminAllGroupsActivitiesResp, Member, Participation } from "@/app/_lib/api"
import FixedAbortController from "@/app/_lib/pr-client-utils/FixedAbortController";
import { SessionContext } from "@/app/_lib/SessionContext";
import { apiFetchPost } from "@/app/_lib/user-management-client/apiRoutesClient";
import { formatDateTime } from "@/app/_lib/utils";
import { useEffect, useState } from "react"
import styles from './page.module.css'
import { Popup } from "@/app/Popup";
import WhatsAppLinkComp from "@/app/_lib/WhatsAppLinkComp";

interface Details {
    members: Member[];
    activity: Activity;
}

interface ActivityProps {
    members: Member[];
    activity: Activity;
    setDetails: (details: Details | null) => void;
}
function ActivityComp({ members, activity, setDetails }: ActivityProps) {
    function onDetails() {
        setDetails({ activity, members });
    }
    let accepting: string[] = []
    let rejecting: string[] = [];
    activity.participations.forEach(p => {
        switch (p.accept) {
            case 'accepted':
                if (!accepting.includes(p.phoneNr)) {
                    accepting.push(p.phoneNr);
                }
                rejecting = rejecting.filter(phoneNr => phoneNr !== p.phoneNr)
                break;

            case 'rejected':
                accepting = accepting.filter(phoneNr => phoneNr !== p.phoneNr);
                if (!rejecting.includes(p.phoneNr)) {
                    rejecting.push(p.phoneNr);
                }
                break;

            case 'undecided':
                accepting = accepting.filter(phoneNr => phoneNr !== p.phoneNr);
                rejecting = rejecting.filter(phoneNr => phoneNr !== p.phoneNr)
                break;
        }
    })
    return (
        <div className={styles.activity}>
            <div>{activity.name}</div>
            <div>{formatDateTime(activity.date, true)}</div>
            <div><a tabIndex={0} onClick={onDetails} onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') onDetails(); }}>{accepting.length} / {activity.capacity ?? 'unbegrenzt'}</a></div>
        </div>
    )
}

interface ActivitiesInGroupProps {
    activitiesInGroup: ActivitiesInGroup;
    setDetails: (d: Details | null) => void;
}
function ActivitiesInGroupComp({ activitiesInGroup, setDetails }: ActivitiesInGroupProps) {
    return (
        <div className={styles.group}>
            <div className={styles.groupName}>{activitiesInGroup.group}</div>
            {
                activitiesInGroup.activities.map((a, i) => (
                    <ActivityComp key={i} members={activitiesInGroup.members} activity={a} setDetails={setDetails} />))
            }
        </div>
    )
}

export default function Page() {
    const [comment, setComment] = useState('')
    const [activitiesInGroups, setActivitiesInGroups] = useState<ActivitiesInGroup[] | null>(null);
    const [details, setDetails] = useState<Details | null>(null);

    useEffect(() => {
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            setComment('Nicht authorisiert.');
            return;
        }

        const req: GroupAdminAllGroupsActivitiesReq = {
            user: user1,
            token: token1
        }
        const abortController = new FixedAbortController();
        apiFetchPost<GroupAdminAllGroupsActivitiesReq, GroupAdminAllGroupsActivitiesResp>('/api/group-admin/all-activities', req, abortController.signal).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    setComment('Nicht authorisiert.');
                    break;
                case 'error':
                    setComment('Unerwarteter Fehler: ' + resp.error);
                    break;
                case 'success':
                    setActivitiesInGroups(resp.activitiesInGroups.toSorted((a, b) => a.group.localeCompare(b.group)).map(aig => ({
                        ...aig,
                        activities: aig.activities.toSorted((a, b) => (a.date == null ? (b.date == null ? 0 : 1) : (b.date == null ? -1 : a.date - b.date)))
                    })))
                    break;
            }
        }).catch(reason => {
            if ('name' in reason && reason.name === 'AbortError') {
                // ignore
            } else {
                setComment('Unerwarteter Fehler: ' + JSON.stringify(reason));
            }
        })

        return () => {
            abortController.abort();
        }
    }, [])


    const decisions: { [user: string]: Participation } | undefined = details?.activity.participations.reduce((d, participation) => ({
        ...d,
        [participation.phoneNr]: participation
    }),
        {}
    )

    const accept: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'accepted'))
    const reject: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'rejected'))
    const undecided: string[] = details == null ? [] : (details?.members.map(member => member.phoneNr).filter(phoneNr => !accept.map(p => p.phoneNr).includes(phoneNr) && !reject.map(p => p.phoneNr).includes(phoneNr)))

    function phoneNrToName(phoneNr: string): string {
        if (details == null) return '';
        const member = details.members.find(member => member.phoneNr === phoneNr)
        if (member == null) return '';
        return member.prename + ' ' + member.surname;
    }

    return (
        <>
            <div className={styles.main}>
                {
                    activitiesInGroups &&
                    activitiesInGroups.map(activitiesInGroup => <ActivitiesInGroupComp key={activitiesInGroup.group} activitiesInGroup={activitiesInGroup} setDetails={setDetails} />)
                }
            </div>
            <Popup visible={details != null} setVisible={(visible) => {
                if (!visible) setDetails(null)
            }}>
                <h2 className={styles.headerActivity}>{details?.activity.name} {details?.activity.date != null && formatDateTime(details?.activity.date, true)}</h2>
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
                                                    <td><WhatsAppLinkComp phoneNr={participation.phoneNr} /></td>
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
                                                    <td><WhatsAppLinkComp phoneNr={participation.phoneNr} /></td>
                                                    <td className={styles.detailDate}>{formatDateTime(new Date(participation.date))}</td>
                                                </tr>))
                                        }

                                    </tbody>
                                </table>
                        }

                    </div>
                    <h3 className={styles.headerUndecided}>{undecided.length} haben noch nicht abgestimmt oder können es noch nicht sagen:</h3>
                    <table>
                        <tbody>
                            {
                                undecided.map((phoneNr, i) => <tr key={i}>
                                    <td className={styles.detailName}>{phoneNrToName(phoneNr)}</td>
                                    <td><WhatsAppLinkComp phoneNr={phoneNr} /></td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                </div>

            </Popup>
        </>
    )
}