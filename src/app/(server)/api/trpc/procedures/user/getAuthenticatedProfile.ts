import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../.."

export const getAuthenticatedProfile = protectedProcedure.query(async ({ ctx }) => {
    const primaryDestinyMembershipId = ctx.session.user.primaryDestinyMembershipId
    if (!primaryDestinyMembershipId) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User has no primaryDestinyMembershipId set."
        })
    }

    return await ctx.prisma.profile.findUnique({
        where: {
            destinyMembershipId: primaryDestinyMembershipId
        }
    })
})
