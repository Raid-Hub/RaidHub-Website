"use client"

import { Collection } from "@discordjs/collection"
import { createContext, useContext, type ReactNode } from "react"
import type { ListedRaid, RaidHubPlayerActivitiesActivity } from "~/services/raidhub/types"

const RaidContext = createContext<
    | {
          raid: ListedRaid
          isLoadingActivities: false
          activities: Collection<string, RaidHubPlayerActivitiesActivity>
      }
    | { raid: ListedRaid; isLoadingActivities: true; activities: null }
    | null
>(null)

export function useRaidCardContext() {
    const ctx = useContext(RaidContext)
    if (!ctx) throw new Error("No RaidContext found")
    return ctx
}

export const RaidCardContext = ({
    children,
    activitiesByRaid,
    isLoadingActivities,
    raid
}: {
    children: ReactNode
    activitiesByRaid: Collection<
        ListedRaid,
        Collection<string, RaidHubPlayerActivitiesActivity>
    > | null
    isLoadingActivities: boolean
    raid: ListedRaid
}) => (
    <RaidContext.Provider
        value={{
            raid,
            ...(isLoadingActivities
                ? { isLoadingActivities: true, activities: null }
                : {
                      isLoadingActivities: false,
                      activities: activitiesByRaid?.get(raid) ?? new Collection()
                  })
        }}>
        {children}
    </RaidContext.Provider>
)