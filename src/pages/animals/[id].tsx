import Link from 'next/link'
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { AllEventTypes } from '~/server/events';
import { trpc } from '~/utils/trpc';
import { Card } from '../dashboard';
import { NextPageWithLayout } from '../_app';
import { Event } from 'prisma/prisma-client'
import { format, formatDistanceToNow, formatRelative } from 'date-fns';

const EventCard = ({} : {
  eventTypeName: string,
  events: Event[]
}) => {

}

/*

for re-introduction later

<Card>
          <button onClick={() => deleteAnimal({ id })}>
            Delete
          </button>
        </Card>

*/

const AnimalPage: NextPageWithLayout = () => {
  
  const router = useRouter()
  const id = parseInt(router.query.id as string)

  const trpcContext = trpc.useContext()

  const {
    data: animal,
    isLoading,
    isError
  } = trpc.animal.get.useQuery({
    id
  })

  const {
    mutate: deleteAnimal,
    isLoading: loadingDeleteAnimal
  } = trpc.animal.delete.useMutation({
    onSuccess() {
      trpcContext.account.current.invalidate()
      router.replace('/animals')
    }
  })

  const {
    data: events,
    isLoading: loadingEvents,
    isFetching: fetchingEvents
  } = trpc.events.get.useQuery({
    animalId: id
  })

  const {
    mutate: captureEvent,
    isLoading: capturingEvent
  } = trpc.events.capture.useMutation({
    onSuccess() {
      trpcContext.events.get.invalidate()
    }
  })

  if (isLoading || loadingDeleteAnimal || loadingEvents) {
    return <Loader/>
  }

  if (!animal || isError || !events) {
    return <>Whoops...</>
  }

	return (
		<div className="mt-12 flex flex-col flex-wrap items-center justify-center gap-8">
      
      <div className='flex flex-wrap justify-center gap-4 w-full px-2 rotate-6'>
        <Card>
          <h1 className='text-2xl font-serif'>
            { animal.name }
          </h1>
        </Card>
        
      </div>
      <div className={`flex flex-wrap justify-center gap-4 w-full px-2`}>
      { AllEventTypes.map(eventType => {
				const eventsOfType = events.filter(e => e[0] === eventType.name)[0]?.[1]
          .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1) ?? []

        const numberOfEvents = eventsOfType.length

        const latestEvent = eventsOfType[0]

        const latestTime = latestEvent?.createdAt
        const now = new Date()
        
				return (
					<div className='max-w-sm w-full'>
            <Card>
              <h3 className='text-xl font-semibold border-b-2 border-gray-600'>{ eventType.displayName }</h3>
              { numberOfEvents > 0 &&
                (
                  <div className='m-4'>
                    <p className='text-sm font-light'>
                      Last time
                    </p>
                    <p className='text-lg'>{`${formatDistanceToNow(latestTime!)} ago`}</p>
                    <p className='font-thin'>
                      {`${formatRelative(latestTime!, now)}`}
                    </p>
                    <p className='text-xs w-full'>
                      {`${latestEvent!.user.name}`}
                    </p>
                  </div>
                )
              }
              <ul className='list-disc'>
                { eventsOfType.slice(1, 5).map(e => {
                  if (!e) return

                  const happened = e!.createdAt

                  return (
                    <li className='text-sm font-extralight'>
                      {`${formatRelative(happened, now)}, by ${e!.user.name}`}
                    </li>
                  )
                }) }
              </ul>
              <div className='w-full flex justify-end'>
                <button 
                  onClick={() => captureEvent({ animalId: id, eventType: eventType.name })} 
                  className={`bg-gray-400 mt-4 px-3 py-1 rounded-full font-bold text-gray-100 ${(fetchingEvents || capturingEvent) && 'opacity-50'}`} 
                >
                  Capture
                </button>
              </div>
            </Card>
          </div>
				)
			}) }
      </div>
		</div>
  );
};

AnimalPage.requiresAuthentication = true
AnimalPage.getLayout = getDashboardLayout

export default AnimalPage;
