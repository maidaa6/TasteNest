# ADR-0003 – PostgreSQL za povezani podatkovni model

**Status:** Sprejeto v obstoječi zasnovi

**Datum zapisa:** 2026-10-25

## Kontekst in opis problema

[Podatkovni model TasteNest](../03-podatkovni-model.md) sestavlja 12 povezanih entitet. Recept vsebuje standardizirane sestavine prek `RecipeIngredient`, uporabniki z recepti povezujejo ocene in priljubljene, načrtovani obroki pa se sklicujejo na iste recepte. Pri generiranju seznama se podatki povežejo po poti `MealPlan → PlannedMeal → Recipe → RecipeIngredient → Ingredient` in rezultat zapiše v `ShoppingList` ter `ShoppingListItem`.

Izbira mora podpreti enoličnost ocen, priljubljenih in tedenskih načrtov, pozitivne količine ter zamenjavo celotnega nakupovalnega seznama brez delno shranjenega rezultata. Podatki niso zbirka med seboj neodvisnih dokumentov receptov.

## Obravnavane alternative

- **PostgreSQL:** relacijske tabele, tuji ključi, sestavljene omejitve enoličnosti, decimalne količine in transakcije neposredno ustrezajo zasnovanemu modelu.
- **MongoDB:** omogoča vgnezdene dokumente, reference, preverjanje sheme, unikatne indekse in transakcije med dokumenti. Samostojen dokument recepta s sestavinami bi bil izvedljiv, vendar je treba presoditi tudi povezave z uporabniki, načrti in skupnim katalogom sestavin.
- **MySQL:** prav tako ustrezna relacijska možnost; trenutni model ne izkazuje zahteve, zaradi katere bi bilo smiselno menjati že izbrani PostgreSQL in pripravljeno zasnovo dostopa prek Prisma.

## Odločitev in utemeljitev

Ohranimo **PostgreSQL**. Naslednja presoja izhaja iz konkretnih pravil TasteNest, ne iz trditve, da dokumentna baza ne podpira povezanih podatkov.

| Potreba TasteNest | Utemeljitev izbire PostgreSQL v primerjavi z MongoDB |
|---|---|
| Skupna identiteta sestavine | `Ingredient.id` ostane enoten v receptih in nakupovalnih postavkah. Vgnezdenje kopij sestavin v MongoDB bi zahtevalo usklajevanje kopij; uporaba referenc bi znova uvedla povezovanje dokumentov. |
| Veljavni sklici | Tuji ključi preprečijo zapis načrtovanega obroka za neobstoječ recept ali sestavine za neobstoječ katalog. Pri MongoDB bi veljavnost medsebojnih referenc dodatno zagotavljala aplikacija. |
| Ena ocena in en priljubljeni na uporabnika ter recept | `UNIQUE (user_id, recipe_id)` pri ocenah in sestavljeni ključ pri priljubljenih uveljavita pravilo tudi ob sočasnih zahtevah. MongoDB ima unikatne sestavljene indekse, zato sama enoličnost ni razlog za zavrnitev; odločilen je celoten relacijski model. |
| Izračun nakupovalnega seznama | Povezovanje obrokov, receptov in sestavin sledi obstoječim relacijam. Združevanje po `ingredient_id` in normalizirani enoti se opira na enoten katalog; pretvorbe in preračun porcij ostanejo v storitvenem sloju. |
| Celovita zamenjava seznama | Transakcija skupaj izbriše stare postavke, zapiše nove in posodobi `generated_at`; napaka ohrani prejšnje stanje. MongoDB omogoča večdokumentne transakcije, zato prednost PostgreSQL temelji na skladnosti celotne operacije z že relacijskimi podatki. |

PostgreSQL omogoča tudi `CHECK` omejitve za oceno 1–5 ter pozitivne količine in porcije. Datum obroka znotraj tedna in pravice lastnika se še vedno preverjajo v storitvenem sloju. Logični umik recepta (`HIDDEN`) ohrani zgodovinske sklice, nakupovalni seznam pa je nameren posnetek količin ob generiranju, ne kopija celotnega recepta.

Možnosti omejitev potrjuje [uradna dokumentacija PostgreSQL](https://www.postgresql.org/docs/18/ddl-constraints.html). MongoDB opisuje [vgnezdenje in reference](https://www.mongodb.com/docs/manual/data-modeling/) ter [transakcije](https://www.mongodb.com/docs/manual/core/transactions/). Sklep o primernosti za TasteNest je projektna presoja na podlagi zgornjega modela.

### Posledice

#### Pozitivne

- Baza varuje ključne povezave in preprečuje podvojene ocene, priljubljene ter načrte tudi ob napakah v aplikaciji.
- Delni nakupovalni seznam se ob neuspešni transakciji ne shrani.
- Normalizirani podatki omogočajo kasnejše agregate ocen in uporabe receptov brez spreminjanja osnovnih povezav.

#### Negativne

- Spremembe entitet zahtevajo načrtovane migracije; dodajanje shrambe ali alergenov ni samo dodajanje poljubnega polja dokumentu.
- Za lokalni razvoj je treba zagnati in nastaviti strežnik PostgreSQL, predvidoma prek Docker Compose.
- Relacijske poizvedbe in indekse je treba načrtovati glede na iskanje ter generiranje seznamov; izbira baze sama ne zagotovi učinkovitih poizvedb ali pravilnih pretvorb enot.
