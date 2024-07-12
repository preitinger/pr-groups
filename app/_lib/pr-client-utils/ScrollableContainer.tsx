'use client'

import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ScrollableContainer.module.css'
import { ScrollableContainerProps } from './ScrollableContainerProps';
import { withStopPropagation } from '../utils';

const childWidth = 80;

function Point({ selected, onPointClick, onEnterDown }: {
    selected: boolean; onPointClick?: () => void;
    onEnterDown?: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas == null || !canvas.getContext) return;
        const c = canvas.getContext('2d')
        if (c == null) return
        c.fillStyle = selected ? 'lightgray' : 'gray';
        c.arc(8, 8, 8, 0, Math.PI * 2)
        c.fill()
    }, [selected])

    return <canvas ref={canvasRef} className={styles.point} width={16} height={16} tabIndex={0} onClick={onPointClick && withStopPropagation(onPointClick)} onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnterDown) onEnterDown();
    }} />
}

export default function ScrollableContainer({ className, snapOffset, snapWidth, snap, setSnap, children, points }: PropsWithChildren<ScrollableContainerProps>) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement>(null);
    const [mySnapWidth, setMySnapWidth] = useState<number | null>(null)


    useEffect(() => {
        const container = containerRef.current;
        if (snap == null || container == null) return;
        const newSnapWidth = snapWidth ?? container.clientWidth;
        // if (snapWidth == null) {
        setMySnapWidth(newSnapWidth)
        // }
        container.scrollLeft = snap * newSnapWidth;
    }, [snap, children, snapWidth])

    const childrenLen = Array.isArray(children) ? children.length : 1

    const innerWidth = (snapOffset ?? 0) + (childrenLen + 1) * (mySnapWidth ?? 0);

    return (
        <div className={`${styles.outer} ${className}`}>
            <div ref={containerRef} className={`${styles.container}`} onScroll={(e) => {
                if (timeoutRef.current != null) {
                    clearTimeout(timeoutRef.current);
                }
                if (mySnapWidth == null || snapOffset == null) return;

                timeoutRef.current = setTimeout(() => {
                    if (containerRef.current == null) return;
                    const snap = Math.round((containerRef.current.scrollLeft - (snapOffset ?? 0)) / mySnapWidth);
                    containerRef.current.scrollLeft = snap * mySnapWidth;
                    if (setSnap != null) {
                        setSnap(snap);
                    }
                }, 200)
            }}>
                <div style={{
                    width: `${innerWidth}px`
                }} className={styles.inner}>
                    {
                        snapOffset != null && <div><div style={{ width: snapOffset }}></div></div>
                    }
                    {children}
                    {
                        snapOffset != null && mySnapWidth != null &&
                        <div>
                            <div style={{ width: `${mySnapWidth}px` }}></div>
                        </div>
                    }
                </div>
            </div>
            {
                points && snap != null &&
                <div className={styles.points}>
                    {Array.isArray(children) ? children.map((c, i) => {
                        return <Point key={i} selected={i === snap} onPointClick={() => { if (setSnap != null) setSnap(i) }}
                        onEnterDown={() => { if (setSnap != null) setSnap(i)}} />
                    }) : <span>kein Array?!</span>}
                </div>
            }
        </div>
    )
}