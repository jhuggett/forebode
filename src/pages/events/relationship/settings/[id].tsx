import { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getDashboardLayout,  } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { Card } from '~/pages/dashboard';
import { NextPageWithLayout } from '~/pages/_app';
import { AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { SubmitButton, Text } from '~/components/Forms';
import { formatRelative } from 'date-fns';

type EditFormData = {
  name: string
}

const DeleteCard = ({ data } : { data: RelationshipInfo }) => {

  const trpcContext = trpc.useContext()

  const router = useRouter()

  const {
    mutate,
    isLoading
  } = trpc.relationship.delete.useMutation({
    onSuccess() {
      trpcContext.invalidate()
      router.replace('/events')
    }
  })

  const confirmDeletion = () => {
    const shouldStillDelete = confirm(`Are you sure you want to delete ${data.relationship.name}?`)
    if (shouldStillDelete) mutate({ id: data.relationship.id })
  }

  if (isLoading) return <Loader/>

  return (
    <div>
      <Card>
        <button onClick={confirmDeletion} className='px-4 py-2 bg-slate-400 rounded-lg font-bold text-gray-200'>
          Delete Event Type
        </button>
      </Card>
    </div>
  )
}

const EditCard = ({ data } : { data: RelationshipInfo }) => {
  const form = useForm<EditFormData>()
  const {
    handleSubmit
  } = form

  const trpcContext = trpc.useContext()

  const {
    mutate
  } = trpc.relationship.update.useMutation({
    onSuccess() {
      trpcContext.invalidate()
    }
  })

  const onSubmit = ({
    name
  } : EditFormData) => mutate({
    name,
    id: data.relationship.id
  })

  return (
    <div className='w-full max-w-md'>
      <Card>
        <h2 className='font-semibold text-gray-600 text-lg text-right'>
          Edit Event Type
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2 py-4'>
          <Text 
            form={form}
            label={'Name'}
            name={'name'}
            initialValue={data.relationship.name}
          />
          <SubmitButton 
            text='Update'
          />
        </form>
      </Card>
    </div>
  )
}

const CompareSinceCard = ({ data } : { data: RelationshipInfo }) => {
  const trpcContext = trpc.useContext()

  const {
    mutate
  } = trpc.relationship.update.useMutation({
    onSuccess() {
      trpcContext.invalidate()
    }
  })

  return (
    <div className='w-full max-w-md'>
      <Card>
        <h2 className='font-semibold text-gray-600 text-lg text-right'>
          Compare Since
        </h2>
        { data.relationship.compareSince ? (
          <>
          <p>{ data.relationship.compareSince.toDateString() }</p>
          <p>{ formatRelative(data.relationship.compareSince, new Date()) }</p>
          </>
        ) : (
          <p>Not set. Comparing all events.</p>
        )}
        <button className='bg-gray-300 p-2 rounded-md text-gray-600 font-medium'
          onClick={() => mutate({
            id: data.relationship.id,
            compareSince: new Date()
          })}
        >Update compare since to right now</button>
      </Card>
    </div>
  )
}

type RelationshipInfo = NonNullable<inferRouterOutputs<AppRouter>['relationship']['get']>

const EventPage: NextPageWithLayout = () => {
  const router = useRouter()
  const id = parseInt(router.query.id as string)

  const {
    data,
    isLoading
  } = trpc.relationship.get.useQuery({
    id
  })

  if (isLoading) return <Loader />

  if (!data) return <div>Whoops</div>
	
	return (
		<div className="mt-12 flex flex-col items-center justify-center gap-8">
      <div className='flex items-center gap-8'>
        <Link href={`/events/relationship/${id}`}>
          <svg className='w-6 fill-gray-600 hover:cursor-pointer' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
        </Link>
        <h2 className='text-2xl font-mono text-gray-600'>
          { data?.relationship.name }
        </h2>
      </div>
      <div className='flex w-full max-w-7xl justify-center flex-wrap gap-4'>
        <EditCard data={data} />
        <CompareSinceCard data={data} />
        <DeleteCard data={data} />
      </div>
		</div>
  );
};

EventPage.requiresAuthentication = true
EventPage.getLayout = getDashboardLayout

export default EventPage;
