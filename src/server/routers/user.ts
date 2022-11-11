import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/prisma";
import bcrypt from 'bcrypt'

export const userRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        userName: z.string().min(1).max(100),
        accountName: z.string().optional(),
        password: z.string().min(8).max(100),
        joiningCode: z.string().optional()
      })
    )
    .mutation(async ({ input }) => {
      const { 
        email, 
        accountName, 
        userName,
        password,
        joiningCode
      } = input;

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          name: userName,
          email,
          password: hashedPassword,
        }
      })

      if (joiningCode) {
        await prisma.account.update({
          where: {
            id: parseInt(joiningCode!)
          },
          data: {
            users: {
              connect: {
                id: user.id
              }
            }
          }
        })
      } else {
        await prisma.account.create({
          data: {
            name: accountName!,
            users: {
              connect:  {
                id: user.id
              }
            }
          }
        })
      }
    }),
});
