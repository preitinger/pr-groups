import styles from './ActivityDetailsComp.module.css'
import { Activity, Member, Participation } from './api'
import { formatDateTime } from './utils';
import WhatsAppLinkComp from './WhatsAppLinkComp';

export interface ActivityDetailsProps {
    group: string;
    selActivity: Activity | null;
    members: Member[];
}
export default function ActivityDetailsComp({ group, selActivity, members }: ActivityDetailsProps) {

    const decisions: { [user: string]: Participation } | undefined = selActivity?.participations.reduce((d, participation) => ({
        ...d,
        [participation.phoneNr]: participation
    }),
        {}
    )

    const accept: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'accepted'))
    const reject: Participation[] = decisions == null ? [] : Object.values(decisions).filter((p => p.accept === 'rejected'))
    const undecided: string[] = decisions == null ? [] : (members.map(member => member.phoneNr).filter(phoneNr => !accept.map(p => p.phoneNr).includes(phoneNr) && !reject.map(p => p.phoneNr).includes(phoneNr)))

    function phoneNrToName(phoneNr: string): string {
        if (selActivity == null) return '';
        const member = members.find(member => member.phoneNr === phoneNr)
        if (member == null) return '';
        return member.prename + ' ' + member.surname;
    }
    return <>
        <h1 className={styles.headerGroup}>{group}</h1>
        <h2 className={styles.headerActivity}>{selActivity?.name} {selActivity?.date != null && formatDateTime(selActivity?.date, true)}</h2>
        <div className={styles.detailLists}>
            <h3 className={styles.headerAccepts}>{accept.length === 1 ? '1 Zusage' : `${accept.length} Zusagen`}</h3>
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
            <h3 className={styles.headerRejects}>{reject.length === 1 ? '1 Absage' : `${reject.length} Absagen`}</h3>
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
            <h3 className={styles.headerUndecided}>{`${undecided.length === 1 ? 'Eine Person hat noch nicht abgestimmt oder kann es noch nicht sagen:' : `${undecided.length} haben noch nicht abgestimmt oder können es noch nicht sagen:`}`}</h3>
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
    </>

}