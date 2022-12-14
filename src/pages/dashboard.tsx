import { inferRouterOutputs } from '@trpc/server';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import Link from 'next/link';
import { Children, ReactNode } from 'react';
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

	if (durationSince.days) return <p className='italic text-2xl text-center font-bold text-red-700'>
		{`${durationSince.days}d ${durationSince.hours}h`}
	</p>
	if (durationSince.hours) return <p className='italic text-xl text-center font-semibold text-yellow-500'>
		{`${durationSince.hours}h ${durationSince.minutes}m`}
	</p>
		if (durationSince.minutes) return <p className='italic text-lg text-center text-green-600'>
			{`${durationSince.minutes}m ${durationSince.seconds}s`}
		</p>
		return <p className='italic text-md font-thin text-center py-1 text-green-600'>
			{`${durationSince.seconds}s`}
		</p>
}

export const EmphaticDot = ({ lastDate } : { lastDate: Date }) => {

	const now = new Date()

	const durationSince = intervalToDuration({start: lastDate, end: now})

	const char = `•`

	/*
	Should also handle weeks, months, and years in the future
	*/

	if (durationSince.days) return <p className='italic leading-tight text-6xl text-center font-bold text-red-700'>
		<svg className='w-5 fill-red-700' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" />
		</svg>
	</p>
	if (durationSince.hours) return <p className='italic text-6xl text-center font-semibold text-yellow-500'>
		<svg className='w-5 fill-yellow-500' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" />
		</svg>
	</p>
		if (durationSince.minutes) return <p className='italic text-6xl text-center text-green-600'>
			<svg className='w-5 fill-green-700' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="50" />
			</svg>
		</p>
		return <p className='italic text-md font-thin text-6xl text-center text-green-600'>
			<svg className='w-5 fill-green-700' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="50" />
			</svg>
		</p>
}

type AnimalSummary = NonNullable<inferRouterOutputs<AppRouter>['account']['dashboard']['animals'][0]>
const AnimalSummary = ({ animal } : { animal: AnimalSummary}) => {
	return (
		<div className=''>
			<Card>
				<div className=' text-gray-600'>
					<p className='font-semibold font-serif text-4xl pb-8'>
						<CardLink to={`/animals/${animal.id}`} title={`View animal ${animal.name}`} >
							{animal.name}
						</CardLink>
					</p>
					<div className='w-full flex flex-wrap gap-8 justify-evenly items-center divide-gray-300'>
						{animal.events.sort((a, b) => a.type.name > b.type.name ? 1 : -1).map(event => {

							const latestEvent = event
							const eventType = event.type

							return (
								<div className='flex flex-col gap-1'>
									<p className='text-md font-medium text-center '>
									{ eventType.name }
									</p>
									{ latestEvent && (
										<div className='flex justify-around items-center'>
											<EmphaticDot lastDate={latestEvent.createdAt} />
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


	const {
		data,
		isLoading
	} = trpc.relationship.get.useQuery({
		id: relationship.id
	})

	if (isLoading) return <Loader />

	const [firstType, secondType] = data!.eventTypes!
	if (!firstType || !secondType) {
		return null
	}

	let largerType = firstType
	let lesserType = secondType

	if (secondType._count.events > firstType._count.events) {
		largerType = secondType
		lesserType = firstType
	}
	const difference = largerType._count.events - lesserType._count.events

	return (
		<div className='w-fit'>
			<Card>
				<div className='flex flex-col items-center gap-1'>
					<p className='text-4xl font-semibold'>{ difference }</p>
					<div className='flex gap-2 items-center'>
						{ relationship.name }
					</div>
				</div>
				<CardLink to={`/events/relationship/${relationship.id}`} title={`View ${relationship.name}`} />
			</Card>
		</div>
	)
}

type AccountLevelEventTypeSummary = NonNullable<inferRouterOutputs<AppRouter>['account']['dashboard']['accountLevelEventTypes'][0]>
const AccountLevelEventTypeSummary = ({ accountLevelEventType } : { accountLevelEventType: AccountLevelEventTypeSummary }) => {

	const latestEvent = accountLevelEventType.events[0]

	return (
		<div className=' text-gray-600'>
			<Card>
				<CardLink to={`/events/${accountLevelEventType.id}`} title={`View event ${accountLevelEventType.name}`} >
					<h3 className='text-lg text-center hover:cursor-pointer'>
						Last { accountLevelEventType.name }
					</h3>
				</CardLink>
				{ latestEvent ? (
					<div>
						<div className='flex justify-around items-center'>
							<EmphaticTimeSince lastDate={latestEvent.createdAt} />
						</div>
						<p className='font-thin text-sm text-center'>{ latestEvent.user.name }</p>
					</div>
				) : (
					<p>Hasn't happened yet.</p>
				) }
			</Card>
		</div>
	)
}


export const CardLink = ({ to, title, children }: { to: string, title: string, children?: ReactNode }) => {
	return (
		<Link href={ to }>
			<a title={title} className='after:absolute after:content-[""] after:left-0 after:top-0 after:right-0 after:bottom-0'>
				{ children }
			</a>
		</Link>
	)
}

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-md rounded-lg h-fit relative card'>
		{ children }
	</div>

export const Divider = ({ children } : { children: ReactNode }) => {
	return (
		<div className="relative flex py-5 items-center">
			<div className="flex-grow border-t border-gray-400"></div>
			<span className="flex-shrink mx-4 text-gray-400">{ children }</span>
			<div className="flex-grow border-t border-gray-400"></div>
	</div>
	)
}

const DashboardPage: NextPageWithLayout = () => {
	const {
		data: dashboard,
		isLoading: loadingAccount,
		error
	} = trpc.account.dashboard.useQuery()


	if (loadingAccount) {
		return <Loader/>
	}

	if (!dashboard) {
		return <>Whoops.</>
	}
	

	return (
		<div className="mt-12 flex flex-col m-auto w-full max-w-6xl justify-center gap-8 pb-8">
			<div className='w-full px-4 justify-center flex flex-wrap gap-4 max-w-6xl'>
				{ dashboard.relationships.map(relationship => (
					<RelationshipSummary key={`relationship-${relationship.id}`} relationship={relationship} />
				)) }
			</div>
			<Divider>Animals</Divider>
			<div className='w-full px-4 justify-center flex flex-wrap gap-4 max-w-6xl'>
				{ dashboard.animals.filter(animal => animal.events.length > 0).map(animal => {
					return <AnimalSummary key={animal.name} animal={animal} />
				}) }
			</div>
			<Divider>Household events</Divider>
			<div className='w-full px-4 justify-center flex flex-wrap gap-4 max-w-6xl'>
				{ dashboard.accountLevelEventTypes.map(accountLevelEventType => {
					return <AccountLevelEventTypeSummary key={accountLevelEventType.name} accountLevelEventType={accountLevelEventType} />
				}) }
			</div>
		</div>
  );
};

DashboardPage.requiresAuthentication = true
DashboardPage.getLayout = getDashboardLayout

export default DashboardPage;
