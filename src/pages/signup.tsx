import { useForm } from 'react-hook-form';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';
import { signIn, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Loader } from '~/components/Loader';

type FormData = {
  email: string,
  userName: string,
  accountName: string,
  password: string,
  joiningCode?: string
}

const SignupPage: NextPageWithLayout = () => {
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
  } = trpc.user.signup.useMutation({
    onSuccess: (_data, variables) => signIn('credentials', {
      email: variables.email,
      password: variables.password,
      callbackUrl: '/dashboard'
    })
  })

  const onSubmit = ({
    email,
    userName,
    accountName,
    password,
    joiningCode
  } : FormData) => mutate({
    email,
    userName,
    accountName,
    password,
    joiningCode
  })

  const {
    data,
    status
  } = useSession()

  const router = useRouter()
    

  if (status === 'loading' || isLoading) {
    return <Loader/>
  }

  if (status === 'authenticated') {
    router.replace('/dashboard')
    return <>Already logged in</>
  }
    
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-8xl text-center">Signup</h1>
      <form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        Email
        <input {...register("email", { required: true })} />
        Your Name
        <input {...register("userName", { required: true })} />
        Password
        <input {...register("password", { required: true })} />
        Account name (to create an account)
        <input {...register("accountName")} />
        Joining Code (to join an existing account)
        <input {...register("joiningCode")} />
        <input type="submit" />
      </form>
    </div>
  );
};

export default SignupPage;
