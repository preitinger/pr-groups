import { useId } from 'react';
import styles from './Toggler1.module.css'

export interface Toggler1Props {
    label?: string;
    checked: boolean
    setChecked: (checked: boolean) => void
}

export default function Toggler1({ label, checked, setChecked }: Toggler1Props) {
    const id = useId();
    return (
        <div className={styles.row}>
            <div className={styles.toggler}>
                <input tabIndex={0} id={id} type="checkbox" 
                checked={checked} onChange={() => { setChecked(!checked) }} />
                <label htmlFor={id}>
                    <svg className={styles.togglerOn} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <polyline className={styles.path + ' ' + styles.check} points="100.2,40.2 51.5,88.8 29.8,67.5"></polyline>
                    </svg>
                    <svg className={styles.togglerOff} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <line className={styles.path + ' ' + styles.line} x1="34.4" y1="34.4" x2="95.8" y2="95.8"></line>
                        <line className={styles.path + ' ' + styles.line} x1="95.8" y1="34.4" x2="34.4" y2="95.8"></line>
                    </svg>
                    <div className={styles.innerLabel}>{label}</div>
                </label>
            </div>
            {/* <div className={styles.labelText}>{label}</div> */}
        </div>
    )
}