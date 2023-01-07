import { EventType } from '@prisma/client';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout, SignOutButton } from '~/components/DashboardLayout';
import { Checkbox, FormSelect, NativeSelect, SubmitButton, Text } from '~/components/Forms';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout, useAuth } from '../_app';

interface Form {
  name: string,
  eventTypeA: EventType,
  eventTypeB: EventType
}

const AddRelationShipPage: NextPageWithLayout = () => {
	const router = useRouter()
	
  const form = useForm<Form>()
	const {
    handleSubmit
  } = form

	const {
    data,
    isLoading: loadingEventTypes
  } = trpc.eventTypes.all.useQuery()

  const {
    mutate: relate
  } = trpc.eventTypes.relate.useMutation({
		onSuccess() {
			router.replace('/events')
		}
	})

	const onSubmit = ({
    name,
    eventTypeA,
    eventTypeB
  } : Form) => {
    relate({
      name,
      eventTypeAId: eventTypeA.id,
      eventTypeBId: eventTypeB.id,
      relationshipType: 'DIFFERENCE'
    })
  }

  if (loadingEventTypes) return <Loader />

	return (
		<div className="mt-12 m-auto flex-col items-center justify-center gap-8 max-w-md">
			<h2 className='text-center text-xl font-medium'>Create a new relationship</h2>
			<form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <Text form={form} label='Name for the relationship' name='name' required />

        <span className='my-8 flex flex-col gap-2'>
          <p className='text-center text-lg font-medium'>The difference</p>
          <div className='flex justify-evenly gap-2 flex-wrap'>
            <FormSelect
              options={data!.eventTypes} 
              asString={eventType => eventType.name}
              form={form}
              label={'Between event'}
              name={'eventTypeA'}
              required
              placeholder='Select an event'
            />
            <FormSelect
              options={data!.eventTypes} 
              asString={eventType => eventType.name}
              form={form}
              label={'and event'}
              name={'eventTypeB'}
              required
              placeholder='Select an event'
            />
          </div>
        </span>
        <SubmitButton text='Create' />
      </form>
		</div>
  );
};

AddRelationShipPage.requiresAuthentication = true
AddRelationShipPage.getLayout = getDashboardLayout

export default AddRelationShipPage;
