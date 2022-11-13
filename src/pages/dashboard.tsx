import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { getEventTypeForName } from '~/server/events';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from './_app';

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-xl rounded-2xl'>
		{ children }
	</div>

const DashboardPage: NextPageWithLayout = () => {
	const {
		email,
		name
	} = useAuth()

	const {
		data: account,
		isLoading: loadingAccount
	} = trpc.account.current.useQuery()


	if (loadingAccount) {
		return <Loader/>
	}

	if (!account) {
		return <>Whoops.</>
	}

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='max-w-2xl w-full px-4'>
				<Card>
					<div className='flex flex-col divide-y-2 divide-gray-300 gap-4'>
					{ account.summary.filter(animal => animal.events.length > 0).map(animal => {
						return (
							<div className='pt-4'>
								<p className='text-center font-bold font-serif text-xl pt-4 pb-6'>
								<Link href={`/animals/${animal.id}`}>
									{animal.name}
								</Link>
								</p>
								<div className='w-full flex flex-wrap gap-2 justify-evenly items-center'>
									{animal.events.sort((a, b) => a.type.name > b.type.name ? 1 : -1).map(event => {

										const latestEvent = event
										const eventType = event.type

										return (
											<div className='px-4'>
												<p className='text-sm'>
												{ getEventTypeForName(eventType.name)?.displayName }
												</p>
												{ latestEvent && (
													<>
													<p className='italic text-xl'>{ formatDistanceToNow(latestEvent.createdAt) } ago</p>
													<p className='font-thin text-sm text-right'>{ latestEvent.user.name }</p>
													</>
												)  }
												{ !latestEvent && (
													<p>Has not happened yet.</p>
												)} 
												
											</div>
										)
									})}
								</div>
							</div>
						)
					}) }
					</div>
				</Card>
			</div>
			<div className='flex gap-4 flex-wrap p-4'>
				<Card>
					<p>Account: { account.name }</p>
					<p>
						{`Welcome ${name}. You're signed in as ${email}`}
					</p>
					<p>
						{`Joining code: ${account.id}`}
					</p>
				</Card>
				<Card>
					<div>{`${account.animals.length} animals.`}</div>
					<Link href={'/animals'}>View all animals</Link>
				</Card>
			</div>
		</div>
  );
};

DashboardPage.requiresAuthentication = true
DashboardPage.getLayout = getDashboardLayout

export default DashboardPage;
