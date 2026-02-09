# Audyt projektu: plan prac, architektura, wydajność i dobre praktyki

Data: 2026-02-09

## TL;DR

Projekt ma **dobrze opisaną docelową wizję** (SPEC/QA/ROADMAP), ale aktualny stan kodu jest na etapie bardzo wczesnym i **nie odzwierciedla dokumentacji README/SPEC/QA**. Największym problemem nie jest sam plan, tylko brak spójności między dokumentacją a implementacją.

## Co jest zaplanowane dobrze

1. **Jasna hierarchia dokumentów i źródeł prawdy** (README, SPEC, QA, ROADMAP + reguły priorytetów) — to bardzo dobry fundament pracy zespołowej.
2. **Dobre decyzje produktowo-techniczne w SPEC**:
   - jedna aktywna selekcja na event,
   - snapshot kursów vs aktualne kursy,
   - blokada „Place Bet” przy zmianie kursów,
   - lock/suspend podczas aktualizacji,
   - cele wydajnościowe (selektory per outcome).
3. **ROADMAP podzielony na etapy 0–4** oraz checklisty QA — właściwe podejście do iteracyjnej realizacji.

## Najważniejsze problemy (stan faktyczny)

### 1) Dokumentacja i README są niespójne z kodem

- README deklaruje gotowe Levels 1–4, live updates, Bet Slip, Zustand i optymalizacje renderu.
- W kodzie nie ma jeszcze tych elementów (brak store, brak komponentów sportsbookowych, brak logiki live odds, strona startowa Next.js).

**Wniosek:** obecny opis projektu jest „aspiracyjny”, nie „stan aktualny”. To utrudnia ocenę i onboardowanie.

### 2) ROADMAP ma checklistę, ale nie odzwierciedla realnego progresu

- Poza setupem większość punktów jest nadal niezaznaczona.
- Jednocześnie README sugeruje pełną implementację.

**Wniosek:** plan jest sensowny, ale zarządzanie statusem prac wymaga uporządkowania.

### 3) Ryzyko wydajnościowe i architektoniczne (na tym etapie)

- Wymagania wydajnościowe są poprawnie opisane, ale brak implementacji nie pozwala ich zweryfikować.
- Brak testów automatycznych dla logiki domenowej (odds, clamp/rounding, konflikty selekcji) zwiększy ryzyko regresji po wdrożeniu live updates.

## Ocena jakości planu

- **Plan prac (ROADMAP): 8/10** — struktura etapów i scope control są dobre.
- **Jakość architektury docelowej (SPEC): 8.5/10** — decyzje są dojrzałe i adekwatne do zadania.
- **Stan implementacji względem planu: 2/10** — obecnie projekt jest blisko szablonu startowego.
- **Spójność dokumentacja ↔ kod: 2/10** — największy obszar do natychmiastowej naprawy.

## Rekomendowane działania (kolejność)

1. **Natychmiast:** urealnić README (sekcja „Current status” + „In progress”), żeby nie deklarować nieistniejących funkcji.
2. **Natychmiast:** zsynchronizować ROADMAP z realnym statusem (zostawić checklistę, ale dodać datowany status sprintu).
3. **Sprint 1:** dowieźć Level 1 i Level 2 end-to-end (lista eventów + Bet Slip + reguły konfliktów/toggle).
4. **Sprint 2:** dodać Level 3 (symulacja live, lock/suspend, odds changed + accept all).
5. **Sprint 3:** wdrożyć Level 4 (selekcyjne subskrypcje, pomiar renderów, dowód profilera).
6. **Równolegle:** minimalne testy domenowe (odds helpers + reguły selekcji), żeby zabezpieczyć refaktory.

## Kryteria „Done” dla wiarygodnej wersji rekrutacyjnej

- README pokazuje tylko faktycznie działające funkcje.
- QA scenariusze 1–9 są ręcznie przejrzane i odhaczone.
- Co najmniej 3–5 testów jednostkowych logiki domenowej przechodzi lokalnie.
- Krótki dowód wydajności (np. notatka + screenshot z profilera) jest dodany do docs.

## Podsumowanie

Kierunek projektu jest dobry, ale obecny stan wymaga przede wszystkim **przywrócenia wiarygodności dokumentacji** oraz dowiezienia podstawowej implementacji zgodnie z ROADMAP. Najbardziej ryzykowny punkt na ten moment to nie wydajność runtime, tylko rozjazd między deklaracjami a rzeczywistym kodem.
