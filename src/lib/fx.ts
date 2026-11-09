// Conversion to AED for the Overview. The dirham is pegged to the US dollar at a fixed
// 3.6725, so USD never depends on a feed; EUR comes from a public rates API (cached 6 h)
// with a fixed fallback if it can't be reached — the Overview says which one was used.
const USD_PEG = 3.6725
const EUR_FALLBACK = 4.1

export interface FxRates {
  toAed: (amount: number, currency: string) => number
  note: string
}

export async function getFx(): Promise<FxRates> {
  const rates: Record<string, number> = { AED: 1, USD: USD_PEG, EUR: EUR_FALLBACK }
  let note = `1 USD = ${USD_PEG} AED (fixed peg) · 1 EUR = ${EUR_FALLBACK} AED (estimate — live rate unavailable)`
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AED', { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) })
    const data = await res.json()
    if (data?.result === 'success' && data.rates?.EUR > 0) {
      rates.EUR = 1 / data.rates.EUR
      const day = new Date(data.time_last_update_utc).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
      note = `1 USD = ${USD_PEG} AED (fixed peg) · 1 EUR = ${rates.EUR.toFixed(4)} AED (rate of ${day})`
    }
  } catch { /* keep the fallback */ }
  return { toAed: (amount, currency) => amount * (rates[currency] ?? 1), note }
}
