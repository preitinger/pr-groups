import { useEffect, useState } from 'react';
import { withStopPropagation } from '../utils';
import styles from './CookieDlg.module.css';
import { LocalContext } from '../LocalContext';
import Privacy from '@/app/Privacy';

export interface CookieDlgProps {
    setCookiesAccepted: (accepted: boolean) => void;
}

/**
 * Dieser Dialog wird angezeigt, wenn im localStorage nicht bereits ein Eintrag vorliegt, dass dieser Dialog mit OK bestaetigt wurde.
 */
export default function CookieDlg({ setCookiesAccepted }: CookieDlgProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const ctx = new LocalContext();
        const ca = ctx.cookiesAccepted
        setVisible(!ca);
        setCookiesAccepted(ca);
    }, [setCookiesAccepted])

    function onOk() {
        const ctx = new LocalContext();
        setVisible(false);
        ctx.cookiesAccepted = true;
        setCookiesAccepted(true);
    }

    return (
        <>
            {visible &&
                <div className={styles.dlg}>
                    <Privacy />
                    <div className={styles.popupButtonRow}>
                        <button onClick={withStopPropagation(onOk)}>ZUSTIMMEN</button>
                    </div>
                </div>
            }        </>
    )
}