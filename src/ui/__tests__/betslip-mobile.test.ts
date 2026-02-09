import { getMobileBetSlipToggleLabel } from "@/ui/betslip-mobile";

describe("getMobileBetSlipToggleLabel", () => {
  it("shows base label with no selections", () => {
    expect(getMobileBetSlipToggleLabel(0)).toBe("Bet Slip");
  });

  it("shows selection count when there are picks", () => {
    expect(getMobileBetSlipToggleLabel(3)).toBe("Bet Slip (3)");
  });
});
