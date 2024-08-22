import { PropsWithChildren, useContext } from "react";
import { accordionContext } from "./AccordionContext";
import styles from './AccordionPage.module.css'
import Image from "next/image";

export interface AccordionPageProps {
    header: string;
}

export default function AccordionPage({ children, header }: PropsWithChildren<AccordionPageProps>) {
    const ctx = useContext(accordionContext)
    console.log('ctx', ctx);
    const pageOpen = ctx.open.includes(ctx.ownIdx);
    console.log('pageOpen', pageOpen)
    return (
        <>
            <div className={pageOpen ? styles.hdOpen : styles.hdClosed} onClick={ctx.toggleOwnOpen ?? undefined}>
                <div>{pageOpen ? '-' : '+'}</div>
                <div className={styles.hdText}>
                    {header}
                </div>
                <Image src='/down-chevron_9144316.png' alt='Open' width={32} height={32} />
            </div>
            {
                pageOpen && (
                    <div className={styles.content}>
                        {children}
                    </div>
                )
            }
        </>
    )
}