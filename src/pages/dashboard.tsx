import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import Link from 'next/link';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { getEventTypeForName } from '~/server/events';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-xl rounded-2xl'>
		{ children }
	</div>

const DashboardPage: NextPageWithLayout = () => {
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
			<div className='w-full px-4 justify-center flex flex-wrap gap-4'>
					{ account.summary.filter(animal => animal.events.length > 0).map(animal => {
						return (
							<div>
								<Card>
									<div className=' text-gray-600'>
										<p className='text-center font-bold font-serif text-2xl pb-4'>
										<Link href={`/animals/${animal.id}`}>
											{animal.name}
										</Link>
										</p>
										<div className='w-full flex flex-wrap gap-2 justify-evenly items-center'>
											{animal.events.sort((a, b) => a.type.name > b.type.name ? 1 : -1).map(event => {

												const latestEvent = event
												const eventType = event.type

												const now = new Date()

												const durationSince = intervalToDuration({start: latestEvent.createdAt, end: now})

												return (
													<div className='px-4'>
														<p className='text-sm'>
														{ getEventTypeForName(eventType.name)?.displayName }
														</p>
														{ latestEvent && (
															<>
															<p className='italic text-xl text-center py-1 text-gray-800'>{ (() => {
																/*
																Should also handle weeks, months, and years in the future
																*/

																if (durationSince.days) return formatDuration({days: durationSince.days})
																if (durationSince.hours) return formatDuration({hours: durationSince.hours})
																if (durationSince.minutes) return formatDuration({minutes: durationSince.minutes})
																return formatDuration({seconds: durationSince.seconds})
															})() }</p>
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
								</Card>
							</div>
						)
					}) }
			</div>
		</div>
  );
};

DashboardPage.requiresAuthentication = true
DashboardPage.getLayout = getDashboardLayout

export default DashboardPage;
