import parse from 'html-react-parser';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home({data, header}) {

  const {content, title} = data;
  const [html, setHTML] = useState(content);

  useEffect(() => {
    setHTML(content);
  }, [content]);
  
  return (

    <>
      <Head>
        <title>{title}</title>
      </Head>
      <>
        { parse(header) }
      </>
      <main>              
        {
          html && (
            parse(html)
          )
        }
        <script async src="/bundle.js"></script> 
      </main>
    </>

  )
}

export async function getStaticProps(context) {

  const endpoint = process.env.WORDPRESS_SITE
  const request = await fetch(`${endpoint}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        post(id: "2277", idType: DATABASE_ID) {
          title,
          content,
        }
      }`,
    }),
  });

  const response = await request.json();
  const data = response.data.post;

  const header_request = await fetch(process.env.EDGE_FUNCTION);
  const header_response = await header_request.json();
  const {data:{ header }} = header_response;

  return {
    props: {data, header}, // will be passed to the page component as props
  }

}