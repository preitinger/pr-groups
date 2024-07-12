import { PropsWithChildren, useEffect, useState } from "react";
import styles from './Menu.module.css'
import Image from "next/image";
import { Popup } from "../Popup";
import Impressum from "./pr-client-utils/Impressum";
import { SessionContext } from "./SessionContext";
import useUser from "./useUser";
import { apiFetchPost } from "./user-management-client/apiRoutesClient";
import { DeleteReq, DeleteResp } from "./user-management-server/user-management-common/delete";
import { withStopPropagation } from "./utils";
import ImgAttributions from "./ImgAttributions";
import { myImgAttributions } from "../myImgAttributions";

export interface MenuProps {
    group?: string | null;
    onDeleteMemberClick?: (() => void) | null;
    customLabels?: (string | { label: string; src: string; alt: string; width: number; height: number })[];
    onCustomClick?: (idx: number) => () => void;
    customSpinning?: boolean;
}

export default function Menu({ group, onDeleteMemberClick, customLabels, customSpinning, onCustomClick, children }: PropsWithChildren<MenuProps>) {
    const [impressum, setImpressum] = useState(false);
    const [about, setAbout] = useState(false);
    const [cookiePopup, setCookiePopup] = useState(false);
    const [imgAttr, setImgAttr] = useState(false);
    const [menu, setMenu] = useState(false);
    const user = useUser();
    const [spinning, setSpinning] = useState(false);
    const [selfDeleted, setSelfDeleted] = useState(false);

    useEffect(() => {
        const ctx = new SessionContext();
        const cookiesShown = ctx.cookiesShown;
        if (!cookiesShown) {
            setCookiePopup(true);
            ctx.cookiesShown = true;
        }
    }, [])

    function onMenuClick() {
        setMenu(visible => !visible);
    }

    function deleteProfile() {
        setSpinning(true);
        const ctx = new SessionContext();
        const user1 = ctx.user;
        const token1 = ctx.token;
        if (user1 == null || token1 == null) {
            return;
        }
        const req: DeleteReq = {
            user: user1,
            token: token1
        }
        setSpinning(true);
        apiFetchPost<DeleteReq, DeleteResp>('/api/user/delete', req).then(resp => {
            switch (resp.type) {
                case 'authFailed':
                    console.warn('authFailed');
                    break;
                case 'success':
                    setSelfDeleted(true);
                    console.log('deleted your profile');
                    break;
                case 'error':
                    console.error('Unerwarteter Fehler: ', resp.error)
                    break;
            }
        }).catch(reason => {
            console.error('Unerwarteter Fehler:', reason, JSON.stringify(reason));
        }).finally(() => {
            setSpinning(false);
        })
    }

    return (
        <>
            {
                selfDeleted ? <p>Your profile was deleted. Please leave this site.</p> :
                    <>
                        {children}

                        <div tabIndex={0} className={styles.menuButton} onClick={withStopPropagation(() => { onMenuClick() })} onKeyUp={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') onMenuClick();
                        }} >
                            <Image className={styles.menuImg} src='/main-menu.svg' width={32 * 0.65} height={32 * 0.65} alt='Menu' />
                        </div>
                        <Popup visible={menu} setVisible={setMenu}>
                            <div className={styles.menu}>
                                {customLabels != null &&
                                    customLabels.map((label, i) =>
                                        <button key={i} onClick={withStopPropagation(() => {
                                            setMenu(false);
                                            if (onCustomClick != undefined) onCustomClick(i)();
                                        })}>
                                            {typeof label === 'string' ? label :
                                                <div className={styles.labelAndImg}>{label.label} <Image src={label.src} alt={label.alt} width={label.width} height={label.height} /></div>}
                                        </button>
                                    )
                                }
                                <button onClick={withStopPropagation(() => { setImpressum(true); setMenu(false) })}>IMPRESSUM / DATENSCHUTZ</button>
                                <button onClick={withStopPropagation(() => { setAbout(true); setMenu(false) })}>ABOUT</button>
                                <button onClick={withStopPropagation(() => { setImgAttr(true); setMenu(false) })}>BILDER VON FREEP!K</button>
                            </div>
                            {/* <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setMenu(false))}>SCHLIEẞEN</button>
                            </div> */}
                        </Popup>
                        <Popup visible={cookiePopup} setVisible={setCookiePopup}>
                            Dieser Service benutzt Cookies um temporäre Seitenzustände zu speichern und eine Datenbank um Gruppen, ihre Mitglieder (nur Handynr, Vorname und optional Nachname oder abgekürzter Nachname), Gruppenaktivitäten und die Beteiligungen der Mitglieder zu speichern.
                            Sie dürfen diese Seite nur weiter benutzen, wenn Sie dies akzeptieren. Andernfalls verlassen Sie bitte diese Seite.
                            <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => { setCookiePopup(false); })}>OK</button>
                            </div>
                        </Popup>
                        <Popup visible={impressum} setVisible={setImpressum}>
                            <div className={styles.impressum}>
                                <Impressum group={group ?? null} name='Peter Reitinger' street='Birkenweg' houseNr='8' postalCode='93482' city='Pemfling' phone='09971-6131' mail='peter.reitinger(at)gmail.com' onDeleteClick={group == null ? deleteProfile : (onDeleteMemberClick ?? null)} />
                            </div>
                            {/* <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setImpressum(false))}>SCHLIEẞEN</button>
                            </div> */}
                        </Popup>
                        <Popup visible={about} setVisible={setAbout}>
                            <h1>About pr-groups</h1>
                            <table className={styles.aboutTable}>
                                <tbody>
                                    <tr>
                                        <td colSpan={2}>Layout & Design:</td>
                                    </tr>
                                    <tr>
                                        <td>ALEXANDER POHL</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>Programmierung:</td>
                                    </tr>
                                    <tr>
                                        <td>PETER REITINGER</td>
                                        <td><Image className={styles.picture} src='/Peter-Reitinger.jpg' width={200} height={199} alt='Peter Reitinger' /></td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setAbout(false))}>SCHLIEẞEN</button>
                            </div> */}
                        </Popup>
                        <Popup visible={imgAttr} setVisible={setImgAttr}>
                            <ImgAttributions attributions={myImgAttributions} />
                        </Popup >
                        {
                            (spinning || customSpinning) &&
                            <div className={styles.spinner}></div>
                        }
                    </>
            }
        </>
    )
}