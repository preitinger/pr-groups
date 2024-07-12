
export interface ScrollableContainerProps {
    className: string;
    snapOffset?: number;
    snapWidth?: number;
    snap?: number;
    setSnap?: (idx: number) => void;
    points?: boolean;
}
