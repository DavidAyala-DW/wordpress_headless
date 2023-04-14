import { validate_hex } from '@/lib';
import parse from 'html-react-parser';
import Head from 'next/head';
import Script from 'next/script'
import React, { useState } from 'react';

export default function Home({data, header}) {

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

export const getServerSideProps = async (ctx) => {

  const { query } = ctx;
  if(!query || !query?.logged_in_customer_id){      

    return {
      redirect: {
        destination: "https://www.kurufootwear.com/account/login",
        permanent: false,
      },
    };

  }

  const valid_connection = validate_hex(query);
  if(!valid_connection){

    return {
      redirect: {
        destination: "https://www.kurufootwear.com/account/login",
        permanent: false,
      },
    };
    
  }

  return {
    props:{
      data:null
    }
  }
}
