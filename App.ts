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
const assets: Array<string> = [];
let loaded: Boolean = false;
const apiRes = {
	home: {},
	about: {},
	collections: {},
	products: {},
};

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
	const api = await initApi(req);

	if (!loaded) {
		console.log("I'm fetching.....");
		loaded = true;
		// home
		await api
			.query(Prismic.Predicates.at("document.type", "home"))
			.then(({ results }: any) => {
				const data = results[0].data;
				const homeRes: Array<string> = [];
				data.gallery.forEach(({ image }: any) => {
					assets.push(image.url);
					homeRes.push(image.url);
				});
				apiRes.home = homeRes;
			});

		// about
		await api.getSingle("about").then((res: any) => {
			const data = res.data;
			const aboutRes: any = {
				body: {},
			};
			const aboutResGallery: Array<string> = [];

			data.gallery.forEach(({ image }: any) => {
				assets.push(image.url);
				aboutResGallery.push(image.url);
			});

			aboutRes.gallery = aboutResGallery;
			data.body.forEach((section: any) => {
				const sectionObj: any = {};
				const sectionItems = [];

				if (!isEmpty(section.items[0])) {
					for (let i = 0; i < section.items.length; i++) {
						assets.push(section.items[i].image.url);
						sectionItems.push(section.items[i].image.url);
					}
				}

				sectionObj.items = sectionItems;
				sectionObj.primary = section.primary;
				aboutRes.body[section.slice_type] = sectionObj;
			});
			apiRes.about = aboutRes;
		});

		// collection
		await api
			.query(Prismic.Predicates.at("document.type", "collection"))
			.then(async ({ results }) => {
				const collectionRes: any = {};
				// But why did switching to a for...of work while the .forEach did not?
				// .forEach expects a synchronous function and won't do anything with the
				// return value. It just calls the function and on to the next. for...of
				// will actually await on the result of the execution of the function.
				for (const product of results) {
					const data = product.data;
					const collectionObj: any = {};
					for (const productData of data.products) {
						const product = productData.products_product;
						await api
							.query(Prismic.Predicates.at("document.id", product.id))
							.then(({ results }: any) => {
								collectionObj[product.uid] = results[0].data;
								assets.push(results[0].data.image.url);
								assets.push(results[0].data.model.url);
							});
					}
					collectionRes[data.title] = collectionObj;
				}
				apiRes.collections = collectionRes;
			});
	}

	switch (req.url) {
		case "/":
			return apiRes.home;
		case "/about":
			return apiRes.about;
		case "/collections":
			return apiRes.collections;
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
	// debugger;
	const home = await fetchDoc(req);
	res.render("home", { home, assets });
});

app.get("/about", async (req, res) => {
	const about = await fetchDoc(req);
	res.render("about", { about, assets });
});

app.get("/collections", async (req, res) => {
	const collections = await fetchDoc(req);
	res.render("collections", { collections, assets });
});

app.listen(3000, () => console.log("I'm listening on port 3000 ✨✨"));
