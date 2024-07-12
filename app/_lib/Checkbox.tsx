import { FocusEventHandler } from "react";
import styles from './Checkbox.module.css'

interface CheckboxProps {
    label: string;
    value: boolean;
    setValue: (v: boolean) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
}
export default function Checkbox({ label, value, setValue, onBlur }: CheckboxProps) {
    return (
        <div>
            <label className={styles.checkbox}><input type='checkbox' checked={value} onChange={() => { setValue(!value) }} onBlur={onBlur} />{label}</label>
        </div>
    )
}
