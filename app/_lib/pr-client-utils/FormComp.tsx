'use client'

import { PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from './FormComp.module.css'
import Image from "next/image";

export interface DecoImg {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export interface FormProps {
    /**
     * default is 800
     */
    maxWidth?: number;
    /**
     * default is 600
     */
    maxHeight?: number;
    decoImg?: DecoImg;
}

export default function FormComp({ maxWidth, maxHeight, decoImg, children }: PropsWithChildren<FormProps>) {
    const [detectedWidth, setDetectedWidth] = useState<number>(Number.NaN);
    const [detectedHeight, setDetectedHeight] = useState<number>(Number.NaN);
    const divRef = useRef<HTMLDivElement>(null)
    const invisibleDivRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        function getDiv() {
            return divRef.current ?? invisibleDivRef.current;
        }
        let div = getDiv();
        if (div == null) throw new Error('divRef.current null');
        setDetectedWidth(div.clientWidth)
        setDetectedHeight(div.clientHeight);

        const resizeObserver = new ResizeObserver((entries, observer) => {
            if (div == null) return;
            const w = div.clientWidth;
            const h = div.clientHeight;
            if (w === 0 || h === 0) {
                const newDiv = getDiv();
                if (newDiv != null) {
                    resizeObserver.unobserve(div);
                    resizeObserver.observe(newDiv);
                    div = newDiv;
                }
            } else {
                setDetectedWidth(w);
                setDetectedHeight(h);
            }

        })
        resizeObserver.observe(div);

        return () => {
            if (div != null) {
                resizeObserver.unobserve(div)
            }
        }
    }, [])

    if (maxWidth == null) maxWidth = 800;
    if (maxHeight == null) maxHeight = 600;
    const layoutDone = !Number.isNaN(detectedWidth);
    const bigForImg = detectedWidth > maxWidth && detectedHeight > maxHeight;
    const big = detectedWidth > 500 && detectedHeight > 700;

    return (
        <>
            {layoutDone ?
                <div ref={divRef} className={styles.outer}>
                    {big ?
                        <>
                            {bigForImg && decoImg && <Image priority={true} className={styles.decoImg} src={decoImg.src} width={decoImg.width} height={decoImg.height} alt={decoImg.alt} />}
                            <div className={styles.bigInner} style={{
                                // width: `${maxWidth}px`,
                                // height: `${maxHeight}px`
                                minHeight: decoImg && decoImg.height + 'px'
                            }}>
                                {children}
                            </div>
                        </>
                        :
                        <div className={styles.smallInner}>
                            {children}
                        </div>
                    }
                </div>
                : <div className={styles.hiddenForLayout}>
                    <div ref={invisibleDivRef} className={styles.outer}>
                        {big ?
                            <>
                                {decoImg && <Image src={decoImg.src} width={decoImg.width} height={decoImg.height} alt={decoImg.alt} />}
                                <div className={styles.bigInner} style={{
                                    // width: `${maxWidth}px`,
                                    // height: `${maxHeight}px`
                                    minHeight: decoImg && decoImg.height + 'px'
                                }}>
                                    {children}
                                </div>
                            </>
                            :
                            <div className={styles.smallInner}>
                                {children}
                            </div>
                        }
                    </div>

                </div>
            }
        </>
    )
}