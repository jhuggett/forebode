import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Checkbox, SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from '../_app';

export enum CreateEventType {
	AccountLevel = 'household'
}

interface Form {
  name: string,
  isAccountLevel: boolean
}

const AddEventPage: NextPageWithLayout = () => {
	const router = useRouter()

	const isAccountLevel = router.query.type === CreateEventType.AccountLevel
	
  const form = useForm<Form>()
	const {
    handleSubmit
  } = form

	const {
		mutate
	} = trpc.eventTypes.add.useMutation({
		onSuccess() {
			router.replace('/events')
		}
	})

	const onSubmit = ({
    name
  } : Form) => mutate({
    name,
		isAccountLevel
  })

	return (
		<div className="mt-12 m-auto flex-col items-center justify-center gap-8 max-w-md">
			<h2 className='text-center text-xl font-medium'>Create a new { isAccountLevel && 'household' } event type</h2>
			<form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <Text form={form} label='Name' name='name' placeholder='Watered the lawn' required />
        <SubmitButton />
      </form>
		</div>
  );
};

AddEventPage.requiresAuthentication = true
AddEventPage.getLayout = getDashboardLayout

export default AddEventPage;
