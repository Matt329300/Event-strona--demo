# Event — strona

Makieta strony eventowej (klub / imprezy). Ciemny motyw, czerwony akcent,
wideo w tle. Zbudowana na czystym HTML/CSS/JS — bez frameworków i bez kroku
budowania.

## Struktura

```
index.html                 # strona główna: slider + nadchodzące wydarzenia
wydarzenia.html            # lista wszystkich wydarzeń
rezerwacje.html            # rezerwacje online (przekierowania do biletomatu)
event-page-standalone.html # wersja jednoplikowa (widoki przełączane hashem) — do udostępniania
assets/
  css/styles.css           # cały styl (motyw sterowany zmienną --accent)
  js/main.js               # slider, menu mobilne, modal, formularze demo, tło-wideo
  img/placeholder.svg      # czarne pole z białym X (w miejscu zdjęć i logo)
  video/hero-crowd.mp4     # wideo w tle całej strony
```

## Uruchomienie lokalnie

Dowolny statyczny serwer, np.:

```bash
npx serve .
```

albo po prostu otwórz `index.html` w przeglądarce.

## Do podmiany (oznaczone `PLACEHOLDER` w kodzie)

- nazwa marki „EVENT." — `<title>`, nagłówek, stopka
- `assets/img/placeholder.svg` → realne grafiki (16:9 slider, 4:5 karty) i logo
- przyciski „Kup bilet" / „Zarezerwuj" (`href="#"`) → linki do biletomatu
- dane wydarzeń, dane kontaktowe, linki social + regulamin / polityka prywatności
- formularz newslettera jest demonstracyjny — podłącz Mailchimp / własny endpoint
