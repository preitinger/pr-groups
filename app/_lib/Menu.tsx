import { PropsWithChildren, useEffect, useState } from "react";
import styles from './Menu.module.css'
import Image from "next/image";
import { Popup } from "../Popup";
import Impressum from "./pr-client-utils/Impressum";
import { SessionContext } from "./SessionContext";

function ImgAndAttrRow({ url, children }: PropsWithChildren<{ url: string }>) {
    return (
        <tr>
            <td><Image src={url} alt={url} width={32} height={32} /></td>
            <td>{children}</td>
        </tr>
    )
}

export interface MenuProps {
    customLabels?: string[]
    onCustomClick?: (idx: number) => () => void;
}

export default function Menu({ customLabels, onCustomClick }: MenuProps) {
    const [impressum, setImpressum] = useState(false);
    const [about, setAbout] = useState(false);
    const [cookiePopup, setCookiePopup] = useState(false);
    const [imgAttr, setImgAttr] = useState(false);
    const [menu, setMenu] = useState(false);

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

    return (
        <>
            <div className={styles.menuButton} onClick={onMenuClick} >
                <Image src='/main-menu.svg' width={32} height={32} alt='Menu' />
            </div>
            <Popup visible={menu}>
                <div className={styles.menu}>
                    <button onClick={() => { setImpressum(true); setMenu(false) }}>IMPRESSUM</button>
                    <button onClick={() => { setAbout(true); setMenu(false) }}>ABOUT</button>
                    <button onClick={() => { setImgAttr(true); setMenu(false) }}>BILDER VON FREEP!K</button>
                    {customLabels != null &&
                        customLabels.map((label, i) => 
                            <button key={i} onClick={() => {setMenu(false); if (onCustomClick != undefined) onCustomClick(i)();}}>{label}</button>
                        )
                    }
                </div>
                <div className={styles.popupButtonRow}>
                    <button onClick={() => setMenu(false)}>SCHLIEẞEN</button>
                </div>
            </Popup>
            <Popup visible={cookiePopup} setVisible={setCookiePopup}>
                Dieser Service benutzt Cookies um temporäre Seitenzustände zu speichern und eine Datenbank um Gruppen, ihre Mitglieder (nur Handynr, Vorname und optional Nachname oder abgekürzter Nachname), Gruppenaktivitäten und die Beteiligungen der Mitglieder zu speichern.
                Sie dürfen diese Seite nur weiter benutzen, wenn Sie dies akzeptieren. Andernfalls verlassen Sie bitte diese Seite.
            </Popup>
            <Popup visible={impressum}>
                <div className={styles.impressum}>
                    <Impressum name='Peter Reitinger' street='Birkenweg' houseNr='8' postalCode='93482' city='Pemfling' phone='09971-6131' mail='peter.reitinger(at)gmail.com' />
                </div>
                <div className={styles.popupButtonRow}>
                    <button onClick={() => setImpressum(false)}>SCHLIEẞEN</button>
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
                        </tbody>
                    </table>
                </div>
            </Popup >

        </>
    )
}