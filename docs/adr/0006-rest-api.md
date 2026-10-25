# ADR-0006 – REST API z JSON za komunikacijo

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

React mora iskati recepte, oddajati komentarje in ocene ter upravljati lastne načrte in nakupovalne postavke. Gre za razločne vire in nekaj vsebinskih operacij, predvsem generiranje seznama. [Obstoječa arhitektura](../04-arhitektura-in-tehnoloski-sklad.md#komunikacija-in-primer-procesa) predvideva HTTP z JSON pod `/api`; aplikacija ne zahteva sprotnega sodelovanja ali pretočnih posodobitev.

## Obravnavane alternative

- **REST API z JSON:** neposredno preslika recepte, komentarje in načrte v poti ter uporabi metode in statuse HTTP; za posamezen zaslon je včasih potrebnih več zahtev.
- **GraphQL:** odjemalcu omogoča izbiro podatkov več povezanih virov v eni zahtevi; dodal bi shemo, razreševalnike in preverjanje pravic na ravni posameznih polj oziroma povezav za obseg nekaj znanih zaslonov.
- **RPC prek HTTP:** jasno izrazi dejanja, kot je generiranje seznama; pri običajnem branju in urejanju receptov ter načrtov bi projekt moral posebej določiti še poimenovanje operacij in semantiko odgovorov.

## Odločitev in utemeljitev

Ohranimo **REST API z JSON pod `/api`**, ki ga kliče frontend prek `fetch`. Poti temeljijo na virih iz podatkovnega modela; preverjanje [JWT](0005-jwt-avtentikacija.md), vlog in lastništva ostane na strežniku.

| Namen v TasteNest | Primer zahteve | Pravilo |
|---|---|---|
| Iskanje in filtriranje | `GET /api/recipes` s poizvedbenimi parametri | Vrne samo objavljene recepte, skladne z vsemi izbranimi filtri. |
| Objava recepta | `POST /api/recipes` | Dovoljena avtorju; avtorstvo določi identiteta prijavljenega računa. |
| Komentiranje | `POST /api/recipes/:id/comments` | Ustvari nov komentar prijavljenega uporabnika na objavljenem receptu. |
| Oddaja ali sprememba ocene | `PUT /api/recipes/:id/rating` | Ponovljena enaka ocena ne ustvari dodatnega zapisa za isti par uporabnik–recept. |
| Branje lastnega tedna | `GET /api/meal-plans/:weekStart` | Vrne načrt prijavljenega uporabnika, ne poljubnega računa. |
| Generiranje seznama | `POST /api/meal-plans/:weekStart/shopping-list/generate` | Izvede preračun in transakcijsko zamenjavo seznama. |
| Označevanje kupljenega | `PATCH /api/shopping-list-items/:id` | Spremeni oznako samo na lastnikovi postavki. |

Generiranje je izrecna operacija `POST`, ker spreminja shranjeni posnetek in ponastavi oznake kupljenega; ne izvaja se ob navadnem branju načrta. Primeri ne predstavljajo celotnega seznama poti. Pri implementaciji se dopolnijo preostala dejanja, kot so odstranjevanje priljubljenih, urejanje obrokov in skrbniške operacije, brez spremembe dovoljenj.

API dosledno uporablja statuse HTTP: `201` za ustvarjen vir, `400` za neveljaven vhod, `401` za neveljavno ali manjkajočo avtentikacijo ter `403` za prepovedano dejanje. Neobstoječi ali javnosti skriti recept vrne `404`; pri zasebnih virih odgovor ne sme razkriti podatkov drugega lastnika. Napake imajo enotno obliko JSON in ne razkrivajo gesel, žetonov ali podrobnosti baze.

### Posledice

#### Pozitivne

- Poti sledijo uporabniškim procesom in jih je mogoče neposredno preveriti z integracijskimi testi Supertest.
- `PUT` za lastno oceno in unikatna omejitev v bazi skupaj podpreta največ eno oceno za isti recept in uporabnika.
- Izrecno generiranje ohrani pravilo, da sprememba načrta sama ne prepiše obstoječega nakupovalnega seznama.

#### Negativne

- Obliko podatkov določajo odgovori API; za prikaz recepta in zasebnega načrta lahko frontend potrebuje več zahtev.
- Ekipa mora ročno uskladiti imena polj, validacijo, statuse napak in dovoljene spremembe med odjemalcem in strežnikom.
- Ponovitev zahteve za generiranje lahko ponovno ponastavi oznake kupljenega; vmesnik mora med izvajanjem preprečiti nenamerno večkratno sprožitev in prikazati rezultat zahteve.
