import express from "express";
import morgan from "morgan";
import path from "path";
import PrismicDom from "prismic-dom";
import { UAParser } from "ua-parser-js";
import Prismic from "@prismicio/client";
import dotenv from "dotenv";
import { isEmpty } from "lodash";

dotenv.config();
const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;
const asset: Array<string> = [];

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

const fetchDoc = async (req: any) => {
	const apiRes = {
		home: {},
		about: {},
	};
	const api = await initApi(req);

	// home
	await api
		.query(Prismic.Predicates.at("document.type", "home"))
		.then(({ results }: any) => {
			const data = results[0].data;
			const homeRes: Array<string> = [];
			data.gallery.forEach(({ image }: any) => {
				asset.push(image.url);
				homeRes.push(image.url);
			});
			apiRes.home = homeRes;
		});

	// about
	await api.getSingle("about").then((res: any) => {
		const data = res.data;
		const aboutRes = {
			body: {},
		};
		const aboutResGallery: Array<string> = [];

		data.gallery.forEach(({ image }: any) => {
			asset.push(image.url);
			aboutResGallery.push(image.url);
		});

		//@ts-ignore
		aboutRes.gallery = aboutResGallery;
		data.body.forEach((section: any) => {
			const sectionObj = {};
			const sectionItems = [];

			if (!isEmpty(section.items[0])) {
				for (let i = 0; i < section.items.length; i++) {
					asset.push(section.items[i].image.url);
					sectionItems.push(section.items[i].image.url);
				}
			}

			//@ts-ignore
			sectionObj.items = sectionItems;
			//@ts-ignore
			sectionObj.primary = section.primary;
			//@ts-ignore
			// apiRes.about[section.slice_type] = sectionObj;
			//@ts-ignore
			aboutRes.body[section.slice_type] = sectionObj;
		});
		apiRes.about = aboutRes;
	});

	switch (req.url) {
		case "/":
			return apiRes.home;
		case "/about":
			return apiRes.about;
	}
};

const app = express();

app.use(morgan("dev"));

// If we don't serve static files, we can't access these from html
app.use(express.static(path.join(__dirname, "build")));

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
	const home = await fetchDoc(req);
	res.render("home", { home });
});

app.get("/about", async (req, res) => {
	const about = await fetchDoc(req);
});

app.listen(3000, () => console.log("I'm listening on port 3000 ✨✨"));
