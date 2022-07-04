import "babel-polyfill";
import express from "express";
import { matchRoutes } from "react-router-config";
import Routes from "./client/Routes";
import renderer from "./helpers/renderer";
import createStore from "./helpers/createStore";
import proxy from "express-http-proxy";

const app = express();

app.use(
  "/api",
  proxy("http://react-ssr-api.herokuapp.com", {
    proxyReqOptDecorator(opts) {
      opts.headers["x-forwarded-host"] = "localhost:3000";
      return opts;
    },
  })
);
app.use(express.static("public"));
app.get("*", (req, res) => {
  const store = createStore(req);

  const promises = matchRoutes(Routes, req.path)
    .map(({ route }) => {
      return route.loadData ? route.loadData(store) : null;
    })
    .map((promise) => {
      if (promise) {
        return new Promise((resolve, _reject) => {
          promise.then(resolve).catch(resolve);
        });
      }
    });

  const render = () => {
    const context = {};
    const content = renderer(req, store, context);
    console.log("context21", context);

    if (context.url) {
      return res.redirect(302, context.url);
    }

    if (context.notFound) {
      res.status(404);
    }
    res.send(content);
  };

  Promise.all(promises).then(render).catch(render);
});

app.listen(3000, () => {
  console.log("Listening on port 3000, http://localhost:3000");
});
