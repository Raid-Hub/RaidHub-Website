"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { getClanBannerSource, getDestinyManifest } from "bungie-net-core/endpoints/Destiny2"
import { getDestinyManifestComponent, type DestinyManifestLanguage } from "bungie-net-core/manifest"
import { type ClanBannerSource, type DestinyManifest } from "bungie-net-core/models"
import Dexie from "dexie"
import { useEffect, useState, type ReactNode } from "react"
import { type BungieAPIError } from "~/models/BungieAPIError"
import type { Prettify } from "~/types/generic"
import { DB_VERSION, indexDB } from "~/util/dexie"
import { o } from "~/util/o"
import { ManifestStatusOverlay } from "../ManifestStatusOverlay"
import { useLocale } from "./LocaleManager"
import { useBungieClient } from "./session/BungieClientProvider"
import type ClientBungieClient from "./session/ClientBungieClient"

const KEY_MANIFEST_VERSION = "d2_manifest_version"

const DestinyManifestManager = ({ children }: { children: ReactNode }) => {
    const [manifestVersion, setManifestVersion] = useState<string | null | undefined>(undefined)
    const client = useBungieClient()
    const { manifestLanguage } = useLocale()

    useEffect(() => {
        const oldVersion = localStorage.getItem(KEY_MANIFEST_VERSION)
        setManifestVersion(oldVersion ?? null)
    }, [])

    const { mutate: storeManifest, ...mutationState } = useMutation({
        mutationFn: updateCachedManifest,
        onSuccess: newManifestVersion => {
            setManifestVersion(newManifestVersion)
            // Free up some memory
            indexDB.clearCache()
            localStorage.setItem(KEY_MANIFEST_VERSION, newManifestVersion)
        },
        onError: (e: Error | Error[]) => {
            console.log(
                `Failed to store the Destiny 2 manifest definitions with error(s): ${
                    Array.isArray(e)
                        ? "\n" + e.map((e, idx) => `${idx + 1}. ${e.message}`).join(",\n")
                        : e.message
                }.`
            )
        }
    })

    const queryState = useQuery({
        queryKey: ["bungie", "manifest", manifestLanguage],
        queryFn: () => getDestinyManifest(client).then(res => res.Response),
        suspense: false,
        enabled: manifestVersion !== undefined,
        refetchInterval: 3600_000, // 1 hour
        retry: (failureCount, error: BungieAPIError) => error.ErrorCode !== 5 && failureCount < 3,
        onSuccess: data => {
            const newManifestVersion = [data.version, manifestLanguage, DB_VERSION].join("::")

            if (manifestVersion !== newManifestVersion) {
                storeManifest({
                    newManifestVersion,
                    client,
                    manifest: data,
                    language: manifestLanguage
                })
            }
        },
        onError: (e: Error) => {
            console.error(
                `Failed to download Destiny 2 manifest: ${e.message} ${
                    manifestVersion ? "Using cached version." : "No cached version available."
                }`
            )
        }
    })

    return (
        <>
            {queryState.isFetching ? (
                <ManifestStatusOverlay status="bungie-loading" />
            ) : mutationState.isLoading ? (
                <ManifestStatusOverlay status="dexie-loading" />
            ) : queryState.isError ? (
                <ManifestStatusOverlay status="bungie-error" error={queryState.error} />
            ) : mutationState.isError ? (
                <ManifestStatusOverlay status="dexie-error" error={mutationState.error} />
            ) : null}
            {children}
        </>
    )
}

export default DestinyManifestManager

const updateCachedManifest = async ({
    newManifestVersion,
    client,
    manifest,
    language
}: {
    newManifestVersion: string
    client: ClientBungieClient
    manifest: DestinyManifest
    language: DestinyManifestLanguage
}) => {
    const allSettled = await Promise.allSettled([
        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyInventoryItemLiteDefinition",
            language: language
        }).then(items =>
            indexDB.transaction("rw", indexDB.items, () => {
                const itemsWithHashes = Object.entries(items).map(([hash, item]) => ({
                    ...item,
                    hash: Number(hash)
                }))
                indexDB.seedCache("items", itemsWithHashes)
                return indexDB.items.bulkPut(itemsWithHashes)
            })
        ),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyActivityDefinition",
            language: language
        }).then(activities => {
            const values = Object.values(activities)
            indexDB.seedCache("activities", values)

            return indexDB.transaction("rw", indexDB.activities, () =>
                indexDB.activities.bulkPut(values)
            )
        }),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyActivityModeDefinition",
            language: language
        }).then(modes => {
            const values = Object.values(modes)
            indexDB.seedCache("activityModes", values)
            return indexDB.transaction("rw", indexDB.activityModes, () =>
                indexDB.activityModes.bulkPut(values)
            )
        }),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinySeasonDefinition",
            language: language
        }).then(seasons => {
            const values = Object.values(seasons)
            indexDB.seedCache("seasons", values)
            return indexDB.transaction("rw", indexDB.seasons, () => indexDB.seasons.bulkPut(values))
        }),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyActivityModifierDefinition",
            language: language
        }).then(modifiers => {
            const values = Object.values(modifiers)
            indexDB.seedCache("activityModifiers", values)
            return indexDB.transaction("rw", indexDB.activityModifiers, () =>
                indexDB.activityModifiers.bulkPut(values)
            )
        }),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyClassDefinition",
            language: language
        }).then(classes => {
            const values = Object.values(classes)
            indexDB.seedCache("characterClasses", values)
            return indexDB.transaction("rw", indexDB.characterClasses, () =>
                indexDB.characterClasses.bulkPut(values)
            )
        }),

        getDestinyManifestComponent(client, {
            destinyManifest: manifest,
            tableName: "DestinyMilestoneDefinition",
            language: language
        }).then(milestones => {
            const values = Object.values(milestones)
            indexDB.seedCache("milestones", values)
            return indexDB.transaction("rw", indexDB.milestones, () =>
                indexDB.milestones.bulkPut(values)
            )
        }),

        getClanBannerSource(client).then(res =>
            updateClanBannerData(res.Response as RawClanBannerData)
        )
    ] as const)

    const errors = allSettled.filter((r): r is PromiseRejectedResult => r.status === "rejected")

    if (!errors.length) return newManifestVersion

    if (
        errors.some(
            e =>
                e.reason instanceof Dexie.DexieError ||
                (typeof e.reason === "string" && e.reason.includes("Dexie"))
        )
    ) {
        // Force a reset if there was a dexie related error
        await indexDB.delete()
    }

    throw errors.map(e => (e instanceof Error ? e : new Error(String(e.reason))))
}

async function updateClanBannerData(banners: RawClanBannerData) {
    const hash = <K extends keyof RawClanBannerData>(key: K) =>
        o.entries(banners[key]).map(([hash, def]) =>
            typeof def === "string"
                ? { hash: Number(hash), value: def }
                : {
                      hash: Number(hash),
                      ...(def as Prettify<RawClanBannerData[K][keyof RawClanBannerData[K]]>)
                  }
        )

    const clanBannerTableKeys = Object.keys(banners) as (keyof RawClanBannerData)[]

    return indexDB.transaction(
        "rw",
        clanBannerTableKeys.map(key => indexDB[key]),
        () =>
            Promise.all(
                clanBannerTableKeys.map(key => {
                    const data = hash(key)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return (
                        indexDB[key]
                            // @ts-expect-error Can't type this
                            .bulkPut(data)
                    )
                })
            )
    )
}

export interface RGBA {
    blue: number
    green: number
    red: number
    alpha: number
}

export interface RawClanBannerData extends ClanBannerSource {
    clanBannerDecals: Record<
        string,
        {
            foregroundPath: string
            backgroundPath: string
        }
    >
    clanBannerDecalPrimaryColors: Record<string, RGBA>
    clanBannerDecalSecondaryColors: Record<string, RGBA>
    clanBannerGonfalons: Record<string, string>
    clanBannerGonfalonColors: Record<string, RGBA>
    clanBannerGonfalonDetails: Record<string, string>
    clanBannerGonfalonDetailColors: Record<string, RGBA>
    clanBannerDecalsSquare: Record<
        string,
        {
            foregroundPath: string
            backgroundPath: string
        }
    >
    clanBannerGonfalonDetailsSquare: Record<string, string>
}