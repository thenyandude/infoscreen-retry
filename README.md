# infoscreen-retry

**Milepæl 1 - Prosjektplanlegging**

**Prosjektbeskrivelse**

**Teknologier**
- **Backend:** Node.js, MongoDB, VMWare
- **Frontend:** React, Express, RasberryPI3B+

**Overordnet Tilnærming**

Jeg vil helst prøve å holde meg til MVC modellen, og bruke low coupling high cohesion konseptet.

Jeg har lyst til å prøve å lage en grafisk versjon av admin panelet, hvor du kan legge inn filer, og velge rekkefølgen de vises i og hvor lenge.

**Utfordringer**

| **Oppgave**    | **Potensielle Utfordringer**                                            |
|------------------------|-----------------------------------------------------------------|
| Planlegging            | Velge riktige teknologier                                       |
| Backend-implementering | Database implementering, dytte og lese data, og sikre databasen |
| Frontend-utvikling     | Integrere React-komponenter uten problemer / bugs               |

**Tidsplan**

| **Fase**            | **Forventet Tidsbruk**|
|------------------------|--------------------|
| Prosjektplanlegging    | 4 timer            |
| Backend-implementering | 6 timer            |
| Frontend-utvikling     | 5 timer            |
| Testing og Debugging   | 8 timer            |
| Dokumentasjon          | 4 timer            |



**Milepæl 2 - Konsept**

1. **Oversikt over tredjepartsprogramvare:**
    MongoDB,
    Mongoose,
    Express,
    React,
    RasberryPI3B+,
    Node.js,
    npm: Node Package Manager,
    VsCode IDE

https://lucid.app/lucidchart/77f50d92-d68e-4da5-9df6-5ed699d94ba1/edit?beaconFlowId=1F62EE424217D979&invitationId=inv_2148bedc-531a-4f84-b816-59b50152c550&page=0_0#
    
   
3. **Beskrivelse av prototypen:**

   **Prototypens Funksjonaliteter:**

   - **Opplasting av Filer:**
        - Legg til en opplastingsfunksjon som tillater brukeren å laste opp filer til systemet.
        - Implementer støtte for ulike filformater som skal vises.

    - **Tidsinnstilling for Filvisning:**
        - Lag et brukervennlig grensesnitt for å velge hvor lenge hver fil skal vises før det byttes til neste.
        - Tillat brukeren å angi varighet i sekunder eller minutter, avhengig av preferanse.

    - **Databaseintegrasjon:**
        - Implementer funksjonalitet for å lagre filinformasjon i databasen (MongoDB).
        - Lag en strukturert database for å holde styr på filer, deres varighet og andre relevante attributter.

   **Bruksscenarier:**

   - **Opplasting av en Fil:**
        - Brukeren går til opplastingsgrensesnittet, velger ønsket fil, og laster den opp i systemet.
        - Systemet lagrer filen i databasen og tilknytter nødvendig metadata, inkludert visningsvarighet.

    - **Konfigurere Visningstid:**
        - Brukeren går til grensesnittet for tidsinnstilling, velger en fil og angir ønsket varighet.
        - Systemet lagrer denne informasjonen i databasen og tar hensyn til den ved visning.

    - **Automatisk Filbytte:**
        - Systemet bytter automatisk til neste fil etter den angitte visningstiden.
        - Hvis det ikke er flere filer, kan systemet enten stoppe visningen eller gå tilbake til den første filen, avhengig av konfigurasjonen.