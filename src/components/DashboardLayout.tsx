import { signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

type DashboardLayoutProps = { children: ReactNode };

const SignOutButton = () => 
	<button onClick={() => signOut({
		callbackUrl: '/'
	})}
  className='hidden sm:block py-2 px-4 rounded-lg bg-gray-400 text-gray-200 font-semibold m-4 whitespace-nowrap'
  > 
		Log out
	</button>

const NavLink = ({ href, children } : { href: string, children: ReactNode }) => {

  const router = useRouter()

  const active = router.pathname.includes(href)

  return (
    <Link href={ href }>
      <a className={`
      
      ${active ? 'border-gray-600 border-b-2 my-2 h-fit' : ''}
      `} >
        { children }
      </a> 
    </Link>
  )
}
  

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className='w-full bg-gray-200 flex justify-between'>
          <div className='hidden sm:flex justify-center items-center mx-4 text-xl font-bold'>
            Forebode
          </div>
          <div className='flex justify-center items-center w-full gap-4'>
            <NavLink href={'/dashboard'}>
              Dashboard
            </NavLink>
            <NavLink href={'/animals'}>
              Animals
            </NavLink>
          </div>
          <SignOutButton />
        </div>
        {children}
      </main>
    </>
  );
};

export const getDashboardLayout = (page) => <DashboardLayout>{page}</DashboardLayout>