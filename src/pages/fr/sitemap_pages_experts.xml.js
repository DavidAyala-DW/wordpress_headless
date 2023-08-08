import { XMLBuilder} from "fast-xml-parser";
import { MongoClient } from 'mongodb';
const url = process.env.MONGO_URI;
const dbName = 'sitemap';

export default function SitemapECXml({xml}) {
  return xml;
}

export async function getServerSideProps({res}) {

  const client = await MongoClient.connect(url);
  const db = client.db(dbName);    
  const collection = db.collection("sitemaps");

  const data = await collection.findOne({_type : "fr_ec"});

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true
  });

  const current_sitemap = data?.xml;

  const xmlContent = builder.build(JSON.parse(current_sitemap));
  res.setHeader('Content-Type', 'application/xml');
  res.write(xmlContent)
  res.end()
  
  return {
    props: {
      xml: xmlContent
    }
  };
}
