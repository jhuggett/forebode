import { EventType, Event, User, Animal, EventTypeRelationship, EventTypeRelationshipType } from '@prisma/client';
import { inferRouterOutputs } from '@trpc/server';
import { formatDistanceToNow, formatRelative } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Checkbox, SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { Card, EmphaticTimeSince } from '../dashboard';
import { NextPageWithLayout, useAuth } from '../_app';

const AccountLevelEventCard = ({ info } : { info: EventTypeInfo }) => {

  const trpcContext = trpc.useContext()

  const {
    mutate: captureEvent
  } = trpc.events.capture.useMutation({
    onSuccess() {
      trpcContext.eventTypes.get.invalidate()
    }
  })

  const latestEvent = info.events[0]

  return (
    <div className='w-full max-w-sm'>
      <Card>
        { latestEvent ? (
          <div>
            <div className='m-4'>
              <p className='text-sm font-light'>
                Last time
              </p>
              <p className='text-lg'>{`${formatDistanceToNow(latestEvent.createdAt)} ago`}</p>
              <p className='font-thin'>
                {`${formatRelative(latestEvent.createdAt, new Date())}`}
              </p>
              <p className='text-xs w-full'>
                {`${latestEvent!.user.name}`}
              </p>
            </div>
          </div>
        ) : (
          <p>Nothing</p>
        ) }
        <ul className='list-disc'>
        { info.events.map(event => {
          return (
            <li className='text-sm font-extralight'>
              {`${formatRelative(event.createdAt, new Date())}, by ${event.user.name}`}
            </li>
          )
        }) }
        </ul>
        
        <div className='w-full flex justify-end'>
          <button onClick={() => captureEvent({eventTypeId: info.id})}>
            <svg className='x-12 h-12' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM232 368V344 280H168 144V232h24 64V168 144h48v24 64h64 24v48H344 280v64 24H232z"/>
            </svg>
          </button>
        </div>
      </Card>
    </div>
  )
}

const AnimalLevelEventCard = ({ info } : { info: EventTypeInfo }) => {
  return (
    <div className='w-full max-w-sm'>
      <Card>
        <p className='text-xl font-semibold'>Tracked by:</p>
        { info.animals.length > 0 ? (
          <ul className='flex gap-2 flex-wrap'>
            { info.animals.map(animal => (
              <Link href={`/animals/${animal.id}`}>{ animal.name }</Link>
            )) }
          </ul>
        ) : (
          <p>
            No animals are tracking this yet.
          </p>
        ) }
      </Card>
    </div>
  )
}



const NativeSelect = <T,>({ options, asString, onSelect } : { 
  options: T[], 
  asString: (option: T) => string 
  onSelect: (option: T) => void
}) => {
  const optionMap = useMemo(() => new Map(options.map(option => [asString(option), option])), options)
  return (
    <div>
      <select onChange={e => onSelect(optionMap.get(e.target.value)!)}>
        { Array.from(optionMap.keys()).map(key => (
          <option value={key}>{ key }</option>
        )) }
      </select>
    </div>
  )
}

const RelationshipCard = ({ info } : { info: EventTypeInfo } ) => {

  const trpcContext = trpc.useContext()

  const {
    data: allTypes,
    isLoading
  } = trpc.eventTypes.all.useQuery()

  const {
    mutate: relate
  } = trpc.eventTypes.relate.useMutation({
    onSuccess() {
      trpcContext.eventTypes.get.invalidate()
    }
  })

  const [typeToRelate, setTypeToRelate] = useState<EventType>()

  if (isLoading) return <Card><Loader /></Card>

  if (!allTypes) return <div>Whoops</div>

  return (
    <div className='w-full max-w-sm'>
      <Card>
        <h3 className='text-xl font-semibold'>
          Relationships:
        </h3>
        { info.relationships.length > 0 ? (
          <>{ info.relationships.map(relationship => (
            <div className='font-light p-2'>
              Differential relationship between { relationship.eventTypes[0]!.name } and { relationship.eventTypes[1]!.name }.
            </div>
          )) }</>
        ) : (
          <p>
            <p className='text-center py-4 italic'>
              No relationships.
            </p>
            { allTypes?.length > 1 && (
              <div className='py-4'>
                <NativeSelect options={allTypes.filter(t => t.name !== info.name)} asString={option => option.name} onSelect={option => setTypeToRelate(option)} />
                <button onClick={() => relate({
                  eventTypeAId: info.id,
                  eventTypeBId: typeToRelate!.id,
                  relationshipType: EventTypeRelationshipType.DIFFERENCE
                })} className='px-2 py-1 bg-gray-500 rounded-xl text-gray-200 my-2'>
                  Create differential relationship
                </button>
              </div>
            ) }
          </p>
        ) }
      </Card>
    </div>
  )
}

type EventTypeInfo = NonNullable<inferRouterOutputs<AppRouter>['eventTypes']['get']>

const EventPage: NextPageWithLayout = () => {

  const router = useRouter()
  const id = parseInt(router.query.id as string)

  const {
    data,
    isLoading
  } = trpc.eventTypes.get.useQuery({
    eventTypeId: id
  })

  if (isLoading) return <Loader />

  if (!data) return <div>Whoops</div>
	
	return (
		<div className="mt-12 flex flex-col items-center justify-center gap-8">
      <h2 className='text-2xl font-mono text-gray-600'>
        { data?.name }
      </h2>
      <div className='flex w-full flex-col items-center flex-wrap gap-4'>
        { data.isAccountLevel ? <AccountLevelEventCard info={data} /> : <AnimalLevelEventCard info={data} /> }
        
        <RelationshipCard info={data} />
      </div>
		</div>
  );
};

EventPage.requiresAuthentication = true
EventPage.getLayout = getDashboardLayout

export default EventPage;