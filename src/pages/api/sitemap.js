import fs from 'fs';
import { XMLParser, XMLBuilder} from "fast-xml-parser";

export default async function handler(req, res) {

  if (req.method === 'POST') {

    const request = await fetch("https://www.kurufootwear.com/sitemap.xml");
    const reponse = await request.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@@",
      format: true
    });

    const currentParsedXML = parser.parse(reponse);
    
    const filteredLocs = currentParsedXML.sitemapindex.sitemap.filter(sitemap => !sitemap.loc.includes("en-ca") && !sitemap.loc.includes("fr-ca") )
    const new_sitemaps = [
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/blog.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/reports.xml"
      }
    ]

    const newParsedXML = {
      sitemapindex: {
        sitemap: [...filteredLocs, ...new_sitemaps],
        "@@xmlns": currentParsedXML.sitemapindex["@@xmlns"]
      }
    };

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@@",
      format: true
    });

    const xmlContent = builder.build(newParsedXML);

    fs.writeFile("./public/sitemap.xml", xmlContent, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating file' });
      } else {
        res.status(200).json({ message: 'File created successfully', data: newParsedXML });
      }      
    });

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

}
