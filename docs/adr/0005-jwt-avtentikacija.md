# ADR-0005 – Kratkoživ JWT za avtentikacijo

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

Javni pregled receptov je dostopen gostom. Komentarji, ocene, priljubljeni in zasebni načrti zahtevajo identiteto uporabnika, objavljanje pa še vlogo `AUTHOR`. Ločena React in Express komunicirata prek HTTP; [obstoječa zasnova](../04-arhitektura-in-tehnoloski-sklad.md#avtentikacija-in-avtorizacija) določa JWT v pomnilniku frontenda, zgoščevanje gesel z `bcrypt` ter preverjanje aktivnosti, vloge in lastništva na backendu.

## Obravnavane alternative

- **Kratkoživ JWT v pomnilniku:** odjemalec ga dodaja v glavo `Authorization`; ne zahteva strežniške zbirke sej, vendar nalaganje strani izgubi stanje prijave in sam žeton ne omogoča preprostega posamičnega preklica.
- **Strežniška seja s piškotkom `HttpOnly`:** omogoča centralni preklic in prepreči neposredno branje piškotka iz JavaScript; zahteva hrambo sej ter ureditev piškotkov in zaščite pred CSRF pri izbranem načinu gostovanja.
- **Zunanji ponudnik identitete prek OpenID Connect:** zmanjša lastno izvajanje prijave, vendar doda zunanjo storitev in nastavitev povezovanja zunanje identitete z lokalnimi vlogami; MVP ne zahteva zunanje prijave.

## Odločitev in utemeljitev

Ohranimo **kratkoživ JWT**, poslan kot `Authorization: Bearer …`, in **`bcrypt` za gesla**. Ob prijavi API preveri podatke in aktivnost računa ter izda podpisan žeton z identifikatorjem uporabnika in časovno omejitvijo. Žeton ne vsebuje gesla, njegove zgoščene vrednosti ali zasebnih načrtov; podpis zagotavlja preverjanje izvora in celovitosti, ne zaupnosti vsebine.

Frontend hrani JWT samo v pomnilniku, skladno z MVP; po osvežitvi strani se uporabnik ponovno prijavi. Shranjevanje v `localStorage` in osvežitveni žetoni niso del te odločitve. JWT preveri identiteto, avtorizacija pa na vsaki zaščiteni zahtevi dodatno preveri trenutno aktivnost in vlogo računa v bazi ter lastništvo konkretnega vira. Zato deaktivacija ali odvzem vloge učinkujeta tudi pri še veljavnem JWT. Vloga `ADMIN` ne obide zasebnosti tujih načrtov in seznamov.

Ta izbira ohranja že opisani način uporabe ločenega API. Pred morebitno produkcijsko uporabo je treba po obstoječi arhitekturi dopolniti HTTPS, omejevanje poskusov prijave in upravljanje skrivnosti ter ponovno presoditi trajanje in obnavljanje prijave.

### Posledice

#### Pozitivne

- Isti način preverjanja identitete velja za komentarje, avtorstvo in načrtovanje obrokov; ne potrebujemo ločene zbirke sej.
- Žeton se ne ohrani v trajni brskalniški shrambi po ponovnem nalaganju aplikacije.
- Sprotno preverjanje računa prepreči, da bi odvzete pravice ostale uporabne do izteka žetona.

#### Negativne

- Ponovna prijava po nalaganju strani zmanjšuje udobje uporabe, kar je sprejeta omejitev MVP.
- Ukraden veljaven JWT je uporaben do izteka, razen če se račun deaktivira; posamičen preklic žetona bi zahteval dodaten mehanizem. Pomnilnik ne odpravi tveganja XSS.
- Sprotno preverjanje računa povzroči dodatno poizvedbo; JWT v tej zasnovi ne pomeni odsotnosti dostopa do baze pri avtentikaciji.
- Žetona na strežniku ne moremo razveljaviti samo tako, da ga odjemalec pozabi; čas veljavnosti in varovanje skrivnosti sta zato del izvedbene konfiguracije.
