export function shortDateTime(
  date: string | number | Date,
  includeTime: boolean = true
) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }
      : {}),
  })
}

/**
 * Relative-time formatting — one formatter, two densities.
 *
 * Ported from the design-review walkthrough contract: identical input must
 * render an identical string on every surface, with the density chosen per
 * call site — compact ("5m") for rows, verbose ("5 minutes ago") where prose
 * reads better.
 *
 * Threshold contract:
 *   < 60s   -> "Now"
 *   < 60m   -> "Nm" | "N minute(s) ago"
 *   < 24h   -> "Nh" | "N hour(s) ago"
 *   >= 24h  -> "Nd" | "N day(s) ago"
 */
export type RelativeTimeFormat = "compact" | "verbose"

function secondsAgo(date: string | number | Date, now: Date): number {
  return Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
}

const COMPACT_UNITS = { minute: "m", hour: "h", day: "d" } as const

function render(
  amount: number,
  unit: "minute" | "hour" | "day",
  format: RelativeTimeFormat
): string {
  if (format === "compact") return `${amount}${COMPACT_UNITS[unit]}`
  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`
}

/**
 * The single relative formatter behind every relative time in the app.
 * Never reads the real clock — `now` is always passed in, so callers that
 * tick keep their labels live and tests stay deterministic.
 */
export function formatRelative(
  date: string | number | Date,
  now: Date,
  format: RelativeTimeFormat
): string {
  const sec = secondsAgo(date, now)
  if (sec < 60) return "Now"
  if (sec < 3600) return render(Math.floor(sec / 60), "minute", format)
  if (sec < 86400) return render(Math.floor(sec / 3600), "hour", format)
  return render(Math.floor(sec / 86400), "day", format)
}
