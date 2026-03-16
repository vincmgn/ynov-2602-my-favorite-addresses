import { getDistance } from "../src/utils/getDistance";

describe("getDistance", () => {
  const paris = { lat: 48.8566, lng: 2.3522 };
  const marseille = { lat: 43.2965, lng: 5.3698 };

  test("should return 0 when comparing the same point", () => {
    const distance = getDistance(paris, paris);
    expect(distance).toBe(0);
  });

  test("should calculate correct distance between Paris and Marseille", () => {
    const distance = getDistance(paris, marseille);
    expect(distance).toBeGreaterThan(600);
    expect(distance).toBeLessThan(700);
  });

  test("should be consistent (A to B == B to A)", () => {
    const distAB = getDistance(paris, marseille);
    const distBA = getDistance(marseille, paris);
    expect(distAB).toBeCloseTo(distBA);
  });
});
