import { BungieMembershipType } from "bungie-net-core/lib/models"
import { AvailableRaid } from "../../types/raids"

export type RRLeaderboardEntryUser = {
    bungieGlobalDisplayName: string
    displayName: string
    iconPath: string
    membershipId: string
    membershipType: BungieMembershipType
}
export type RRLeaderboardEntry = {
    value: number
    activityDetails: {
        instanceId: string
        membershipType: BungieMembershipType
    }
    destinyUserInfos: RRLeaderboardEntryUser[]
}

export type GetLeaderboardParams = string[]

export async function getLeaderboard(params: GetLeaderboardParams, page: number) {
    return (await fetch(
        `https://api.raidreport.dev/raid/leaderboard/${params.join(
            "/"
        )}/normal?page=${page}&pageSize=50`
    )
        .then(res => res.json())
        .then(data => data.response)) as {
        entries: RRLeaderboardEntry[]
    }
}