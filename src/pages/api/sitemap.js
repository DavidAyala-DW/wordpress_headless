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
    const invalid_content = [];
    const filteredLocs = currentParsedXML.sitemapindex.sitemap.filter(sitemap => !invalid_content.some(el => sitemap.loc.includes(el)) )
    const new_sitemaps = [
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/sitemap_pages_experts.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/fr/sitemap_pages_experts.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/sitemap_blog.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/fr/sitemap_blog.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/sitemap_reports.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/fr/sitemap_reports.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/sitemap_compare.xml"
      },
      {
        "loc": "https://www.kurufootwear.com/a/sitemap/fr/sitemap_compare.xml"
      }
    ]

    const newParsedXML = {
      sitemapindex: {
        sitemap: [...filteredLocs, ...new_sitemaps],
        "@@xmlns": currentParsedXML.sitemapindex["@@xmlns"]
      }
    };

    const wordpress_sitemap_request = await fetch("https://kuruexpertscorner.com/test_sitemap.xml");
    const wordpress_sitemap_response = await wordpress_sitemap_request.text();
    const wordpress_sitemap = parser.parse(wordpress_sitemap_response);
    const {urlset} = wordpress_sitemap;

    const parsed_urlset = urlset.url.filter(url => url.loc.includes("/a/") && !url.loc.includes("lorem") && !url.loc.includes("this-is-an") );

    const wordpress_home = urlset.url.find(url => url.loc == "https://www.kurufootwear.com" );

    let blog_urls = parsed_urlset.filter(url => url.loc.includes("/a/blog/"));
    const ec_urls = parsed_urlset.filter(url => url.loc.includes("/a/shoes/"));
    const reports_urls = parsed_urlset.filter(url => url.loc.includes("/a/reports/"));
    const compare_urls = parsed_urlset.filter(url => url.loc.includes("/a/compare/"));

    const ec_activity = {...blog_urls.find(url => url.loc.includes("/a/blog/activity"))};
    ec_activity.loc = ec_activity.loc.replace("blog","shoes");
    ec_urls.push(ec_activity);

    const blog_home = {...wordpress_home};
    blog_home.loc = "https://www.kurufootwear.com/a/blog";
    blog_urls.push(blog_home);

    const shoes_home = {...wordpress_home};
    shoes_home.loc = "https://www.kurufootwear.com/a/shoes";
    ec_urls.push(shoes_home);
    const publish_date = new Date("2023-05-11T00:00:00+00:00").getTime();
    const publish_date_string = new Date("2023-05-11T00:00:00+00:00").toISOString().replace('Z', '+00:00');

    blog_urls = blog_urls.filter(url => url.loc != "/a/shoes");
 
    blog_urls.forEach((url, i) => {
      const lastmod_date = new Date(url.lastmod).getTime();
      if(lastmod_date <= publish_date){        
        blog_urls[i].lastmod = publish_date_string;
      }
      blog_urls[i].changefreq = "weekly";
      blog_urls[i].priority = parseFloat(blog_urls[i].priority).toFixed(1);
    })

    ec_urls.forEach((url, i) => {
      const lastmod_date = new Date(url.lastmod).getTime();
      if(lastmod_date <= publish_date){        
        ec_urls[i].lastmod = publish_date_string;
      }
      ec_urls[i].changefreq = "weekly";
      ec_urls[i].priority = parseFloat(ec_urls[i].priority).toFixed(1);
    })

    reports_urls.forEach((url, i) => {
      const lastmod_date = new Date(url.lastmod).getTime();
      if(lastmod_date <= publish_date){        
        reports_urls[i].lastmod = publish_date_string;
      }
      reports_urls[i].changefreq = "weekly";
      reports_urls[i].priority = parseFloat(reports_urls[i].priority).toFixed(1);
    })

    compare_urls.forEach((url, i) => {
      const lastmod_date = new Date(url.lastmod).getTime();
      if(lastmod_date <= publish_date){        
        compare_urls[i].lastmod = publish_date_string;
      }
      compare_urls[i].changefreq = "weekly";
      compare_urls[i].priority = parseFloat(compare_urls[i].priority).toFixed(1);
    })

    const blog_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: blog_urls,
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const fr_blog_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        //Filter to don't include the home page (/a/blog/fr/home)
        url: blog_urls.map(blog => {
          const new_blog = {...blog};
          new_blog.loc = new_blog.loc.replace("/a/blog","/a/blog/fr");
          if(new_blog.loc.split("/").slice(-1)[0] == "fr" || new_blog.loc.split("/").slice(-1)[0] == ""){
           new_blog.loc += "/home"
          }
          return new_blog;
        }).filter(blog => !blog.loc.includes("/fr/home")),        
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const shoes_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: ec_urls,
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const fr_shoes_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: ec_urls.map(blog => {
          const new_blog = {...blog};
          new_blog.loc = new_blog.loc.replace("/a/shoes","/a/shoes/fr");
          if(new_blog.loc.split("/").slice(-1)[0] == "fr" || new_blog.loc.split("/").slice(-1)[0] == ""){
           new_blog.loc += "/home"
          }
          return new_blog;
        }),
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const reports_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: reports_urls,
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const fr_reports_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: reports_urls.map(report => ({...report, loc: report.loc.replace("/a/reports","/a/reports/fr")})),
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const compare_pages_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: compare_urls,
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const fr_compare_pages_xml = {
      "?xml":{
        "@@version": "1.0",
        "@@encoding": "UTF-8"        
      },
      urlset: {
        url: compare_urls.map(compare => ({...compare, loc: compare.loc.replace("/a/compare","/a/compare/fr")})),
        "@@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@@xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1"
      }
    }

    const client = await MongoClient.connect(url);

    try {
      
      const db = client.db(dbName);    
      const collection = db.collection("sitemaps");
      await collection.updateOne(
        {_type: "index"},
        { $set: {_type:"index", xml: JSON.stringify(newParsedXML)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "blog"},
        { $set: {_type:"blog", xml: JSON.stringify(blog_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "fr_blog"},
        { $set: {_type:"fr_blog", xml: JSON.stringify(fr_blog_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "ec"},
        { $set: {_type:"ec", xml: JSON.stringify(shoes_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "fr_ec"},
        { $set: {_type:"fr_ec", xml: JSON.stringify(fr_shoes_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "reports"},
        { $set: {_type:"reports", xml: JSON.stringify(reports_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "fr_reports"},
        { $set: {_type:"fr_reports", xml: JSON.stringify(fr_reports_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "compare"},
        { $set: {_type:"compare", xml: JSON.stringify(compare_pages_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      await collection.updateOne(
        {_type: "fr_compare"},
        { $set: {_type:"fr_compare", xml: JSON.stringify(fr_compare_pages_xml)} }, // The update operation
        { upsert: true } // The upsert option
      );

      client.close();

      res.status(200).json({ message: 'XML files have been created successfully.'});

    } catch (error) {
      console.error(error);
      client.close();
      res.status(500).json({ message: 'Error creating file' });
    }    

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

}
