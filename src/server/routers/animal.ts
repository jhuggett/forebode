import { prisma } from "~/server/prisma";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
    return await prisma.eventType.findMany({
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
            animalId: input.animalId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
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
  })

});