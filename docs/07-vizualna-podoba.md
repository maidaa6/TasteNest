# TasteNest – vizualna podoba

Dokument opisuje vizualni sistem uporabniškega vmesnika. Postavitev zaslonov sledi žičnim modelom iz [06-wireframes.md](06-wireframes.md) (WF-01, WF-02); tu je določen končni videz.

## Smer

Topel uredniški slog, podoben kuharski reviji: svetlo krem ozadje, velike serifne naslove, mehke sence in veliko prostora. Vmesnik naj bo prijazen in berljiv, ne „aplikacijsko“ hladen.

## Gradniki sloga (design tokens)

Vse vrednosti so definirane kot spremenljivke CSS v `frontend/src/styles.css` (`:root`); komponente ne uporabljajo neposrednih barv.

| Skupina | Vrednosti |
|---|---|
| Ozadje | krem `#faf6f0`, površina bela, toplo siva obroba |
| Glavna barva | terakota `#c2562f` (gumbi, povezave, poudarki), temnejša različica za hover |
| Dodatna barva | olivno zelena (oznake kategorij, uspešna stanja) |
| Besedilo | temno rjava, umirjena siva za pomožno besedilo; kontrast vsaj 4.5 : 1 |
| Pisave | **Fraunces** (naslovi), **Inter** (besedilo); paketa `@fontsource`, brez zunanjih CDN |
| Oblika | zaobljeni robovi 10 px (polja), 16–20 px (kartice), polni krogi za čipe |
| Sence | dve ravni: mirujoča in dvignjena (hover) |
| Gibanje | kratki prehodi 150–250 ms, nežen prikaz vsebine; izklopljeno pri `prefers-reduced-motion` |

## Zasloni

- **Glava:** lepljiva, prosojno zamegljeno ozadje, logotip (ikona gnezda in napis), povezave; prijavljen uporabnik ima krog z začetnico in ime.
- **Pregled receptov (WF-01):** uvodni naslov „Kaj bomo kuhali danes?“, večje iskalno polje z gumbom, kategorije kot klikljivi čipi (izbrani je poudarjen), filtra sestavine in časa priprave. Mreža kartic: slika z oznako kategorije, naslov, čas in porcije z ikonama, kratek opis. Nalaganje prikazujejo skeleti, prazen rezultat ima ilustracijo in gumb za ponastavitev filtrov.
- **Podrobnosti recepta (WF-02):** velika slika, ob njej naslov, avtor, čas in porcije ter sestavine; spodaj postopek, razdeljen na oštevilčene korake. Dejanja za priljubljene in tedenski načrt se prikažejo šele z US-07 in US-08.
- **Prijava in registracija:** razdeljen zaslon, levo fotografija hrane z vabilom, desno obrazec; na telefonu samo obrazec.
- **Moji recepti, obrazec za recept, 404:** isti gradniki; obrazec je razdeljen v sekcije (osnovno, sestavine, postopek).

## Slike receptov

Podatkovni model slik nima (v MVP niso obvezne). Vmesnik zato izbere sliko po pravilu:

1. Za demo recepte iz seed skripte obstaja fotografija v `frontend/src/assets/recipes/`, povezana z naslovom recepta.
2. Vsi drugi recepti dobijo ilustracijo kategorije: barvni gradient in ikono SVG, določeno po kategoriji (privzeta ikona za neznano kategorijo).

Fotografije imajo brezplačno licenco; vir in licenca sta navedena v README.

## Dostopnost in odzivnost

- Postavitev deluje od širine telefona (360 px) naprej; mreža kartic se prilagaja številu stolpcev.
- Vsi interaktivni elementi imajo viden fokus (`:focus-visible`).
- Slike imajo opisno besedilo `alt`; ilustracije so dekorativne (`aria-hidden`).
- Besedila, vloge in oznake, na katere se opirajo testi, ostanejo nespremenjeni.
