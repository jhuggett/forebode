import { prisma } from "~/server/prisma";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";

export const accountRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const email = ctx.session.user?.email
    if (!email) {
      throw new TRPCError({
        code: "BAD_REQUEST"
      })
    }

    const account = await prisma.account.findFirst({
      where: {
        id: ctx.accountId
      },
      include: {
        animals: true
      }
    })

    if (!account) {
      throw new TRPCError({
        code: "BAD_REQUEST"
      })
    }

    return {
      id: account.id,
      name: account.name,
      animals: account.animals.map(animal => ({
        name: animal.name,
        id: animal.id
      }))
    }
  }),
});