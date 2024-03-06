import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../.."

export const deleteUser = protectedProcedure.mutation(async ({ ctx }) => {
    try {
        const { profile } = await ctx.prisma.user.delete({
            where: {
                id: ctx.session.user.id
            },
            select: {
                profile: true
            }
        })
        return profile
    } catch (e) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: e instanceof Error ? e.message : "Unknown error"
        })
    }
})