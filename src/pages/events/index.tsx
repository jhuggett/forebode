import Link from 'next/link';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card } from '../dashboard';
import { NextPageWithLayout, useAuth } from '../_app';


const AddEventTypeButton = () => (
  <div className='p-8 rounded-xl border-gray-500 border-2 border-dashed'>
    <Link href={'/events/add'}>
      Add a new event
    </Link>
  </div>
)

const EventsPage: NextPageWithLayout = () => {
	
  const {
    data: eventTypes,
    isLoading: loadingEventTypes
  } = trpc.eventTypes.all.useQuery()


  if (loadingEventTypes) return <Loader />

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='flex gap-4 items-center justify-center flex-wrap p-4'>
				{ eventTypes?.map( event => {
          return (
            <Card>
              <Link href={`/events/${event.id}`}>
                { event.name }
              </Link>
            </Card>
          )
        } ) }
        <AddEventTypeButton />
			</div>
		</div>
  );
};

EventsPage.requiresAuthentication = true
EventsPage.getLayout = getDashboardLayout

export default EventsPage;
