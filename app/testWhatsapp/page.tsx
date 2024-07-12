'use client'

import { useState } from "react"
import Input from "../_lib/Input"
import { whatsappLink } from "../_lib/whatsapp"

export default function Page() {
    const [nr, setNr] = useState('')
    const [msg, setMsg] = useState('')
    const [url, setUrl] = useState('');
    function onSend() {
        setUrl(whatsappLink(nr, msg))
        // setUrl(`https://api.whatsapp.com/send?phone=${encodeURIComponent(nr)}&text=${encodeURIComponent(msg)}`);
    }
    return (
        <>
            <Input label='Telefonnr' text={nr} setText={setNr}/>
            <Input label='Nachricht' text={msg} setText={setMsg} />
            <button onClick={onSend}>Senden</button>
            <p><a href={url}>{url}</a></p>
        </>
    )
}