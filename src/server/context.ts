/* eslint-disable @typescript-eslint/no-unused-vars */
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { Session, unstable_getServerSession } from 'next-auth';
import { authOptions } from '~/pages/api/auth/[...nextauth]';
import { prisma } from './prisma';



/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
  ) {
    // for API-response caching see https://trpc.io/docs/caching
    
    const { req, res } = opts
    
    const session = await unstable_getServerSession(req, res, authOptions)

    if (!session || !session.user) return {}

    const account = await prisma.account.findFirstOrThrow({
      where: {
        users: {
          some: {
            email: session?.user?.email
          }
        }
      },
      include: {
        users: {
          where: {
            email: session?.user?.email
          }
        }
      }
    })
    
    return {
      session,
      accountId: account.id,
      userId: account.users[0]!.id
    };
  }
  
  export type Context = trpc.inferAsyncReturnType<typeof createContext>;