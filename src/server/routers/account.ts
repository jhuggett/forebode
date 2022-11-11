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

    const summary = await prisma.animal.findMany({
      where: {
        accountId: account.id,
      },
      include: {
        events: {
          distinct: 'eventTypeName',
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            type: {
              select: {
                name: true
              }
            }
          }
        },
      }
    })

    return {
      id: account.id,
      name: account.name,
      animals: account.animals.map(animal => ({
        name: animal.name,
        id: animal.id
      })),
      summary
    }
  }),
});