import Head from 'next/head';
import React, { useState } from 'react';

export default function Home() {

  const [count, setCount] = useState(0);

  return (
    <>
      <Head>
        <title>Test title</title>
      </Head>
      <main className='p-10 bg-black text-white min-h-screen'>
        <h1 className='text-xl text-center font-semibold'>Hello world</h1>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
      </main>
    </>
  )
}
