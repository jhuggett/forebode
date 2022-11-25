import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/prisma";
import bcrypt from 'bcrypt'

export class JoiningCode {
  constructor(
    public userName: string,
    public accountId: number
  ) {}
  
  static from(str: string) {
    const decoded = Buffer.from(str, 'base64').toString('utf-8')
    const [ userName, accountId ] = decoded.split('.')
    return new JoiningCode(userName!, parseInt(accountId!))
  }

  toString() {
    return Buffer.from(`${this.userName}.${this.accountId}`, 'utf-8').toString('base64')
  }
}

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

    const joiningCode =  JoiningCode.from(code)

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
