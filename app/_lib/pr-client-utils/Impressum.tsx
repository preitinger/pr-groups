export interface ImpressumProps {
    name: string;
    mail: string;
    phone: string;
    street: string;
    houseNr: string;
    postalCode: string;
    city: string;
}
export default function Impressum({ name, street, houseNr, mail, phone, postalCode, city }: ImpressumProps) {
    return (
        <div>
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
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>       </div>
    )
}