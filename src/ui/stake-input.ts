export const formatStakeInputValue = (value: number): string =>
  Number.isFinite(value) && value > 0 ? String(value) : "";

export const normalizeStakeInputValue = (value: string): string =>
  value.replace(",", ".");

// Allow partial input (e.g. "12." or empty) while the user is typing.
export const isStakeInputValueValid = (value: string): boolean =>
  /^\d*\.?\d*$/.test(value);

export const parseStakeInputValue = (value: string): number | null => {
  if (value === "") {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};
