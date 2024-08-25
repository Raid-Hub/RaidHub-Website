import "server-only"

import type { BungieFetchConfig } from "bungie-net-core"
import type { PlatformErrorCodes } from "bungie-net-core/models"
import { BungieAPIError } from "~/models/BungieAPIError"
import BaseBungieClient from "~/services/bungie/BungieClient"

const ExpectedErrorCodes = new Set<PlatformErrorCodes>([
    5, // SystemDisabled
    686, // ClanNotFound
    1653 // PGCRNotFound
])

export default class ServerBungieClient extends BaseBungieClient {
    private next: NextFetchRequestConfig
    private timeout: number

    constructor({ next, timeout }: { next?: NextFetchRequestConfig; timeout?: number } = {}) {
        super()
        this.next = next ?? {}
        this.timeout = timeout ?? 5000
    }

    generatePayload(config: BungieFetchConfig): RequestInit {
        if (config.url.pathname.match(/\/common\/destiny2_content\/json\//)) {
            throw new Error("Manifest definitions are not available on the server")
        }

        const apiKey = process.env.BUNGIE_API_KEY
        if (!apiKey) {
            throw new Error("Missing BUNGIE_API_KEY")
        }

        const payload: RequestInit & { headers: Headers } = {
            method: config.method,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            body: config.body,
            headers: new Headers(config.headers),
            next: this.next
        }

        payload.headers.set("X-API-KEY", apiKey)
        payload.headers.set(
            "Origin",
            process.env.DEPLOY_URL ??
                (process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : `https://localhost:${process.env.PORT ?? 3000}`)
        )

        const controller = new AbortController()
        payload.signal = controller.signal
        setTimeout(() => controller.abort(), this.timeout)

        return payload
    }

    async handle<T>(url: URL, payload: RequestInit): Promise<T> {
        try {
            return (await this.request(url, payload)) as T
        } catch (err) {
            if (
                !(err instanceof DOMException) &&
                !(err instanceof BungieAPIError && ExpectedErrorCodes.has(err.ErrorCode))
            ) {
                console.error(err)
            }
            throw err
        }
    }
}
