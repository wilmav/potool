-- Clear existing templates to ensure clean state
DELETE FROM bullet_templates;

INSERT INTO bullet_templates (theme, fi_text, en_text, tags, fi_description, en_description) VALUES

-- A. DISCOVERY
('Discovery', 'A/B‑testaus', 'A/B testing', '{discovery, testing}',
 'Menetelmä, jossa kahta eri versiota (A ja B) verrataan toisiinsa paremman suorituskyvyn määrittämiseksi.',
 'A method of comparing two versions (A and B) against each other to determine which one performs better.'),

('Discovery', 'Analytiikan tarkistus', 'Analytics Review', '{discovery, data}',
 'Olemassa olevan datan analysointi käyttäjäkäyttäytymisen ja ongelmakohtien tunnistamiseksi.',
 'Analyzing existing data to identify user behaviors, trends, and pain points.'),

('Discovery', 'Asiakaspolku', 'Customer Journey', '{discovery, ux}',
 'Visuaalinen kuvaus asiakkaan vuorovaikutuksesta palvelun kanssa alusta loppuun.',
 'A visual representation of every interaction a customer has with your service from start to finish.'),

('Discovery', 'Asiakassegmentit', 'Customer Segments', '{discovery, business}',
 'Käyttäjäryhmien jaottelu yhteisten ominaisuuksien perusteella kohdennettua kehitystä varten.',
 'Dividing the customer base into groups of individuals that are similar in specific ways relevant to marketing and product.'),

('Discovery', 'Asiakasymmärrys', 'Customer Insight', '{discovery, ux}',
 'Syvällinen tieto asiakkaiden tarpeista ja motivaatioista, joka ohjaa tuotekehitystä.',
 'Deep understanding of customer needs and motivations that guides product development.'),

('Discovery', 'Benchmarkkaus', 'Benchmarking', '{discovery, market}',
 'Oman tuotteen vertailu alan parhaisiin käytäntöihin tai kilpailijoihin.',
 'Comparing your product against best practices or competitors to identify performance gaps.'),

('Discovery', 'Data‑auditointi', 'Data Audit', '{discovery, data}',
 'Tarkistus, onko nykyinen data luotettavaa, ehyttä ja onko sitä riittävästi päätöksentekoon.',
 'Reviewing existing data assets to assess quality, utility, and availability for decision making.'),

('Discovery', 'Data‑lähteet', 'Data Sources', '{discovery, data}',
 'Määrittely mistä järjestelmistä tai rajapinnoista tarvittava tieto saadaan.',
 'Identifying where the necessary data originates from, such as APIs, databases, or third-party services.'),

('Discovery', 'Data‑puutteet', 'Data Gaps', '{discovery, data}',
 'Tunnistetut alueet, joista puuttuu kriittistä tietoa päätöksenteon tueksi.',
 'Identified areas where critical information is missing to support decision making.'),

('Discovery', 'Discovery‑hypoteesi', 'Discovery Hypothesis', '{discovery, product}',
 'Oletus ongelmasta tai ratkaisusta, joka validoidaan tutkimusvaiheessa.',
 'An assumption about a problem or solution that needs to be validated during the research phase.'),

('Discovery', 'Dokumentoidut oletukset', 'Documented Assumptions', '{discovery, product}',
 'Lista oletuksista, joiden varaan projekti rakentuu, jotta ne voidaan testata.',
 'A list of assumptions the project is based on, recorded so they can be systematically tested.'),

('Discovery', 'Edge‑case‑kartoitus', 'Edge Case Mapping', '{discovery, ux}',
 'Harvinaisten mutta mahdollisten käyttötilanteiden tunnistaminen, jotka voivat rikkoa prosessin.',
 'Identifying rare but possible scenarios that might break the standard user flow.'),

('Discovery', 'Feature‑fit arvio', 'Feature Fit Assessment', '{discovery, product}',
 'Arvio siitä, kuinka hyvin ehdotettu ominaisuus palvelee liiketoimintatavoitteita ja käyttäjätarpeita.',
 'Evaluating how well a proposed feature aligns with business goals and user needs.'),

('Discovery', 'Fokuskysymykset', 'Focus Questions', '{discovery, product}',
 'Keskeiset kysymykset, joihin discovery-vaiheen tulee vastata.',
 'Key questions that the discovery phase aims to answer to reduce uncertainty.'),

('Discovery', 'GDPR‑huomiot', 'GDPR Considerations', '{discovery, legal}',
 'Henkilötietojen käsittelyyn liittyvät vaatimukset ja rajoitukset tietosuoja-asetuksen näkökulmasta.',
 'Requirements and constraints related to processing personal data under data protection regulations.'),

('Discovery', 'Haastattelukysymykset', 'Interview Questions', '{discovery, ux}',
 'Suunniteltu runko käyttäjähaastatteluille olennaisen tiedon keräämiseksi.',
 'A structured set of questions designed to gather insights during user interviews.'),

('Discovery', 'Haastatteluraportit', 'Interview Summaries', '{discovery, ux}',
 'Tiivistelmät käyttäjähaastattelujen keskeisistä löydöksistä.',
 'Summarized key findings and insights derived from user interviews.'),

('Discovery', 'Hypoteesien priorisointi', 'Hypothesis Prioritization', '{discovery, product}',
 'Oletusten järjestäminen tärkeyden ja riskin mukaan testausta varten.',
 'Ranking assumptions based on risk and importance to determine testing order.'),

('Discovery', 'Hypoteesien testaus', 'Hypothesis Testing', '{discovery, product}',
 'Kokeilut, joilla varmistetaan onko oletus totta vai tarua.',
 'Experiments designed to validate or invalidate specific product assumptions.'),

('Discovery', 'Idean rajaus', 'Idea Scoping', '{discovery, product}',
 'Idean pilkkominen toteutettavaksi ja hallittavaksi kokonaisuudeksi.',
 'Defining the boundaries of an idea to make it manageable and implementable.'),

('Discovery', 'Insight‑kartta', 'Insight Map', '{discovery, ux}',
 'Visuaalinen kooste havainnoista ja niiden yhteyksistä toisiinsa.',
 'A visual synthesis of research observations and their relationships.'),

('Discovery', 'Käyttäjähaastattelut', 'User Interviews', '{discovery, ux}',
 'Suora keskustelu käyttäjien kanssa heidän tarpeidensa ja ongelmiensa ymmärtämiseksi.',
 'Direct conversations with users to understand their needs, behaviors, and pain points.'),

('Discovery', 'Käyttäjäongelmat', 'User Pains', '{discovery, ux}',
 'Käyttäjän kokemat haasteet tai turhautumiset nykyisessä toimintamallissa.',
 'Specific problems or frustrations users experience with the current solution or process.'),

('Discovery', 'Käyttäjäprofiilit', 'User Profiles', '{discovery, ux}',
 'Kuvaukset tyypillisistä käyttäjistä, heidän taustoistaan ja tavoitteistaan.',
 'Descriptions of typical users, including their backgrounds, goals, and behaviors.'),

('Discovery', 'Käyttäjäsegmentointi', 'User Segmentation', '{discovery, ux}',
 'Käyttäjien jakaminen ryhmiin käyttäytymisen tai tarpeiden perusteella.',
 'Grouping users based on shared behaviors, needs, or demographics.'),

('Discovery', 'Käyttäjävirheet', 'User Errors', '{discovery, ux}',
 'Yleiset virheet, joita käyttäjät tekevät järjestelmää käyttäessään.',
 'Common mistakes users make when interacting with the system.'),

('Discovery', 'Kilpailija‑analyysi', 'Competitor Analysis', '{discovery, market}',
 'Kilpailijoiden ratkaisujen vahvuuksien ja heikkouksien arviointi.',
 'Evaluating strengths and weaknesses of current and potential competitors.'),

('Discovery', 'KPI‑luonnos', 'KPI Draft', '{discovery, business}',
 'Alustavat mittarit, joilla onnistumista tullaan arvioimaan.',
 'Preliminary key performance indicators defined to measure success.'),

('Discovery', 'Kysyntäsignaalit', 'Demand Signals', '{discovery, market}',
 'Indikaattorit, jotka osoittavat markkinoiden kiinnostusta ratkaisua kohtaan.',
 'Indicators showing market interest or need for the proposed solution.'),

('Discovery', 'Markkinadata', 'Market Data', '{discovery, market}',
 'Tilastollinen tieto markkinan koosta, kasvusta ja trendeistä.',
 'Statistical information regarding market size, growth, and trends.'),

('Discovery', 'Markkinatrendit', 'Market Trends', '{discovery, market}',
 'Markkinoiden pitkän aikavälin kehityssuunnat.',
 'Long-term directions or patterns in the market that affect the product.'),

('Discovery', 'Mittarit', 'Metrics', '{discovery, business}',
 'Määrälliset luvut, joilla seurataan tuotteen tai prosessin tilaa.',
 'Quantitative measures used to track and assess the status of a specific process.'),

('Discovery', 'Oletusten validointi', 'Assumption Validation', '{discovery, product}',
 'Prosessi, jossa varmistetaan projektin pohjana olevien oletusten paikkansapitävyys.',
 'The process of verifying that the core assumptions underlying the project are true.'),

('Discovery', 'Ongelmakuvaus', 'Problem Statement', '{discovery, product}',
 'Tiivis kuvaus ratkaistavasta ongelmasta ilman ratkaisuehdotusta.',
 'A concise description of the issue to be addressed, mostly focusing on the "what" and "why".'),

('Discovery', 'Ongelmien juurisyyt', 'Root Causes', '{discovery, product}',
 'Syvälliset syyt, jotka aiheuttavat havaitut pintaongelmat.',
 'The underlying reasons that cause the visible problems or symptoms.'),

('Discovery', 'Persona‑tarkistus', 'Persona Check', '{discovery, ux}',
 'Varmistus, että suunniteltu ratkaisu palvelee määriteltyjä käyttäjäpersoonia.',
 'Verifying that the proposed solution aligns with the needs of defined user personas.'),

('Discovery', 'Priorisointikriteerit', 'Prioritization Criteria', '{discovery, product}',
 'Säännöt, joiden perusteella päätetään, mitä tehdään ensin.',
 'The rules or guidelines used to determine the order of execution for tasks or features.'),

('Discovery', 'Riskien tunnistus', 'Risk Identification', '{discovery, risk}',
 'Mahdollisten uhkien ja ongelmien listaaminen ennen toteutusta.',
 'Listing potential threats and issues that could derail the project before implementation starts.'),

('Discovery', 'Roadblockit', 'Roadblocks', '{discovery, management}',
 'Esteet, jotka estävät etenemisen ja vaativat ratkaisua.',
 'Obstacles that currently prevent progress and need to be resolved.'),

('Discovery', 'Roolit ja vastuut', 'Roles and Responsibilities', '{discovery, management}',
 'Määrittely kuka tekee mitäkin ja kuka vastaa mistäkin.',
 'Defining who is responsible for which tasks and decisions.'),

('Discovery', 'Signaalit', 'Signals', '{discovery, market}',
 'Heikot tai vahvat vihjeet markkinamuutoksista tai käyttäjätarpeista.',
 'Weak or strong cues indicating market shifts or emerging user needs.'),

('Discovery', 'Stakeholder‑kartta', 'Stakeholder Map', '{discovery, management}',
 'Visualisointi kaikista sidosryhmistä ja heidän vaikutusvallastaan projektiin.',
 'A visualization of all stakeholders involved and their influence/interest in the project.'),

('Discovery', 'Suorituskyky‑odotukset', 'Performance Expectations', '{discovery, tech}',
 'Määritelmät siitä, kuinka nopeasti tai tehokkaasti järjestelmän tulee toimia.',
 'Definitions of how fast or efficiently the system needs to operate under load.'),

('Discovery', 'Tarpeiden kartoitus', 'Needs Mapping', '{discovery, ux}',
 'Käyttäjien ilmaisemien ja piilevien tarpeiden dokumentointi.',
 'Documenting both explicit and latent needs expressed by users.'),

('Discovery', 'Tekninen toteutettavuus', 'Technical Feasibility', '{discovery, tech}',
 'Arvio siitä, onko ratkaisu mahdollista toteuttaa käytettävissä olevilla teknologioilla.',
 'Assessment of whether the solution can be built with available technologies and constraints.'),

('Discovery', 'Tiedon puutteet', 'Information Gaps', '{discovery, data}',
 'Asiat, joita emme vielä tiedä ja jotka vaativat selvitystä.',
 'Things we do not yet know that require further research or investigation.'),

('Discovery', 'Validointisuunnitelma', 'Validation Plan', '{discovery, product}',
 'Suunnitelma siitä, miten ratkaisun toimivuus varmistetaan oikeilla käyttäjillä.',
 'A plan outlining how the solution will be verified with real users.'),

('Discovery', 'Vaikutus vs vaiva', 'Impact vs Effort', '{discovery, product}',
 'Priorisointimenetelmä, jossa verrataan hyötyä vaadittuun työmäärään.',
 'A prioritization framework comparing the expected benefit against the required work.'),

('Discovery', 'Vaatimusten rajaus', 'Requirement Scoping', '{discovery, product}',
 'Päätös siitä, mitä vaatimuksia otetaan mukaan ensimmäiseen versioon.',
 'Deciding which requirements are included in the scope of the first release.'),

('Discovery', 'Ymmärrysaukot', 'Knowledge Gaps', '{discovery, product}',
 'Kriittiset aukot tiimin ymmärryksessä liiketoiminnasta tai käyttäjistä.',
 'Critical gaps in the team''s understanding of the business domain or users.'),

-- E. KOMMUNIKAATIO & YHTEISTYÖ
('Kommunikaatio', 'Dev lead ‑synkka', 'Dev Lead Sync', '{comms, tech}',
 'Säännöllinen katselmointi teknisen liidin kanssa arkkitehtuurista.',
 'Regular alignment regarding architecture with the technical lead.'),

('Kommunikaatio', 'Datan tarkistus', 'Data Team Check', '{comms, data}',
 'Varmistus datatiimiltä, että tarvittava data on saatavilla ja laadukasta.',
 'Verification from the data team that necessary data is available and high quality.'),

('Kommunikaatio', 'Design‑synkka', 'Design Sync', '{comms, design}',
 'Palaveri suunnittelijoiden kanssa käyttöliittymän ja kokemuksen linjauksista.',
 'Meeting with designers to align on UI/UX direction.'),

('Kommunikaatio', 'Dokumentointipyyntö', 'Documentation Request', '{comms, product}',
 'Pyyntö luoda tai päivittää tekninen tai käyttäjädokumentaatio.',
 'A request to create or update technical or user documentation.'),

('Kommunikaatio', 'Kysymykset tiimille', 'Team Questions', '{comms, team}',
 'Lista avoimista kysymyksistä kehitystiimille ratkottavaksi.',
 'A list of open questions for the development team to resolve.'),

('Kommunikaatio', 'Päätösten kirjaus', 'Decision Log', '{comms, management}',
 'Keskeisten projektipäätösten dokumentointi myöhempää tarkastelua varten.',
 'Documenting key project decisions for future reference.'),

('Kommunikaatio', 'Riskikeskustelu', 'Risk Discussion', '{comms, risk}',
 'Avoin keskustelu tunnistetuista riskeistä ja niiden mitigoinnista.',
 'Open discussion about identified risks and mitigation strategies.'),

('Kommunikaatio', 'Stakeholder‑synkka', 'Stakeholder Sync', '{comms, management}',
 'Tilannepäivitys sidosryhmille odotusten hallitsemiseksi.',
 'Status update for stakeholders to manage expectations.'),

('Kommunikaatio', 'Tekninen arvio', 'Technical Review', '{comms, tech}',
 'Koodin tai arkkitehtuurin katselmointi laadun varmistamiseksi.',
 'Review of code or architecture to ensure quality and feasibility.'),

('Kommunikaatio', 'UX‑arvio', 'UX Review', '{comms, design}',
 'Käyttökokemuksen asiantuntija-arvio suunnitellusta ratkaisusta.',
 'Expert review of the proposed user experience design.'),

('Kommunikaatio', 'Viikkosynkka', 'Weekly Sync', '{comms, management}',
 'Viikoittainen tiimipalaveri etenemisen ja esteiden läpikäymiseksi.',
 'Weekly team meeting to review progress and blockers.'),

('Kommunikaatio', 'Workshop‑agenda', 'Workshop Agenda', '{comms, management}',
 'Suunnitelma työpajan kulusta tavoitteiden saavuttamiseksi.',
 'Plan for a workshop session to ensure goals are met.'),

-- B. IDEOINTI
('Ideointi', 'Aivoriihi', 'Brainstorming', '{ideation, creative}', 'Vapaamuotoinen ideointisessio uusien ratkaisujen löytämiseksi.', 'Free-form ideation session to generate new solutions.'),
('Ideointi', 'Arvolupaus', 'Value Proposition', '{ideation, business}', 'Lupaus siitä, mitä arvoa tuote tuottaa asiakkaalle.', 'A statement identifying the clear benefits a customer gets from the product.'),
('Ideointi', 'Arvovirta', 'Value Stream', '{ideation, business}', 'Prosessi, jonka kautta arvo toimitetaan asiakkaalle.', 'The set of actions that take place to add value to a customer.'),
('Ideointi', 'Backlog‑siemenet', 'Backlog Seeds', '{ideation, agile}', 'Alustavat ideat, jotka saattavat päätyä kehitysjonoon.', 'Initial ideas that might eventually become backlog items.'),
('Ideointi', 'Design‑vaihtoehdot', 'Design Alternatives', '{ideation, design}', 'Erilaiset visuaaliset tai toiminnalliset lähestymistavat ongelmaan.', 'Different visual or functional approaches to solving the problem.'),
('Ideointi', 'Feature‑ideat', 'Feature Ideas', '{ideation, product}', 'Konkreetit ideat uusista ominaisuuksista.', 'Concrete ideas for new product features.'),
('Ideointi', 'Flow‑luonnokset', 'Flow Sketches', '{ideation, ux}', 'Karkeat piirrokset käyttäjän etenemisestä palvelussa.', 'Rough sketches of how a user moves through the service.'),
('Ideointi', 'Funktio‑rajaukset', 'Functional Boundaries', '{ideation, tech}', 'Määrittely siitä, mitä järjestelmä tekee ja mitä se ei tee.', 'Defining what the system handles and what is out of scope.'),
('Ideointi', 'Ideakortit', 'Idea Cards', '{ideation, creative}', 'Strukturoidut kortit ideoiden nopeaan kirjaamiseen.', 'Structured cards for quickly capturing and sorting ideas.'),
('Ideointi', 'Ideapankki', 'Idea Bank', '{ideation, creative}', 'Varasto tulevaisuuden ideoille, joita ei vielä toteuteta.', 'A repository for ideas meant for future consideration.'),
('Ideointi', 'Ideoiden klusterointi', 'Idea Clustering', '{ideation, creative}', 'Samankaltaisten ideoiden ryhmittely teemoiksi.', 'Grouping similar ideas into themes/clusters.'),
('Ideointi', 'Käyttötapaukset', 'Use Cases', '{ideation, product}', 'Kuvaukset siitä, miten käyttäjä käyttää järjestelmää tiettyyn tavoitteeseen.', 'Descriptions of how a user uses the system to achieve a specific goal.'),
('Ideointi', 'Käyttäjäpolut', 'User Flows', '{ideation, ux}', 'Reitti, jonka käyttäjä kulkee käyttöliittymässä.', 'The path taken by a prototypical user on a website or app.'),
('Ideointi', 'Konseptiluonnokset', 'Concept Sketches', '{ideation, design}', 'Varhaisen vaiheen hahmotelmat tuoteideasta.', 'Early stage drawings visualizing the product concept.'),
('Ideointi', 'Konseptivaihtoehdot', 'Concept Options', '{ideation, design}', 'Eri suuntiin vievät ratkaisumallit vertailtavaksi.', 'Divergent high-level solution models for comparison.'),
('Ideointi', 'Low‑fi protot', 'Low‑fidelity Prototypes', '{ideation, design}', 'Yksinkertaistetut mallit toiminnallisuuden testaamiseen.', 'Simplified models used to test functionality without visual polish.'),
('Ideointi', 'Mockup‑vaihtoehdot', 'Mockup Options', '{ideation, design}', 'Staattiset kuvat käyttöliittymän mahdollisesta ulkoasusta.', 'Static images showing possible visual designs of the interface.'),
('Ideointi', 'MVP‑rajaukset', 'MVP Boundaries', '{ideation, product}', 'Pienimmän toimivan tuotteen ominaisuuksien määrittely.', 'Defining the feature set for the Minimum Viable Product.'),
('Ideointi', 'Ongelman uudelleenmuotoilu', 'Reframing', '{ideation, creative}', 'Ongelman katsominen uudesta näkökulmasta ratkaisun löytämiseksi.', 'Looking at the problem from a new perspective to find better solutions.'),
('Ideointi', 'Prototyyppivaihtoehdot', 'Prototype Options', '{ideation, design}', 'Erilaiset interaktiiviset mallit testaukseen.', 'Different interactive models created for user testing.'),
('Ideointi', 'Ratkaisupolut', 'Solution Paths', '{ideation, product}', 'Eri strategiat ongelman ratkaisemiseksi.', 'Different strategic approaches to solve the identified problem.'),
('Ideointi', 'Ratkaisun rajaukset', 'Solution Scoping', '{ideation, product}', 'Ratkaisun laajuuden rajaaminen resussien mukaan.', 'Limiting the scope of the solution based on resources.'),
('Ideointi', 'Riskittömät kokeilut', 'Low‑risk Experiments', '{ideation, product}', 'Nopeat testit, joilla opitaan ilman suurta riskiä.', 'Quick tests to learn without significant investment or risk.'),
('Ideointi', 'Roolikohtaiset näkymät', 'Role‑based Views', '{ideation, ux}', 'Näkymien suunnittelu eri käyttäjärooleille (esim. admin vs user).', 'Designing different interfaces for different user roles.'),
('Ideointi', 'Sketch‑ideat', 'Sketch Ideas', '{ideation, design}', 'Nopeat piirrokset ideoiden kommunikointiin.', 'Quick drawings to communicate ideas visually.'),
('Ideointi', 'Storyboardit', 'Storyboards', '{ideation, ux}', 'Sarjakuvaus käyttäjän kokemuksesta ja kontekstista.', 'Comic-strip like visualization of the user experience context.'),
('Ideointi', 'Suunnitteluperiaatteet', 'Design Principles', '{ideation, design}', 'Ohjenuorat, jotka ohjaavat muotoilupäätöksiä.', 'Guiding rules that influence design decisions.'),
('Ideointi', 'Tekninen konsepti', 'Technical Concept', '{ideation, tech}', 'Korkean tason kuvaus teknisestä ratkaisusta.', 'High-level description of the technical implementation approach.'),
('Ideointi', 'Testattavat ideat', 'Testable Ideas', '{ideation, product}', 'Ideat, jotka on muotoiltu niin, että ne voidaan validoida.', 'Ideas formulated specifically so they can be validated.'),
('Ideointi', 'UI‑luonnokset', 'UI Sketches', '{ideation, design}', 'Käyttöliittymän elementtien hahmottelu paperille tai taululle.', 'Drafting UI elements on paper or whiteboard.'),
('Ideointi', 'UX‑vaihtoehdot', 'UX Alternatives', '{ideation, ux}', 'Vaihtoehtoiset tavat tarjota käyttökokemus.', 'Alternative ways to structure the user experience.'),
('Ideointi', 'Visuaaliset moodit', 'Visual Moods', '{ideation, design}', 'Tunnelmakuvat, jotka ohjaavat visuaalista ilmettä.', 'Mood boards identifying the visual style and feeling.'),

-- C. VAATIMUSMÄÄRITTELY
('Määrittely', 'API‑rajapinnat', 'API Endpoints', '{specs, tech}', 'Määrittelyt sovellusrajapinnoille tietojen vaihtoa varten.', 'Specifications for application programming interfaces.'),
('Määrittely', 'Audit‑logit', 'Audit Logs', '{specs, tech}', 'Vaatimus muutoshistorian tallentamisesta jäljitettävyyden vuoksi.', 'Requirement to record history of changes for traceability.'),
('Määrittely', 'Autentikointi', 'Authentication', '{specs, security}', 'Käyttäjän tunnistautumisen mekanismit (kirjautuminen).', 'Mechanisms for verifying user identity (login).'),
('Määrittely', 'Autorisointi', 'Authorization', '{specs, security}', 'Käyttöoikeuksien hallinta ja roolit.', 'Managing access rights and user roles.'),
('Määrittely', 'Datamallit', 'Data Models', '{specs, data}', 'Tietokannan rakenne ja tietojen väliset suhteet.', 'Structure of the database and relationships between data entities.'),
('Määrittely', 'Edge‑caset', 'Edge Cases', '{specs, product}', 'Poikkeustilanteiden käsittely (esim. verkko katkeaa).', 'Handling of exceptional or rare situations.'),
('Määrittely', 'Error‑tilat', 'Error States', '{specs, ux}', 'Miten järjestelmä toimii ja viestii virhetilanteissa.', 'How the system behaves and communicates during errors.'),
('Määrittely', 'Feature‑rajaukset', 'Feature Boundaries', '{specs, product}', 'Tarkka kuvaus siitä, mitä ominaisuus sisältää ja mitä ei.', 'Precise description of what a feature includes and excludes.'),
('Määrittely', 'GDPR‑vaatimukset', 'GDPR Requirements', '{specs, legal}', 'Tietosuoja-asetuksen asettamat pakolliset toiminnot.', 'Mandatory functions required by data protection regulations.'),
('Määrittely', 'Hyväksymiskriteerit', 'Acceptance Criteria', '{specs, agile}', 'Ehdot, joiden on täytyttävä, jotta ominaisuus on valmis.', 'Conditions that must be met for a feature to be considered done.'),
('Määrittely', 'Käyttöoikeudet', 'Permissions', '{specs, security}', 'Mitä toimintoja kukin käyttäjärooli saa tehdä.', 'What actions specific user roles are allowed to perform.'),
('Määrittely', 'Käyttöpolut', 'Usage Flows', '{specs, ux}', 'Yksityiskohtaiset askeleet käyttäjän prosessissa.', 'Detailed steps in the user''s process flow.'),
('Määrittely', 'Lokitus', 'Logging', '{specs, tech}', 'Järjestelmätapahtumien tallennus virheenkorjausta varten.', 'Recording system events for debugging and monitoring.'),
('Määrittely', 'Lokalisointi', 'Localization', '{specs, product}', 'Valmius tukea useita kieliä ja alueasetuksia.', 'Readiness to support multiple languages and region settings.'),
('Määrittely', 'Lähdejärjestelmät', 'Source Systems', '{specs, tech}', 'Määrittely ulkoisista järjestelmistä, joista dataa haetaan.', 'Definition of external systems where data is fetched from.'),
('Määrittely', 'Monitorointi', 'Monitoring', '{specs, ops}', 'Järjestelmän tilan ja terveyden seuranta.', 'Tracking system health and status.'),
('Määrittely', 'Non‑functional requirements', 'Non-functional Requirements', '{specs, tech}', 'Laatuvaatimukset kuten nopeus, turvallisuus ja skaalautuvuus.', 'Quality attributes like speed, security, and scalability.'),
('Määrittely', 'Performance‑vaatimukset', 'Performance Requirements', '{specs, tech}', 'Suorituskyvyn tavoitearvot (esim. latausajat).', 'Target values for performance (e.g., load times).'),
('Määrittely', 'Rajapintakuvaukset', 'Interface Descriptions', '{specs, tech}', 'Tekniset kuvaukset integraatioista.', 'Technical descriptions of integrations.'),
('Määrittely', 'Regressioriskit', 'Regression Risks', '{specs, risk}', 'Riski, että uusi muutos rikkoo vanhaa toiminnallisuutta.', 'Risk that a new change breaks existing functionality.'),
('Määrittely', 'Resurssirajat', 'Resource Limits', '{specs, tech}', 'Rajoitukset käytettävissä oleville laitteistoresursseille.', 'Constraints on available hardware resources.'),
('Määrittely', 'Responsiivisuus', 'Responsiveness', '{specs, ux}', 'Vaatimus käyttöliittymän skaalautumisesta eri päätelaitteille.', 'Requirement for UI to adapt to different devices.'),
('Määrittely', 'Skaalautuvuus', 'Scalability', '{specs, tech}', 'Kyky käsitellä kasvavia käyttäjämääriä.', 'Ability to handle growing amounts of users or work.'),
('Määrittely', 'Suorituskyky', 'Performance', '{specs, tech}', 'Järjestelmän tehokkuus ja vasteajat.', 'System efficiency and response times.'),
('Määrittely', 'Tietoturva', 'Security', '{specs, security}', 'Suojaukset hyökkäyksiä ja tietovuotoja vastaan.', 'Protections against attacks and data breaches.'),
('Määrittely', 'Tilasiirtymät', 'State Transitions', '{specs, tech}', 'Logiikka, miten objekti siirtyy tilasta toiseen (esim. tilaus).', 'Logic defining how an object moves from one state to another.'),
('Määrittely', 'Toiminnalliset vaatimukset', 'Functional Requirements', '{specs, product}', 'Mitä järjestelmän täytyy tehdä.', 'What the system must do.'),
('Määrittely', 'Validointisäännöt', 'Validation Rules', '{specs, data}', 'Säännöt syötetyn tiedon oikeellisuuden tarkistamiseksi.', 'Rules for checking correctness of input data.'),
('Määrittely', 'Virheviestit', 'Error Messages', '{specs, ux}', 'Käyttäjälle näytettävät tekstit virhetilanteissa.', 'Texts shown to users during errors.'),

-- F. TYÖKALUT & TEKNOLOGIAT
('Työkalut', 'Analytiikka: Posthog', 'Analytics: Posthog', '{tools, data}', 'Tuoteanalytiikkatyökalu käyttäytymisen seurantaan.', 'Product analytics tool for tracking user behavior.'),
('Työkalut', 'Design: Figma', 'Design: Figma', '{tools, design}', 'Johtava käyttöliittymäsuunnittelun työkalu.', 'Leading interface design tool.'),
('Työkalut', 'Dokumentointi: Notion', 'Documentation: Notion', '{tools, product}', 'Joustava työtila dokumentaation ja tiedon hallintaan.', 'Flexible workspace for documentation and knowledge management.'),
('Työkalut', 'Kaaviot: Miro', 'Diagrams: Miro', '{tools, design}', 'Digitaalinen valkotaulu yhteistyöhön ja kaavioihin.', 'Digital whiteboard for collaboration and diagrams.'),
('Työkalut', 'Koodivarasto: GitHub', 'Code Repo: GitHub', '{tools, tech}', 'Lähdekoodin hallinta ja versiointi.', 'Source code management and versioning.'),
('Työkalut', 'Projektinhallinta: Linear', 'Project Management: Linear', '{tools, management}', 'Virtaviivainen työkalu ohjelmistokehityksen seurantaan.', 'Streamlined tool for tracking software development.'),
('Työkalut', 'Protot: Figma', 'Prototypes: Figma', '{tools, design}', 'Interaktiiviset mallit Figmalla.', 'Interactive models built in Figma.'),
('Työkalut', 'Tietokanta: Supabase', 'Database: Supabase', '{tools, tech}', 'Avoin vaihtoehto Firebase-taustajärjestelmälle.', 'Open source Firebase alternative for backend.'),
('Työkalut', 'Videot: Loom', 'Videos: Loom', '{tools, comms}', 'Työkalu nopeiden videoviestien tallentamiseen.', 'Tool for recording quick video messages.'),

-- D. GO-TO-MARKET & JULKAISU
('Go-to-market', 'Adoptiomittarit', 'Adoption Metrics', '{gtm, business}', 'Miten mitataan käyttöönoton onnistumista.', 'How rollout success is measured.'),
('Go-to-market', 'Beta‑testaus', 'Beta Testing', '{gtm, product}', 'Tuotteen testaus rajatulla käyttäjäryhmällä ennen julkaisua.', 'Testing with a limited user group before full release.'),
('Go-to-market', 'Dokumentaatio', 'Documentation', '{gtm, product}', 'Ohjeet käyttäjille ja ylläpitäjille.', 'Guides for users and administrators.'),
('Go-to-market', 'FAQ‑luonnos', 'FAQ Draft', '{gtm, support}', 'Usein kysytyt kysymykset vastauksineen.', 'Frequently Asked Questions with answers.'),
('Go-to-market', 'Feature‑flagit', 'Feature Flags', '{gtm, tech}', 'Ominaisuuksien hallittu julkaisu koodia muuttamatta.', 'Controlled release of features without changing code.'),
('Go-to-market', 'Go‑to‑market‑suunnitelma', 'GTM Plan', '{gtm, business}', 'Strategia tuotteen viemiseksi markkinoille.', 'Strategy for bringing the product to market.'),
('Go-to-market', 'Julkaisumuistiot', 'Release Notes', '{gtm, product}', 'Kuvaus julkaisun sisältämistä muutoksista käyttäjille.', 'Description of changes in a release for users.'),
('Go-to-market', 'Käyttöönotto', 'Onboarding', '{gtm, ux}', 'Uuden käyttäjän perehdytys prosessi.', 'Process for getting a new user started.'),
('Go-to-market', 'Koulutusmateriaalit', 'Training Materials', '{gtm, support}', 'Materiaalit käyttäjien kouluttamiseen.', 'Materials for training users.'),
('Go-to-market', 'Launch‑checklist', 'Launch Checklist', '{gtm, ops}', 'Tarkistuslista kaikesta, mikä on tehtävä ennen julkaisua.', 'Checklist of everything to be done before launch.'),
('Go-to-market', 'Mittarit', 'Metrics', '{gtm, business}', 'KPI:t julkaisun onnistumisen seurantaan.', 'KPIs to track launch success.'),
('Go-to-market', 'Pilotointi', 'Piloting', '{gtm, product}', 'Kokeilujakso rajatussa ympäristössä.', 'Trial period in a limited environment.'),
('Go-to-market', 'Rollout‑strategia', 'Rollout Strategy', '{gtm, business}', 'Suunnitelma siitä, miten ja milloin tuote julkaistaan kenellekin.', 'Plan for how and when the product is released to whom.'),
('Go-to-market', 'Riskienhallinta', 'Risk Management', '{gtm, risk}', 'Julkaisuun liittyvien riskien hallinta.', 'Managing risks related to the launch.'),
('Go-to-market', 'Regressiotestaus', 'Regression Testing', '{gtm, tech}', 'Varmistus, ettei julkaisu riko vanhaa.', 'Verifying release doesnt break existing stuff.'),
('Go-to-market', 'Stakeholder‑viestintä', 'Stakeholder Communication', '{gtm, management}', 'Tiedottaminen sidosryhmille julkaisun etenemisestä.', 'Informing stakeholders about launch progress.'),
('Go-to-market', 'Support‑prosessi', 'Support Process', '{gtm, support}', 'Miten tukipyynnöt käsitellään julkaisun jälkeen.', 'How support requests are handled after launch.'),
('Go-to-market', 'Tiedotus', 'Announcements', '{gtm, marketing}', 'Julkinen viestintä uudesta versiosta.', 'Public communication about the new version.'),
('Go-to-market', 'Versionhallinta', 'Versioning', '{gtm, tech}', 'Miten versiot numeroidaan ja hallitaan.', 'How versions are numbered and managed.'),
('Go-to-market', 'Viestintäpaketti', 'Communication Kit', '{gtm, marketing}', 'Valmiit viestipohjat ja materiaalit tiedotukseen.', 'Ready templates and materials for communication.');
