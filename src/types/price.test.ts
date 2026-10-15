import { describe, expect, it } from 'vitest'
import { isPriceData } from './price'

const price = {
  assetPair: 'BTC/USD',
  price: 50000,
  timestamp: 1,
  confidence: 0.99,
  sources: ['chainlink'],
}

describe('isPriceData pair metadata', () => {
  it('continues accepting legacy price data without pair metadata', () => {
    expect(isPriceData(price)).toBe(true)
  })

  it('accepts nullable canonical values and a valid decimal scale', () => {
    expect(isPriceData({ ...price, pairMetadata: { baseUnit: 'BTC', quoteUnit: null, priceScale: 8 } })).toBe(true)
  })

  it('rejects malformed canonical scale metadata', () => {
    expect(isPriceData({ ...price, pairMetadata: { baseUnit: 'BTC', quoteUnit: 'USD', priceScale: 1.5 } })).toBe(false)
  })
})
