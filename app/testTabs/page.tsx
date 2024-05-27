'use client'
import { useState } from 'react'
import TabButton from '../_lib/TabButton'
import styles from './page.module.css'
import TabPage from '../_lib/TabPage';
export default function Page() {
    const [sel, setSel] = useState('1');
    return (
        <div>
            <div className={styles.buttonRow}>
                <TabButton label='1' ownKey='1' selectedKey={sel} setSelectedKey={setSel} />
                <TabButton label='2' ownKey='2' selectedKey={sel} setSelectedKey={setSel} />
                <TabButton label='3' ownKey='3' selectedKey={sel} setSelectedKey={setSel} />
            </div>
            <div className={styles.container}>
                <TabPage ownKey='1' selectedKey={sel}>
                    Content 1
                </TabPage>
                <TabPage ownKey='2' selectedKey={sel}>
                    Content 2
                </TabPage>
                <TabPage ownKey='3' selectedKey={sel}>
                    Content 3
                </TabPage>
            </div>
        </div>
    )
}