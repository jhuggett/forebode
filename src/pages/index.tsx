import Link from 'next/link';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-8xl text-center">Forebode</h1>
      <div className="flex gap-4 justify-center">
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
      </div>
    </div>
  );
};

export default IndexPage;
