import Link from 'next/link';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-8xl text-center">Forebode</h1>
      <div className="flex gap-4 justify-center items-center mt-8">
        <Link href="/login">
          <a className='px-4 py-2 text-lg hover:opacity-95 bg-gray-800 rounded-lg text-gray-200 font-semibold'>
            Login
          </a>
        </Link>
        <Link href="/signup">
            <a className='px-4 py-2 text-sm h-fit hover:opacity-95 bg-gray-600 rounded-lg text-gray-200 font-semibold'>
              Sign up
            </a>
          </Link>
      </div>
    </div>
  );
};

export default IndexPage;
