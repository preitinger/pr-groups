import { PropsWithChildren } from "react";
import ModalDialog from "./_lib/ModalDialog";
import styles from './Popup.module.css'
import { withStopPropagation } from "./_lib/utils";

export interface PopupProps {
    visible: boolean;
    setVisible?: (visible: boolean) => void
}

export function Popup({ visible, setVisible, children }: PropsWithChildren<PopupProps>) {
    return (
        <>
            {
                visible &&
                <ModalDialog>
                    <div className={styles.popupOuter}>
                        {
                            setVisible != null &&
                            <button className={styles.close} onClick={withStopPropagation(() => setVisible(false))} tabIndex={0}>
                            </button>
                        }
                        <div className={styles.popupContent}>
                            {children}
                            {/* {
                                setVisible != null &&
                                <div className={styles.popupButtonRow}>
                                    <button onClick={(e) => { setVisible(false); e.stopPropagation(); }}>SCHLIEẞEN</button>
                                </div>

                            } */}
                        </div>
                    </div>
                </ModalDialog>
            }
        </>
    )

}
