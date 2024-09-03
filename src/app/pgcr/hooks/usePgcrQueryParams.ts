import { z } from "zod"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { type PGCRPageParams } from "../types"

export const usePgcrQueryParams = () =>
    useQueryParams<PGCRPageParams>(
        z.object({
            player: z.string().regex(/d+/).optional(),
            character: z.string().regex(/d+/).optional()
        })
    )
