import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { protectedProcedure, router } from "../trpc";
import { Event } from "../../../node_modules/.prisma/client/index"
import { User } from "prisma/prisma-client";

export type EventInfo = Event & {
  user: User;
}

const sortEvents = (events: EventInfo[], eventMap: Map<string, EventInfo[]>) => {
  for (const event of events) {
    if (!eventMap.has(event.eventTypeName)) {
      eventMap.set(event.eventTypeName, [event])
    } else {
      eventMap.get(event.eventTypeName)!.push(event)
    }
  }
}

export const eventsRouter = router({
  get: protectedProcedure.input(
    z.object({
      animalId: z.number().optional()
    })
  )
  .query(async ({ctx, input}) => {

    const { animalId } = input
    const { accountId } = ctx

    const eventMap = new Map<string, EventInfo[]>()

    if (!animalId) {
      // get events for account

      if (!accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST"
        })
      }

      const events = await prisma.event.findMany({
        where: {
          accountId
        },
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })

      sortEvents(events, eventMap)
    } else {
      const events = await prisma.event.findMany({
        where: {
          animalId
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: true
        },
        take: 10
      })

      sortEvents(events, eventMap)
    }

    return Array.from(eventMap.entries())
  }),
  capture: protectedProcedure.input(
    z.object({
      animalId: z.number().optional(),
      eventType: z.string()
    })
  )
  .mutation(async ({ctx, input}) => {
    const {
      animalId,
      eventType
    } = input

    await prisma.event.create({
      data: {
        accountId: !animalId ? ctx.accountId! : null,
        animalId: animalId ? animalId : null,
        eventTypeName: eventType,
        userId: ctx.userId!
      }
    })
  }),
  delete: protectedProcedure.input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ctx, input}) => {
    const {
      id
    } = input

    await prisma.event.delete({
      where: {
        id
      }
    })
  })
})