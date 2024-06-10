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

function ImgAndAttrRow({ url, children }: PropsWithChildren<{ url: string }>) {
    return (
        <tr>
            <td><Image src={url} alt={url} width={32} height={32} /></td>
            <td>{children}</td>
        </tr>
    )
}

export interface MenuProps {
    group?: string | null;
    onDeleteMemberClick?: (() => void) | null;
    customLabels?: string[];
    onCustomClick?: (idx: number) => () => void;
}

export default function Menu({ group, onDeleteMemberClick, customLabels, onCustomClick, children }: PropsWithChildren<MenuProps>) {
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
                        <div className={styles.menuButton} onClick={withStopPropagation(() => { onMenuClick() })} >
                            <Image src='/main-menu.svg' width={32 * 0.65} height={32 * 0.65} alt='Menu' />
                        </div>
                        <Popup visible={menu}>
                            <div className={styles.menu}>
                                {customLabels != null &&
                                    customLabels.map((label, i) =>
                                        <button key={i} onClick={withStopPropagation(() => { setMenu(false); if (onCustomClick != undefined) onCustomClick(i)(); })}>{label}</button>
                                    )
                                }
                                <button onClick={withStopPropagation(() => { setImpressum(true); setMenu(false) })}>IMPRESSUM / DATENSCHUTZ</button>
                                <button onClick={withStopPropagation(() => { setAbout(true); setMenu(false) })}>ABOUT</button>
                                <button onClick={withStopPropagation(() => { setImgAttr(true); setMenu(false) })}>BILDER VON FREEP!K</button>
                            </div>
                            <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setMenu(false))}>SCHLIEẞEN</button>
                            </div>
                        </Popup>
                        <Popup visible={cookiePopup} setVisible={setCookiePopup}>
                            Dieser Service benutzt Cookies um temporäre Seitenzustände zu speichern und eine Datenbank um Gruppen, ihre Mitglieder (nur Handynr, Vorname und optional Nachname oder abgekürzter Nachname), Gruppenaktivitäten und die Beteiligungen der Mitglieder zu speichern.
                            Sie dürfen diese Seite nur weiter benutzen, wenn Sie dies akzeptieren. Andernfalls verlassen Sie bitte diese Seite.
                        </Popup>
                        <Popup visible={impressum}>
                            <div className={styles.impressum}>
                                <Impressum group={group ?? null} name='Peter Reitinger' street='Birkenweg' houseNr='8' postalCode='93482' city='Pemfling' phone='09971-6131' mail='peter.reitinger(at)gmail.com' onDeleteClick={group == null ? deleteProfile : (onDeleteMemberClick ?? null)} />
                            </div>
                            <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setImpressum(false))}>SCHLIEẞEN</button>
                            </div>
                        </Popup>
                        <Popup visible={about}>
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
                            <div className={styles.popupButtonRow}>
                                <button onClick={withStopPropagation(() => setAbout(false))}>SCHLIEẞEN</button>
                            </div>
                        </Popup>
                        <Popup visible={imgAttr} setVisible={setImgAttr}>
                            <h3>Vielen Dank für folgende kostenlose Bilder bereit gestellt unter freepik.com:</h3>
                            <div className={styles.center}>
                                <table className={styles.imgTable}>
                                    <tbody>
                                        <ImgAndAttrRow url='/check-mark_5299035.png'>
                                            <a href="https://www.freepik.com/icon/check-mark_5299035#fromView=search&page=2&position=63&uuid=a213ba3c-7c1f-4ffb-987d-a3f27fae4442">Icon by Ian June</a>
                                        </ImgAndAttrRow>
                                        <ImgAndAttrRow url='/copy_1621635.png'>
                                            <a href="https://www.freepik.com/icon/copy_1621635#fromView=search&page=1&position=1&uuid=7742990b-36dc-4812-9450-ab42a0e5b87b">Icon by Freepik</a>
                                        </ImgAndAttrRow>
                                        <ImgAndAttrRow url='/cross_8995303.png'>
                                            <a href="https://www.freepik.com/icon/cross_8995303#fromView=search&page=2&position=91&uuid=a9dd6062-9b81-43c5-bf5a-ea44908109c4">Icon by Maan Icons</a>
                                        </ImgAndAttrRow>
                                        <ImgAndAttrRow url='/edit_12000664.png'>
                                            <a href="https://www.freepik.com/icon/edit_12000664#fromView=search&page=2&position=47&uuid=c237083f-91e4-4a1e-9a0d-563d40de6c2e">Icon by Mihimihi</a>
                                        </ImgAndAttrRow>
                                        <ImgAndAttrRow url='/thinking_982997.png'>
                                            <a href="https://www.freepik.com/icon/thinking_982997">Icon by Freepik</a>
                                        </ImgAndAttrRow>
                                        <ImgAndAttrRow url='/square_14034302.png'>
                                            <a href="https://www.freepik.com/icon/square_14034302#fromView=search&page=1&position=7&uuid=ebccda20-7e84-4c88-a3db-182ec9011a80">Icon by hqrloveq</a>
                                        </ImgAndAttrRow>
                                    </tbody>
                                </table>
                            </div>
                        </Popup >
                        {
                            spinning &&
                            <div className={styles.spinner}></div>
                        }
                        {children}
                    </>
            }
        </>
    )
}