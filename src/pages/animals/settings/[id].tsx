import Link from 'next/link'
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '~/pages/_app';
import { Card } from '~/pages/dashboard';

const AnimalPage: NextPageWithLayout = () => {
  
  const router = useRouter()
  const id = parseInt(router.query.id as string)

  const trpcContext = trpc.useContext()

  const {
    data: animal,
    isLoading,
    isError
  } = trpc.animal.get.useQuery({
    id
  })

  const {
    mutate: deleteAnimal,
    isLoading: loadingDeleteAnimal
  } = trpc.animal.delete.useMutation({
    onSuccess() {
      trpcContext.account.current.invalidate()
      router.replace('/animals')
    }
  })

  const {
    data: eventTypes,
    isLoading: loadingEventTypes
  } = trpc.animal.eventTypes.useQuery({
    id
  })

  const {
    mutate: trackEvent
  } = trpc.animal.track.useMutation({
    onSuccess() {
      trpcContext.animal.eventTypes.invalidate()
    }
  })
  const {
    mutate: untrackEvent
  } = trpc.animal.untrack.useMutation({
    onSuccess() {
      trpcContext.animal.eventTypes.invalidate()
    }
  })


  if (isLoading || loadingDeleteAnimal || loadingEventTypes) {
    return <Loader/>
  }

  if (!animal || !eventTypes || isError) {
    return <>Whoops...</>
  }

  
	return (
		<div className="mt-12 flex flex-col flex-wrap items-center justify-center gap-8">
          <h1 className='text-4xl text-gray-600 font-serif font-bold flex gap-4 items-center'>
            <Link href={`/animals/${id}`}>
              <svg className='w-6 fill-gray-600 hover:cursor-pointer' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            </Link>
            { animal.name }
          </h1> 
        
      <div className={`flex flex-wrap justify-center gap-4 w-full px-2`}>
        <Card>
          <div className='flex flex-col gap-2'>
            { eventTypes.tracked?.map(eventType => {
              return (
                <span className='flex gap-4 justify-around items-center'>
                  <p className='text-lg'>{ eventType.name }</p>
                  <button className='bg-gray-500 text-gray-200 px-2 py-1 rounded-md' onClick={() => untrackEvent({animalId: id, eventId: eventType.id})}>Stop tracking</button>
                </span>
              )
            }) }
          </div>
          <div>
          { eventTypes.availible?.map(eventType => {
              return (
                <span 
                className='flex gap-8 justify-between my-2'>
                  <p>{ eventType.name }</p>
                  <button className='bg-gray-500 text-gray-200 px-1 rounded-md' onClick={() => trackEvent({animalId: id, eventId: eventType.id})}>Track</button>
                </span>
              )
              }) }
          </div>
        </Card>
        <Card>
          <div className='flex flex-col items-center gap-2'>
            <button className='bg-red-700 text-white font-bold px-2 py-1 rounded-md' onClick={() => {
              const confirmed = confirm(`Are you sure you want to delete ${animal.name}? This cannot be undone.`)
              if (confirmed) deleteAnimal({ id })
            }}>
              Delete { animal.name }
            </button>
            <p className='text-md opacity-70'>This cannot be undone.</p>
          </div>
        </Card>
      </div>
		</div>
  );
};

AnimalPage.requiresAuthentication = true
AnimalPage.getLayout = getDashboardLayout

export default AnimalPage;
