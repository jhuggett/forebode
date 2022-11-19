/**
 * This file contains the root router of your tRPC-backend
 */
import { router } from "../trpc";
import { accountRouter } from "./account";
import { animalRouter } from "./animal";
import { eventTypesRouter } from "./event-types";
import { eventsRouter } from "./events";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  account: accountRouter,
  animal: animalRouter,
  events: eventsRouter,
  eventTypes: eventTypesRouter
});

export type AppRouter = typeof appRouter;
