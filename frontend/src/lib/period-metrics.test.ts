import { describe, expect, it } from "vitest";
import { buildEquivalentPreviousPeriodRange, resolveSalesCantadasAverageMetric, resolveSalesCantadasTrendGranularity } from "./period-metrics";

describe("period metrics", () => {
  it("seleciona métricas e granularidade nas transições de período", () => {
    expect(resolveSalesCantadasTrendGranularity("2026-01-01", "2026-01-01")).toBe("hour");
    expect(resolveSalesCantadasTrendGranularity("2026-01-01", "2026-01-07")).toBe("day");
    expect(resolveSalesCantadasTrendGranularity("2026-01-01", "2026-01-31")).toBe("week");
    expect(resolveSalesCantadasAverageMetric("2026-01-01", "2026-03-31").label).toBe("Média bimestral");
  });

  it("calcula período anterior equivalente inclusive", () => {
    const range = buildEquivalentPreviousPeriodRange("2026-03-01", "2026-03-10");
    expect(range?.dayCount).toBe(10);
    expect([range?.start.getFullYear(), range?.start.getMonth(), range?.start.getDate()]).toEqual([2026, 1, 19]);
    expect([range?.end.getFullYear(), range?.end.getMonth(), range?.end.getDate()]).toEqual([2026, 1, 28]);
  });

  it("retorna nulo para datas ausentes", () => {
    expect(buildEquivalentPreviousPeriodRange("", "2026-01-10")).toBeNull();
  });
});
