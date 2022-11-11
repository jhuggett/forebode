import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

type FormData = {
  name: string
}

const AddAnimalPage: NextPageWithLayout = () => {

  const router = useRouter()
	
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FormData>()

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
        Name of animal
        <input {...register("name", { required: true })} />
        <input type="submit" />
      </form>
		</div>
  );
};

AddAnimalPage.requiresAuthentication = true
AddAnimalPage.getLayout = getDashboardLayout

export default AddAnimalPage;
