import { prisma } from "~/server/prisma";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AllEventTypes } from "../events";

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
        eventTypes: {
          connect: AllEventTypes.map(e => ({ name: e.name }))
        }
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
      },
      include: {
        eventTypes: true
      }
    })

    if (!animal) {
      throw new TRPCError({
        code: "NOT_FOUND"
      })
    }

    return {
      name: animal.name,
      eventTypes: animal.eventTypes
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
});