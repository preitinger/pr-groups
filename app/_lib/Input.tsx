import { forwardRef, useId } from 'react';
import styles from './Input.module.css'

export interface InputProps {
    label: string;
    text: string;
    setText: (text: string) => void;
    onEnter?: () => void;
}
const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, text, setText, onEnter }: InputProps, ref) {
    const id = useId()
    return (
        <>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <input ref={ref} id={id} type='text' value={text} onChange={(e) => setText(e.target.value)} className={styles.input}
                onKeyUp={onEnter && ((e) => {
                    if (e.key === 'Enter') {
                        onEnter();
                    }
                })} />
        </>
    )
})
export default Input;