import { type Metadata } from "next"
import { metadata as leaderboardMetadata } from "~/app/layout"
import { Splash } from "~/app/leaderboards/LeaderboardSplashComponents"
import RaidCardBackground from "~/data/raid-backgrounds"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import type { PageStaticParams } from "~/types/generic"
import { Leaderboard } from "../../../Leaderboard"
import { getRaidEnum } from "../../helpers"
import { type RaidLeaderboardStaticParams } from "../../layout"
import { WorldfirstSSREntries } from "./WorldfirstSSREntries"
import { ENTRIES_PER_PAGE, createQueryKey } from "./constants"

export async function generateStaticParams({ params: { raid } }: RaidLeaderboardStaticParams) {
    const manifest = await prefetchManifest()
    const raidEnum = getRaidEnum(manifest, raid)

    const wfBoards = manifest.leaderboards.worldFirst[raidEnum]

    return wfBoards.map(board => ({
        category: board.category
    }))
}

type StaticParams = RaidLeaderboardStaticParams &
    PageStaticParams<typeof generateStaticParams> & { searchParams: { page?: string } }

export async function generateMetadata({ params }: StaticParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const raidEnum = getRaidEnum(manifest, params.raid)

    const boards = manifest.leaderboards.worldFirst[raidEnum]
    const raidName = manifest.raidStrings[raidEnum]

    const title = `${raidName} ${
        boards.find(p => p.category === params.category)!.displayName
    } World First Leaderboard`
    return {
        title: title,
        openGraph: {
            ...leaderboardMetadata.openGraph,
            title: title
        }
    }
}

export const revalidate = 900
export const dynamic = "force-static"

export default async function Page({ params, searchParams }: StaticParams) {
    const manifest = await prefetchManifest()
    const raid = getRaidEnum(manifest, params.raid)

    const { displayName } = manifest.leaderboards.worldFirst[raid].find(
        l => l.category === params.category
    )!

    return (
        <Leaderboard
            pageProps={{ format: "time", type: "team", count: ENTRIES_PER_PAGE }}
            type="worldfirst"
            category={params.category}
            hasPages
            raid={raid}
            refreshQueryKey={createQueryKey({
                raidPath: params.raid,
                category: params.category,
                page: 1
            })}
            heading={
                <Splash
                    title={manifest.raidStrings[raid]}
                    subtitle={displayName}
                    tertiaryTitle="World First Leaderboards"
                    cloudflareImageId={RaidCardBackground[raid]}
                />
            }
            entries={
                <WorldfirstSSREntries
                    category={params.category}
                    page={searchParams.page ?? "1"}
                    raidPath={params.raid}
                />
            }
        />
    )
}