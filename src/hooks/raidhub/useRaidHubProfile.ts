import { RaidHubProfile } from "../../types/profile"
import CustomError, { ErrorCode } from "../../models/errors/CustomError"
import { ErrorHandler } from "../../types/generic"
import { useCallback, useEffect, useState } from "react"
import { getRaidHubProfile } from "../../services/app/getProfile"

type UseRaidHubProfileParams = {
    destinyMembershipId: string
    errorHandler: ErrorHandler
}

type UseRaidHubProfile = {
    profile: RaidHubProfile | null
    isLoading: boolean
    revalidate(): void
}

export function useRaidHubProfile({
    destinyMembershipId,
    errorHandler
}: UseRaidHubProfileParams): UseRaidHubProfile {
    const [profile, setProfile] = useState<RaidHubProfile | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const profile = await getRaidHubProfile(destinyMembershipId)
            setProfile(profile)
        } catch (e: any) {
            setError(e)
        } finally {
            setIsLoading(false)
        }
    }, [destinyMembershipId])

    useEffect(() => {
        error && CustomError.handle(errorHandler, error, ErrorCode.RaidHubProfile)
    }, [error, errorHandler])

    useEffect(() => {
        setIsLoading(true)
        fetchData()
    }, [fetchData])
    return { profile, isLoading, revalidate: fetchData }
}
