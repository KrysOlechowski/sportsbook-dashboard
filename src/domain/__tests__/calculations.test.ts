import {
  calculatePotentialWin,
  calculateTotalOdds,
} from "@/domain/calculations";

describe("domain calculations", () => {
  it("calculates total odds as product of selected odds snapshots", () => {
    const totalOdds = calculateTotalOdds([
      { selectedOddsSnapshot: 1.5 },
      { selectedOddsSnapshot: 2.0 },
      { selectedOddsSnapshot: 3.0 },
    ]);

    expect(totalOdds).toBe(9);
  });

  it("calculates potential win as total odds multiplied by stake", () => {
    const potentialWin = calculatePotentialWin(
      [{ selectedOddsSnapshot: 1.8 }, { selectedOddsSnapshot: 2.5 }],
      10,
    );

    expect(potentialWin).toBe(45);
  });

  it("returns zero totals for empty slip to match UI empty-state defaults", () => {
    expect(calculateTotalOdds([])).toBe(0);
    expect(calculatePotentialWin([], 25)).toBe(0);
  });
});
