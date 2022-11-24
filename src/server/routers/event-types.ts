import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { protectedProcedure, router } from "../trpc";
import { Event } from "../../../node_modules/.prisma/client/index"
import { EventTypeRelationshipType, User } from "prisma/prisma-client";

export const eventTypesRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.eventType.findMany({
      where: {
        accountId: ctx.accountId
      }
    })
  }),
  get: protectedProcedure.input(z.object({
    eventTypeId: z.number()
  })).query(async ({ ctx, input }) => {

    const eventInfo = await prisma.eventType.findUnique({
      where: {
        id: input.eventTypeId
      },
      include: {
        animals: true,
        relationships: {
          include: {
            eventTypes: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        events: {
          where: {
            accountId: ctx.accountId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            user: true
          }
        },
      }
    })

    const userGraphInfo = await prisma.user.findMany({
      where: {
        accountId: ctx.accountId
      },
      include: {
        _count: {
          select: {
            Event: {
              where: {
                eventTypeId: input.eventTypeId
              }
            }
          }
        }
      }
    })

    if (!eventInfo || !userGraphInfo) throw new TRPCError({ code: "NOT_FOUND" })

    return {
      ...eventInfo,
      graph_data: userGraphInfo.map(data => ({
        name: data.name,
        _count: data._count
      }))
    }
  }),
  relate: protectedProcedure.input(z.object({
    eventTypeAId: z.number(),
    eventTypeBId: z.number(),
    relationshipType: z.string()
  })).mutation(async ({ ctx, input }) => {
    if (input.relationshipType === EventTypeRelationshipType.DIFFERENCE) {
      await prisma.eventTypeRelationship.create({
        data: {
          relationshipType: EventTypeRelationshipType.DIFFERENCE,
          eventTypes: {
            connect: [{
              id: input.eventTypeAId
            }, {
              id: input.eventTypeBId
            }]
          }
        }
      })
      return
    }
    throw new TRPCError({code: "BAD_REQUEST"})
  }),
  add: protectedProcedure.input(z.object({
    name: z.string(),
    isAccountLevel: z.boolean()
  })).mutation(async ({ ctx, input }) => {

    await prisma.eventType.create({
      data: {
        name: input.name,
        isAccountLevel: input.isAccountLevel,
        account: {
          connect: {
            id: ctx.accountId
          }
        }
      }
    })
  })
})