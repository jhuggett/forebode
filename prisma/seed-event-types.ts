import { PrismaClient } from '@prisma/client';
import { AllEventTypes, getEventTypeForName } from '../src/server/events';

const prisma = new PrismaClient();

async function main() {
  const existingEventTypes = await prisma.eventType.findMany()
  const existingEventTypeNames = existingEventTypes.map(eventType => eventType.name)

  const existingEventsToDelete = existingEventTypes
  .filter(eventType => !getEventTypeForName(eventType.name))
  .map(eventType => eventType.name)

  await prisma.eventType.deleteMany({
    where: {
      name: {
        in: existingEventsToDelete
      }
    }
  })

  const eventTypesToCreate = AllEventTypes.filter(eventType => !existingEventTypeNames.includes(eventType.name))

  await prisma.eventType.createMany({
    data: eventTypesToCreate.map(eventType => ({
      name: eventType.name
    }))
  })
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
