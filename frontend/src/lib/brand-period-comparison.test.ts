import { describe, expect, it } from "vitest";
import {
  alignComparisonBuckets,
  calculateComparisonVariation,
  getPreviousPeriodRange,
  parseLocalInputDate,
} from "./brand-period-comparison";

describe("comparação de período por marca", () => {
  it("calcula um período anterior de mesma duração, inclusive em ano bissexto", () => {
    expect(getPreviousPeriodRange("2028-03-01", "2028-03-29")).toEqual({
      current: { startDate: "2028-03-01", endDate: "2028-03-29" },
      previous: { startDate: "2028-02-01", endDate: "2028-02-29" },
      durationInDays: 29,
    });
  });

  it("rejeita datas inválidas e intervalos invertidos", () => {
    expect(parseLocalInputDate("2026-02-29")).toBeNull();
    expect(getPreviousPeriodRange("2026-02-02", "2026-02-01")).toBeNull();
  });

  it("protege o cálculo percentual contra divisão por zero", () => {
    expect(calculateComparisonVariation(10, 8)).toEqual({ difference: 2, percentage: 25 });
    expect(calculateComparisonVariation(0, 0)).toEqual({ difference: 0, percentage: 0 });
    expect(calculateComparisonVariation(5, 0)).toEqual({ difference: 5, percentage: null });
  });

  it("alinha buckets ausentes com zero", () => {
    expect(alignComparisonBuckets([9, 10, 11], new Map([[9, 3], [11, 8]]), (hour) => hour)).toEqual([
      { bucket: 9, value: 3 }, { bucket: 10, value: 0 }, { bucket: 11, value: 8 },
    ]);
  });
});
