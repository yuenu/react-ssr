import express from "express";
import React from "react";
import * as ReactDOMServer from "react-dom/server";

import Home from "./client/components/Home";

const app = express();

app.use(express.static("public"));
app.get("/", (req, res) => {
  const content = ReactDOMServer.renderToString(<Home />);

  const html = `
    <html>
      <head></head>
      <body>
        <div>${content}</div>
        <script src="bundle.js"></script>
      </body>
    </html>
  `;
  res.send(content);
});

app.listen(3000, () => {
  console.log("Listening on port 3000, http://localhost:3000");
});
