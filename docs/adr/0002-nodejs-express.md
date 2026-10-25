# ADR-0002 – Node.js + Express za strežniški del

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

Backend mora preverjati vloge `USER`, `AUTHOR`, `ADMIN` in lastništvo zasebnih podatkov ter izvajati poslovna pravila iz [obsega projekta](../02-funkcionalnosti-in-obseg.md). Osrednji proces pridobi obroke in sestavine, preračuna porcije, pretvori združljive enote in v transakciji zamenja nakupovalni seznam. Za obseg vaj je predviden [modularni monolit](../04-arhitektura-in-tehnoloski-sklad.md), ki streže enemu spletnemu odjemalcu.

## Obravnavane alternative

- **Node.js + Express:** omogoča JavaScript na obeh straneh in sestavljanje obdelave HTTP iz usmerjevalnikov ter vmesne programske opreme; projekt mora sam določiti razporeditev modulov in validacijo.
- **Node.js + NestJS:** ponuja predpisano modularno strukturo in vbrizgavanje odvisnosti; za načrtovane module bi zahteval dodatne abstrakcije in konvencije ogrodja.
- **Python + Django REST Framework:** ponuja ORM, administracijske možnosti in pripravljene vzorce API; pomenil bi spremembo izbranega jezika backenda in dostopa do podatkov prek Prisma.

## Odločitev in utemeljitev

Ohranimo **Node.js + Express**. Usmerjevalniki določijo poti pod `/api`, kontrolerji pretvorijo vhod in izhod HTTP, vmesna programska oprema preveri identiteto in vhodne podatke, storitve pa izvedejo poslovna pravila in dostopajo do baze prek [Prisma](0004-prisma.md).

Izračun količin in pretvorbe `kg → g`, `l → ml` sodijo v storitev za nakupovalni seznam, da isti rezultat velja ne glede na odjemalca. Preverjanje lastništva mora biti izvedeno pred dostopom do načrta ali postavke; veljaven JWT sam še ne daje pravice do poljubnega vira. En proces API in ena baza zadoščata za predvideni obseg, zato ne uvajamo mikrostoritev ali ločenega sistema za sporočila.

### Posledice

#### Pozitivne

- Frontend in backend uporabljata JavaScript, zato ni potrebna uvedba drugega izvedbenega jezika.
- Izračun porcij in združevanje sestavin je mogoče preverjati z Vitest, pravice in odgovore HTTP pa z integracijskimi testi Supertest.
- Moduli za recepte, načrte in nakupovalne sezname ostanejo znotraj ene namestitve; transakcija ni razdeljena med storitve.

#### Negativne

- Express sam ne zagotovi dogovorjene strukture, validacije ali avtorizacije; ekipa mora dosledno uporabljati plasti in enotno obravnavo napak.
- Predolga sinhrona opravila bi zadrževala obdelavo drugih zahtev; izračun se zato omeji na izbrani tedenski načrt, morebitna prihodnja zahtevna opravila pa zahtevajo novo presojo.
- Preverjanje pravic v različnih modulih lahko postane nedosledno; skupna pravila za identiteto in vloge se izvajajo v skupni vmesni programski opremi, lastništvo pa ob dostopu do konkretnega vira.
