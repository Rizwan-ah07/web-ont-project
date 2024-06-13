import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
// TODO: Voeg missende session middleware toe
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

// TODO: Voeg de routers toe met bijbehorende middleware.
// TODO: Zorg dat de 404 pagina wordt getoond als de gebruiker een onbekende route bezoekt.

export default app;