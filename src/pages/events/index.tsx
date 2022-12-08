import Link from 'next/link';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card, CardLink, Divider } from '../dashboard';
import { NextPageWithLayout } from '../_app';


const AddEventTypeButton = () => (
  <div className='p-8 rounded-xl border-gray-500 border-2 border-dashed relative'>
    <CardLink to='/events/add' title='Add a new event'>
      Add a new event
    </CardLink>
  </div>
)

const AddAccountLevelEventTypeButton = () => (
  <div className='p-8 rounded-xl border-gray-500 border-2 border-dashed relative'>
    <CardLink to='/events/add' title='Add a new event'>
      Add a new household event
    </CardLink>
  </div>
)

const EventsPage: NextPageWithLayout = () => {
	
  const {
    data: eventTypeInfo,
    isLoading: loadingEventTypes
  } = trpc.eventTypes.all.useQuery()

  if (loadingEventTypes) return <Loader />

  if (!eventTypeInfo) return <>Whoops.</>

  const {
    eventTypes,
    relationships
  } = eventTypeInfo

	return (
		<div className="mt-12 flex flex-col w-full flex-wrap gap-8">
      <Divider>Animal Events</Divider>
			<div className='flex gap-4 items-center justify-center flex-wrap p-4'>
				{ eventTypes?.filter(event => !event.isAccountLevel).map( event => {
          return (
            <Card>
              <CardLink to={`/events/${event.id}`} title={`View ${event.name}`}>
                { event.name }
              </CardLink>
            </Card>
          )
        } ) }
        <AddEventTypeButton />
			</div>
      <Divider>Household Events</Divider>
      <div className='flex gap-4 items-center justify-center flex-wrap p-4'>
				{ eventTypes?.filter(event => event.isAccountLevel).map( event => {
          return (
            <Card>
              <CardLink to={`/events/${event.id}`} title={`View ${event.name}`}>
                { event.name }
              </CardLink>
            </Card>
          )
        } ) }
        <AddAccountLevelEventTypeButton />
			</div>
      <Divider>Events Relationships</Divider>
      <div className='flex gap-4 items-center justify-center flex-wrap p-4'>
				{ relationships?.map( relationship => {
          return (
            <Card>
              { `${relationship.relationshipType} relationship between ${relationship.eventTypes.map(eventType => eventType.name).join(' and ')}` }
            </Card>
          )
        } ) }
			</div>
		</div>
  );
};

EventsPage.requiresAuthentication = true
EventsPage.getLayout = getDashboardLayout

export default EventsPage;
