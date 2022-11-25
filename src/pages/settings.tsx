import { inferRouterOutputs } from '@trpc/server';
import { useState } from 'react';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { Card } from './dashboard';
import { NextPageWithLayout, useAuth } from './_app';

const InviteCard = ({ account } : { account: AccountInfo }) => {

	const joiningLink = `${window.location.origin}/join/${account.joiningCode}`

	const copyLink = () => {
		navigator.clipboard.writeText(joiningLink)
		setCopied(times => times + 1)
	}

	const [copied, setCopied] = useState(0)

	return (
		<div>
			<Card>
				<h2 className='text-lg'>Invite someone to join your household?</h2>
				<p className='mt-6'>Send them this link:</p>
				<button className='px-4 bg-gray-300 rounded-lg py-2' onClick={copyLink}>{joiningLink}</button>
				<p className='text-sm text-right'>{ copied ? `copied!` : 'click the link to copy it' }</p>
			</Card>
		</div>
	)
}

type AccountInfo = NonNullable<inferRouterOutputs<AppRouter>['account']['current']>

const SettingsPage: NextPageWithLayout = () => {
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
		return <>Whoops. <SignOutButton /></>
	}

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='flex gap-4 justify-center flex-wrap p-4'>
				<Card>
          <p className='p-2'>
            You're signed in as { name } ({ email }) on { account.name }.
          </p>
					
          <div className='flex justify-end mt-2'>
            <SignOutButton />
          </div>
				</Card>
				<InviteCard account={account} />
			</div>
		</div>
  );
};

SettingsPage.requiresAuthentication = true
SettingsPage.getLayout = getDashboardLayout

export default SettingsPage;
