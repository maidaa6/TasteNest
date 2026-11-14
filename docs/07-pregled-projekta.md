# Pregled prevzetega projekta – TasteNest

## 1. Pregled projekta

TasteNest je spletna aplikacija za objavljanje, iskanje in organizacijo kuharskih receptov. Projekt uporablja React in Vite za frontend, Node.js z Express za backend ter PostgreSQL s Prisma ORM za podatkovno bazo.

Projekt sem uspešno zagnal v lokalnem okolju. Preveril sem delovanje podatkovne baze, backenda, uporabniške prijave ter osnovnih funkcionalnosti aplikacije. Pri pregledu sem upošteval dokumentacijo projekta in dejansko implementacijo.

## 2. Pregled implementiranih funkcionalnosti MVP

V dokumentaciji `02-funkcionalnosti-in-obseg.md` je predvidenih sedem funkcionalnosti MVP.

| Funkcionalnost | Stanje | Ugotovitev |
|---|---|---|
| Registracija, prijava in pravice | Delno preverjeno | Prijava deluje, dostop do ustvarjanja receptov pa je omejen na avtorje. |
| Objavljanje receptov | Implementirano | Avtor lahko ustvari in ureja svoje recepte, določi kategorijo, postopek, porcije in sestavine. |
| Iskanje in filtriranje | Implementirano | Deluje iskanje po nazivu ter filtriranje po sestavini, kategoriji in najdaljšem času priprave. |
| Interakcije z recepti | Ni implementirano | Komentiranje, ocenjevanje in dodajanje med priljubljene niso omogočeni. |
| Tedenski načrt obrokov | Ni implementirano | Uporabnik ne more razporejati receptov v tedenski načrt. |
| Generiranje nakupovalnega seznama | Ni implementirano | Generiranje seznama iz načrtovanih obrokov ni omogočeno. |
| Prilagajanje porcij | Ni implementirano | Uporabnik ne more spreminjati števila porcij in samodejno preračunati količin sestavin. |

Osnovne funkcionalnosti za delo z recepti so implementirane, vendar aplikacija ne omogoča celotnega predvidenega procesa od izbire receptov do tedenskega načrtovanja in priprave nakupovalnega seznama.

## 3. Pregled petih uporabniških zgodb

Na podlagi dokumenta `05-uporabniske-zgodbe.md` sem pregledal pet uporabniških zgodb.

| Uporabniška zgodba | Stanje | Ugotovitev |
|---|---|---|
| US-02 – Prijava in pravice | Delno izpolnjena | Prijava deluje in uporabnik z vlogo USER ne more ustvarjati receptov. |
| US-03 – Objavljanje in urejanje receptov | Delno preverjena | Ustvarjanje in urejanje receptov sta omogočena. |
| US-04 – Iskanje in filtriranje | Pretežno izpolnjena | Iskanje in predvideni filtri delujejo. Vseh meril sprejemljivosti nisem posebej testiral. |
| US-05 – Komentiranje recepta | Ni izpolnjena | Aplikacija ne omogoča dodajanja ali prikazovanja komentarjev, prav tako ni ustreznih API končnih točk. |
| US-08 – Tedenski načrt obrokov | Ni izpolnjena | Funkcionalnost načrtovanja obrokov ni implementirana v uporabniškem vmesniku ali API-ju. |

Pregled kaže, da del uporabniških zgodb ni izpolnjen, nekatere implementirane funkcionalnosti pa zahtevajo dodatno testiranje posameznih meril sprejemljivosti.

## 4. Dodatne ugotovitve

Pri pregledu sem ugotovil tudi, da aplikacija ne omogoča brisanja receptov, nalaganja lastnih slik ter upravljanja uporabniških vlog prek uporabniškega vmesnika.

Brisanje receptov in nalaganje slik nista izrecno zahtevana med osnovnimi merili uporabniške zgodbe US-03, zato ju obravnavam kot možnosti za nadaljnjo nadgradnjo. Upravljanje uporabniških vlog pa je predvideno v dokumentaciji projekta.

## 5. Zaključek

Projekt TasteNest je mogoče uspešno zagnati v lokalnem okolju, osnovne funkcionalnosti za prijavo, objavljanje in iskanje receptov pa delujejo.

Kljub temu projekt še ne izpolnjuje vseh zahtev MVP. Manjkajo predvsem interakcije z recepti, tedensko načrtovanje obrokov, generiranje nakupovalnega seznama in prilagajanje porcij.

Za popolno izpolnitev predvidenega MVP bi bilo treba implementirati manjkajoče funkcionalnosti in dodatno preveriti merila sprejemljivosti že obstoječih uporabniških zgodb.