import { FocusEventHandler } from "react";
import styles from './Checkbox.module.css'

interface CheckboxProps {
    label?: string;
    checked: boolean;
    setChecked: (v: boolean) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    className?: string;
}
export default function Checkbox({ label, checked: value, setChecked: setValue, onBlur, className }: CheckboxProps) {
    return (
        <div>
            <label className={styles.checkbox + (className ? ' ' + className :   '')}><input type='checkbox' checked={value} onChange={() => { setValue(!value) }} onBlur={onBlur} />{label}</label>
        </div>
    )
}
