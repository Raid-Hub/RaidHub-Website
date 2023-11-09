import styles from "../../styles/pages/leaderboards.module.css"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { LeaderboardEntryParticipant } from "../../types/leaderboards"

const defautlIcon = "https://www.bungie.net/img/theme/destiny/icons/missing_emblem.jpg"

const LeaderboardEntryUser = ({ user }: { user: LeaderboardEntryParticipant }) => {
    const [icon, setIcon] = useState(user.iconURL ?? defautlIcon)
    return (
        <div className={styles["leaderboard-entry-user"]}>
            <div className={styles["user-icon-container"]}>
                <Image
                    unoptimized
                    onError={() => setIcon(defautlIcon)}
                    src={icon}
                    alt={`icon for ${user.displayName}`}
                    fill
                />
            </div>
            {user.url ? (
                <Link
                    href={user.url}
                    className={styles["username"]}
                    target={user.url.startsWith("/") ? "" : "_blank"}>
                    <span>{user.displayName}</span>
                </Link>
            ) : (
                <span className={styles["username"]}>
                    <span>{user.displayName}</span>
                </span>
            )}
        </div>
    )
}

export default LeaderboardEntryUser
