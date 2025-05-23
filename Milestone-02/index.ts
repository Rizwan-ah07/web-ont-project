import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { Pokemon } from "./interfaces";
import { connect, getAllPokemons, getAllTrainers, login, register, PokemonCollection, getSortedPokemons, getSortedTrainers } from "./database";
import { secureMiddleware, ensureAdmin } from "./middleware/secureMiddleware";
import { loginRouter } from "./routers/loginRouter";
import { registerRouter } from "./routers/registerRouter";
dotenv.config();

const app: Express = express();

declare module "express-session" {
    interface SessionData {
        user: { [key: string]: any };
    }
}

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT ?? 3000);

app.use(
  require("express-session")({
    secret: "your secret key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(loginRouter());
app.use(registerRouter());


app.get("/", secureMiddleware, (req, res) => {
  res.render("index", {
    title: "Welcome",
    message: "Welcome to the Pokémon & Trainer App",
  });
});

app.get("/pokemon", secureMiddleware, async (req, res) => {
  const filterName = req.query.filterName ? String(req.query.filterName) : "";
  const sortField = req.query.sortField ? String(req.query.sortField) : "name";
  const sortDirection = req.query.sortDirection ? String(req.query.sortDirection) as "asc" | "desc" : "asc";
  const pokemons = await getSortedPokemons(sortField, sortDirection, filterName);

  res.render("pokemonOverview", {
    pokemons,
    filterName,
    sortField,
    sortDirection
  });
});

app.get("/pokemon/:id", secureMiddleware, async (req, res) => {
  const id = req.params.id;
  const pokemons = await getAllPokemons();
  const pokemon = pokemons.find(p => p.id === id);
  if (!pokemon) {
    res.status(404).send("Pokémon not found");
    return;
  }
  const trainers = await getAllTrainers();
  const trainer = trainers.find(t => t.id === pokemon.trainerAffiliation.id);
  res.render("pokemonDetail", { pokemon, trainer });
});

app.get("/pokemon/:id/edit", secureMiddleware, ensureAdmin, async (req: Request, res: Response) => {
    const id = req.params.id;
    const pokemon = await PokemonCollection.findOne({ id: id });
    if (!pokemon) {
        return res.status(404).send("Pokémon not found");
    }
    res.render("pokemonEdit", { pokemon });
});

app.post("/pokemon/:id/edit", secureMiddleware, ensureAdmin, async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        
        const updateData: Partial<Pokemon> = {
            name: req.body.name,
            description: req.body.description,
            age: parseInt(req.body.age),
            imageUrl: req.body.imageUrl,
            rarity: req.body.rarity  
        };

        const result = await PokemonCollection.updateOne({ id: id }, { $set: updateData });
        if (result.modifiedCount === 0) {
            return res.status(404).send("No updates made, Pokémon not found.");
        }
        res.redirect(`/pokemon/${id}`);
    } catch (error) {
        console.error("Failed to update the Pokémon:", error);
        res.status(500).send("Error updating Pokémon");
    }
});

app.get("/trainer", secureMiddleware, async (req, res) => {
  const filterName = req.query.filterName ? String(req.query.filterName) : "";
  const sortField = req.query.sortField ? String(req.query.sortField) : "name";
  const sortDirection = req.query.sortDirection ? String(req.query.sortDirection) as "asc" | "desc" : "asc";

  const trainers = await getSortedTrainers(sortField, sortDirection, filterName);

  res.render("trainerOverview", {
    trainers,
    filterName,
    sortField,
    sortDirection
  });
});

app.get("/trainer/:id", secureMiddleware, async (req, res) => {
  const id = req.params.id;
  const trainers = await getAllTrainers();
  const trainer = trainers.find(t => t.id === id);
  if (!trainer) {
    res.status(404).send("Trainer not found");
    return;
  }
  const pokemons = await getAllPokemons();
  const pokemonsForTrainer = pokemons.filter(
    p => p.trainerAffiliation.id === trainer.id
  );

  res.render("trainerDetail", { 
    trainer, pokemonsForTrainer 
  });
});

app.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await login(email, password);
        if (req.session) {
            req.session.user = user;
        }
        res.redirect("/");
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).send(error.message);
        } else {
            res.status(401).send("Unknown error occurred");
        }
    }
});

app.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        await register(email, password);
        res.redirect("/login");
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send("Unknown error occurred");
        }
    }
});


app.listen(app.get("port"), async () => {
  await connect();
  console.log("Server started on http://localhost:" + app.get("port"));
});