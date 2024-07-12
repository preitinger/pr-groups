import { PropsWithChildren } from "react";
import styles from './Label.module.css'

export default function Label({ children }: PropsWithChildren<{}>) {
    return <div className={styles.label}>{children}</div>
}
