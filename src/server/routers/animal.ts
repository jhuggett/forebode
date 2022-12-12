import { prisma } from "~/server/prisma";
import { protectedProcedure, router } from "../trpc";
import { TypeOf, z } from "zod";
import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";
import { Event, EventType } from "@prisma/client";

export const animalRouter = router({
  create: protectedProcedure.input(
    z.object({
      name: z.string().min(1).max(100),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const {
      name
    } = input

    const {
      id
    } = await prisma.animal.create({
      data: {
        name,
        accountId: ctx.accountId!,
      }
    })

    return {
      id,
      name
    }
  }),
  get: protectedProcedure.input(
    z.object({
      id: z.number()
    })
  )
  .query(async ({ctx, input}) => {
    const {
      id
    } = input

    const animal = await prisma.animal.findFirst({
      where: {
        id
      }
    })

    if (!animal) {
      throw new TRPCError({
        code: "NOT_FOUND"
      })
    }

    return {
      name: animal.name
    }
  }),
  delete: protectedProcedure.input(
    z.object({
      id: z.number()
    })
  )
  .mutation(async ({ctx, input}) => {
    const {
      id
    } = input

    await prisma.event.deleteMany({
      where: {
        animalId: id
      }
    })

    await prisma.animal.delete({
      where: {
        id
      }
    })
  }),
  eventTypes: protectedProcedure.input(
    z.object({
      id: z.number()
    })
  )
  .query(async ({ctx, input}) => {

    let availibleTypes = await prisma.eventType.findMany({
      where: {
        accountId: ctx.accountId,
        isAccountLevel: false
      }
    })

    const typesInUse = await prisma.animal.findUnique({
      where: {
        id: input.id
      },
      include: {
        eventTypes: true
      }
    })

    const namesToOmit = typesInUse?.eventTypes.map(t => t.name) || []
    availibleTypes = availibleTypes.filter(t => !namesToOmit.includes(t.name))

    return {
      tracked: typesInUse?.eventTypes,
      availible: availibleTypes
    }

  }),
  track: protectedProcedure.input(z.object({
    animalId: z.number(),
    eventId: z.number()
  })).mutation(async ({input, ctx}) => {
    await prisma.animal.update({
      where: {
        id: input.animalId
      },
      data: {
        eventTypes: {
          connect: {
            id: input.eventId
          }
        }
      }
    })
  }),
  untrack: protectedProcedure.input(z.object({
    animalId: z.number(),
    eventId: z.number()
  })).mutation(async ({input, ctx}) => {
    await prisma.animal.update({
      where: {
        id: input.animalId
      },
      data: {
        eventTypes: {
          disconnect: {
            id: input.eventId
          }
        }
      }
    })
  }),
  latestEvents: protectedProcedure.input(z.object({
    animalId: z.number()
  })).query(async ({ ctx, input }) => {
    const eventsToday = await prisma.eventType.findMany({
      where: {
        animals: {
          some: {
            id: input.animalId
          }
        }
      },
      include: {
        events: {
          where: {
            animalId: input.animalId,
            createdAt: {
              gte: startOfDay(new Date())
            }
          },
          orderBy: {
            createdAt: 'desc'
          },

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

    const latestEvents = await prisma.eventType.findMany({
      where: {
        animals: {
          some: {
            id: input.animalId
          }
        }
      },
      include: {
        events: {
          where: {
            animalId: input.animalId,
          },
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

    type EventInfo = typeof latestEvents[0]['events'][0]

    const eventTypes = new Map<number, EventType & {
      latest?: EventInfo,
      events_today: EventInfo[],
    }>()

    for (const eventType of eventsToday) {
      if (!eventTypes.has(eventType.id)) {
        eventTypes.set(eventType.id, { latest: undefined, events_today: [], ...eventType })
      }
      eventTypes.get(eventType.id)!.events_today = eventType.events
    } 

    for (const eventType of latestEvents) {
      if (!eventTypes.has(eventType.id)) {
        eventTypes.set(eventType.id, { latest: undefined, events_today: [], ...eventType })
      }
      if (eventType.events.length > 0) eventTypes.get(eventType.id)!.latest = eventType.events[0]
    } 

    return Array.from(eventTypes.values())
  })

});