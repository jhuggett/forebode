import Link from 'next/link'
import { getDashboardLayout } from '~/components/DashboardLayout';
import { Loader } from '~/components/Loader';
import { trpc } from '~/utils/trpc';
import { Card, CardLink } from '../dashboard';
import { NextPageWithLayout } from '../_app';

const AddAnAnimal = () => 
  <div className='p-8 rounded-xl border-gray-500 border-2 border-dashed relative'>
    <CardLink to='/animals/add' title='Add an animal'>
      Add an animal
    </CardLink>
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
          <CardLink to={`/animals/${animal.id}`} title={`View ${animal.name}`} >
            { animal.name }
          </CardLink>
        </Card>
      )) }
      <AddAnAnimal />
		</div>
  );
};

AnimalsPage.requiresAuthentication = true
AnimalsPage.getLayout = getDashboardLayout

export default AnimalsPage;
