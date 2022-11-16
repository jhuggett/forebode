import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from '../_app';

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-xl rounded-2xl'>
		{ children }
	</div>

const EventsPage: NextPageWithLayout = () => {
	

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='flex gap-4 flex-wrap p-4'>
				Events
			</div>
		</div>
  );
};

EventsPage.requiresAuthentication = true
EventsPage.getLayout = getDashboardLayout

export default EventsPage;
