# ADR-0004 – Prisma ORM za dostop do podatkov in migracije

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

Strežniški del mora preslikati [12 entitet](../03-podatkovni-model.md) v PostgreSQL, ponovljivo ustvariti relacije in omejitve ter izvajati več povezanih zapisov pri generiranju nakupovalnega seznama. Razvojni računalniki potrebujejo isto strukturo baze. [Arhitektura](../04-arhitektura-in-tehnoloski-sklad.md) že predvideva Prisma shemo in migracije znotraj `backend/prisma/`.

## Obravnavane alternative

- **Prisma ORM:** deklarativna shema, generirani odjemalec in migracije povežejo modele, kot sta `RecipeIngredient` in `PlannedMeal`, z uporabo v storitvah; dodana je odvisnost od generatorja in njegovih zmožnosti.
- **Neposredni SQL prek `pg`:** omogoča popoln nadzor nad povezovanjem in agregati, vendar bi morali posebej vzdrževati preslikavo rezultatov, migracijski postopek in ponavljajoče se poizvedbe za vseh 12 entitet.
- **Sequelize:** primerljiv ORM za Node.js z modeli in migracijami; ne prinaša projektne zahteve, ki bi utemeljila zamenjavo že izbrane Prisma sheme in načrtovanega odjemalca.

## Odločitev in utemeljitev

Ohranimo **Prisma ORM**. `backend/prisma/schema.prisma` opiše modele, relacije, indekse in sestavljene omejitve, migracije pa se hranijo v repozitoriju. Dostop prek generiranega odjemalca ostane v storitvah; kontrolerji ne podvajajo podatkovne logike. Generirani odjemalec ima informacije o modelih in tipih; v projektu JavaScript to podpira orodja, ne nadomesti pa preverjanja vhodov med izvajanjem.

Generiranje nakupovalnega seznama uporabi transakcijo: izbris prejšnjih postavk, ustvarjanje novih in posodobitev časa morajo uspeti skupaj. Količine se hranijo kot decimalne vrednosti; v storitvi je treba določiti tudi natančnost izračuna in prikaza. Pravilo »dan obroka je v izbranem tednu« in preverjanje lastništva nista prepuščena ORM.

Ob implementaciji je treba pregledati nastali SQL: če uporabljena različica Prisma katere zahtevane omejitve, na primer `CHECK`, ne izrazi v shemi, jo migracija doda z izrecnim SQL. Shema, migracije, konfiguracija in inicializacijski skript ostanejo vključeni v Git; `.env` in regenerirani odjemalec se izključijo.

### Posledice

#### Pozitivne

- Povezave receptov, sestavin in načrtov so opisane na enem mestu, zato je lažje slediti konceptualnemu modelu.
- Migracije omogočajo ponovitev sprememb strukture na razvojnih bazah in njihov pregled skupaj z dokumentacijo.
- Dostop do podatkov in transakcija nakupovalnega seznama uporabljata enoten odjemalec.

#### Negativne

- Spremembi sheme sledita ustrezna migracija in ponovna generacija odjemalca; neusklajene datoteke povzročijo napake pri izvajanju.
- Za posebne omejitve ali zahtevnejše poizvedbe je lahko potreben SQL; ORM ne odpravi potrebe po poznavanju PostgreSQL.
- Nepremišljeno nalaganje relacij lahko ustvari preveč poizvedb ali podatkov; storitve morajo izbrati samo polja in povezave, potrebne za posamezen zaslon ali izračun.
