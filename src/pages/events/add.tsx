import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Checkbox, SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from '../_app';

interface Form {
  name: string,
  isAccountLevel: boolean
}

const AddEventPage: NextPageWithLayout = () => {

	const router = useRouter()
	
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
    name,
		isAccountLevel
  } : Form) => mutate({
    name,
		isAccountLevel
  })

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <Text form={form} label='Name' name='name' placeholder='Watered the lawn' required />
				<Checkbox form={form} label='Household level' name='isAccountLevel' />
        <SubmitButton />
      </form>
		</div>
  );
};

AddEventPage.requiresAuthentication = true
AddEventPage.getLayout = getDashboardLayout

export default AddEventPage;
