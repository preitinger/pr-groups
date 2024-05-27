import styles from './TabButton.module.css'

export interface TabButtonProps {
    label: string;
    ownKey: string;
    selectedKey: string;
    setSelectedKey: (key: string) => void;
}
export default function TabButton({label, ownKey, selectedKey, setSelectedKey}: TabButtonProps) {
    return (
        <div className={`${styles.tabButton} ${selectedKey === ownKey && styles.selected}`} onClick={() => setSelectedKey(ownKey)}>
            {label}
        </div>
    )

}