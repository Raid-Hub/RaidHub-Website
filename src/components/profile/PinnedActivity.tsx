import styles from "../../styles/profile.module.css"
import { RaidBanner } from "../../util/destiny/raid"
import Loading from "../global/Loading"
import { Icons } from "../../util/presentation/icons"
import { toCustomDateString } from "../../util/presentation/formatting"
import { ErrorHandler } from "../../types/generic"
import { useActivity } from "../../hooks/bungie/useActivity"
import { useLocale } from "../app/LanguageProvider"

type PinnedActivityProps = {
    activityId?: string | null
    errorHandler: ErrorHandler
}

const PinnedActivity = ({ activityId, errorHandler }: PinnedActivityProps) => {
    const { pgcr, isLoading: isLoadingActivity } = useActivity({ activityId, errorHandler })
    const { locale, strings } = useLocale()
    if (isLoadingActivity)
        return (
            <div className={styles["pinned-activity-wrapper"]}>
                <div className={styles["pinned-activity-loading"]}>
                    <Loading />
                </div>
            </div>
        )
    else if (!pgcr) return <div className={styles["pinned-activity-wrapper"]}></div>
    else
        return (
            <div className={styles["pinned-activity-wrapper"]}>
                <a href={`/pgcr/${activityId}`}>
                    <div className={styles["pinned-activity"]}>
                        <div
                            className={["background-img", styles["pinned-background"]].join(" ")}
                            style={{
                                backgroundImage: `url('${RaidBanner[pgcr.details.raid]}')`
                            }}
                        />
                        <img className={styles["pin"]} src={Icons.PIN} alt="" />

                        <div className={styles["card-header-text"]}>
                            <p className={styles["card-header-title"]}>{pgcr.title(strings)}</p>
                        </div>
                        <div className={styles["card-header-subtext"]}>
                            <p>{toCustomDateString(pgcr.completionDate, locale)}</p>

                            <div className={styles["card-header-time"]}>
                                <img src={Icons.SPEED} alt="" width="20px" height="20px" />
                                <span>{pgcr.speed.string(strings)}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        )
}

export default PinnedActivity
