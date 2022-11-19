import Link from 'next/link'
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card } from '../dashboard';
import { NextPageWithLayout, useAuth } from '../_app';
import { Event, EventType } from 'prisma/prisma-client'
import { addMinutes, formatDistanceToNow, formatRelative, isBefore } from 'date-fns';


const EventTypeCard = ({ eventType, animalId, name } : {
  eventType: (EventType & {
      events: (Event & {
          user: {
              name: string;
          };
      })[];
  }),
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
    <div className='w-full max-w-md'>
      <Card>
        <h3 className='text-xl text-center font-mono text-gray-700 font-semibold border-b-2 border-gray-600'>{ eventType.name }</h3>
        { latestEvent ?
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
          : (
            <p className='py-8 text-center max-w-xs px-2'>Nothing yet. Press the plus icon to capture the first event.</p>
          )
        }
        <ul className='list-disc'>
          { eventType.events.slice(1, 5).map(e => {
            if (!e) return

            const happened = e!.createdAt

            return (
              <li className='text-sm font-extralight'>
                {`${formatRelative(happened, now)}, by ${e!.user.name}`}
              </li>
            )
          }) }
        </ul>
        <div className='w-full flex justify-end gap-2'>
          { canUndo &&
            <button onClick={() => deleteEvent({id: latestEvent.id})} className='text-gray-500'>undo</button>
          }
          <button 
            onClick={() => captureEvent({ animalId, eventTypeId: eventType.id })} 
            className={`active:scale-90 hover:scale-105 duration-300 ${(capturingEvent || undoingEvent) && 'opacity-50'}`} 
          >
            <svg className='x-12 h-12' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM232 368V344 280H168 144V232h24 64V168 144h48v24 64h64 24v48H344 280v64 24H232z"/>
            </svg>
          </button>
        </div>
      </Card>
    </div>
  )
}

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
		<div className="mt-12 flex flex-col flex-wrap items-center justify-center gap-8">
      <h1 className='text-4xl text-gray-600 font-serif font-bold flex gap-8 items-center'>
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
