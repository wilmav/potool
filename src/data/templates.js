export const TEMPLATES = [
    {
        id: 'roadmap',
        label: { fi: 'Roadmap-keskeinen', en: 'Roadmap-focused' },
        description: { fi: 'Selkeä, strateginen kokonaiskuva.', en: 'Clear, strategic overview.' },
        content: `
            <h1>Tuotteen visio</h1>
            <p></p>
            <h2>Tavoitetila (6–12 kk)</h2>
            <p></p>
            <h2>Keskeiset käyttäjäsegmentit</h2>
            <p></p>
            <h2>Roadmap (kvartaaleittain)</h2>
            <table><tbody><tr><th style="width: 100px"><p>Kvartaali</p></th><th style="width: 200px"><p>Päätavoite</p></th><th style="width: 300px"><p>Keskeiset toimenpiteet</p></th><th style="width: 150px"><p>Mittarit</p></th></tr><tr><td><p>Q1</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Q2</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Q3</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Q4</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table>
            <p></p>
            <h2>Riskit ja riippuvuudet</h2>
            <p></p>
            <h2>Mittaaminen ja onnistumiskriteerit</h2>
            <p></p>
            <h2>Resurssit ja rajaukset</h2>
            <p></p>
        `
    },
    {
        id: 'backlog',
        label: { fi: 'Backlog-keskeinen', en: 'Backlog-focused' },
        description: { fi: 'Tekemisen rakenne ja priorisointi.', en: 'Structure of work and prioritization.' },
        content: `
            <h1>Tuotteen tarkoitus</h1>
            <p></p>
            <h2>Käyttäjätarinat (ylätaso)</h2>
            <p></p>
            <h2>Priorisointiperiaatteet</h2>
            <p></p>
            <h2>Backlog-kategoriat</h2>
            <table><tbody><tr><th style="width: 150px"><p>Kategoria</p></th><th style="width: 300px"><p>Kuvaus</p></th><th style="width: 300px"><p>Esimerkkejä</p></th></tr><tr><td><p>Core features</p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Enhancements</p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Technical debt</p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Research / spikes</p></td><td><p></p></td><td><p></p></td></tr></tbody></table>
            <p></p>
            <h2>Sprinttikohtaiset tavoitteet</h2>
            <p></p>
            <h2>Definition of Ready</h2>
            <p></p>
            <h2>Definition of Done</h2>
            <p></p>
        `
    },
    {
        id: 'outcome',
        label: { fi: 'Outcome-keskeinen', en: 'Outcome-focused' },
        description: { fi: 'Korostaa vaikutuksia, ei tehtäviä.', en: 'Emphasizes outcomes, not tasks.' },
        content: `
            <h1>Haluttu käyttäjämuutos</h1>
            <p></p>
            <h2>Haluttu liiketoimintamuutos</h2>
            <p></p>
            <h2>Nykytila vs tavoitetila</h2>
            <table><tbody><tr><th style="width: 200px"><p>Teema</p></th><th style="width: 200px"><p>Nykytila</p></th><th style="width: 200px"><p>Tavoitetila</p></th><th style="width: 200px"><p>Mittari</p></th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table>
            <p></p>
            <h2>Keskeiset hypoteesit</h2>
            <p></p>
            <h2>Kokeilut ja mittarit</h2>
            <p></p>
            <h2>Oppiminen ja seuraavat askeleet</h2>
            <p></p>
        `
    },
    {
        id: 'technical',
        label: { fi: 'Tekninen PO', en: 'Technical PO' },
        description: { fi: 'Kun toimit teknisen tiimin rajapinnassa.', en: 'For working with technical teams.' },
        content: `
            <h1>Arkkitehtuurin nykytila</h1>
            <p></p>
            <h2>Tekniset tavoitteet</h2>
            <p></p>
            <h2>Integraatiot ja rajapinnat</h2>
            <table><tbody><tr><th style="width: 150px"><p>Järjestelmä</p></th><th style="width: 150px"><p>Rajapinta</p></th><th style="width: 100px"><p>Suunta</p></th><th style="width: 200px"><p>Tiedot</p></th><th style="width: 150px"><p>Riskit</p></th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table>
            <p></p>
            <h2>Tietomalli / datavirrat</h2>
            <p></p>
            <h2>Tekniset riskit</h2>
            <p></p>
            <h2>Ylläpitovaatimukset</h2>
            <p></p>
            <h2>Versiohallinnan periaatteet</h2>
            <p></p>
        `
    },
    {
        id: 'stakeholder',
        label: { fi: 'Sidosryhmä-keskeinen', en: 'Stakeholder-focused' },
        description: { fi: 'Kommunikaatio ja odotusten hallinta.', en: 'Communication and expectation management.' },
        content: `
            <h1>Keskeiset sidosryhmät</h1>
            <p></p>
            <h2>Tarpeet ja odotukset</h2>
            <p></p>
            <h2>Sidosryhmät</h2>
            <table><tbody><tr><th style="width: 200px"><p>Sidosryhmä</p></th><th style="width: 250px"><p>Tarve</p></th><th style="width: 200px"><p>Vaikutus</p></th><th style="width: 150px"><p>Kommunikaatiotapa</p></th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table>
            <p></p>
            <h2>Kommunikaatiorytmi</h2>
            <p></p>
            <h2>Päätöksentekoperiaatteet</h2>
            <p></p>
            <h2>Riskit ja eskalointipolut</h2>
            <p></p>
            <h2>Yhteiset onnistumisen mittarit</h2>
            <p></p>
        `
    },
    {
        id: 'lean',
        label: { fi: 'Lean-PO', en: 'Lean PO' },
        description: { fi: 'Ultraminimalistinen runko.', en: 'Ultraminimalist framework.' },
        content: `
            <h1>Visio</h1>
            <p></p>
            <h2>Tavoite</h2>
            <p></p>
            <h2>Käyttäjä</h2>
            <p></p>
            <h2>Ongelma</h2>
            <p></p>
            <h2>Ratkaisu</h2>
            <p></p>
            <h2>Mittarit</h2>
            <p></p>
            <h2>Seuraava askel</h2>
            <p></p>
        `
    },
    {
        id: 'strategic',
        label: { fi: 'Strateginen PO (Pitch)', en: 'Strategic PO (Pitch)' },
        description: { fi: 'Idean myynti nopeasti.', en: 'selling the idea quickly.' },
        content: `
            <h1>Miksi tämä tuote?</h1>
            <p></p>
            <h2>Kenelle?</h2>
            <p></p>
            <h2>Mitä arvoa syntyy?</h2>
            <p></p>
            <h2>Miten onnistumme?</h2>
            <p></p>
            <h2>Mitä tarvitsemme?</h2>
            <p></p>
            <h2>Mitä tapahtuu seuraavaksi?</h2>
            <p></p>
        `
    }
]
