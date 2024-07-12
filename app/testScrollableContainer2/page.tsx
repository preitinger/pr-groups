'use client'

import { useState } from "react";
import ScrollableContainer from "../_lib/pr-client-utils/ScrollableContainer";
import styles from './page.module.css'

export default function Page() {
    const [snap, setSnap] = useState(0);

    const buttons = []

    for (let i = 0; i < 100; ++i) {
        buttons.push(<button key={i}>Button {i}</button>)
    }

    return (
        <ScrollableContainer className={styles.container} points snap={snap} setSnap={setSnap} snapWidth={260} snapOffset={0}>
            <div className={styles.page}>
                page 1
            </div>
            <div className={styles.page}>
                <h1>page 2</h1>
                {buttons}
            </div>
        </ScrollableContainer>
    )
}