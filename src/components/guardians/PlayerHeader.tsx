import styles from "~/styles/pages/inpsect.module.css"
import { DestinyCharacterComponent, DestinyProfileComponent } from "bungie-net-core/models"
import UserName from "../profile/user/UserName"
import Image from "next/image"
import Link from "next/link"
import { emblemUrl } from "~/util/destiny/bungie-icons"

export default function PlayerHeader({
    profile,
    characters
}: {
    profile: DestinyProfileComponent
    characters: Record<string, DestinyCharacterComponent>
}) {
    return (
        <div className={styles["player-header"]}>
            <Link
                href={`/profile/${profile.userInfo.membershipType}/${profile.userInfo.membershipId}`}>
                <h3>
                    <UserName {...profile.userInfo} />
                </h3>
            </Link>
            <Image
                src={emblemUrl(Object.values(characters)[0].emblemBackgroundPath)}
                alt={""}
                unoptimized
                fill
                style={{ userSelect: "none" }}
            />
        </div>
    )
}