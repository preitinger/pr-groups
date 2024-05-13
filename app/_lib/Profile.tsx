import styles from './Profile.module.css'

export interface ProfileProps {
    user: string | null;
}

export default function Profile({ user }: ProfileProps) {
    return (
        <div className={styles.profile}>
            {user}
        </div>
    )
}