import { createContext } from "react";

export interface AccordionContext {
    ownIdx: number;
    open: number[];
    toggleOwnOpen: null | (() => void);
}

export const accordionContext = createContext<AccordionContext>({
    ownIdx: 0,
    open: [],
    toggleOwnOpen: null
})