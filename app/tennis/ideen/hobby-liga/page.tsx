import styles from './page.module.css'
export default function Page() {
    return (
        <article className={styles.article}>
            <h1>Idee für Hobby-Liga-System jenseits LK und Co</h1>
            <section>
                <h2>Ausgangssituation</h2>
                eine Gruppe von Tennisspielern mit ziemlich heterogenem Leistungsniveau (für Insider: ähnlich der Chamer After-Work-Gruppe), die sich regelmäßig zu gemeinsamen Doppelspielen treffen
            </section>
            <section>
                <h2>Ziel</h2>
                Abwechslungsreiche Matches für so viel Spielfreude wie möglich
            </section>
            <section>
                <h2>Paarbildung</h2>
                Zunächst gibt es für jeden der Spieler einen Zettel mit seinem Namen drauf in einem großen (virtuellen) Topf.
                Aus dem Topf wird ein Spieler gezogen. Dieser darf seinen Doppelpartner frei wählen.
                Dann wird der nächste Spieler gezogen, welcher wiederum aus den verbleibenden Spielern wählen darf usw. bis alle Paare gebildet wurden.
                Dann wird für jeden Spieler, der dieses Mal nicht wählen durfte, ein zusätzlicher Zettel mit seinem Namen darauf in den (virtuellen) Topf gelegt,
                damit seine Chancen für die nächste Ziehung steigen.
            </section>
            <section>
                <h2>Die Liga</h2>
                In jedem Match gibt es für jeden gewonnenen Satz für jeden der Spieler im Siegerpaar einen Pluspunkt und für jeden Spieler im Verliererpaar einen
                Minuspunkt. Die Punkte werden dann wie üblich notiert, z.B.:
                <pre>
                    Spieler 1    18:2<br/>
                    Spieler 2    16:4<br/>
                    ...
                </pre>
            </section>
            <section>
                <h2>Auswahl der Paare, die gegeneinander spielen</h2>
                In jedem Paar (siehe oben im Abschnitt &quot;Paarbildung&quot;) werden die Ligapunkte der beiden Spieler miteinander addiert. Das Paar mit der besten Differenz spielt gegen das mit der zweitbesten, das mit der drittbesten gegen das mit der viertbesten, usw.
            </section>
            <section>
                <h2>Variante</h2>
                Ab und zu kann zur Abwechslung auf eine Auslosung der Paare verzichtet werden und stattdessen stur nach Rangfolge gespielt werden, d.h. folgende Matches:
                <ol>
                    <li>Match: Spieler 1, Spieler 2 gegen Spieler 3, Spieler 4</li>
                    <li>Match: Spieler 5, Spieler 6 gegen Spieler 7, Spieler 8</li>
                    <li>...</li>
                </ol>
            </section>
        </article>
    )
}