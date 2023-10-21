import Activity from "~/models/profile/data/Activity"
import { RaidHubAPIResponse, RaidHubActivitiesResponse } from "~/types/raidhub-api"

export function activitiesQueryKey(membershipId: string) {
    return ["raidhub-activities", membershipId] as const
}
export async function getAllActivities(membershipId: string) {
    const all = new Array<Activity>()
    let cursor = undefined
    do {
        const data = await getActivities({ membershipId, cursor })
        all.push(...data.activities.map(a => new Activity(a)))
        cursor = data.prevActivity
    } while (cursor)

    return all
}

async function getActivities({
    membershipId,
    cursor
}: {
    membershipId: string
    cursor?: string
}): Promise<RaidHubActivitiesResponse> {
    const url = new URL(
        (process.env.RAIDHUB_API_URL ?? "https://api.raidhub.app") + `/activities/${membershipId}`
    )

    if (cursor) {
        url.searchParams.set("cursor", cursor)
    }

    const res = await fetch(url)

    const data = (await res.json()) as RaidHubAPIResponse<RaidHubActivitiesResponse>

    if (data.success) {
        return data.response
    } else {
        throw new Error(data.message)
    }
}
