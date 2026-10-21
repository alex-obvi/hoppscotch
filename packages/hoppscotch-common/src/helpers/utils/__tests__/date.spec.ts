import { describe, expect, test } from "vitest"
import { formatRelative } from "../date"

// Fixed clock — the formatter never reads the real time, so tests are
// deterministic by construction.
const NOW = new Date("2026-10-21T12:00:00.000Z")

const ago = (sec: number) => new Date(NOW.getTime() - sec * 1000)

describe("formatRelative", () => {
  test.each([
    [45, "Now", "Now"],
    [59, "Now", "Now"], // boundary: the last second inside the Now window
    [60, "1m", "1 minute ago"], // boundary: flips to minutes
    [300, "5m", "5 minutes ago"],
    [7200, "2h", "2 hours ago"],
    [86399, "23h", "23 hours ago"], // boundary: the last second inside hours
    [86400, "1d", "1 day ago"], // boundary: flips to days
    [90000, "1d", "1 day ago"],
    [1296000, "15d", "15 days ago"],
  ])(
    "elapsed %is renders %s (compact) / %s (verbose)",
    (sec, compact, verbose) => {
      expect(formatRelative(ago(sec as number), NOW, "compact")).toBe(compact)
      expect(formatRelative(ago(sec as number), NOW, "verbose")).toBe(verbose)
    }
  )

  test("renders singular verbose wording for exactly one unit", () => {
    expect(formatRelative(ago(60), NOW, "verbose")).toBe("1 minute ago")
    expect(formatRelative(ago(3600), NOW, "verbose")).toBe("1 hour ago")
    expect(formatRelative(ago(86400), NOW, "verbose")).toBe("1 day ago")
  })

  test("renders plural verbose wording beyond one unit", () => {
    expect(formatRelative(ago(120), NOW, "verbose")).toBe("2 minutes ago")
    expect(formatRelative(ago(7200), NOW, "verbose")).toBe("2 hours ago")
    expect(formatRelative(ago(172800), NOW, "verbose")).toBe("2 days ago")
  })

  test("renders Now for future timestamps", () => {
    const future = new Date(NOW.getTime() + 30000)
    expect(formatRelative(future, NOW, "compact")).toBe("Now")
    expect(formatRelative(future, NOW, "verbose")).toBe("Now")
  })

  test("both densities agree on the amount for the same input", () => {
    const compact = formatRelative(ago(7200), NOW, "compact")
    const verbose = formatRelative(ago(7200), NOW, "verbose")
    expect(compact).toBe("2h")
    expect(verbose.startsWith("2 hours")).toBe(true)
  })
})
