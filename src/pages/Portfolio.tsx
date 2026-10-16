import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PortfolioMovement } from '../components/PortfolioMovement'
import { PortfolioScenario } from '../components/PortfolioScenario'
import { usePriceContext } from '../context/PriceContext'
import { STORAGE_KEYS, readJson, writeJson } from '../utils/storage'
import { isPortfolioHolding, valuePortfolio, type PortfolioHolding } from '../utils/portfolio'

function readHoldings(): PortfolioHolding[] {
  const stored = readJson<unknown>(STORAGE_KEYS.portfolioHoldings, [])
  return Array.isArray(stored) ? stored.filter(isPortfolioHolding) : []
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 8 }).format(value)
}

export function Portfolio() {
  const { prices, livePrices, pricesLoading, pricesError } = usePriceContext()
  const [holdings, setHoldings] = useState(readHoldings)
  const [assetPair, setAssetPair] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState('')
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    setStorageWarning(!writeJson(STORAGE_KEYS.portfolioHoldings, holdings))
  }, [holdings])

  const mergedPrices = useMemo(
    () =>
      prices.map((price) => {
        const live = livePrices.get(price.assetPair)
        return live && live.data.timestamp >= price.timestamp ? live.data : price
      }),
    [prices, livePrices],
  )
  const valuation = useMemo(() => valuePortfolio(holdings, mergedPrices), [holdings, mergedPrices])

  function addHolding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedPair = assetPair.trim().toUpperCase()
    const parsedAmount = Number(amount)
    if (!/^[A-Z0-9]{1,12}\/[A-Z0-9]{1,12}$/.test(normalizedPair)) {
      setFormError('Enter a pair in BASE/QUOTE format, such as XLM/USD.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Amount must be a finite number greater than zero.')
      return
    }
    setFormError('')
    setHoldings((current) => [
      ...current,
      {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        assetPair: normalizedPair,
        amount: parsedAmount,
      },
    ])
    setAssetPair('')
    setAmount('')
  }

  function removeHolding(id: string) {
    setHoldings((current) => current.filter((holding) => holding.id !== id))
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Track manually entered holdings using the oracle feed. Holdings stay in this browser; no wallet or account
          sync is used.
        </p>
      </header>

      <form
        onSubmit={addHolding}
        className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        aria-label="Add portfolio holding"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Asset pair
          <input
            value={assetPair}
            onChange={(event) => setAssetPair(event.target.value)}
            placeholder="XLM/USD"
            autoComplete="off"
            className="mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            aria-describedby={formError ? 'holding-error' : undefined}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount held (base asset)
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            className="mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-cyan-700 px-5 font-semibold text-white hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          Add holding
        </button>
        {formError && (
          <p id="holding-error" role="alert" className="text-sm text-red-700 dark:text-red-300 sm:col-span-3">
            {formError}
          </p>
        )}
      </form>

      {storageWarning && (
        <p
          role="status"
          className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          Browser storage is unavailable; changes will not persist after leaving this page.
        </p>
      )}
      {pricesLoading && holdings.length > 0 && (
        <p role="status" className="text-sm text-gray-600 dark:text-gray-400">
          Loading current oracle prices…
        </p>
      )}
      {pricesError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          Current prices could not be refreshed. Existing price values are shown only if they are still fresh.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ExposureGroup title="Base asset exposure" exposures={valuation.baseExposure} unit="units" />
        <ExposureGroup title="Quote asset exposure" exposures={valuation.quoteExposure} unit="notional" />
      </div>

      <section
        aria-labelledby="holdings-title"
        className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-4 dark:bg-gray-900">
          <h2 id="holdings-title" className="font-semibold text-gray-900 dark:text-white">
            Holdings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {valuation.unavailableCount} unavailable · {valuation.staleCount} stale
          </p>
        </div>
        {holdings.length === 0 ? (
          <p className="p-5 text-sm text-gray-600 dark:text-gray-400">
            No holdings yet. Add an asset pair and amount to begin.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th scope="col" className="p-3">
                    Pair
                  </th>
                  <th scope="col" className="p-3">
                    Amount
                  </th>
                  <th scope="col" className="p-3">
                    Price
                  </th>
                  <th scope="col" className="p-3">
                    Value
                  </th>
                  <th scope="col" className="p-3">
                    Price status
                  </th>
                  <th scope="col" className="p-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {valuation.holdings.map((holding) => (
                  <tr key={holding.id}>
                    <th scope="row" className="p-3 font-medium text-gray-900 dark:text-white">
                      {holding.assetPair}
                    </th>
                    <td className="p-3">
                      {formatAmount(holding.amount)} {holding.baseAsset}
                    </td>
                    <td className="p-3">
                      {holding.price === null ? '—' : `${formatAmount(holding.price)} ${holding.quoteAsset}`}
                    </td>
                    <td className="p-3">
                      {holding.value === null ? '—' : `${formatAmount(holding.value)} ${holding.quoteAsset}`}
                    </td>
                    <td className="p-3">
                      {holding.status === 'available'
                        ? `Available (${holding.sources.join(', ') || 'source unspecified'})`
                        : holding.status === 'stale'
                          ? 'Stale price'
                          : 'Price unavailable'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeHolding(holding.id)}
                        aria-label={`Remove ${holding.assetPair} holding`}
                        className="min-h-10 rounded px-2 text-cyan-800 underline underline-offset-2 hover:text-cyan-950 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:text-cyan-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <PortfolioMovement holdings={valuation.holdings} />
      <PortfolioScenario holdings={valuation.holdings} />
    </section>
  )
}

function ExposureGroup({
  title,
  exposures,
  unit,
}: {
  title: string
  exposures: Array<{ asset: string; amount: number }>
  unit: string
}) {
  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
      aria-label={title}
    >
      <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      {exposures.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No exposure to display.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {exposures.map(({ asset, amount }) => (
            <li key={asset} className="flex justify-between gap-3 text-sm">
              <span className="font-medium">{asset}</span>
              <span>
                {formatAmount(amount)} {unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
