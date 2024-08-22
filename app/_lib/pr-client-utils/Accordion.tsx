import { PropsWithChildren } from "react"
import { accordionContext } from "./AccordionContext"
import useAccordion from "./useAccordion"

export interface AccordionPage {

}
export interface AccordionProps {
    multiOpen: boolean;
    defaultOpen?: number | number[];
}

export default function Accordion({ children, multiOpen, defaultOpen }: PropsWithChildren<AccordionProps>) {
    const [open, toggleOpen] = useAccordion(multiOpen, defaultOpen ?? [])
    return (
        <>
            <div>

                {Array.isArray(children) ? children.map((child, i) => (
                    <accordionContext.Provider key={i} value={{ 
                        ownIdx: i,
                        open: open,
                        toggleOwnOpen: () => {
                            toggleOpen(i)
                        } }}>
                        {child}
                    </accordionContext.Provider>
                )) : <></>}
            </div>
        </>
    )
}
