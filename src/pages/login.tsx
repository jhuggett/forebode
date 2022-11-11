import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';
import { signIn, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Loader } from '~/components/Loader';

type FormData = {
  email: string,
  password: string
}

const LoginPage: NextPageWithLayout = () => {
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FormData>()

  const onSubmit = ({
    email,
    password
  } : FormData) => signIn('credentials', {
    email,
    password,
    callbackUrl: '/dashboard'
  })

  const {
    data,
    status
  } = useSession()

  const router = useRouter()
    

  if (status === 'loading') {
    return <Loader/>
  }

  if (status === 'authenticated') {
    router.replace('/dashboard')
    return <>Already logged in</>
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-8xl text-center">Login</h1>
      <form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} />
        <input {...register("password", { required: true })} />
        <input type="submit" />
      </form>
    </div>
  );
};

export default LoginPage;
