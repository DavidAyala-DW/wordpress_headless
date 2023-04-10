import parse from 'html-react-parser';
import Head from 'next/head';
import Script from 'next/script'


export default function Home({data, header}) {
  
  return (

    <main className='p-10 bg-black text-white min-h-screen'>
      <h1 className='text-xl text-center font-semibold'>Hello world</h1>
    </main>

  )
}

export async function getStaticProps(context) {


  return {
    props: {data: "hi"},
  }

}