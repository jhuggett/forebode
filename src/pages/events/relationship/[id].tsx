import Link from 'next/link';
import { useRouter } from 'next/router';
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const RelationshipPage: NextPageWithLayout = () => {
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
		<div className="mt-12 flex flex-col items-center justify-center gap-8 px-2 pb-4">
      <div className='flex items-center gap-8'>
        <h2 className='text-2xl font-mono text-gray-600'>
          { data?.relationship.name }
        </h2>
        <Link href={`/events/relationship/settings/${id}`}>
          <svg className='h-6 hover:cursor-pointer fill-gray-600' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M200 0H312l17.2 78.4c15.8 6.5 30.6 15.1 44 25.4l76.5-24.4 56 97-59.4 54.1c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l59.4 54.1-56 97-76.5-24.4c-13.4 10.3-28.2 18.9-44 25.4L312 512H200l-17.2-78.4c-15.8-6.5-30.6-15.1-44-25.4L62.3 432.5l-56-97 59.4-54.1C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L6.3 176.5l56-97 76.5 24.4c13.4-10.3 28.2-18.9 44-25.4L200 0zm56 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/></svg>
        </Link>
      </div>
      <div className='flex w-full max-w-7xl flex-col gap-4'>

      </div>
		</div>
  );
};

RelationshipPage.requiresAuthentication = true
RelationshipPage.getLayout = getDashboardLayout

export default RelationshipPage;
