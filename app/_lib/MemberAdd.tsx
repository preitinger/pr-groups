import { group } from 'console'
import Input from './Input'
import styles from './MemberAdd.module.css'
import { useState } from 'react';
import { SessionContext } from './SessionContext';
import { GroupMemberAddReq, GroupMemberAddResp, Member } from './api';
import { apiFetchPost } from './user-management-client/apiRoutesClient';

export interface MemberAddProps {
    initialGroup: string;
    onAdd: (memberData: {group: string; newPhoneNr: string; prename: string; surname: string}) => void;
    onCancel: () => void
}

export default function MemberAdd({ initialGroup, onAdd, onCancel }: MemberAddProps) {
    const [group, setGroup] = useState(initialGroup)
    const [newPhoneNr, setNewPhoneNr] = useState('');
    const [prename, setPrename] = useState('');
    const [surname, setSurname] = useState('');
    const [comment, setComment] = useState('');

    async function onAddClick() {
        if (group == '') {
            setComment('Gruppe darf nicht leer sein!');
            return;
        }
        if (newPhoneNr == '') {
            setComment('Telefonnr darf nicht leer sein!');
            return;
        }
        if (prename == '' && surname == '') {
            setComment('Vorname und Nachname dürfen nicht beide leer sein!');
            return;
        }
        onAdd({group, newPhoneNr, prename, surname})
    }

    return <>
        <Input id='group' label='Gruppe' text={group} setText={setGroup} />
        <Input id='phoneNr' label='Telefonnr. des neuen Gruppenmitglieds' text={newPhoneNr} setText={setNewPhoneNr} />
        <Input id='prename' label='Vorname des neuen Mitglieds' text={prename} setText={setPrename} />
        <Input id='surname' label='Nachname (ggf. Kürzel) des neuen Mitglieds' text={surname} setText={setSurname} />
        <div>
            <button className={styles.addButton} onClick={onAddClick}>GRUPPENMITGLIED HINZUFÜGEN</button>
            <button className={styles.cancelButton} onClick={onCancel}>ABBRECHEN</button>
        </div>
        <p>{comment}</p>
    </>
}
