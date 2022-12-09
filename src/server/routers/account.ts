import { prisma } from "~/server/prisma";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { sub } from "date-fns";
import { JoiningCode } from "../joining-code";

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
        animals: {
          include: {
            _count: {
              select: {
                eventTypes: true
              }
            }
          }
        }
      }
    })

    if (!account) {
      throw new TRPCError({
        code: "BAD_REQUEST"
      })
    }

    

    const joiningCode = new JoiningCode(ctx.session.user?.name!, account.name, account.id)

    return {
      id: account.id,
      name: account.name,
      animals: account.animals.map(animal => ({
        name: animal.name,
        id: animal.id,
        numberOfEventTypesTracking: animal._count.eventTypes
      })),
      joiningCode: joiningCode.toString()
    }
  }),
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const animals = await prisma.animal.findMany({
      where: {
        accountId: ctx.accountId,
      },
      include: {
        events: {
          distinct: 'eventTypeId',
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            type: {
              select: {
                name: true
              }
            },
            user: {
              select: {
                name: true
              }
            }
          }
        },
      }
    })

    const relationships = await prisma.eventTypeRelationship.findMany({
      where: {
        eventTypes: {
          every: {
            accountId: ctx.accountId
          }
        }
      },
      include: {
        eventTypes: {
          include: {
            _count: {
              select: {
                events: true,
              },

            }
          }
        }
      }
    })

    const accountLevelEventTypes = await prisma.eventType.findMany({
      where: {
        accountId: ctx.accountId,
        isAccountLevel: true
      },
      include: {
        events: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return {
      animals,
      relationships,
      accountLevelEventTypes
    }
  })
});