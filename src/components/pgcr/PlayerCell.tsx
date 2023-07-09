import styles from "../../styles/pages/pgcr.module.css"
import PGCRPlayer from "../../models/pgcr/Player"
import { Icons } from "../../util/presentation/icons"

type PlayerCellProps = {
    member: PGCRPlayer
    index: number
    emblemBackground: string
    memberIndex: number
    solo: boolean
    updateMemberIndex: (clicked: number) => void
}

const PlayerCell = ({
    member,
    index,
    emblemBackground,
    memberIndex,
    solo,
    updateMemberIndex
}: PlayerCellProps) => {
    const dynamicCssClass = memberIndex === index ? styles["selected"] : ""
    const completionClass = member.didComplete ? "" : styles["dnf"]
    const icon = member.characters[0].logo
    const displayName = member.displayName ?? member.membershipId

    return (
        <button
            key={index}
            className={[
                styles["entry-card"],
                styles["selectable"],
                dynamicCssClass,
                completionClass
            ].join(" ")}
            onClick={() => updateMemberIndex(index)}>
            <div className={styles["emblem"]}>
                <img src={emblemBackground} alt={`Emblem for ${member.displayName}`} />
            </div>
            <div className={styles["color-film"]} />

            <div className={styles["member-card"]}>
                <div className={styles["class-logo"]}>
                    {member.characters.length && (
                        <img src={icon} alt={member.characters[0].className} />
                    )}
                </div>
                <div className={styles["member-name"]}>
                    <span className={styles["contained-span"]}>{displayName}</span>
                </div>
                <div className={styles["quick-stats-container"]}>
                    {solo ? (
                        <img
                            className={styles["flawless-diamond"]}
                            src={Icons.FLAWLESS_DIAMOND}
                            alt={member.displayName + " went flawless this raid"}
                        />
                    ) : (
                        <div className={styles["quick-stats"]}>
                            <div className={styles["quick-stat"]}>
                                {<img src={Icons.KILLS} alt={"Kills"} />}
                                <span>{member.stats.kills}</span>
                            </div>
                            <div className={styles["quick-stat"]}>
                                {<img src={Icons.ASSISTS} alt={"Assists"} />}
                                <span>{member.stats.assists}</span>
                            </div>
                            <div className={styles["quick-stat"]}>
                                {<img src={Icons.DEATHS} alt={"Deaths"} />}
                                <span>{member.stats.deaths}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </button>
    )
}

export default PlayerCell