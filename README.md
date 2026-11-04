# TasteNest

TasteNest je odzivna spletna aplikacija za objavljanje in odkrivanje receptov ter načrtovanje obrokov. Povezuje recepte, tedenski načrt in samodejno pripravo nakupovalnega seznama, da uporabniku ni treba ročno prepisovati sestavin in preračunavati količin.

Repozitorij vsebuje zasnovo iz 3. naloge RIRS in implementacijo MVP, ki nastaja v 4. nalogi. Razvoj poteka po Issues in Pull Requestih, napredek pa se spremlja na GitHub Project boardu.

## Uporabniške vloge

| Vloga | Glavne možnosti |
|---|---|
| Gost | Pregled objavljenih receptov, iskanje in filtriranje, registracija in prijava. |
| Uporabnik (`USER`) | Komentiranje, ocenjevanje, priljubljeni recepti, lastni tedenski načrti in nakupovalni seznami. |
| Avtor (`AUTHOR`) | Vse pravice uporabnika ter objavljanje in urejanje svojih receptov. |
| Administrator (`ADMIN`) | Upravljanje računov, vlog in kategorij ter moderiranje receptov in komentarjev. |

Račun ima eno vlogo; registracija ustvari `USER`, povišanje opravi administrator, prvi administrator pa se pripravi z inicializacijskim skriptom. Načrti in nakupovalni seznami so zasebni lastniku; administrator do tujih podatkov nima dostopa brez posebnega pooblastila.

## Glavne funkcionalnosti MVP

- Registracija, prijava ter preverjanje vlog in lastništva podatkov na backendu.
- Objava receptov s postopkom, kategorijo, časom priprave, porcijami in sestavinami s količinami ter urejanje lastnih receptov.
- Iskanje po nazivu in filtriranje po sestavini, kategoriji in najdaljšem času priprave.
- Komentarji, ocene od 1 do 5 in dodajanje ali odstranjevanje priljubljenih receptov.
- Zasebni tedenski načrt z izbiro dneva, vrste obroka in želenega števila porcij.
- Prilagajanje količin glede na porcije ter nakupovalni seznam z združevanjem sestavin in označevanjem kupljenega.
- Skrbniško upravljanje računov in kategorij ter umik neprimernih vsebin.

Nakupovalni seznam je posnetek načrta ob generiranju. Spremembe načrta zahtevajo ponovno generacijo, ki zamenja postavke in ponastavi oznake kupljenega. Sistem pretvori `kg` v `g` in `l` v `ml`; kosov ne pretvarja v maso ali prostornino.

Domača shramba, predlogi glede na zalogo, prehranske oznake in alergeni, osebne zbirke, javni profili, prijave vsebin ter statistika so kasnejše nadgradnje, opisane v [obsegu projekta](docs/02-funkcionalnosti-in-obseg.md).

## Tehnološki sklad

Zasnova uporablja modularni monolit s tremi plastmi: frontend → REST API → podatkovna baza.

| Del | Predvidena tehnologija |
|---|---|
| Uporabniški vmesnik | React + Vite, klici API prek `fetch` |
| Strežniški del | Node.js + Express, REST API z JSON pod `/api` |
| Podatkovna baza | PostgreSQL |
| Dostop do podatkov in migracije | Prisma ORM |
| Avtentikacija | Kratkoživ JWT v pomnilniku aplikacije; zgoščevanje gesel z `bcrypt` |
| Avtorizacija | Preverjanje vlog (RBAC), aktivnosti računa in lastništva podatkov |
| Lokalni razvoj | Node.js, npm in Docker Compose za podatkovno bazo |
| Testiranje | Vitest in Supertest |

## Dokumentacija

| Dokument | Vsebina |
|---|---|
| [01 – Zasnova rešitve](docs/01-zasnova-resitve.md) | Namen, ciljni uporabniki in meje prve različice |
| [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md) | Vloge, MVP, poslovna pravila in kasnejše nadgradnje |
| [03 – Podatkovni model](docs/03-podatkovni-model.md) | Dvanajst povezanih entitet, ER-diagram in omejitve |
| [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md) | Plasti, komunikacija in predvideni lokalni zagon |
| [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md) | Zgodbe, merila sprejemljivosti in pokritost funkcionalnosti |
| [06 – Žični modeli](docs/06-wireframes.md) | WF-01, WF-02 in WF-03 v PNG ter izvirniki SVG |

### Arhitekturne odločitve (ADR)

Zapisi utemeljujejo že izbrano zasnovo, obravnavane alternative in posledice odločitev.

- [Predloga ADR po minimalni obliki MADR](docs/adr/adr-template.md)
- [ADR-0001 – React + Vite](docs/adr/0001-react-vite.md)
- [ADR-0002 – Node.js + Express](docs/adr/0002-nodejs-express.md)
- [ADR-0003 – PostgreSQL](docs/adr/0003-postgresql.md)
- [ADR-0004 – Prisma ORM](docs/adr/0004-prisma.md)
- [ADR-0005 – Avtentikacija z JWT](docs/adr/0005-jwt-avtentikacija.md)
- [ADR-0006 – REST API](docs/adr/0006-rest-api.md)

## Predvidena struktura projekta

Spodnja struktura vključuje načrtovane izvedbene datoteke; trenutno obstajajo dokumentacija, README, `.gitignore` ter prazni mapi `frontend/` in `backend/` z datotekama `.gitkeep`.

```text
TasteNest/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── 01-zasnova-resitve.md
│   ├── 02-funkcionalnosti-in-obseg.md
│   ├── 03-podatkovni-model.md
│   ├── 04-arhitektura-in-tehnoloski-sklad.md
│   ├── 05-uporabniske-zgodbe.md
│   ├── 06-wireframes.md
│   ├── wireframes/                 # Izvirniki SVG in WF-01–WF-03 v PNG
│   └── adr/                        # Predloga in oštevilčene odločitve
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Lokalni zagon

### Predpogoji

- Node.js 22 ali novejši in npm
- Docker z Docker Compose

| Storitev | Naslov |
|---|---|
| API | `http://localhost:3000/api` |
| PostgreSQL | `localhost:5432` (baza `tastenest`, testna baza `tastenest_test`) |

### 1. Podatkovna baza

```bash
docker compose up -d
```

Ob prvem zagonu vsebnik ustvari tudi testno bazo `tastenest_test` (skripta v `docker/postgres-init/`). Če je volumen že obstajal pred to skripto, ga je treba ponovno ustvariti z `docker compose down -v`.

Če so vrata 5432 že zasedena (npr. lokalno nameščen PostgreSQL), v korenu projekta ustvarite `.env` z `DB_PORT=5433` in enaka vrata uporabite v `DATABASE_URL` in `TEST_DATABASE_URL` v `backend/.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env    # nastavite JWT_SECRET in ADMIN_PASSWORD
npm install             # ustvari tudi Prisma Client
npm run db:migrate      # uveljavi migracije v bazi tastenest
npm run db:seed         # administrator, kategorije, sestavine in demo podatki
npm run dev
```

Preverjanje: `curl http://localhost:3000/api/health` vrne `{"status":"ok"}`.

| Skripta | Namen |
|---|---|
| `npm run db:migrate` | Ustvari in uveljavi migracije med razvojem |
| `npm run db:deploy` | Uveljavi obstoječe migracije brez ustvarjanja novih |
| `npm run db:seed` | Idempotentno napolni bazo z začetnimi podatki |
| `npm run db:reset` | Pobriše bazo, ponovno uveljavi migracije in zažene seed |

### Začetni računi

Prvi administrator se ustvari samo s seed skripto iz `ADMIN_EMAIL` in `ADMIN_PASSWORD` v `backend/.env`. Seed ustvari še demo račune za lokalni razvoj (izklop: `SEED_DEMO_DATA=false`):

| Vloga | E-naslov | Geslo |
|---|---|---|
| `AUTHOR` | `avtor@tastenest.local` | `avtor1234` |
| `USER` | `uporabnik@tastenest.local` | `uporabnik1234` |

### Testi

```bash
cd backend
npm test
```

Integracijski testi uporabljajo bazo iz `TEST_DATABASE_URL` (`tastenest_test`), pred zagonom nanjo uveljavijo migracije in jo med testi praznijo. Testi se samodejno izvedejo tudi na vsakem Pull Requestu (GitHub Actions, `.github/workflows/ci.yml`).

`.env` in skrivnosti se ne vključujejo v Git; vzorčne datoteke `.env.example`, shema Prisma in migracije se vključujejo.
