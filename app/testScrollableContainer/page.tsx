'use client'

import { ReactNode, useRef, useState } from 'react'
import ScrollableContainer from '../_lib/pr-client-utils/ScrollableContainer'
import styles from './page.module.css'

interface ChildProps {
    idx: number;
}
function ChildComp({ idx }: ChildProps) {
    return (
        <div>
            <div className={styles.childInner}>{idx}</div>
        </div>
    )
}

export default function Page() {
    const [scrollX, setScrollX] = useState(0);
    const testDiv = useRef<HTMLDivElement>(null)

    const children1: ReactNode[] = []

    for (let i = 0; i < 100; ++i) {
        children1.push(<ChildComp key={i} idx={i} />)
    }
    // 18
    return (
        <ScrollableContainer snapOffset={80 - 18} snapWidth={80} className={styles.container}>
            {children1}
        </ScrollableContainer>
        // <>
        //     scrollX: {scrollX}
        //     <div ref={testDiv} className={styles.container + ' ' + styles.test} onScroll={() => {
        //         if (testDiv.current == null)return;
        //         setScrollX(testDiv.current.scrollLeft)
        //     }} >
        //         {children1}
        //     </div>
        // </>

    )
}