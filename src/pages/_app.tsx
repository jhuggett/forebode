import '../styles/global.css';
import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import { ReactElement, ReactNode, useContext, useState } from 'react';
import { DefaultLayout } from '~/components/DefaultLayout';
import { trpc } from '~/utils/trpc';
import { SessionProvider, useSession } from 'next-auth/react';
import React from 'react';
import { Session } from 'next-auth';
import { Loader } from '~/components/Loader';
import { useRouter } from 'next/router';

export const AuthContext = React.createContext<Session | null>(null)

export const useAuth = () => {
  const session = useContext(AuthContext)

  if (
    !session || 
    !session.user || 
    !session.user.email || 
    !session.user.name
  ) throw new Error(`Session is missing something: ${session}`)

  return {
    email: session.user.email,
    name: session.user.name
  }
}

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
  requiresAuthentication?: boolean
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const RequiresAuth = ({ children }) => {
  const {
    data,
    status
  } = useSession()

  const router = useRouter()

  if (status === 'loading') return <Loader/>

  if (status === 'unauthenticated') {
    router.replace('/')
    return <Loader />
  }

  return <AuthContext.Provider value={data}>
    { children }
  </AuthContext.Provider>
}

const App = (({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  const ConfiguredComponent = () => <Component {...pageProps} />

  return <SessionProvider session={(pageProps as any).session}>
    { getLayout(<>
      { Component.requiresAuthentication ? (
        <RequiresAuth>
          <ConfiguredComponent />
        </RequiresAuth>
      ) : (
        <ConfiguredComponent />
      ) }
    </>) }
  </SessionProvider>
}) as AppType;

export default trpc.withTRPC(App);
