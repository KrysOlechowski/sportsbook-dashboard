export type SelectionSnapshot = {
  selectedOddsSnapshot: number;
};

export const calculateTotalOdds = (selections: SelectionSnapshot[]): number => {
  if (selections.length === 0) {
    return 0;
  }

  return selections.reduce((product, selection) => {
    return product * selection.selectedOddsSnapshot;
  }, 1);
};

export const calculatePotentialWin = (
  selections: SelectionSnapshot[],
  stake: number,
): number => {
  return calculateTotalOdds(selections) * stake;
};
