import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"
import { zDeleteVanity } from "~/util/zod"
import { adminProcedure } from "../../.."

export const deleteVanity = adminProcedure.input(zDeleteVanity).mutation(async ({ input, ctx }) => {
    try {
        const removed = await ctx.prisma.profile.update({
            where: {
                vanity: input.vanity
            },
            data: {
                vanity: null
            },
            select: {
                destinyMembershipId: true,
                name: true
            }
        })
        revalidatePath(`/profile/${removed.destinyMembershipId}`)
        revalidatePath(`/user/${input.vanity}`)
        return { ...removed, ...input }
    } catch (e) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: e instanceof Error ? e.message : "Unknown error"
        })
    }
})
