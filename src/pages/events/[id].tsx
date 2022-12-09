import { EventType, Event, User, Animal, EventTypeRelationship, EventTypeRelationshipType } from '@prisma/client';
import { inferRouterOutputs } from '@trpc/server';
import { formatDistanceToNow, formatRelative } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { VictoryChart, VictoryContainer, VictoryPie } from 'victory';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Checkbox, SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { EventTypeCard } from '../animals/[id]';
import { Card, Divider, EmphaticTimeSince } from '../dashboard';
import { NextPageWithLayout, useAuth } from '../_app';

const AccountLevelEventCard = ({ info } : { info: EventTypeInfo }) => {

  const { name } = useAuth()

  return <EventTypeCard eventType={info} name={name} />
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

const Graphs = ({ info } : { info: EventTypeInfo }) => {
  return (
    <div className='w-full max-w-sm'>
      <Card>
        <h4 className='text-center font-medium '>Who did what?</h4>

          <VictoryPie
            containerComponent={<VictoryContainer
              style={{
                pointerEvents: "auto",
                userSelect: "auto",
                touchAction: "auto"
              }}
            />} 
            data={info.graph_data.filter(data => data._count.Event > 0).map(data => ({
              x: data.name,
              y: data._count.Event
            }))}
          />
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
		<div className="mt-12 flex flex-col items-center justify-center gap-8 px-2 pb-4">
      <div className='flex items-center gap-8'>
        <h2 className='text-2xl font-mono text-gray-600'>
          { data?.name }
        </h2>
        <Link href={`/events/settings/${id}`}>
          <svg className='h-6 hover:cursor-pointer fill-gray-600' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M200 0H312l17.2 78.4c15.8 6.5 30.6 15.1 44 25.4l76.5-24.4 56 97-59.4 54.1c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l59.4 54.1-56 97-76.5-24.4c-13.4 10.3-28.2 18.9-44 25.4L312 512H200l-17.2-78.4c-15.8-6.5-30.6-15.1-44-25.4L62.3 432.5l-56-97 59.4-54.1C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L6.3 176.5l56-97 76.5 24.4c13.4-10.3 28.2-18.9 44-25.4L200 0zm56 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/></svg>
        </Link>
      </div>
      <div className='flex w-full max-w-7xl flex-col gap-4'>
        <div className='m-auto'>
          { data.isAccountLevel ? <AccountLevelEventCard info={data} /> : <AnimalLevelEventCard info={data} /> }
        </div>
        <Divider>Analytics</Divider>
        <div className='m-auto'>
          <Graphs info={data} />
        </div>
      </div>
		</div>
  );
};

EventPage.requiresAuthentication = true
EventPage.getLayout = getDashboardLayout

export default EventPage;
