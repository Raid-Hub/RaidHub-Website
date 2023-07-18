import styles from "../../styles/pages/profile/profile.module.css"
import { ErrorHandler } from "../../types/generic"
import Head from "next/head"
import UserCard from "./user/UserCard"
import ClanCard from "./clan/ClanCard"
import PinnedActivity from "./mid/PinnedActivity"
import ToggleSwitch from "./mid/ToggleSwitch"
import { useState } from "react"
import { useDestinyStats } from "../../hooks/bungie/useDestinyStats"
import { useCharacterStats } from "../../hooks/bungie/useCharacterStats"
import { useRaidHubProfile } from "../../hooks/raidhub/useRaidHubProfile"
import { BungieMembershipType } from "bungie-net-core/lib/models"
import { useDestinyProfile } from "../../hooks/bungie/useDestinyProfile"
import { useBungieMemberships } from "../../hooks/bungie/useBungieMemberships"
import { useRaidReport } from "../../hooks/raidreport/useRaidReportData"
import Banners from "./banners/Banners"
import Raids from "./raids/Raids"
import { useProfileTransitory } from "../../hooks/bungie/useProfileTransitory"
import CurrentActivity from "./mid/CurrentActivity"
import { InitialProfileProps } from "../../types/profile"

export enum Layout {
    DotCharts,
    RecentActivities
}

type ProfileProps = InitialProfileProps & {
    errorHandler: ErrorHandler
}

const Profile = ({ destinyMembershipId, destinyMembershipType, errorHandler }: ProfileProps) => {
    // DATA HOOKS
    const { profile: primaryDestinyProfile, isLoading: isLoadingDestinyProfile } =
        useDestinyProfile({
            destinyMembershipId,
            destinyMembershipType,
            errorHandler
        })

    const { profile: raidHubProfile, isLoading: isLoadingRaidHubProfile } = useRaidHubProfile({
        destinyMembershipId,
        errorHandler
    })

    const {
        bungieMemberhip,
        destinyMemberships,
        isLoading: isLoadingMemberships
    } = useBungieMemberships({
        destinyMembershipId,
        destinyMembershipType,
        errorHandler
    })

    const { data: raidReportData, isLoading: isLoadingRaidReportData } = useRaidReport({
        destinyMembershipIds: destinyMemberships,
        primaryMembershipId: destinyMembershipId,
        errorHandler
    })

    const {
        historicalStats,
        isLoading: isLoadingDestinyStats,
        characterMemberships
    } = useDestinyStats({ destinyMemberships, errorHandler })

    const { stats: raidMetrics, isLoading: isLoadingRaidMetrics } = useCharacterStats({
        characterMemberships,
        errorHandler
    })

    const {
        profile: transitoryProfile,
        isLoading: isLoadingTransitoryProfile,
        lastRefresh: lastTransitoryRefresh
    } = useProfileTransitory({
        destinyMembershipId,
        destinyMembershipType,
        errorHandler
    })

    const [mostRecentActivity, setMostRecentActivity] = useState<string | undefined | null>(
        undefined
    )

    // LAYOUT
    const [layout, setLayout] = useState<Layout>(Layout.DotCharts)

    const handleLayoutToggle = (buttonState: boolean) => {
        const newState = buttonState ? Layout.RecentActivities : Layout.DotCharts
        setLayout(newState)
    }

    const name =
        primaryDestinyProfile?.userInfo.bungieGlobalDisplayName ??
        primaryDestinyProfile?.userInfo.displayName

    return (
        <main className={styles["main"]}>
            <Head>
                <title>{name ? `${name} | RaidHub` : "RaidHub"}</title>
            </Head>
            <section className={styles["user-info"]}>
                <UserCard
                    isLoading={
                        isLoadingDestinyProfile || isLoadingRaidHubProfile || isLoadingMemberships
                    }
                    userInfo={
                        bungieMemberhip
                            ? { ...bungieMemberhip, ...primaryDestinyProfile?.userInfo }
                            : undefined
                    }
                    socials={raidHubProfile?.socials ?? null}
                    emblemBackgroundPath={primaryDestinyProfile?.emblemBackgroundPath}
                    background={raidHubProfile?.background ?? null}
                />
                <Banners
                    banners={raidReportData?.rankings ?? null}
                    destinyMembershipId={destinyMembershipId}
                    isLoading={isLoadingRaidReportData || isLoadingMemberships}
                />
                <ClanCard
                    membershipId={destinyMembershipId}
                    membershipType={destinyMembershipType}
                    errorHandler={errorHandler}
                />
            </section>

            <section className={styles["mid"]}>
                {transitoryProfile && (
                    <CurrentActivity data={transitoryProfile} lastRefresh={lastTransitoryRefresh} />
                )}
                <PinnedActivity
                    isLoading={
                        raidHubProfile?.pinnedActivity !== null
                            ? isLoadingRaidHubProfile
                            : mostRecentActivity === undefined
                    }
                    activityId={
                        raidHubProfile?.pinnedActivity !== null
                            ? raidHubProfile?.pinnedActivity
                            : mostRecentActivity
                    }
                    isPinned={!!raidHubProfile?.pinnedActivity}
                    errorHandler={errorHandler}
                />
                <ToggleSwitch checked={!!layout} onToggle={handleLayoutToggle} />
            </section>

            <section className={styles["raids"]}>
                <Raids
                    membershipId={destinyMembershipId}
                    characterMemberships={characterMemberships}
                    layout={layout}
                    raidMetrics={raidMetrics}
                    raidReport={raidReportData?.activities || null}
                    isLoadingRaidMetrics={isLoadingRaidMetrics}
                    isLoadingCharacters={isLoadingDestinyStats}
                    isLoadingRaidReport={isLoadingRaidReportData}
                    setMostRecentActivity={setMostRecentActivity}
                    errorHandler={errorHandler}
                />
            </section>
        </main>
    )
}

export default Profile
