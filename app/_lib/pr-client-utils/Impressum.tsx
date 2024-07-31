'use client'

import { useState } from 'react';
import styles from './Impressum.module.css'
import useUser from '../useUser';
import { withStopPropagation } from '../utils';
import Privacy from '@/app/Privacy';

export interface ImpressumProps {
    name: string;
    mail: string;
    phone: string;
    street: string;
    houseNr: string;
    postalCode: string;
    city: string;
    group: string | null;
    onDeleteClick: (() => void) | null;
}
export default function Impressum({ name, street, houseNr, mail, phone, postalCode, city, group, onDeleteClick }: ImpressumProps) {
    const [selfDeleted, setSelfDeleted] = useState(false);
    const user = useUser();

    function deleteMember() {
        if (onDeleteClick != null && confirm(`Achtung! Wirklich Daten zu deiner Mitgliedschaft in Gruppe "${group}" löschen? Nur dann OK klicken!`)) {
            onDeleteClick();
        }
    }

    function deleteUser() {
        if (onDeleteClick != null) {
            if (confirm(`Achtung! Wirklich Daten zu User "${user}" löschen?`)) onDeleteClick();
        } else {
            alert('Löschung gescheitert. :-(')
        }
    }

    return (
        <div className={styles.impressum}>
            <h1>Impressum</h1>
            <p>Angaben gemäß § 5 TMG:</p>
            <p>{name}<br />
                {street} {houseNr}<br />
                {postalCode} {city}</p>

            <p>Kontakt:</p>
            <p>Telefon: {phone}<br />
                E-Mail: <a href={`mailto:${mail}`}>{mail}</a></p>

            <p>Umsatzsteuer-ID:</p>
            <p>Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz:<br />
                (keine da private Seite)</p>

            <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</p>
            <p>{name}<br />
                {street} {houseNr}<br />
                {postalCode} {city}</p>

            <p>Haftungsausschluss:</p>
            <p>Haftung für Inhalte<br />
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>

            <p>Haftung für Links<br />
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
            <h1>Datenschutz</h1>
            <Privacy />
            {
                group != null &&
                <>
                    <p>Wenn du die App nicht mehr nutzen möchtest und alle Daten zu deiner Mitgliedschaft in der Gruppe {`"${group}"`} unmittelbar gelöscht werden sollen, bitte folgenden Button klicken:

                    </p>
                    <button onClick={withStopPropagation(deleteMember)} className={styles.delete}>
                        Ich möchte, dass nach dem Klick auf diesen Button alle Daten über mich in der Gruppe {`"${group}"`} gelöscht werden. Mir ist bewusst, dass dann alle anderen Gruppenmitglieder und -administratoren nichts mehr über mich in der App oder direkt in der Datenbank sehen können.
                    </button>
                </>
            }
            {
                user != null &&
                <>
                    <p>Wenn du die App nicht mehr nutzen möchtest und alle Daten zu deinem User {`"${user}"`} gelöscht werden sollen, bitte folgenden Button klicken:</p>
                    <button onClick={withStopPropagation(deleteUser)} className={styles.delete}>Ich möchte diese App nicht mehr nutzen und möchte dass mit dem Klick auf diesen Button unmittelbar alle Daten zu meinem User {`"${user}"`} gelöscht werden. </button>
                </>
            }
        </div>
    )
}