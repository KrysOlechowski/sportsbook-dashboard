const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ONE_X_TWO_LABELS: Record<number, string> = {
  0: "1",
  1: "X",
  2: "2",
};

export const formatOdds = (value: number): string => value.toFixed(2);

export const formatEventStart = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown start time";
  }

  return DATE_TIME_FORMATTER.format(date);
};

export const getOneXTwoLabel = (position: number, fallbackLabel: string): string =>
  ONE_X_TWO_LABELS[position] ?? fallbackLabel;
