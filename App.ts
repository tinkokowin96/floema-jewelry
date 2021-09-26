import express from "express";
import morgan from "morgan";
import path from "path";
import PrismicDom from "prismic-dom";
import { UAParser } from "ua-parser-js";
import Prismic from "@prismicio/client";
import dotenv from "dotenv";

dotenv.config();
const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

const initApi = (req: any) => {
  return Prismic.getApi(apiEndpoint!, {
    accessToken: apiKey,
    req,
  });
};

const lineResolver = (doc: any) => {
  switch (doc.type) {
    case "about":
      return "/about";
    case "home":
      return "/";
    case "collections" || "collection":
      return "/collection";
    case "product":
      return `detail/${doc.slug}`;
    default:
      return "/";
  }
};

const fetchDoc = (req: any) =>
  initApi(req).then((api: any) => {
    if (req.url === "/") {
      return api.query(Prismic.Predicates.at("document.type", "home"));
    } else {
      return api.query(Prismic.Predicates.at("document.type", req.url));
    }
  });

const app = express();
app.use(morgan("dev"));

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "page"));

app.use((req, res, next) => {
  const ua = UAParser(req.headers["user-agent"]);
  switch (ua.device.type) {
    case undefined:
      res.locals.userDevice = "Desktop";
    case "mobile":
      res.locals.userDevice = "Phone";
    case "tablet":
      res.locals.userDevice = "Tablet";
  }
  res.locals.link = lineResolver(req);
  res.locals.PrismicDom = PrismicDom;

  next();
});

app.get("/", async (req, res) => {
  const data = await fetchDoc(req);
  console.log("got data", data);
  res.render("home", { data });
});

app.listen(3000, () => console.log("I'm listening on port 3000 ✨✨"));
