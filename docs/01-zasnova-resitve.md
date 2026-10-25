# TasteNest – zasnova rešitve

## Ime rešitve
**TasteNest** – spletna aplikacija za recepte in načrtovanje obrokov.

## Namen in problem
Recepti so pogosto razpršeni po različnih spletnih straneh, načrtovanje tedenskih obrokov in sestavljanje nakupovalnega seznama pa zahtevata ročno prepisovanje sestavin in preračunavanje količin. TasteNest združuje objavljanje in odkrivanje receptov, uporabniško skupnost ter načrtovanje obrokov z avtomatsko pripravo nakupovalnega seznama.

## Ciljni uporabniki
- **Uporabniki:** osebe, ki iščejo recepte, jih ocenjujejo, shranjujejo med priljubljene in načrtujejo obroke.
- **Avtorji receptov:** uporabniki, ki poleg običajne uporabe objavljajo lastne recepte.
- **Administratorji:** skrbniki, ki upravljajo račune in moderirajo vsebine.

## Delovanje rešitve
Obiskovalec lahko pregleduje javno objavljene recepte. Registrirani uporabnik lahko recepte komentira, oceni in shrani med priljubljene. Avtor vnese recept z naslovom, opisom, postopkom, časom priprave, številom porcij, kategorijo in seznamom sestavin z merskimi enotami in količinami. Objavljen recept je takoj viden; administrator ga lahko naknadno umakne.

Uporabnik v tedenski načrt izbere recepte, dan, vrsto obroka in želeno število porcij. Sistem glede na izvirno število porcij preračuna sestavine, združi enake sestavine z združljivimi enotami in pripravi nakupovalni seznam. Uporabnik lahko postavke označi kot kupljene. Seznam predstavlja posnetek stanja ob generiranju; ob spremembi načrta ga uporabnik ponovno ustvari.

## Meje prve različice
MVP vključuje osnovno skupnost receptov, tedenski načrt in nakupovalni seznam. Upravljanje domače zaloge, priporočanje receptov in napredna moderacija so predvideni za kasneje. Rešitev je dinamična spletna aplikacija s podatki v relacijski podatkovni bazi.
