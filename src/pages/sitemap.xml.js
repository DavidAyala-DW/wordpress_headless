import { XMLParser, XMLBuilder} from "fast-xml-parser";
let current_sitemap = require('../../tmp/sitemap.json');

export default function SitemapXml({xml}) {
  return xml;
}

export async function getServerSideProps({req, res}) {

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true
  });

  const xmlContent = builder.build(current_sitemap);
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.write(xmlContent)
  res.end()
  
  return {
    props: {
      xml: xmlContent
    }
  };
}
