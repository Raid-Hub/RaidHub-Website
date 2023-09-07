import styles from "../../../styles/pages/profile/clan.module.css"
import { useClan } from "../../../hooks/bungie/useClan"
import Loading from "../../global/Loading"
import ClanBanner from "./ClanBanner"
import { fixClanName } from "../../../util/destiny/fixClanName"
import { BungieMembershipType } from "bungie-net-core/models"
import CustomError, { ErrorCode } from "~/models/errors/CustomError"
import { urlHighlight } from "~/util/presentation/urlHighlight"
import Link from "next/link"

type ClanCardProps = {
    membershipId: string
    membershipType: BungieMembershipType
}

const ClanCard = ({ membershipId, membershipType }: ClanCardProps) => {
    const {
        data: clan,
        isLoading,
        error
    } = useClan({
        membershipId,
        membershipType
    })
    return isLoading ? (
        <Loading wrapperClass={styles["card-loading"]} />
    ) : clan ? (
        <Link href={`/clan/${clan.groupId}`} className={styles["clan"]}>
            <div className={styles["clan-banner-container"]}>
                {clan.clanBanner && <ClanBanner {...clan.clanBanner} sx={10} />}
            </div>
            <div className={styles["desc"]}>
                <span className={styles["desc-title"]}>
                    {fixClanName(clan.name) + ` [${clan.clanInfo.clanCallsign}]`}
                </span>
                <span className={styles["desc-subtitle"]}>{clan?.motto}</span>
                <div className={styles["desc-text-wrapper"]}>
                    <p className={styles["desc-text"]}>{urlHighlight(clan?.about ?? "")}</p>
                </div>
            </div>
        </Link>
    ) : error ? (
        <div className={styles["clan"]} style={{ flexDirection: "column", gap: "1em" }}>
            <div>Error Loading Clan</div>
            <div>{CustomError.handle(e => e.message, error, ErrorCode.Clan)}</div>
        </div>
    ) : null
}

export default ClanCard
