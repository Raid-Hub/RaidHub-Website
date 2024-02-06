"use client"

import Image from "next/image"
import Link from "next/link"
import styled from "styled-components"
import { useLocale } from "~/app/managers/LocaleManager"
import { Flex } from "~/components/layout/Flex"
import { RaidHubPlayerSearchResult } from "~/types/raidhub-api"
import { bungieIconUrl } from "~/util/destiny/bungie-icons"
import { getUserName } from "~/util/destiny/bungieName"
import { formattedTimeSince } from "~/util/presentation/formatting"

export const SinglePlayerSearchResult = (props: {
    size: number
    player: RaidHubPlayerSearchResult
    handleSelect?: () => void
}) => {
    const { locale } = useLocale()
    return (
        <Container
            $size={props.size}
            href={`/profile/${props.player.membershipType ?? 0}/${props.player.membershipId}`}
            onClick={props.handleSelect}>
            <Flex $align="flex-start" $padding={props.size / 2} $gap={props.size / 2}>
                <Icon
                    src={bungieIconUrl(props.player.iconPath)}
                    alt={getUserName(props.player)}
                    unoptimized
                    width={96}
                    height={96}
                    $size={props.size}
                />
                <Flex
                    $direction="column"
                    $padding={0}
                    $gap={props.size / 2}
                    $crossAxis="flex-start">
                    <Username $size={props.size}>{getUserName(props.player)}</Username>
                    {props.player.lastSeen && (
                        <LastSeen $size={props.size}>
                            {formattedTimeSince(new Date(props.player.lastSeen), locale)}
                        </LastSeen>
                    )}
                </Flex>
            </Flex>
        </Container>
    )
}

const Container = styled(Link)<{
    $size: number
}>`
    padding: ${({ $size }) => $size * 0.25}em;
    &:hover {
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.highlight.orange},
            #0000 40%
        );
    }
`

const Icon = styled(Image)<{
    $size: number
}>`
    border-radius: ${({ $size }) => $size}px;

    width: ${({ $size }) => $size * 32}px;
    height: ${({ $size }) => $size * 32}px;
`

const Username = styled.span<{
    $size: number
}>`
    font-size: ${({ $size }) => 0.4 + $size * 0.4}rem;

    color: ${({ theme }) => theme.colors.text.primary};
`

const LastSeen = styled.span<{
    $size: number
}>`
    font-size: ${({ $size }) => 0.2 + $size * 0.4}rem;

    color: ${({ theme }) => theme.colors.text.secondary};
`