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
    const [mySnapWidth, setMySnapWidth] = useState<number | null>(snapWidth ?? null)
    const [dummyWidth, setDummyWidth] = useState<number | null>(null);


    useEffect(() => {
        const container = containerRef.current
        if (dummyWidth != null || container == null) {
            return;
        }
        const clientWidth = container.clientWidth;
        // Goal: snapOffset + mySnapWidth + dummyWidth = clientWidth
        // So dummyWidth := clientWidth - snapOffset - mySnapWidth
        const newSnapWidth = snapWidth ?? clientWidth;
        setMySnapWidth(newSnapWidth)
        const d = clientWidth - (snapOffset ?? 0) - newSnapWidth
        setDummyWidth(d);
    }, [dummyWidth, snapWidth, snapOffset])

    useEffect(() => {
        const container = containerRef.current
        if (container == null) {
            return
        }
        const resizeObserver = new ResizeObserver((entries, observer) => {
            const clientWidth = container.clientWidth;
            // Goal: snapOffset + mySnapWidth + dummyWidth = clientWidth
            // So dummyWidth := clientWidth - snapOffset - mySnapWidth
            const newSnapWidth = snapWidth ?? clientWidth;
            if (newSnapWidth !== snapWidth) {
                setMySnapWidth(newSnapWidth)
            }
            const d = clientWidth - (snapOffset ?? 0) - newSnapWidth
            setDummyWidth(d);
        })

        resizeObserver.observe(container)

        return () => {
            resizeObserver.unobserve(container)
        }

    }, [snapOffset, snapWidth])

    useEffect(() => {
        const container = containerRef.current;
        if (snap == null || container == null || dummyWidth == null || mySnapWidth == null) return;
        container.scrollLeft = snap * mySnapWidth;
    }, [snap, children, snapWidth, dummyWidth, mySnapWidth])

    const childrenLen = Array.isArray(children) ? children.length : 1

    const innerWidth = (snapOffset ?? 0) + childrenLen * (mySnapWidth ?? 0) + (dummyWidth ?? 0);

    return (
        <div className={`${styles.outer} ${className}`}>
            <div ref={containerRef} className={`${styles.container}`} onScroll={(e) => {
                if (timeoutRef.current != null) {
                    clearTimeout(timeoutRef.current);
                }
                if (mySnapWidth == null || snapOffset == null) return;

                timeoutRef.current = setTimeout(() => {
                    if (containerRef.current == null) return;
                    const scrollLeft = containerRef.current.scrollLeft;
                    const snap = Math.round((scrollLeft /* - (snapOffset ?? 0) */) / mySnapWidth);
                    if (snap >= 0 && snap < childrenLen) {
                        containerRef.current.scrollLeft = snap * mySnapWidth;
                        if (setSnap != null) {
                            setSnap(snap);
                        }
                    }
                }, 200)
            }} >
                <div style={{
                    width: `${innerWidth}px`
                }} className={styles.inner}>
                    {
                        snapOffset != null && <div><div style={{ width: snapOffset }}></div></div>
                    }
                    {Array.isArray(children) && children.map((child, i) =>
                        <div key={i} style={{ width: `${mySnapWidth}px` }}>
                            {child}
                        </div>
                    )}
                    {
                        dummyWidth != null && dummyWidth > 0 &&
                        <div>
                            <div style={{ width: dummyWidth }}></div>
                        </div>
                    }
                    {/* {
                        snapOffset != null && mySnapWidth != null &&
                        <div>
                            <div style={{ width: `${mySnapWidth}px` }}></div>
                        </div>
                    } */}
                </div>
            </div>
            {
                points && snap != null &&
                <div className={styles.points}>
                    {Array.isArray(children) ? children.map((c, i) => {
                        return <Point key={i} selected={i === snap} onPointClick={() => { if (setSnap != null) setSnap(i) }}
                            onEnterDown={() => { if (setSnap != null) setSnap(i) }} />
                    }) : <span>kein Array?!</span>}
                </div>
            }
        </div>
    )
}