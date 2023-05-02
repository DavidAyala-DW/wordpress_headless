import { MongoClient } from 'mongodb';
const url = process.env.MONGO_URI;
const dbName = 'sitemap';


import { XMLParser} from "fast-xml-parser";

export default async function handler(req, res) {

  if (req.method === 'GET') {

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
        date: [
          {            
            "@@value": new Date().toISOString()
          }
        ],
        "@@xmlns": currentParsedXML.sitemapindex["@@xmlns"]
      }
    };

    const client = await MongoClient.connect(url);

    try {
      
      const db = client.db(dbName);    
      const collection = db.collection("sitemaps");
      await collection.updateOne(
        {},
        { $set: {xml: JSON.stringify(newParsedXML)} }, // The update operation
        { upsert: true } // The upsert option
      );

      client.close();

      await fetch(process.env.WEBHOOK, {method: "POST"});

      res.status(200).json({ message: 'File created successfully', data: newParsedXML });
    } catch (error) {
      console.error(error);
      client.close();
      res.status(500).json({ message: 'Error creating file' });
    }    

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

}
