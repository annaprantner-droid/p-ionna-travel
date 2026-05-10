import { describe, expect, it } from "vitest";
import { formatCurrency, formatDuration } from "../format";

describe("format helpers", () => {
  it("formats round currency without decimals", () => {
    expect(formatCurrency(120, "USD")).toBe("$120");
  });

  it("formats fractional currency with decimals", () => {
    expect(formatCurrency(120.5, "USD")).toBe("$120.50");
  });

  it("formats duration as Hh MMm", () => {
    expect(formatDuration(245)).toBe("4h 05m");
  });
});
