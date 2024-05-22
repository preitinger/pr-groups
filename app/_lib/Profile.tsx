import Image from 'next/image';
import styles from './Profile.module.css'
import { Logo } from './api';

export interface ProfileProps {
    user: string | null;
    logo?: Logo;
}

export default function Profile({ user, logo }: ProfileProps) {
    return (
        <>
            {logo != null &&
                <div className={styles.logo}>
                    <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />

                </div>
            }
            <div className={styles.profile}>
                {user}
            </div>
        </>
    )
}