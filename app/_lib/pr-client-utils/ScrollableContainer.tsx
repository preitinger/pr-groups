'use client'

import { PropsWithChildren, useEffect, useRef } from 'react';
import styles from './ScrollableContainer.module.css'
import { ScrollableContainerProps } from './ScrollableContainerProps';

const childWidth = 80;

export default function ScrollableContainer({ className, snapOffset, snapWidth, snap, setSnap, children }: PropsWithChildren<ScrollableContainerProps>) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (snap == null || containerRef.current == null || snapWidth == null) return;
        containerRef.current.scrollLeft = snap * snapWidth;

    }, [snap, snapWidth])

    return (
        <div ref={containerRef} className={`${styles.container} ${className}`} onScroll={(e) => {
            if (timeoutRef.current != null) {
                clearTimeout(timeoutRef.current);
            }
            if (snapWidth == null || snapOffset == null) return;

            timeoutRef.current = setTimeout(() => {
                if (containerRef.current == null) return;
                const snap = Math.round(containerRef.current.scrollLeft / snapWidth);
                containerRef.current.scrollLeft = snap * snapWidth;
                if (setSnap != null) {
                    setSnap(snap);
                }
            }, 200)
        }}>
            {
                snapOffset != null && <div><div style={{ width: snapOffset }}></div></div>
            }
            {children}
            {
                snapOffset != null && snapWidth != null &&
                <div>
                    <div style={{ width: `calc(100vw - ${snapOffset + snapWidth}px)` }}></div>
                </div>
            }
        </div>
    )
}