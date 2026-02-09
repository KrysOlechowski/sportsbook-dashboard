export const getMobileBetSlipToggleLabel = (selectionCount: number): string => {
  const suffix = selectionCount > 0 ? ` (${selectionCount})` : "";
  return `Bet Slip${suffix}`;
};
