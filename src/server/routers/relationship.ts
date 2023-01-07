import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { protectedProcedure, router } from "../trpc";

export const relationshipRouter = router({
  get: protectedProcedure.input(z.object({
    id: z.number()
  })).query(async ({ ctx, input }) => {
    const relationship = await prisma.eventTypeRelationship.findFirst({
      where: {
        id: input.id
      }
    })

    if (!relationship) throw new TRPCError({
      message: 'Could not find relationshop.',
      code: 'BAD_REQUEST'
    })
    
    const eventTypes = await prisma.eventTypeRelationship.findFirst({
      where: {
        id: input.id
      },
      select: {
        eventTypes: {
          include: {
            _count: {
              select: {
                events: {
                  where: {
                    createdAt: {
                      gte: relationship.compareSince || new Date(0)
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return {
      relationship,
      eventTypes: eventTypes?.eventTypes
    }
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    compareSince: z.date().optional()
  })).mutation(async ({ ctx, input }) => {
    await prisma.eventTypeRelationship.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name,
        compareSince: input.compareSince
      }
    })
  }),
  delete: protectedProcedure.input(z.object({
    id: z.number()
  })).mutation(async ({ ctx, input }) => {
    await prisma.eventTypeRelationship.delete({
      where: {
        id: input.id
      }
    })
  })
})