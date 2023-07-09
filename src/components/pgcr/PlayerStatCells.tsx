import styles from "../../styles/pages/pgcr.module.css"
import { Icons } from "../../util/presentation/icons"
import { formattedNumber, secondsToHMS } from "../../util/presentation/formatting"
import { IPGCREntry } from "../../types/pgcr"
import { useLocale } from "../app/LanguageProvider"

type PlayerStatCellProps = {
    entry: IPGCREntry
}

const PlayerStatCells = ({ entry }: PlayerStatCellProps) => {
    const { language, locale, strings } = useLocale()
    const statsData: {
        icon: string
        name: string
        value: number | string
    }[] = [
        {
            icon: Icons.KILLS,
            name: strings.kills,
            value: formattedNumber(entry.stats.kills, locale)
        },
        {
            icon: Icons.DEATHS,
            name: strings.deaths,
            value: formattedNumber(entry.stats.deaths, locale)
        },
        {
            icon: Icons.ASSISTS,
            name: strings.assists,
            value: formattedNumber(entry.stats.assists, locale)
        },
        {
            icon: Icons.ABILITIES,
            name: strings.abilityKills,
            value: formattedNumber(entry.stats.abilityKills, locale)
        },
        {
            icon: Icons.TIME,
            name: strings.timeSpent,
            value: secondsToHMS(entry.stats.timePlayedSeconds)
        },
        {
            icon: Icons.UNKNOWN,
            name: strings.mostUsedWeapon,
            value: entry.weapons.first()?.name[language] ?? strings.none
        }
    ]
    return (
        <>
            {statsData.map(({ value, name, icon }, key) => (
                <div
                    key={key}
                    className={[styles["entry-card"], styles["character-stat"]].join(" ")}>
                    <img src={icon} alt={name + ": " + value} className={styles["stat-icon"]} />
                    <div className={styles["summary-stat-info"]}>
                        <span
                            className={[styles["summary-stat-name"], styles["contained-span"]].join(
                                " "
                            )}>
                            {name}
                        </span>
                        <span
                            className={[
                                styles["summary-stat-value"],
                                styles["contained-span"]
                            ].join(" ")}>
                            {value}
                        </span>
                    </div>
                </div>
            ))}
        </>
    )
}

export default PlayerStatCells