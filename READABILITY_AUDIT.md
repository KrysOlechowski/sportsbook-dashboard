# Audyt czytelności projektu (onboarding + jakość kodu)

## Kontekst
Audyt wykonany pod kątem:
- szybkości wejścia nowego developera do projektu,
- spójności architektury i nazewnictwa,
- sygnałów „seniorowego” podejścia vs. „zlepek kodu AI”.

## Ocena ogólna
**Werdykt: projekt wygląda na spójnie zaprojektowany i utrzymywany.**
Nowy programista powinien relatywnie szybko zrozumieć strukturę i przepływy. Kod ma wyraźne granice domena/store/UI, jest testowany i opisany.

## Co działa bardzo dobrze
1. **Czytelna architektura warstwowa**
   - `src/domain` zawiera logikę biznesową bez zależności od React.
   - `src/store` jest pojedynczą granicą stanu (Zustand).
   - `src/ui` skupia prezentację i interakcję.

2. **Dobry onboarding przez dokumentację**
   - README opisuje zakres, zachowania, strukturę i komendy uruchomienia.
   - Specyfikacja i QA dają czytelny kontrakt zachowania.

3. **Nazewnictwo jest w większości domenowe i precyzyjne**
   - Dobre przykłady: `selectionByEventId`, `selectedOddsSnapshot`, `oneXTwoOutcomeIdsByEventId`, `applyOddsUpdates`, `acceptAllChanges`.

4. **Kod nie wygląda jak przypadkowy zlepek**
   - Widać konsekwencję wzorców (mapy po ID, selektory, memoizacja, małe helpery).
   - Komentarze są oszczędne i merytoryczne.

5. **Jakość inżynierska i testy**
   - Testy obejmują domenę, store i kluczowe flow UI.
   - Obecność testów regresyjnych wzmacnia wiarygodność rozwiązania.

## Miejsca do poprawy (czytelność dla nowej osoby)
1. **Duży komponent `BetSlip`**
   - Plik ma dużo odpowiedzialności (render, walidacja stake, timery, akcje).
   - Warto rozważyć lekkie rozbicie na mniejsze komponenty/hooki lokalne (bez zmiany zachowania).

2. **Lokalne konwencje nazewnictwa można jeszcze ujednolicić**
   - Występuje miks krótszych i długich nazw, zwykle sensowny, ale można doprecyzować standard (np. kiedy używać `nextXxxById` vs. `updatedXxxById`).

3. **Brak krótkiego „onboarding map” dla nowej osoby**
   - Przydałby się 1 plik typu „Start here” z:
     - kolejnością czytania plików,
     - najważniejszymi przepływami (`selectOutcome`, live ticker, `acceptAllChanges`),
     - typowymi pułapkami (lock/pulse/odds changed).

## Ocena końcowa
- **Czy nowy programista będzie wiedział, jak się poruszać?**
  - **Tak, w dużej mierze tak** (dobra struktura + README + testy).
- **Czy kod wygląda na doświadczony, a nie AI-zlepek?**
  - **Tak, raczej tak** — szczególnie przez spójną architekturę, kontrolę stanu i sensowne testy.
- **Czy nazwy zmiennych są czytelne?**
  - **Przeważnie tak**; nazewnictwo jest domenowe i opisowe, z niewielką przestrzenią do doprecyzowania konwencji.

## Szybkie rekomendacje (bez przepisywania projektu)
1. Dodać `docs/ONBOARDING.md` (max 1–2 strony) z mapą projektu i „happy path” debugowania.
2. Podzielić `BetSlip` na 2–3 mniejsze jednostki (np. `BetSlipList`, `BetSlipTotals`, `useBetSlipActions`).
3. Dopisać mini sekcję w README: „How to modify safely” (co ruszać dla store/domain/ui).
