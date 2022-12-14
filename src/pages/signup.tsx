import { useForm } from 'react-hook-form';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';
import { signIn, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Loader } from '~/components/Loader';
import { Email, Password, Text, SubmitButton } from '~/components/Forms';

type FormData = {
  email: string,
  userName: string,
  accountName: string,
  password: string,
}

const SignupPage: NextPageWithLayout = () => {
  const form = useForm<FormData>()
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = form

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
  } : FormData) => mutate({
    email,
    userName,
    accountName,
    password,
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
        <Text form={form} label='Name' name='userName' placeholder='John' required />
        <Email form={form} required />
        <Password form={form} required />
        <Text form={form} label='Household name' name='accountName' placeholder='The Smiths' required />
        <SubmitButton />
      </form>
    </div>
  );
};



export default SignupPage;
