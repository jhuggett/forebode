import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

type DashboardLayoutProps = { children: ReactNode };

export const SignOutButton = () => 
	<button onClick={() => signOut({
		callbackUrl: '/'
	})}
  className='py-1 px-2 text-sm rounded-lg bg-gray-700 text-gray-200 hover:-skew-x-6 transition duration-300 whitespace-nowrap'
  > 
		Log out
	</button>

const NavLink = ({ href, children } : { href: string, children: ReactNode }) => {

  const router = useRouter()

  const active = router.pathname.split('/')[1]?.includes(href.slice(1))

  return (
    <Link href={ href }>
      <a className={`
      font-medium duration-300 transition hover:text-gray-600
      ${active ? 'border-gray-600 border-b-2 my-2 h-fit' : 'text-gray-500'}
      `} >
        { children }
      </a> 
    </Link>
  )
}
  

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {

  const {
    data
  } = useSession()

  const email = data?.user?.email

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className='w-full mt-4 flex flex-col lg:flex-row lg:py-2 px-4  justify-between'>
          <div className='flex justify-center items-center mx-4 text-xl font-bold'>
            Forebode
          </div>
          <div className='flex flex-wrap justify-center items-center gap-4 lg:shadow-xl lg:w-fit lg:bg-gray-200 lg:px-4 lg:py-2 rounded-xl'>
            <NavLink href={'/dashboard'}>
              Dashboard
            </NavLink>
            <NavLink href={'/animals'}>
              Animals
            </NavLink>
            <NavLink href={'/events'}>
              Events
            </NavLink>
            <NavLink href={'/settings'}>
              Settings
            </NavLink>
          </div>
          <div className='hidden lg:flex justify-center items-center gap-4'>
            <p className='text-sm'>{ email }</p>
            <SignOutButton />
          </div>
        </div>
        {children}
      </main>
    </>
  );
};

export const getDashboardLayout = (page) => <DashboardLayout>{page}</DashboardLayout>