import { useEffect, useRef, useState } from "react"
import { shared as client } from "../util/http/bungie"
import { CustomBungieSearchResult } from "../util/types"

type UseSearch = {
    results: CustomBungieSearchResult[]
    isLoading: boolean
}

export function useSearch(query: string): UseSearch {
    const [isLoading, setLoading] = useState<boolean>(false)
    const lastSearch = useRef<number>(Date.now())
    const [results, setResults] = useState<CustomBungieSearchResult[]>([])

    useEffect(() => {
        setLoading(!!query)
        if (query) {
            fetchUsers()
        } else {
            setResults([])
        }

        async function fetchUsers() {
            const currentSearch = Date.now()
            lastSearch.current = currentSearch

            const bungieName = asBungieName(query)

            let hydratedResponse: CustomBungieSearchResult[]
            if (bungieName) {
                const response = await client.searchByBungieName(...bungieName)
                hydratedResponse = await Promise.all(
                    response.filter(
                        user =>
                            !user.crossSaveOverride ||
                            user.membershipType === user.crossSaveOverride
                    )
                    //.map(async user => ({ ...user, ...(await client.getFirstCharacter(user)) }))
                )
            } else {
                const response = await client.searchForUser(query.split("#")[0])
                hydratedResponse = await Promise.all(
                    response
                        .map(user => ({
                            ...user,
                            ...user.destinyMemberships[0]
                        }))
                        .filter(user => user.membershipId && user.membershipType)
                    //.map(async user => ({ ...user, ...(await client.getFirstCharacter(user)) }))
                )
            }
            if (lastSearch.current === currentSearch) {
                setResults(hydratedResponse)
                setLoading(false)
            }
        }
    }, [query])
    return { results, isLoading }
}

function asBungieName(name: string): [name: string, code: number] | undefined {
    if (name.includes("#")) {
        const [nameStr, code] = name.split("#")
        let codeNum = parseInt(code)
        if (nameStr && codeNum) {
            return [nameStr, codeNum]
        }
    }
    return undefined
}