import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { protectedProcedure, router } from "../trpc";
import { Event } from "../../../node_modules/.prisma/client/index"
import { EventTypeRelationshipType, User } from "prisma/prisma-client";

export const eventTypesRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const eventTypes = await prisma.eventType.findMany({
      where: {
        accountId: ctx.accountId
      }
    })

    const relationships = await prisma.eventTypeRelationship.findMany({
      where: {
        eventTypes: {
          some: {
            accountId: ctx.accountId
          }
        }
      },
      include: {
        eventTypes: true
      }
    })

    return {
      eventTypes,
      relationships
    }
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
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string()
  })).mutation(async ({ ctx, input }) => {
    await prisma.eventType.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name
      }
    })

    return
  }),
  delete: protectedProcedure.input(z.object({
    id: z.number()
  })).mutation(async ({ ctx, input }) => {

    await prisma.event.deleteMany({
      where: {
        eventTypeId: input.id
      }
    })

    await prisma.eventTypeRelationship.deleteMany({
      where: {
        eventTypes: {
          some: {
            id: input.id
          }
        }
      }
    })

    await prisma.eventType.delete({
      where: {
        id: input.id
      }
    })

    return
  })
})