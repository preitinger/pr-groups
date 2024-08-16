import { PropsWithChildren, useEffect, useState } from "react";
import styles from './Menu.module.css'
import Image from "next/image";
import { Popup } from "../Popup";
import Impressum from "./pr-client-utils/Impressum";
import { SessionContext } from "./SessionContext";
import { apiFetchPost } from "./user-management-client/apiRoutesClient";
import { DeleteReq, DeleteResp } from "./user-management-server/user-management-common/delete";
import { withStopPropagation } from "./utils";
import ImgAttributions from "./ImgAttributions";
import { myImgAttributions } from "../myImgAttributions";
import { LocalContext } from "./LocalContext";
import { userAndTokenFromStorages } from "./userAndToken";
import CookieDlg from "./pr-client-utils/CookieDlg";
import Label from "./Label";
import Checkbox from "./Checkbox";

export type CustomMenuItem = {
    type?: 'normal'
    label: string | { label: string; src: string; alt: string; width: number; height: number };
    onClick: () => void;
} | {
    type: 'checkbox';
    label: string;
    checked: boolean;
    setChecked: (checked: boolean) => void;
}

export interface MenuProps {
    group?: string | null;
    onDeleteMemberClick?: (() => void) | null;
    customItems?: CustomMenuItem[];
    customSpinning?: boolean;
    setCookiesAccepted: (accepted: boolean) => void;
}

export default function Menu({ group, onDeleteMemberClick, customItems, customSpinning, setCookiesAccepted, children }: PropsWithChildren<MenuProps>) {
    const [impressum, setImpressum] = useState(false);
    const [about, setAbout] = useState(false);
    // const [cookiePopup, setCookiePopup] = useState(false);
    const [imgAttr, setImgAttr] = useState(false);
    const [menu, setMenu] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [selfDeleted, setSelfDeleted] = useState(false);

    // useEffect(() => {
    //     const ctx = new SessionContext();
    //     const cookiesShown = ctx.cookiesShown;
    //     if (!cookiesShown) {
    //         setCookiePopup(true);
    //         ctx.cookiesShown = true;
    //     }
    // }, [])

    function onMenuClick() {
        setMenu(visible => !visible);
    }

    function deleteProfile() {
        setSpinning(true);
        const [user1, token1] = userAndTokenFromStorages();
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
                                {customItems != null &&
                                    customItems.map((item, i) =>
                                        item.type === 'checkbox' ?
                                            <Checkbox key={i} label={item.label} checked={item.checked} setChecked={item.setChecked} />
                                            :
                                            <button key={i} onClick={withStopPropagation(() => {
                                                setMenu(false);
                                                item.onClick();
                                            })}>
                                                {typeof item.label === 'string' ? item.label :
                                                    <div className={styles.labelAndImg}>{item.label.label} <Image src={item.label.src} alt={item.label.alt} width={item.label.width} height={item.label.height} /></div>}
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
                        <CookieDlg setCookiesAccepted={setCookiesAccepted} />
                        {/* {
                            cookiePopup &&
                            <CookieDlg onOk={() => setCookiePopup(false)}  />
                        } */}
                        {/* <Popup visible={cookiePopup} setVisible={setCookiePopup}>
                            Dieser Service benutzt Cookies um temporäre Seitenzustände zu speichern und eine Datenbank um Gruppen, ihre Mitglieder (nur Handynr, Vorname und optional Nachname oder abgekürzter Nachname), Gruppenaktivitäten und die Beteiligungen der Mitglieder zu speichern.
                            Sie dürfen diese Seite nur weiter benutzen, wenn Sie dies akzeptieren. Andernfalls verlassen Sie bitte diese Seite.
                            <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => { setCookiePopup(false); })}>OK</button>
                            </div>
                        </Popup> */}
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
                            <p>3</p>
                            <Label>Layout & Design der Abstimmungsseite:</Label>
                            <p>ALEXANDER POHL</p>
                            <Label>Layout & Design der Admin-Seiten und Programmierung:</Label>
                            <Image className={styles.picture} src='/Peter-Reitinger.jpg' width={200} height={199} alt='Peter Reitinger' />
                            <p>PETER REITINGER </p>
                            {/* <table className={styles.aboutTable}>
                                <tbody>
                                    <tr>
                                        <td colSpan={2}>Layout & Design der Abstimmungsseite:</td>
                                    </tr>
                                    <tr>
                                        <td>ALEXANDER POHL</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>Layout & Design der Admin-Seiten und Programmierung:</td>
                                    </tr>
                                    <tr>
                                        <td>PETER REITINGER</td>
                                        <td><Image className={styles.picture} src='/Peter-Reitinger.jpg' width={200} height={199} alt='Peter Reitinger' /></td>
                                    </tr>
                                </tbody>
                            </table> */}
                            {/* <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setAbout(false))}>SCHLIEẞEN</button>
                            </div> */}
                        </Popup>
                        <Popup visible={imgAttr} setVisible={setImgAttr}>
                            <ImgAttributions attributions={myImgAttributions} />
                        </Popup >
                        {
                            (spinning || customSpinning) &&
                            <div className='loader'></div>
                        }
                    </>
            }
        </>
    )
}