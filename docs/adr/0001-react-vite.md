# ADR-0001 – React + Vite za uporabniški vmesnik

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

TasteNest potrebuje odzivni vmesnik za iskanje receptov, podrobnosti s spreminjanjem porcij ter tedenski načrt z nakupovalnim seznamom. Izbira filtrov, preračun prikazanih sestavin in označevanje kupljenega zahtevajo posodabljanje posameznih delov zaslona. [Arhitektura](../04-arhitektura-in-tehnoloski-sklad.md) že predvideva ločen REST API, [žični modeli](../06-wireframes.md) pa tri osrednje zaslone.

## Obravnavane alternative

- **React + Vite:** komponente in stanje za ponavljajoče se kartice receptov, filtre, urejevalnik obroka in nakupovalne postavke; usmerjanje in klice API mora projekt urediti posebej.
- **Vue + Vite:** primerljiva možnost za iste zaslone z reaktivnimi predlogami; glede na že izbrano zasnovo ne rešuje dodatne zahteve, ki bi utemeljila menjavo ogrodja.
- **Next.js:** omogoča tudi strežniško izrisovanje javnih receptov; ob ločenem Express API bi za trenutni obseg uvedel dodatne odločitve o razmejitvi strežniškega dela in gostovanju.

## Odločitev in utemeljitev

Ohranimo **React + Vite**. Strani sestavimo iz komponent za kartico recepta, filtre, seznam sestavin, načrtovani obrok in nakupovalno postavko. React upravlja trenutno izbiro porcij in lokalno stanje obrazcev, klici `fetch` pa so zbrani v `frontend/src/services/`. Vite uporabljamo za razvojni strežnik in pripravo gradnje.

To neposredno podpira WF-01–WF-03 in ohrani en frontend brez dodatne strežniške plasti za izrisovanje. Avtoritativni izračun nakupovalnega seznama, preverjanje dovoljenj in podatkov ostanejo na backendu; sprememba porcij v prikazu ne spreminja izvirnega recepta. V frontend se prenese le javni naslov API, nikoli `DATABASE_URL` ali skrivnost JWT.

### Posledice

#### Pozitivne

- Ista komponenta recepta se lahko uporabi v rezultatih iskanja in priljubljenih, prikaz nakupovalne postavke pa vključuje označevanje kupljenega.
- Spreminjanje porcij in filtrov lahko posodobi ustrezni del zaslona brez ponovnega nalaganja celotne strani.
- Meja med prikazom in poslovnimi pravili ostane jasna: frontend nima dostopa do baze.

#### Negativne

- Ročno je treba urediti usmerjanje, stanje prijave ter prikaz nalaganja in napak pri asinhronih zahtevah.
- Pretežno odjemalski izris javnih receptov ima omejitve pri indeksiranju in predogledih povezav; strežniško izrisovanje bi zahtevalo novo presojo, če postane zahteva projekta.
- Vite pripravi frontend, ne pa tudi API in podatkovne baze; pri lokalnem razvoju je treba uskladiti naslove in CORS.
