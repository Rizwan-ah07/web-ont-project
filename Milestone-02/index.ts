import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Pokemon, Trainer } from "./interfaces";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

// URLs of your external JSON data (adjust these URLs as needed)
const POKEMON_URL =
  "https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/pokemon.json";
const TRAINER_URL =
  "https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/trainers.json";

// Fetch Pokémon data from GitHub
async function getPokemonData(): Promise<Pokemon[]> {
  try {
    const response = await fetch(POKEMON_URL);
    const data = (await response.json()) as Pokemon[];
    return data;
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    return [];
  }
}

// Fetch Trainer data from GitHub
async function getTrainerData(): Promise<Trainer[]> {
  try {
    const response = await fetch(TRAINER_URL);
    const data = (await response.json()) as Trainer[];
    return data;
  } catch (error) {
    console.error("Error fetching Trainer data:", error);
    return [];
  }
}

// Root route – a simple landing page
app.get("/", (req, res) => {
  res.render("index", {
    title: "Welcome",
    message: "Welcome to the Pokémon & Trainer App",
  });
});

/* ====================================================
   Pokémon Overview Route (with filtering & sorting)
   GET /pokemon
==================================================== */
app.get("/pokemon", async (req, res) => {
  let pokemons = await getPokemonData();

  // Filtering by name (if provided via query parameter "filterName")
  const filterName = req.query.filterName ? String(req.query.filterName) : "";
  if (filterName) {
    pokemons = pokemons.filter(p =>
      p.name.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  // Sorting: default sortField = "name", default sortDirection = "asc"
  const sortField = req.query.sortField ? String(req.query.sortField) : "name";
  const sortDirection = req.query.sortDirection ? String(req.query.sortDirection) : "asc";
  pokemons.sort((a, b) => {
    let aField: any, bField: any;
    if (sortField === 'trainer') {
      aField = a.trainerAffiliation.name;
      bField = b.trainerAffiliation.name;
    } else {
      aField = a[sortField as keyof Pokemon];
      bField = b[sortField as keyof Pokemon];
    }
    if (typeof aField === "string" && typeof bField === "string") {
      return sortDirection === "asc"
        ? aField.localeCompare(bField)
        : bField.localeCompare(aField);
    }
    if (typeof aField === "number" && typeof bField === "number") {
      return sortDirection === "asc" ? aField - bField : bField - aField;
    }
    return 0;
  });

  // Hidden fields (comma-separated list from query parameter "hiddenFields")
  const hiddenFields = req.query.hiddenFields
    ? String(req.query.hiddenFields).split(",").map(f => f.trim())
    : [];

  res.render("pokemonOverview", {
    pokemons,
    filterName,
    sortField,
    sortDirection,
    hiddenFields,
  });
});

/* ====================================================
   Pokémon Detail Route – Show full details
   GET /pokemon/:id
==================================================== */
app.get("/pokemon/:id", async (req, res) => {
  const id = req.params.id;
  const pokemons = await getPokemonData();
  const pokemon = pokemons.find(p => p.id === id);
  if (!pokemon) {
    res.status(404).send("Pokémon not found");
    return;
  }
  // Fetch the trainer data and find the trainer for this Pokémon
  const trainers = await getTrainerData();
  const trainer = trainers.find(t => t.id === pokemon.trainerAffiliation.id);
  res.render("pokemonDetail", { pokemon, trainer });
});

/* ====================================================
   Trainer Overview Route (optional)
   GET /trainer
==================================================== */
app.get("/trainer", async (req, res) => {
  let trainers = await getTrainerData();

  const filterName = req.query.filterName ? String(req.query.filterName) : "";
  if (filterName) {
    trainers = trainers.filter(t =>
      t.name.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  const sortField = req.query.sortField ? String(req.query.sortField) : "name";
  const sortDirection = req.query.sortDirection ? String(req.query.sortDirection) : "asc";
  trainers.sort((a, b) => {
    const aField = a[sortField as keyof Trainer];
    const bField = b[sortField as keyof Trainer];
    if (typeof aField === "string" && typeof bField === "string") {
      return sortDirection === "asc"
        ? aField.localeCompare(bField)
        : bField.localeCompare(aField);
    }
    if (typeof aField === "number" && typeof bField === "number") {
      return sortDirection === "asc" ? aField - bField : bField - aField;
    }
    return 0;
  });

  const hiddenFields = req.query.hiddenFields
    ? String(req.query.hiddenFields).split(",").map(f => f.trim())
    : [];

  res.render("trainerOverview", {
    trainers,
    filterName,
    sortField,
    sortDirection,
    hiddenFields,
  });
});

/* ====================================================
   Trainer Detail Route – Show full trainer details
   GET /trainer/:id
==================================================== */
app.get("/trainer/:id", async (req, res) => {
  const id = req.params.id;
  const trainers = await getTrainerData();
  const trainer = trainers.find(t => t.id === id);
  if (!trainer) {
    res.status(404).send("Trainer not found");
    return;
  }
  res.render("trainerDetail", { trainer });
});


app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});