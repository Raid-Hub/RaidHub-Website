import styles from "../../../styles/pages/profile/raids.module.css"
import Link from "next/link"
import { Difficulty, Raid } from "../../../types/raids"
import { useLocale } from "../../app/LanguageProvider"
import { useCallback, useState } from "react"
import { Diamond2 } from "../../../images/icons"
import { RaidTag } from "../../../types/profile"
import { LocalStrings } from "../../../util/presentation/localized-strings"
import { Tag, wfRaceMode } from "../../../util/raidhub/tags"
import Image from "next/image"

export type RaceTag = {
    placement?: number
    asterisk?: boolean
    raid: Raid
    challenge: boolean
    dayOne: boolean
    contest: boolean
    weekOne: boolean
}
type RaidTagLabelProps = {
    instanceId?: string
    scrollToDot: (instanceId: string) => void
} & (
    | ({
          type: "challenge"
      } & RaidTag)
    | ({
          type: "race"
      } & RaceTag)
)
const RaidTagLabel = (props: RaidTagLabelProps) => {
    const { strings } = useLocale()
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

    const scroll = () => {
        props.instanceId && props.scrollToDot(props.instanceId)
    }

    const handleHover = () => {
        const timeout = setTimeout(scroll, 750)
        setTimer(timeout)
    }

    const handleLeave = useCallback(() => {
        timer && clearTimeout(timer)
    }, [timer])

    const label =
        props.type === "challenge"
            ? getChallengeLabel(props, strings)
            : getRaceLabel(props, strings)

    function InnerTag() {
        return (
            <>
                {props.type === "challenge" && props.bestPossible && (
                    <Image src={Diamond2} alt="mastery diamond" />
                )}
                <span>{label}</span>
            </>
        )
    }

    return label ? (
        props.instanceId ? (
            <Link
                className={styles["clickable-tag"]}
                href={`/pgcr/${props.instanceId}`}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}>
                <InnerTag />
            </Link>
        ) : (
            <div className={styles["clickable-tag"]}>
                <InnerTag />
            </div>
        )
    ) : null
}

function getRaceLabel(props: RaceTag, strings: LocalStrings): string | null {
    const tag = wfRaceMode(props)
    if (tag) {
        return `${strings.tags[tag]}${props.asterisk ? "*" : ""}${
            props.placement ? ` #${props.placement}` : ""
        }`
    } else {
        return null
    }
}

function getChallengeLabel(tag: RaidTag, strings: LocalStrings): string | null {
    // special cases
    let wishWall = false
    if (tag.raid === Raid.DEEP_STONE_CRYPT && tag.playerCount === 1) {
        return null
    } else if (tag.raid === Raid.GARDEN_OF_SALVATION && tag.playerCount === 2) {
        tag = {
            ...tag,
            fresh: false
        }
    } else if (tag.raid === Raid.VAULT_OF_GLASS && tag.playerCount === 1) {
        tag = {
            ...tag,
            fresh: false
        }
    } else if (tag.raid === Raid.LAST_WISH && tag.playerCount === 1 && tag.fresh) {
        wishWall = true
    }
    const descriptors: string[] = []
    if (tag.fresh && !tag.flawless) descriptors.push(strings.tags[Tag.FRESH])
    switch (tag.playerCount) {
        case 1:
            descriptors.push(strings.tags[Tag.SOLO])
            break
        case 2:
            descriptors.push(strings.tags[Tag.DUO])
            break
        case 3:
            descriptors.push(strings.tags[Tag.TRIO])
            break
    }
    if (tag.flawless) descriptors.push(strings.tags[Tag.FLAWLESS])
    if (tag.difficulty == Difficulty.MASTER) descriptors.push(strings.tags[Tag.MASTER])
    else if (tag.difficulty == Difficulty.CONTEST) descriptors.push(strings.tags[Tag.CONTEST])
    if (tag.fresh == false) descriptors.push(strings.checkpoints[tag.raid])
    let str = descriptors.join(" ")
    if (wishWall) str += " (Wishwall)"
    if (tag.fresh == null) str += "*"
    return str
}

export default RaidTagLabel
