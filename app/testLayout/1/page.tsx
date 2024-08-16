import styles from './page.module.css'

export default function Page() {
    return (
        <div className={styles.container}>
            <div className={styles.sth}>
                Sth in the container
            </div>
            <div className={styles.bottomBar}>
                bottomBar with height 3rem
            </div>
        </div>
    )
}