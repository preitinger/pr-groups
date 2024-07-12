import { PropsWithChildren, useEffect, useRef } from "react";
import ModalDialog from "./_lib/ModalDialog";
import styles from './Popup.module.css'
import { withStopPropagation } from "./_lib/utils";

export interface PopupProps {
    visible: boolean;
    setVisible?: (visible: boolean) => void
}

export function Popup({ visible, setVisible, children }: PropsWithChildren<PopupProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (visible) {
            dialogRef.current?.showModal()
        } else {
            dialogRef.current?.close()
        }
    }, [visible])
    return (
        <>
            {
                visible &&
                <dialog ref={dialogRef} className='dialog'>
                    <div className={styles.popupOuter}>
                        {
                            setVisible != null &&
                            <button className={styles.close} onClick={withStopPropagation(() => setVisible(false))} tabIndex={0}>
                            </button>
                        }
                        <div className={styles.popupContent + ' scrollable'}>
                            {children}
                            {/* {
                            setVisible != null &&
                            <div className={styles.popupButtonRow}>
                                <button onClick={(e) => { setVisible(false); e.stopPropagation(); }}>SCHLIEẞEN</button>
                            </div>

                        } */}
                        </div>
                    </div>
                </dialog>

                // <ModalDialog onDeactivate={() => setVisible && setVisible(false)}>
                //     <div className={styles.popupOuter}>
                //         {
                //             setVisible != null &&
                //             <button className={styles.close} onClick={withStopPropagation(() => setVisible(false))} tabIndex={0}>
                //             </button>
                //         }
                //         <div className={styles.popupContent + ' scrollable'}>
                //             {children}
                //             {/* {
                //                 setVisible != null &&
                //                 <div className={styles.popupButtonRow}>
                //                     <button onClick={(e) => { setVisible(false); e.stopPropagation(); }}>SCHLIEẞEN</button>
                //                 </div>

                //             } */}
                //         </div>
                //     </div>
                // </ModalDialog>
            }
        </>
    )

}
