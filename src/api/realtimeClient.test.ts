import { afterEach, describe, expect, it, vi } from 'vitest'
import { RealtimeClient } from './realtimeClient'

vi.mock('./websocket', () => ({
  WebSocketClient: class {
    private readonly statuses = new Set<(status: string) => void>()

    diagnostics = {
      retryCount: 20,
      lastConnectedAt: null,
      totalDisconnections: 1,
    }

    onMessage() {
      return () => {}
    }

    onStatusChange(handler: (status: string) => void) {
      this.statuses.add(handler)
      return () => this.statuses.delete(handler)
    }

    connect() {
      this.statuses.forEach((handler) => handler('dead'))
    }

    disconnect() {}
  },
}))

vi.mock('./sseTransport', () => ({
  SseClient: class {
    private readonly statuses = new Set<(status: string) => void>()

    diagnostics = {
      retryCount: 0,
      lastConnectedAt: Date.now(),
      totalDisconnections: 0,
    }

    onMessage() {
      return () => {}
    }

    onStatusChange(handler: (status: string) => void) {
      this.statuses.add(handler)
      return () => this.statuses.delete(handler)
    }

    subscribe() {}
    disconnect() {}

    connect() {
      this.statuses.forEach((handler) => handler('connected'))
    }
  },
  deriveSseUrl: () => 'https://localhost/events',
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('RealtimeClient diagnostics', () => {
  it('reports the actual WebSocket-to-SSE failover path and reason', () => {
    vi.stubGlobal('EventSource', class {})
    const client = new RealtimeClient()
    client.connect()

    expect(client.diagnostics).toMatchObject({
      transport: 'sse',
      transportPath: ['ws', 'sse'],
      fallbackReason: 'websocket-retries-exhausted',
    })

    client.disconnect()
  })
})
