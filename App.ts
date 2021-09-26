import express from "express";
import morgan from "morgan";
import path from "path";

const app = express();
app.use(morgan("dev"));

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "page"));

app.get("/", async (_, res) => {
  res.render("home");
});

app.listen(3000, () => console.log("I'm listening on port 3000..."));
