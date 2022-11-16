import Link from 'next/link'
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card } from '../dashboard';
import { NextPageWithLayout } from '../_app';
import { Event } from 'prisma/prisma-client'
import { format, formatDistanceToNow, formatRelative } from 'date-fns';
import { getEventTypeForName } from '~/server/events';

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
      

          <h1 className='text-4xl text-gray-600 font-serif font-bold'>
            { animal.name }
          </h1> 
        
      <div className={`flex flex-wrap justify-center gap-4 w-full px-2`}>
      { animal.eventTypes.sort((a, b) => a.name > b.name ? 1 : -1).map(eventType => {
				const eventsOfType = events.filter(e => e[0] === eventType.name)[0]?.[1]
          .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1) ?? []

        const numberOfEvents = eventsOfType.length

        const latestEvent = eventsOfType[0]

        const latestTime = latestEvent?.createdAt
        const now = new Date()
        
				return (
					<div className='max-w-sm w-full'>
            <Card>
              <h3 className='text-xl text-center font-mono text-gray-700 font-semibold border-b-2 border-gray-600'>{ getEventTypeForName(eventType.name)?.displayName }</h3>
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
                  className={`active:scale-90 hover:scale-105 duration-300 ${(fetchingEvents || capturingEvent) && 'opacity-50'}`} 
                >
                  <svg className='x-12 h-12' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM232 368V344 280H168 144V232h24 64V168 144h48v24 64h64 24v48H344 280v64 24H232z"/>
                  </svg>
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
