import { m } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useLocale } from "~/app/managers/LocaleManager"
import Loading from "~/components/global/Loading"
import RaidCardBackground from "~/data/raid-backgrounds"
import CloudflareImage from "~/images/CloudflareImage"
import Expand from "~/images/icons/Expand"
import Activity from "~/models/profile/data/Activity"
import styles from "~/styles/pages/profile/raids.module.css"
import { ListedRaid, RaidHubPlayerProfileLeaderboardEntry } from "~/types/raidhub-api"
import { medianElement } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { findTags } from "~/util/tags"
import BigNumberStatItem from "./BigNumberStatItem"
import DotGraphWrapper, { FULL_HEIGHT } from "./DotGraph"
import RaceTagLabel from "./RaceTagLabel"
import { useActivitiesContext } from "./RaidContext"
import RaidTagLabel from "./RaidTagLabel"
import ExpandedRaidView from "./expanded/ExpandedRaidView"

type RaidModalProps = {
    raid: ListedRaid
    expand: () => void
    clearExpand: () => void
    leaderboardData: RaidHubPlayerProfileLeaderboardEntry[]
    wfBoardId: string
    isExpanded: boolean
}

export default function RaidCard({
    raid,
    expand,
    clearExpand,
    leaderboardData,
    wfBoardId,
    isExpanded
}: RaidModalProps) {
    const [hoveredTag, setHoveredTag] = useState<string | null>(null)
    useEffect(() => {
        if (hoveredTag) {
            // Set a new timeout
            const timer = setTimeout(() => {
                setHoveredTag(null)
            }, 2500)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [hoveredTag])

    const { activities, isLoadingActivities } = useActivitiesContext()

    const recentClear = useMemo(
        () => activities?.find(a => a.player.finishedRaid && a.fresh),
        [activities]
    )

    const tags = useMemo(() => findTags(Array.from(activities?.values() ?? [])), [activities])

    const { strings } = useLocale()

    const firstTaggedClear: RaidHubPlayerProfileLeaderboardEntry | undefined = useMemo(() => {
        const wfBoardClear = leaderboardData
            .filter(e => e.boardId === "wfBoardId")
            ?.sort((a, b) => a.rank - b.rank)[0]
        if (wfBoardClear) return wfBoardClear

        const allLeaderboardClears = Array.from(leaderboardData.values())
            .flat()
            .sort(
                (a, b) => new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime()
            )
        return allLeaderboardClears[0]
    }, [leaderboardData, wfBoardId])

    const { fastestFullClear, averageClear } = useMemo(() => {
        const freshFulls = activities?.filter(a => a.completed && a.fresh)
        const fastestFullClear = freshFulls?.size
            ? freshFulls.reduce<Activity>((curr, nxt) =>
                  nxt.durationSeconds < curr.durationSeconds ? nxt : curr
              )
            : undefined
        const averageClear = freshFulls
            ? medianElement(freshFulls.toSorted((a, b) => a.durationSeconds - b.durationSeconds))
            : undefined

        return { fastestFullClear, averageClear }
    }, [activities])

    return isExpanded ? (
        <ExpandedRaidView raid={raid} dismiss={clearExpand} />
    ) : (
        <m.div
            initial={{
                y: 50,
                opacity: 0
            }}
            whileInView={{
                y: 0,
                opacity: 1
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6
            }}
            className={styles["card"]}>
            <div className={styles["card-img-container"]}>
                <CloudflareImage
                    className={styles["card-background"]}
                    priority
                    width={960}
                    height={540}
                    cloudflareId={RaidCardBackground[raid]}
                    alt={strings.raidNames[raid]}
                />
                <div className={styles["card-top"]}>
                    {firstTaggedClear && (
                        <RaceTagLabel
                            placement={firstTaggedClear.rank}
                            instanceId={firstTaggedClear.instanceId}
                            dayOne={firstTaggedClear.dayOne}
                            contest={firstTaggedClear.contest}
                            weekOne={firstTaggedClear.weekOne}
                            challenge={firstTaggedClear.type === "Challenge"}
                            raid={raid}
                            setActiveId={setHoveredTag}
                        />
                    )}
                    <div
                        className={[styles["card-top-right"], styles["visible-on-card-hover"]].join(
                            " "
                        )}>
                        <Expand color="white" sx={25} onClick={expand} />
                    </div>
                </div>
                <div className={styles["img-overlay-bottom"]}>
                    <div className={styles["card-challenge-tags"]}>
                        {tags?.map((tag, key) => (
                            <RaidTagLabel
                                {...tag}
                                raid={raid}
                                key={key}
                                setActiveId={setHoveredTag}
                            />
                        ))}
                    </div>
                    <span className={styles["card-title"]}>{strings.raidNames[raid]}</span>
                </div>
            </div>
            <div className={styles["card-content"]}>
                <div className={styles["graph-content"]}>
                    {isLoadingActivities ? (
                        <div className={styles["dots-container"]} style={{ height: FULL_HEIGHT }}>
                            <Loading className={styles["dots-svg-loading"]} />
                        </div>
                    ) : (
                        <DotGraphWrapper activities={activities} targetDot={hoveredTag} />
                    )}
                    <div className={styles["graph-right"]}>
                        <BigNumberStatItem
                            displayValue={activities?.filter(a => a.player.finishedRaid).size ?? 0}
                            isLoading={isLoadingActivities}
                            name={strings.totalClears.split(" ").join("\n")}
                            extraLarge={true}
                        />
                    </div>
                </div>

                <div className={styles["timings"]}>
                    <BigNumberStatItem
                        displayValue={
                            recentClear ? secondsToHMS(recentClear.durationSeconds) : strings.na
                        }
                        isLoading={isLoadingActivities}
                        name="Recent"
                        href={recentClear ? `/pgcr/${recentClear.activityId}` : undefined}
                    />
                    <BigNumberStatItem
                        displayValue={
                            fastestFullClear
                                ? secondsToHMS(fastestFullClear.durationSeconds)
                                : strings.na
                        }
                        isLoading={isLoadingActivities}
                        name={strings.fastestClear}
                        href={fastestFullClear ? `/pgcr/${fastestFullClear.activityId}` : undefined}
                    />
                    <BigNumberStatItem
                        displayValue={
                            averageClear ? secondsToHMS(averageClear.durationSeconds) : strings.na
                        }
                        isLoading={isLoadingActivities}
                        name={strings.averageClear}
                        href={averageClear ? `/pgcr/${averageClear.activityId}` : undefined}
                    />
                </div>
            </div>
        </m.div>
    )
}