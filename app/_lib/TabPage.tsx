import { PropsWithChildren } from 'react'
import styles from './TabPage.module.css'

export interface TabPageProps {
    ownKey: string;
    selectedKey: string;
}
export default function TabPage({ ownKey, selectedKey, children }: PropsWithChildren<TabPageProps>) {
    return (
        <>
            {
                ownKey === selectedKey &&
                children
            }
        </>
    )
}