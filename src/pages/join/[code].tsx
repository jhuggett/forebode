import { useForm } from 'react-hook-form';
import { trpc } from '~/utils/trpc';
import { signIn, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Loader } from '~/components/Loader';
import { Email, Password, Text, SubmitButton } from '~/components/Forms';
import { NextPageWithLayout } from '../_app';
import { JoiningCode } from '~/server/joining-code';

type FormData = {
  email: string,
  userName: string,
  password: string
}

const JoinAccountPage: NextPageWithLayout = () => {
  const form = useForm<FormData>()
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = form

  const router = useRouter()
  const code = router.query.code as string

  const {
    mutate,
    isLoading
  } = trpc.user.join.useMutation({
    onSuccess: (_data, variables) => signIn('credentials', {
      email: variables.email,
      password: variables.password,
      callbackUrl: '/dashboard'
    })
  })

  const onSubmit = ({
    email,
    userName,
    password
  } : FormData) => mutate({
    email,
    userName,
    password,
    code
  })

  const {
    data,
    status
  } = useSession()
    

  if (status === 'loading' || isLoading) {
    return <Loader/>
  }

  if (status === 'authenticated') {
    router.replace('/dashboard')
    return <>Already logged in</>
  }
    
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl text-center mb-4">Sign up & join 
        <span className='font-semibold text-5xl'>{' '}{ JoiningCode.from(code).accountName }</span>
      </h1>
      <form className='flex flex-col gap-4 m-8' onSubmit={handleSubmit(onSubmit)}>
        <Text form={form} label='Name' name='userName' placeholder='John' required />
        <Email form={form} required />
        <Password form={form} required />
        <SubmitButton />
      </form>
    </div>
  );
};



export default JoinAccountPage;
