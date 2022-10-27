import express from "express";
import dotenv from "dotenv";
import main from "./route/main.js";
import api from "./route/api.js";

dotenv.config();

const app = express();

app
  .set("view engine", "ejs")
  .set("views", "views")
  .use(express.static("public"))
  .use(express.urlencoded({ extended: true }))
  .use("/", main)
  .use("/api", api)
  .use((r) => r.res.render("./pages/404", { title: "404" }));

async function start() {
  try {
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `Сервер запущен! http://localhost:${process.env.PORT || 5000}`
      )
    );
  } catch (e) {
    console.log(e);
  }
}
start();
