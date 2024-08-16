import { PropsWithChildren } from "react";
import styles from './Button.module.css'

export interface ButtonProps {
    className: string;
    onClick: () => void
}

export default function Button({children, className, onClick}: PropsWithChildren<ButtonProps>) {
    return (
        <button className={styles.button + ' ' + className} onClick={onClick}>{children}<span className={styles.buttonBorder}></span></button>
    )
}