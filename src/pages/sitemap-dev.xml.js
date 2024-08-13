import { XMLBuilder } from "fast-xml-parser";
import { MongoClient } from "mongodb";
const url = process.env.MONGO_URI;
const dbName = "sitemap";

export default function SitemapXml({ xml }) {
  return xml;
}

export async function getServerSideProps({ res }) {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection("sitemaps");

  const data = await collection.findOne({ _type: "index" });

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true,
  });

  const sitemap = JSON.parse(data?.xml);
  const filteredSitemap = sitemap.sitemapindex.sitemap.filter(
    (item) =>
      !item.loc.includes("sitemap_pages_experts") &&
      !item.loc.includes("/a/sitemap/sitemap_blog.xml") &&
      !item.loc.includes("/a/sitemap/fr/sitemap_blog.xml")
  );
  sitemap.sitemapindex.sitemap = filteredSitemap;

  const xmlContent = builder.build(sitemap);
  res.setHeader("Content-Type", "application/xml");
  res.write(xmlContent);
  res.end();

  return {
    props: {
      xml: xmlContent,
    },
  };
}
