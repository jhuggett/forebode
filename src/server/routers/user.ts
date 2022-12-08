import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/prisma";
import bcrypt from 'bcrypt'
import { JoiningCode } from "../joining-code";

export const userRouter = router({
  join: publicProcedure.input(z.object({
    email: z.string().email(),
    userName: z.string().min(1).max(100),
    password: z.string().min(8).max(100),
    code: z.string()
  })).mutation(async ({ input }) => {
    const { 
      email,
      userName,
      password,
      code
    } = input;

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: userName,
        email,
        password: hashedPassword,
      }
    })

    const joiningCode = JoiningCode.from(code)

    await prisma.account.update({
      where: {
        id: joiningCode.accountId
      },
      data: {
        users: {
          connect: {
            id: user.id
          }
        }
      }
    })
  }),
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        userName: z.string().min(1).max(100),
        accountName: z.string(),
        password: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const { 
        email, 
        accountName, 
        userName,
        password,
      } = input;

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          name: userName,
          email,
          password: hashedPassword,
        }
      })

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
    }),
});
