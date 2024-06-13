'use client'

import { useState } from "react"
import Input from "../_lib/Input"

export default function Page() {
    const [nr, setNr] = useState('')
    const [msg, setMsg] = useState('')
    const [url, setUrl] = useState('');
    function onSend() {
        setUrl(`https://api.whatsapp.com/send?phone=${encodeURIComponent(nr)}&text=${encodeURIComponent(msg)}`);
    }
    return (
        <>
            <Input id='nr' label='Telefonnr' text={nr} setText={setNr}/>
            <Input id='msg' label='Nachricht' text={msg} setText={setMsg} />
            <button onClick={onSend}>Senden</button>
            <p><a href={url}>{url}</a></p>
        </>
    )
}