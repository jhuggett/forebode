import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

type FormData = {
  name: string
}

const AddAnimalPage: NextPageWithLayout = () => {

  const router = useRouter()
	
  const form = useForm<FormData>()
  const {
    handleSubmit
  } = form

  const {
    mutate,
    isLoading
  } = trpc.animal.create.useMutation({
    onSuccess(data) {
      router.push(`/animals/${data.id}`)
    }
  })
  
  const onSubmit = ({
    name
  } : FormData) => mutate({
    name
  })

  if (isLoading) return <Loader/>

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			<form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <Text form={form} label='Name' name='name' placeholder='Beamont' required />
        <SubmitButton />
      </form>
		</div>
  );
};

AddAnimalPage.requiresAuthentication = true
AddAnimalPage.getLayout = getDashboardLayout

export default AddAnimalPage;
