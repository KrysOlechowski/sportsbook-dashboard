import {
  formatStakeInputValue,
  isStakeInputValueValid,
  normalizeStakeInputValue,
  parseStakeInputValue,
} from "@/ui/stake-input";

describe("stake input helpers", () => {
  it("formats stake for display in controlled input", () => {
    expect(formatStakeInputValue(0)).toBe("");
    expect(formatStakeInputValue(-1)).toBe("");
    expect(formatStakeInputValue(12.5)).toBe("12.5");
  });

  it("normalizes comma decimal separator", () => {
    expect(normalizeStakeInputValue("12,5")).toBe("12.5");
  });

  it("validates allowed input pattern", () => {
    expect(isStakeInputValueValid("")).toBe(true);
    expect(isStakeInputValueValid("02")).toBe(true);
    expect(isStakeInputValueValid(".5")).toBe(true);
    expect(isStakeInputValueValid("10.25")).toBe(true);
    expect(isStakeInputValueValid("1..2")).toBe(false);
    expect(isStakeInputValueValid("abc")).toBe(false);
  });

  it("parses input value to stake", () => {
    expect(parseStakeInputValue("")).toBe(0);
    expect(parseStakeInputValue("02")).toBe(2);
    expect(parseStakeInputValue(".5")).toBe(0.5);
    expect(parseStakeInputValue("10.25")).toBe(10.25);
    expect(parseStakeInputValue("NaN")).toBeNull();
  });
});
