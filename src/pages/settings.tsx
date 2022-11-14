import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from './_app';

export const Card = ({ children }) => 
	<div className='bg-gray-200 p-8 shadow-xl rounded-2xl'>
		{ children }
	</div>

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
		return <>Whoops.</>
	}

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<div className='flex gap-4 flex-wrap p-4'>
				<Card>
          <p className='p-2'>
            You're signed in as { name } ({ email }) on { account.name }.
          </p>
					<p>
						{`Joining code: ${account.id}`}
					</p>
          <div className='flex justify-end mt-2'>
            <SignOutButton />
          </div>
				</Card>
			</div>
		</div>
  );
};

SettingsPage.requiresAuthentication = true
SettingsPage.getLayout = getDashboardLayout

export default SettingsPage;
