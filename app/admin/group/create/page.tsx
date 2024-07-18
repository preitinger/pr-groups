'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css'
import { apiFetchPost } from '@/app/_lib/user-management-client/apiRoutesClient';
import { GroupCreateReq, GroupCreateResp, ImgData } from '@/app/_lib/api';
import { SessionContext } from '@/app/_lib/SessionContext';
import { useRouter } from 'next/navigation';
import Profile from '@/app/_lib/Profile';
import useUser from '@/app/_lib/useUser';
import Header from '@/app/_lib/Header';
import Input from '@/app/_lib/Input';
import { LocalContext } from '@/app/_lib/LocalContext';
import { userAndTokenFromStorages } from '@/app/_lib/userAndToken';

export default function Page() {
    const [name, setName] = useState('');
    const [logoSrc, setLogoSrc] = useState('');
    const [logoAlt, setLogoAlt] = useState('');
    const [logoWidth, setLogoWidth] = useState('');
    const [logoHeight, setLogoHeight] = useState('');
    const [line1Text, setLine1Text] = useState('');
    const [line1FontSize, setLine1FontSize] = useState('');
    const [line1Bold, setLine1Bold] = useState(false);
    const [margin, setMargin] = useState('');
    const [line2Text, setline2Text] = useState('');
    const [line2FontSize, setline2FontSize] = useState('');
    const [line2Bold, setline2Bold] = useState(false);
    const [docTitle, setDocTitle] = useState('');
    const [comment, setComment] = useState('');
    const router = useRouter();
    const user = useUser();

    async function onCreateGroupClick() {
        const [user1, token1] = userAndTokenFromStorages();
        if (user1 == null || token1 == null) {
            alert('Du bist nicht eingeloggt.');
            router.push('/login');
            return;
        }
        let logo: ImgData | null = null;
        try {
            if (logoSrc != '' && logoAlt != '') {
                const width = parseInt(logoWidth);
                const height = parseInt(logoHeight);

                if (width > 0 && height > 0) {
                    logo = {
                        src: logoSrc,
                        alt: logoAlt,
                        width: width,
                        height: height
                    }
                }
            }
        } catch (reason) {}
        const req: GroupCreateReq = {
            user: user1,
            token: token1,
            name: name,
            logo: logo,
            line1: {
                text: line1Text,
                fontSize: line1FontSize,
                bold: line1Bold
            },
            margin: margin,
            line2: {
                text: line2Text,
                fontSize: line2FontSize,
                bold: line2Bold
            },
            docTitle: docTitle
        }
        const resp = await apiFetchPost<GroupCreateReq, GroupCreateResp>('/api/group/create', req)
        switch (resp.type) {
            case 'authFailed':
                setComment('Nicht authorisiert!');
                break;
            case 'error':
                setComment('Unerwarteter Fehler: ' + resp.error);
                break;
            case 'success':
                setComment(`Gruppe ${name} erfolgreich erstellt.`);
                setName('');
                break;
            case 'duplicate':
                setComment(`Eine Gruppe mit dem Namen ${name} existiert bereits.`)
                break;
        }
    }
    return (
        <div>
            <Header user={user} line1={{ text: 'pr-groups | Administration', fontSize: '1.2rem', bold: false }} margin='1rem' line2={{ text: 'Neue Gruppe erstellen', fontSize: '1.5rem', bold: true }} />
            <div className={styles.form}>
                <Input label='Name' text={name} setText={setName} />
                <Input label='logo.src (optional)' text={logoSrc} setText={setLogoSrc} />
                <Input label='logo.alt (optional)' text={logoAlt} setText={setLogoAlt} />
                <Input label='logo.width (optional)' text={logoWidth} setText={setLogoWidth} />
                <Input label='logo.height (optional)' text={logoHeight} setText={setLogoHeight} />
                <Input label='line1.text' text={line1Text} setText={setLine1Text} />
                <Input label='line1.fontSize' text={line1FontSize} setText={setLine1FontSize} />
                <div><input type='checkbox' checked={line1Bold} onChange={() => setLine1Bold(!line1Bold)} /> Bold</div>
                <Input label='Margin zwischen line1 und line2' text={margin} setText={setMargin} />
                <Input label='line2.text' text={line2Text} setText={setline2Text} />
                <Input label='line2.fontSize' text={line2FontSize} setText={setline2FontSize} />
                <div><input type='checkbox' checked={line2Bold} onChange={() => setline2Bold(!line2Bold)} /> Bold</div>
                <Input label='Titel für Browser-Tab und App-Shortcut' text={docTitle} setText={setDocTitle} />
                <button className={styles.createGroup} onClick={onCreateGroupClick}>Gruppe erstellen</button>
                <p>{comment}</p>
            </div>
        </div>
    )
}