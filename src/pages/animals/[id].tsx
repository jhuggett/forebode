import Link from 'next/link'
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card, Divider, EmphaticTimeSince } from '../dashboard';
import { NextPageWithLayout, useAuth } from '../_app';
import { addMinutes, formatDistanceToNow, formatRelative, isBefore } from 'date-fns';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '~/server/routers/_app';


const EventTypeCard = ({ eventType, animalId, name } : {
  eventType: EventInfo
  animalId: number,
  name: string
}) => {
  const trpcContext = trpc.useContext()

  const {
    mutate: captureEvent,
    isLoading: capturingEvent
  } = trpc.events.capture.useMutation({
    onSuccess() {
      trpcContext.animal.latestEvents.invalidate()
    }
  })

  const {
    mutate: deleteEvent,
    isLoading: undoingEvent
  } = trpc.events.delete.useMutation({
    onSuccess () {
      trpcContext.animal.latestEvents.invalidate()
    }
  })

  const latestEvent = eventType.events[0]

  const latestTime = latestEvent?.createdAt
  const now = new Date()

  const canUndo = latestEvent && latestEvent.user.name === name && isBefore(new Date(), addMinutes(latestEvent.createdAt, 10)) 

  return (
    <div className=''>
      <Card>
        <div className='flex flex-wrap items-center justify-center gap-8'>
          { latestEvent ?
            (
              <div className='flex flex-col justify-center items-center min-w-fit'>
                <h3 className='text-2xl text-gray-700 font-semibold pb-2'>Last { eventType.name }</h3>
                <span className='p-2 m-2 bg-gray-300 rounded-lg'>
                  <EmphaticTimeSince lastDate={latestTime!} />
                </span>
                <p className='font-thin'>
                  {`${formatRelative(latestTime!, now)}`}
                </p>
                <p className='text-xs'>
                  {`${latestEvent!.user.name}`}
                </p>
              </div>
            )
            : (
              <p className='py-8 text-center max-w-xs px-2'>Nothing yet. Press the plus icon to capture the first event.</p>
            )
          }
            <div className='flex flex-col justify-center items-center gap-2'>
              { canUndo &&
                <button onClick={() => deleteEvent({id: latestEvent.id})} className='text-gray-500'>undo</button>
              }
              <button 
                onClick={() => captureEvent({ animalId, eventTypeId: eventType.id })} 
                className={`active:scale-90 hover:scale-105 duration-300 ${(capturingEvent || undoingEvent) && 'opacity-50'}`} 
              >
                <svg className='h-14 fill-gray-200 bg-gray-800 rounded-2xl p-2' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
              </button>
            </div>
        </div>
      </Card>
    </div>
  )
}

type EventInfo = NonNullable<inferRouterOutputs<AppRouter>['animal']['latestEvents'][0]>

const AnimalPage: NextPageWithLayout = () => {
  
  const router = useRouter()
  const id = parseInt(router.query.id as string)

  const { name } = useAuth()

  const {
    data: animal,
    isLoading,
    isError
  } = trpc.animal.get.useQuery({
    id
  })

  const {
    data: events,
    isLoading: loadingEvents
  } = trpc.animal.latestEvents.useQuery({
    animalId: id
  })

  if (isLoading || loadingEvents) {
    return <Loader/>
  }

  if (!animal || isError || !events) {
    return <>Whoops...</>
  }

	return (
		<div className="mt-12 flex flex-col gap-8 w-full max-w-7xl m-auto">
      <h1 className='text-4xl m-auto text-gray-600 font-serif font-bold flex gap-8 items-center'>
        { animal.name }
        <Link href={`/animals/settings/${id}`}>
          <svg className='h-6 hover:cursor-pointer fill-gray-600' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M200 0H312l17.2 78.4c15.8 6.5 30.6 15.1 44 25.4l76.5-24.4 56 97-59.4 54.1c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l59.4 54.1-56 97-76.5-24.4c-13.4 10.3-28.2 18.9-44 25.4L312 512H200l-17.2-78.4c-15.8-6.5-30.6-15.1-44-25.4L62.3 432.5l-56-97 59.4-54.1C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L6.3 176.5l56-97 76.5 24.4c13.4-10.3 28.2-18.9 44-25.4L200 0zm56 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/></svg>
        </Link>
      </h1> 
      <div className={`flex flex-wrap justify-center gap-4 w-full px-2`}>
        { events.map(event => (<EventTypeCard eventType={event} animalId={id} name={name} />)) }
      </div>
		</div>
  );
};

AnimalPage.requiresAuthentication = true
AnimalPage.getLayout = getDashboardLayout

export default AnimalPage;
