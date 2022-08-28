import express, { Request, Response } from 'express';

import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(express.json());

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  const isValidUrl = (urlString: string) => {
    try {
      return Boolean(new URL(urlString));
    }
    catch (e) {
      return false;
    }
  }

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    // checks if image_url is provided in querystring
    if (!image_url) {
      return res.status(400)
        .send(`image_url is required`);
    }

    if (typeof image_url !== "string") {
      return res.status(400)
        .send("Query param 'image_url' has to be of type string");
    }
    
    // checks if the supplied image_url is a valid url
    if (!isValidUrl(image_url)) {
      return res.status(400)
        .send(`image_url is not a valid url. ensure you add the protocol part of the url. eg https://`);
    }

    let filteredImage: string;
    try {
      // process the image
      filteredImage = await filterImageFromURL(image_url);
    } catch (error) {
      return res.status(500)
        .send(`an error occurred when processing url, check the image_url`);
    }


    // send the filtered image to the client
    // sendFile is async, therefore, delete the image with a callback
    // to avoid cluttering the fs
    res.sendFile(filteredImage, (err) => {
      deleteLocalFiles([filteredImage]);
    })
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();