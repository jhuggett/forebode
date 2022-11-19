import { inferRouterOutputs } from '@trpc/server';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import Link from 'next/link';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';

export const EmphaticTimeSince = ({ lastDate } : { lastDate: Date }) => {

	const now = new Date()

	const durationSince = intervalToDuration({start: lastDate, end: now})

	/*
	Should also handle weeks, months, and years in the future
	*/

	if (durationSince.days) return <p className='italic text-2xl text-center font-bold py-1 text-gray-900'>
		{`${durationSince.days}d ${durationSince.hours}h`}
	</p>
	if (durationSince.hours) return <p className='italic text-xl text-center font-semibold py-1 text-gray-800'>
		{`${durationSince.hours}h ${durationSince.minutes}m`}
	</p>
		if (durationSince.minutes) return <p className='italic text-lg text-center font-medium py-1 text-gray-700'>
			{`${durationSince.minutes}m ${durationSince.seconds}s`}
		</p>
		return <p className='italic text-md text-center py-1 text-gray-600'>
			{`${durationSince.seconds}s`}
		</p>
}

type AnimalSummary = NonNullable<inferRouterOutputs<AppRouter>['account']['dashboard']['animals'][0]>
const AnimalSummary = ({ animal } : { animal: AnimalSummary}) => {
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

							return (
								<div className='px-4'>
									<p className='text-sm text-center font-mono'>
									{ eventType.name }
									</p>
									{ latestEvent && (
										<div className='flex justify-around items-center'>
											<EmphaticTimeSince lastDate={latestEvent.createdAt} />
										</div>
										
									)  }
									{ !latestEvent && (
										<p>Has not happened yet.</p>
									)} 
									<p className='font-thin text-sm text-center'>{ latestEvent.user.name }</p>
									
								</div>
							)
						})}
					</div>
				</div>
			</Card>
		</div>
	)
}

type RelationshipSummary = NonNullable<inferRouterOutputs<AppRouter>['account']['dashboard']['relationships'][0]>
const RelationshipSummary = ({ relationship } : { relationship: RelationshipSummary }) => {

	const [firstType, secondType] = relationship.eventTypes
	if (!firstType || !secondType) {
		return null
	}

	let largerType = firstType
	let lesserType = secondType

	if (secondType._count.events > firstType._count.events) {
		largerType = secondType
		lesserType = firstType
	} else if (secondType._count.events === firstType._count.events) {
		return (
			<div className='w-full max-w-sm'>
				<Card>
					<p className='flex flex-col items-center gap-2 p-2 text-gray-500'>
						Same number of 
						<Link href={`/events/${largerType.id}`}>
							<p className='font-mono font-bold hover:cursor-pointer'>{ largerType.name }</p>
						</Link>
						as 
						<Link href={`/events/${lesserType.id}`}>
							<p className='font-mono font-bold hover:cursor-pointer'>{ lesserType.name }</p>
						</Link>
					</p>
				</Card>
			</div>
		)
	}

	const difference = largerType._count.events - lesserType._count.events

	return (
		<div className='w-full max-w-sm'>
			<Card>
				<div className='flex flex-col items-center gap-2'>
					<p className='text-4xl font-semibold'>{ difference }</p>
					<Link href={`/events/${largerType.id}`}>
						<p className='font-mono font-bold hover:cursor-pointer'>{ largerType.name }</p>
					</Link>
					<p className='font-light py-4 text-sm'>more than</p>
					<Link href={`/events/${lesserType.id}`}>
						<p className='font-mono font-bold hover:cursor-pointer'>{ lesserType.name }</p>
					</Link>
				</div>
			</Card>
		</div>
	)
}

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-xl rounded-2xl h-fit'>
		{ children }
	</div>

const DashboardPage: NextPageWithLayout = () => {
	const {
		data: dashboard,
		isLoading: loadingAccount
	} = trpc.account.dashboard.useQuery()


	if (loadingAccount) {
		return <Loader/>
	}

	if (!dashboard) {
		return <>Whoops.</>
	}
	

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='w-full px-4 justify-center flex flex-wrap gap-4'>
					{ dashboard.animals.filter(animal => animal.events.length > 0).map(animal => {
						return <AnimalSummary key={animal.name} animal={animal} />
					}) }
					{ dashboard.relationships.map(relationship => (
						<RelationshipSummary relationship={relationship} />
					)) }
			</div>
		</div>
  );
};

DashboardPage.requiresAuthentication = true
DashboardPage.getLayout = getDashboardLayout

export default DashboardPage;
