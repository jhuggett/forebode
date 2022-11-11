import Link from 'next/link'
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card } from '../dashboard';
import { NextPageWithLayout } from '../_app';

const AddAnAnimal = () => 
  <div className='p-8 rounded-xl border-gray-500 border-2 border-dashed'>
    <Link href={'/animals/add'}>
      Add an animal
    </Link>
  </div>


const AnimalsPage: NextPageWithLayout = () => {
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

  const {
    animals
  } = account

	return (
		<div className="mt-12 flex flex-wrap items-center justify-center gap-8">
			{ animals.map(animal => (
        <Card key={`card-${animal.name}`}>
          <Link href={`/animals/${animal.id}`}>
            { animal.name }
          </Link>
        </Card>
      )) }
      <AddAnAnimal />
		</div>
  );
};

AnimalsPage.requiresAuthentication = true
AnimalsPage.getLayout = getDashboardLayout

export default AnimalsPage;
