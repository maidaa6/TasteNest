# TasteNest – uporabniške zgodbe

Dokument temelji na [funkcionalnostih in obsegu](02-funkcionalnosti-in-obseg.md), [podatkovnem modelu](03-podatkovni-model.md) in [arhitekturi](04-arhitektura-in-tehnoloski-sklad.md). Oznake F1–F14 ustrezajo oštevilčenim funkcionalnostim v dokumentu o obsegu.

Zgodbe US-01–US-13 pokrivajo MVP; US-14–US-20 opisujejo kasnejše nadgradnje. Nekdanja US-05 je razdeljena na komentiranje (US-05), ocenjevanje (US-06) in priljubljene (US-07). Nekdanje US-06–US-08 so zdaj US-08–US-10, nekdanje US-09–US-15 pa US-14–US-20. US-11–US-13 dopolnjujejo pokritost že določenih skrbniških opravil; ne uvajajo novih funkcionalnosti.

## Načela INVEST

Vsaka zgodba opisuje uporabniško vrednost in omejen, ocenljiv rezultat, ki ga je mogoče preveriti s 3–5 merili sprejemljivosti. Komentiranje, ocenjevanje in priljubljeni so neodvisne zgodbe: nobena ne zahteva izvedbe drugih dveh. Podrobnosti obrazcev in izvedbe ostajajo predmet dogovora, poslovna pravila pa določa obstoječa zasnova. Za ločeno preverjanje zgodb se lahko uporabijo vnaprej pripravljeni računi in recepti; predlogi glede na zalogo uporabljajo shrambo iz US-14.

Vloga »uporabnik« vključuje `USER` in `AUTHOR`, ki podeduje pravice uporabnika. Gost je neprijavljen obiskovalec. Skrbniška vloga `ADMIN` sama po sebi ne daje dostopa do tujih zasebnih načrtov in nakupovalnih seznamov. Merila veljajo tudi za neposredne zahteve API; skrivanje gumba samo po sebi ne omejuje dostopa.

## Uporabniške zgodbe

### US-01 – Registracija [MVP]

- **Povezana funkcionalnost:** F1 – Registracija [MVP]
- **Vloga:** Gost
- **Zgodba:** Kot gost želim ustvariti uporabniški račun, da lahko shranjujem recepte in načrtujem obroke.
- **Merila sprejemljivosti:**
  1. Registracija zahteva neprazno ime, e-naslov v veljavni obliki in geslo z najmanj 8 znaki; neveljaven vnos ne ustvari računa.
  2. Sistem zavrne e-naslov, ki je že povezan z računom.
  3. Ob uspešni registraciji nastane račun z vlogo `USER`, tudi če odjemalec pošlje vlogo `AUTHOR` ali `ADMIN`.
  4. Geslo se v podatkovni bazi shrani samo kot zgoščena vrednost; odgovori API ne vsebujejo niti gesla niti njegove zgoščene vrednosti.

### US-02 – Prijava in pravice [MVP]

- **Povezana funkcionalnost:** F1 – Prijava in pravice [MVP]
- **Vloga:** Registrirani uporabnik
- **Zgodba:** Kot registrirani uporabnik se želim prijaviti v aplikacijo, da lahko dostopam do svojih zasebnih podatkov.
- **Merila sprejemljivosti:**
  1. Prijava aktivnega računa s pravilnim e-naslovom in geslom vrne časovno omejen JWT; veljaven žeton omogoči dostop do lastnega načrta.
  2. Napačno geslo, neobstoječ e-naslov in neaktiven račun vrnejo enotno sporočilo o neuspešni prijavi ter ne izdajo žetona.
  3. Manjkajoč, potekel ali spremenjen JWT ne omogoči ustvarjanja načrta obrokov ali komentarja.
  4. Račun `USER` ne more objaviti recepta ali izvesti skrbniškega dejanja; backend zavrne tudi neposredno zahtevo API.
  5. JWT ostane v pomnilniku aplikacije; po ponovnem nalaganju strani je za zaščitena dejanja potrebna ponovna prijava.

### US-03 – Objavljanje in urejanje receptov [MVP]

- **Povezana funkcionalnost:** F2 – Objavljanje in urejanje receptov [MVP]
- **Vloga:** Avtor
- **Zgodba:** Kot avtor želim objaviti in urejati svoj recept, da lahko delim navodila za pripravo jedi.
- **Merila sprejemljivosti:**
  1. Objava zahteva neprazen naslov in postopek, obstoječo kategorijo, nenegativen celoštevilski čas priprave v minutah, pozitivno celo število izhodiščnih porcij in vsaj eno sestavino; avtor lahko vnese tudi opis.
  2. Vsaka sestavina obstaja v seznamu sestavin ter vsebuje pozitivno količino in enoto `g`, `kg`, `ml`, `l` ali `kos`; podvojena kombinacija sestavine in enote je zavrnjena.
  3. Objavljen recept je viden v javnem seznamu receptov.
  4. Avtor lahko uredi samo svoje recepte; poskus urejanja tujega recepta je zavrnjen.

### US-04 – Iskanje in filtriranje [MVP]

- **Povezana funkcionalnost:** F3 – Iskanje in filtriranje [MVP]
- **Vloga:** Gost ali uporabnik
- **Zgodba:** Kot obiskovalec želim poiskati recepte po nazivu in filtrih, da hitreje najdem primerno jed.
- **Merila sprejemljivosti:**
  1. Iskanje po nazivu vrne recepte z delnim ujemanjem, ne glede na velike/male črke.
  2. Filter sestavine vrne samo recepte, ki vsebujejo izbrano sestavino.
  3. Naziv, sestavina, kategorija in najdaljši čas priprave se lahko uporabijo hkrati; vsak rezultat izpolnjuje vse izbrane pogoje, vključno s časovno mejo.
  4. Seznam in javne podrobnosti so dostopni brez prijave ter prikazujejo samo recepte s statusom `PUBLISHED`.
  5. Če ni zadetkov, se prikaže sporočilo »Ni najdenih receptov«.

### US-05 – Komentiranje recepta [MVP]

- **Povezana funkcionalnost:** F4 – Interakcije z recepti: komentarji [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim komentirati objavljen recept, da lahko z drugimi delim svojo izkušnjo priprave.
- **Merila sprejemljivosti:**
  1. Prijavljen uporabnik lahko objavljenemu receptu doda komentar; shranjeni komentar je povezan z njegovim računom in izbranim receptom.
  2. Prazen komentar ali komentar, sestavljen samo iz presledkov, je zavrnjen in se ne shrani.
  3. Novi komentar je viden pri podrobnostih recepta skupaj z imenom uporabnika in časom oddaje; isti uporabnik lahko doda več komentarjev.
  4. Neprijavljena zahteva ali zahteva za komentiranje recepta s statusom `HIDDEN` je zavrnjena brez ustvarjenega komentarja.

### US-06 – Ocenjevanje recepta [MVP]

- **Povezana funkcionalnost:** F4 – Interakcije z recepti: ocene [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim oceniti objavljen recept, da lahko izrazim zadovoljstvo z jedjo.
- **Merila sprejemljivosti:**
  1. Prijavljen uporabnik lahko objavljenemu receptu odda celoštevilsko oceno od 1 do 5; vrednosti 0, 6 in 2,5 so zavrnjene.
  2. Za isti par uporabnik–recept obstaja največ ena ocena tudi ob ponovljeni zahtevi; oddaja 5 po prejšnji oceni 3 spremeni obstoječo oceno na 5.
  3. Pri podrobnostih recepta prijavljen uporabnik vidi svojo shranjeno oceno; njeno spreminjanje ne spremeni ocen drugih uporabnikov.
  4. Neprijavljena zahteva ali zahteva za ocenjevanje recepta s statusom `HIDDEN` je zavrnjena brez spremembe ocen.

### US-07 – Priljubljeni recepti [MVP]

- **Povezana funkcionalnost:** F4 – Interakcije z recepti: priljubljeni [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim dodati recept med priljubljene, da ga lahko pozneje hitro najdem.
- **Merila sprejemljivosti:**
  1. Dodajanje objavljenega recepta ustvari povezavo med prijavljenim uporabnikom in receptom; recept se prikaže na njegovem seznamu priljubljenih.
  2. Ponovno dodajanje istega recepta ne ustvari podvojene povezave ali podvojenega prikaza.
  3. Odstranitev iz priljubljenih odstrani samo uporabnikovo povezavo; recept ostane objavljen in priljubljeni drugih uporabnikov ostanejo nespremenjeni.
  4. Neprijavljen uporabnik ne more dodajati ali odstranjevati priljubljenih; uporabnik ne more spreminjati priljubljenih drugega računa.
  5. Umaknjenega recepta ni mogoče na novo dodati med priljubljene in ni prikazan kot dostopen objavljen recept na seznamu.

### US-08 – Tedenski načrt obrokov [MVP]

- **Povezana funkcionalnost:** F5 – Tedenski načrt obrokov [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim razporediti recepte v tedenski načrt, da imam pregled nad obroki za vsak dan.
- **Merila sprejemljivosti:**
  1. Uporabnik izbere teden, dan, vrsto obroka, objavljen recept in pozitivno celo število porcij; dan zunaj izbranega sedemdnevnega obdobja je zavrnjen.
  2. Dodani obrok se prikaže pri ustreznem dnevu in vrsti obroka; za istega uporabnika in ponedeljek začetka tedna se ne ustvari drugi načrt.
  3. Uporabnik lahko svoj načrtovani obrok odstrani ali spremeni.
  4. Drugi uporabnik, tudi administrator brez posebnega pooblastila, ne more brati ali spreminjati njegovega načrta.
  5. Če je recept naknadno umaknjen, obstoječi načrtovani obrok ostane shranjen; novega obroka s tem receptom ni mogoče dodati.

### US-09 – Nakupovalni seznam [MVP]

- **Povezana funkcionalnost:** F6 – Nakupovalni seznam [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim ustvariti nakupovalni seznam iz tedenskega načrta, da vem, katere sestavine moram kupiti.
- **Merila sprejemljivosti:**
  1. Sistem preračuna sestavine vseh veljavnih načrtovanih obrokov glede na porcije: 200 g testenin za 2 porciji pri izbiri 3 porcij ter dodatnih 150 g iz drugega obroka da eno postavko s 450 g testenin.
  2. Enake sestavine združi po `ingredient_id` in združljivi enoti: 1 kg in 250 g da 1250 g, 1 l in 250 ml da 1250 ml; količine v `kos`, `g` in `ml` ostanejo ločene.
  3. Lastnik lahko označi in odznači kupljeno postavko; drugi uporabniki, tudi administrator brez posebnega pooblastila, ne morejo brati ali spreminjati njegovega seznama.
  4. Sprememba načrta ohrani obstoječi seznam; ponovna generacija v eni transakciji zamenja postavke, posodobi čas generiranja in ponastavi oznake kupljenega. Ob napaki shranjevanja ostane prejšnji seznam nespremenjen.
  5. Pri generiranju sistem izpusti naknadno umaknjene recepte, uporabnika opozori, kateri recepti so izpuščeni, in ohrani obstoječe obroke v načrtu.

### US-10 – Prilagajanje porcij [MVP]

- **Povezana funkcionalnost:** F7 – Prilagajanje porcij [MVP]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim spremeniti število porcij na receptu, da dobim pravilne količine za svojo skupino.
- **Merila sprejemljivosti:**
  1. Za izbrano pozitivno celo število porcij se vsaka količina izračuna kot osnovna količina × izbrane porcije / osnovne porcije.
  2. Sprememba z 2 na 3 porcije takoj spremeni prikaz 200 g testenin v 300 g, merska enota pa ostane enaka.
  3. Vnos 0, negativnega ali necelega števila porcij je zavrnjen.
  4. Sprememba prikaza ne spremeni izvirnih količin v shranjenem receptu.

### US-11 – Upravljanje računov in vlog [MVP]

- **Povezava z obsegom:** F1 – Registracija, prijava in pravice; skrbniško upravljanje računov iz razdelka o vlogah.
- **Vloga:** Administrator
- **Zgodba:** Kot administrator želim upravljati vloge in aktivnost računov, da lahko dodelim avtorstvo in omejim dostop neaktivnim računom.
- **Merila sprejemljivosti:**
  1. Inicializacijski skript omogoči pripravo prvega računa `ADMIN`; javna registracija tega ne omogoča.
  2. Administrator lahko računu dodeli eno vlogo iz nabora `USER`, `AUTHOR`, `ADMIN`; druga vrednost je zavrnjena.
  3. Po spremembi vloge iz `AUTHOR` v `USER` račun ne more več objaviti ali urediti recepta, tudi s še veljavnim JWT.
  4. Administrator lahko račun deaktivira ali ponovno aktivira; neaktiven račun se ne more prijaviti, zavrnjene pa so tudi zaščitene zahteve z njegovim prej izdanim JWT.
  5. Zahteva računa `USER` ali `AUTHOR` za spreminjanje vlog ali aktivnosti je zavrnjena; ciljnega računa ne spremeni.

### US-12 – Upravljanje kategorij [MVP]

- **Povezava z obsegom:** Skrbniško upravljanje kategorij iz razdelka o vlogah; podpira F2 in F3.
- **Vloga:** Administrator
- **Zgodba:** Kot administrator želim urejati nabor kategorij, da lahko avtorji in obiskovalci dosledno razvrščajo recepte.
- **Merila sprejemljivosti:**
  1. Administrator lahko ustvari kategorijo z nepraznim imenom; novo kategorijo je mogoče izbrati pri objavi in filtriranju receptov.
  2. Prazno ime in ime, ki že pripada drugi kategoriji, sta zavrnjena brez podvojenega zapisa.
  3. Preimenovanje ohrani identifikator kategorije in povezave z recepti; pri receptih in filtrih se prikaže novo ime.
  4. Gost, `USER` in `AUTHOR` ne morejo ustvariti ali spremeniti kategorije niti z neposredno zahtevo API.

### US-13 – Moderiranje receptov in komentarjev [MVP]

- **Povezava z obsegom:** Skrbniško moderiranje iz razdelka o vlogah; podpira F2 in F4. Obravnava uporabniških prijav ostaja kasnejša nadgradnja F13.
- **Vloga:** Administrator
- **Zgodba:** Kot administrator želim umakniti neprimerno vsebino, da javni pregled receptov in komentarjev ostane uporaben.
- **Merila sprejemljivosti:**
  1. Umik recepta nastavi status `HIDDEN`; recept ni več dostopen v javnem seznamu, iskanju in javnih podrobnostih.
  2. Umik ohrani zapis recepta, njegovega avtorja ter obstoječe sklice iz načrtov in komentarjev; recept se fizično ne izbriše.
  3. Skritje komentarja nastavi `is_hidden`; komentar ostane shranjen, javni prikaz pa ga ne vključuje.
  4. Gost, `USER` in `AUTHOR` ne morejo izvesti skrbniškega umika recepta ali skritja komentarja.

### US-14 – Domača shramba [Kasneje]

- **Povezana funkcionalnost:** F8 – Domača shramba [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim voditi evidenco sestavin doma, da imam pregled nad zalogo.
- **Merila sprejemljivosti:**
  1. Uporabnik lahko doda sestavino s pozitivno količino in enoto iz dovoljenega nabora `g`, `kg`, `ml`, `l`, `kos`.
  2. Pri obstoječem vnosu lahko spremeni količino ali ga odstrani.
  3. Shramba prikazuje samo vnose prijavljenega uporabnika; branje in spreminjanje tuje shrambe je zavrnjeno.
  4. Vnos ničelne ali negativne količine ali nepodprte enote je zavrnjen brez spremembe shrambe.

### US-15 – Predlogi glede na zalogo [Kasneje]

- **Povezana funkcionalnost:** F9 – Predlogi glede na zalogo [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim videti recepte, razvrščene glede na sestavine doma, da lažje izberem jed iz razpoložljivih sestavin.
- **Merila sprejemljivosti:**
  1. Sistem primerja sestavine objavljenih receptov z uporabnikovo shrambo.
  2. Delež ujemanja izračuna kot število prisotnih različnih sestavin / število vseh različnih sestavin recepta.
  3. Recepti so razvrščeni po deležu ujemanja padajoče.
  4. Pri vsakem predlogu so prikazane manjkajoče sestavine.

### US-16 – Prehranske oznake in alergeni [Kasneje]

- **Povezana funkcionalnost:** F10 – Prehranske oznake in alergeni [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim filtrirati recepte po prehranskih oznakah in alergenih, da lažje izberem recepte po svojih preferencah.
- **Merila sprejemljivosti:**
  1. Avtor lahko svojemu receptu dodeli prehranske oznake in alergene iz vnaprej določenega nabora; vrednost zunaj nabora je zavrnjena.
  2. Uporabnik lahko izbere prehransko oznako in izključi označene alergene.
  3. Rezultati ne vključujejo receptov z izključenim označenim alergenom.
  4. Recept brez podatkov o alergenih je jasno označen kot »Podatki niso navedeni«.

### US-17 – Osebne zbirke [Kasneje]

- **Povezana funkcionalnost:** F11 – Osebne zbirke [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim ustvariti tematske zbirke receptov, da imam recepte urejene po svojih potrebah.
- **Merila sprejemljivosti:**
  1. Uporabnik lahko ustvari zbirko z nepraznim imenom; ime iz samih presledkov je zavrnjeno.
  2. V zbirko lahko doda ali iz nje odstrani objavljen recept.
  3. Isti recept je lahko v več zbirkah, v posamezni zbirki pa največ enkrat.
  4. Zbirke so dostopne samo njihovemu lastniku.

### US-18 – Javni profili avtorjev [Kasneje]

- **Povezana funkcionalnost:** F12 – Javni profili avtorjev [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim odpreti profil avtorja, da lahko odkrijem druge njegove recepte.
- **Merila sprejemljivosti:**
  1. Javni profil prikazuje prikazno ime avtorja.
  2. Na profilu so navedeni samo avtorjevi objavljeni recepti.
  3. Klik na recept odpre njegovo javno podrobnost.
  4. Zasebni e-naslov in osebni načrti avtorja niso prikazani.

### US-19 – Prijava neprimernih vsebin [Kasneje]

- **Povezana funkcionalnost:** F13 – Prijava neprimernih vsebin [Kasneje]
- **Vloga:** Uporabnik
- **Zgodba:** Kot uporabnik želim prijaviti neprimeren recept ali komentar, da lahko opozorim administratorja na sporno vsebino.
- **Merila sprejemljivosti:**
  1. Prijavljen uporabnik lahko odda prijavo za recept ali komentar z razlogom.
  2. Prijava se shrani s statusom OPEN in povezavo do prijavljene vsebine.
  3. Administrator lahko prijavo označi kot RESOLVED ali REJECTED.
  4. Običajen uporabnik ne more spreminjati statusa prijave.

### US-20 – Statistika receptov [Kasneje]

- **Povezana funkcionalnost:** F14 – Statistika receptov [Kasneje]
- **Vloga:** Avtor
- **Zgodba:** Kot avtor želim videti statistiko svojih receptov, da lahko spremljam njihovo uporabo.
- **Merila sprejemljivosti:**
  1. Za vsak avtorjev objavljeni recept se prikažeta število ocen in aritmetična sredina ocen; brez ocen je število 0, povprečje pa označeno kot »Ni ocen«.
  2. Prikaže se število uporabnikov, ki so recept dodali med priljubljene.
  3. Prikaže se število vključitev recepta v načrte obrokov kot agregat, brez podatkov o lastnikih načrtov.
  4. Avtor vidi statistiko samo svojih receptov.

## Pokritost funkcionalnosti in vlog

| Funkcionalnost oziroma obstoječe skrbniško opravilo | Zgodbe | Obseg |
|---|---|---|
| F1 – Registracija, prijava in pravice | US-01, US-02, US-11 | MVP |
| F2 – Objavljanje receptov | US-03 | MVP |
| F3 – Iskanje in filtriranje | US-04 | MVP |
| F4 – Komentarji, ocene in priljubljeni | US-05, US-06, US-07 | MVP |
| F5 – Tedenski načrt obrokov | US-08 | MVP |
| F6 – Generiranje nakupovalnega seznama | US-09 | MVP |
| F7 – Prilagajanje porcij | US-10 | MVP |
| Upravljanje kategorij | US-12 | MVP |
| Moderiranje receptov in komentarjev | US-13 | MVP |
| F8 – Domača shramba | US-14 | Kasneje |
| F9 – Predlogi glede na zalogo | US-15 | Kasneje |
| F10 – Prehranske oznake in alergeni | US-16 | Kasneje |
| F11 – Osebne zbirke receptov | US-17 | Kasneje |
| F12 – Javni profili avtorjev | US-18 | Kasneje |
| F13 – Prijavljanje neprimernih vsebin | US-19 | Kasneje |
| F14 – Statistika receptov | US-20 | Kasneje |
