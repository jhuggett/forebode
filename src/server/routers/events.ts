import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { protectedProcedure, router } from "../trpc";
import { Event } from "../../../node_modules/.prisma/client/index"
import { User } from "prisma/prisma-client";

export type EventInfo = Event & {
  user: User;
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

    return events
  }),
  capture: protectedProcedure.input(
    z.object({
      animalId: z.number().optional(),
      eventTypeId: z.number()
    })
  )
  .mutation(async ({ctx, input}) => {
    const {
      animalId,
      eventTypeId
    } = input

    await prisma.event.create({
      data: {
        accountId: !animalId ? ctx.accountId! : null,
        animalId: animalId ? animalId : null,
        eventTypeId: eventTypeId,
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