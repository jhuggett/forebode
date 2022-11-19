import { prisma } from "~/server/prisma";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { sub } from "date-fns";

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
      })),
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
                events: {
                  where: {
                    createdAt: {
                      gte: sub(new Date(), { days: 7 })
                    }
                  }
                },
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