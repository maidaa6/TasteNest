# TasteNest – funkcionalnosti in obseg

## Uporabniške vloge in omejitve
| Vloga | Dovoljenja | Omejitve |
|---|---|---|
| Uporabnik | Iskanje, filtriranje, komentiranje in ocenjevanje objavljenih receptov; priljubljeni recepti; lastni tedenski načrti in nakupovalni seznami | Ne objavlja receptov, ne spreminja tujih podatkov in ne moderira vsebin |
| Avtor | Vse pravice uporabnika; ustvarjanje, objavljanje in urejanje svojih receptov | Ne ureja tujih receptov in ne spreminja vlog |
| Administrator | Upravljanje računov, kategorij in moderiranje receptov/komentarjev | Ne pregleduje zasebnih načrtov in nakupovalnih seznamov drugih uporabnikov brez posebnega pooblastila; ne spreminja avtorstva |

En račun ima eno vlogo (`USER`, `AUTHOR`, `ADMIN`). Avtor podeduje pravice uporabnika. Uporabnik se registrira kot `USER`; povišanje v avtorja ali administratorja opravi administrator. Prvi administrator se ustvari z inicializacijskim skriptom.

## Predvidene funkcionalnosti (14)
1. **[MVP] Registracija, prijava in pravice:** uporabniški račun, prijava in omejitev dostopa po vlogah.
2. **[MVP] Objavljanje receptov:** avtor vnese postopek, kategorijo, izhodiščne porcije in sestavine s količinami; ureja svoje recepte.
3. **[MVP] Iskanje in filtriranje:** po nazivu, sestavini, kategoriji in najdaljšem času priprave; prikaz samo objavljenih receptov.
4. **[MVP] Interakcije z recepti:** komentarji, ocena od 1 do 5 (največ ena aktivna ocena na uporabnika in recept) ter dodajanje/odstranjevanje priljubljenih.
5. **[MVP] Tedenski načrt obrokov:** uporabnik razporedi recepte po dnevih, vrstah obroka in številu porcij.
6. **[MVP] Generiranje nakupovalnega seznama:** sistem združi sestavine načrtovanih obrokov, preračuna količine in omogoči označevanje kupljenih postavk.
7. **[MVP] Prilagajanje porcij:** prikaz preračunanih količin glede na izbrano število porcij, brez spremembe izvirnega recepta.
8. **[Kasneje] Domača shramba:** ročna evidenca razpoložljivih sestavin in količin.
9. **[Kasneje] Predlogi receptov glede na zalogo:** razvrščanje po deležu razpoložljivih sestavin.
10. **[Kasneje] Prehranske oznake in alergeni:** dodatni podatki in filtriranje receptov.
11. **[Kasneje] Osebne zbirke receptov:** več tematskih zbirk poleg priljubljenih.
12. **[Kasneje] Javni profili avtorjev:** seznam objavljenih receptov in osnovne informacije.
13. **[Kasneje] Prijavljanje neprimernih vsebin:** prijave in potek obravnave pri administratorju.
14. **[Kasneje] Statistika receptov:** agregirani podatki o ocenah, priljubljenosti in uporabi v načrtih.

MVP vsebuje šest vsebinsko specifičnih funkcionalnosti (2–7) in osnovno avtentikacijo (1). Običajno urejanje podatkov je podrejeno navedenim procesom.

## Osrednji delovni proces
1. Avtor objavi recept z izhodiščnim številom porcij in sestavinami.
2. Uporabnik poišče recept ter ga doda v svoj tedenski načrt za določen dan in obrok.
3. Uporabnik določi želeno število porcij.
4. Sistem izračuna `prilagojena_količina = izvirna_količina × želene_porcije / izvirne_porcije`.
5. Sistem združi postavke z istim `ingredient_id` in isto mersko enoto (ali enoto, ki jo zna varno pretvoriti), nato ustvari nakupovalni seznam.
6. Uporabnik označuje kupljene postavke; ob spremembi načrta lahko seznam ponovno generira.

## Poslovna pravila
- Izvirno in želeno število porcij morata biti pozitivni celi števili; količine sestavin morajo biti pozitivne.
- En recept lahko vsebuje več sestavin; v MVP je posamezna sestavina v receptu navedena največ enkrat za posamezno mersko enoto.
- Seštevajo se samo združljive količine. V MVP so dovoljene enote `g`, `kg`, `ml`, `l`, `kos`; `kg` se pretvori v `g`, `l` v `ml`; `kos` se ne pretvarja v maso ali prostornino.
- Ena oseba lahko posamezen recept označi kot priljubljen največ enkrat in mu poda največ eno oceno; komentarjev lahko poda več.
- Tedenski načrt in nakupovalni seznam sta zasebna lastniku.
- Načrtovani obroki se lahko sklicujejo samo na objavljene recepte; če je recept naknadno umaknjen, obstoječi načrt ostane shranjen, pri ponovnem generiranju seznama pa sistem uporabnika opozori in tak recept izpusti.
- Spremembe v načrtu ne spreminjajo že ustvarjenega nakupovalnega seznama; ponovna generacija ga v transakciji zamenja in ponastavi oznake kupljenih postavk.
- Vse pravice in lastništvo podatkov se preverjajo na backendu.

## Kasnejše nadgradnje (vsaj 5)
1. Domača shramba z ročnim beleženjem zalog.
2. Predlogi receptov glede na sestavine doma.
3. Podpora prehranskim oznakam in alergenom.
4. Osebne tematske zbirke receptov.
5. Javni profili avtorjev.
6. Prijave neprimernih vsebin z obravnavo.
7. Statistični pregled priljubljenosti receptov.

## Izven obsega (out of scope)
- Spletna prodaja živil, plačila in dostava.
- Uporaba generativne umetne inteligence za ustvarjanje receptov.
- Samodejno pridobivanje zalog iz trgovin ali pametnih naprav.
- Medicinsko oziroma dietetično svetovanje in preverjanje prehranske ustreznosti.
- Mobilna aplikacija za Android/iOS (predvidena je odzivna spletna aplikacija).
