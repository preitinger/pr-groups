import { useCallback, useState } from "react";

export type UseAccordionType = [number[], toggleOpen: (idx: number) => void]
export default function useAccordion(multiOpen: boolean, defaultOpen: number | number[]): UseAccordionType {
    const [open, setOpen] = useState<number[]>(typeof(defaultOpen) === 'number' ? [defaultOpen] : defaultOpen.length <= 1 || multiOpen ? defaultOpen : [defaultOpen[0]])

    const toggleOpen = useCallback((idx: number) => {
        setOpen(old =>
            old.includes(idx) ? old.filter(i => i !== idx)
            : multiOpen ? [...old, idx]
            : [idx]
        )
    }, [multiOpen])

    return [open, toggleOpen]
}