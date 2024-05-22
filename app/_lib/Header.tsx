import Profile from "./Profile";
import styles from './Header.module.css'
import { HeaderLine } from "./HeaderLine";
import { Logo } from "./api";

export interface HeaderProps {
    user: string | null;
    logo?: Logo;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
}

export default function Header({ user, logo, line1, margin, line2 }: HeaderProps) {
    return (
        <>
            <Profile user={user} logo={logo} />
            <div className={styles.lines}>
                <div style={{ marginLeft: logo != null ? '60px' : '0' }}>
                    <div style={{
                        margin: '0',
                        fontSize: line1.fontSize,
                        fontWeight: line1.bold ? 'bold' : 'normal'

                    }}>{line1.text}</div>
                    <div style={{
                        margin: '0',
                        marginTop: margin,
                        fontSize: line2.fontSize,
                        fontWeight: line2.bold ? 'bold' : 'normal'
                    }}>{line2.text}</div>
                </div>
            </div >
        </>
    )
}