import Link from 'next/link'
import styles from './page.module.css'
import Header from '../_lib/Header'
export default function Page() {
    return (
        <>
            <Header line1={{ text: 'pr-groups', fontSize: '1.5em', bold: true }} margin='0' line2={{ text: '', fontSize: '1em', bold: false }} user={null} />
            <div className={styles.links}>
                <p>
                    <Link href='/admin'>Admin</Link>
                </p>
                <p>
                    <Link href='/group-admin'>Gruppen-Admin</Link>
                </p>
            </div>
        </>
    )
}