import styles from './Input.module.css'

export interface InputProps {
    id: string;
    label: string;
    text: string;
    setText: (text: string) => void;
}
export default function Input({ id, label, text, setText }: InputProps) {
    return (
        <>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <input id={id} type='text' value={text} onChange={(e) => setText(e.target.value)} className={styles.input}/>
        </>
    )
}