import { Collection, MongoClient, ObjectId } from "mongodb";
import { Pokemon, Trainer, User } from "./interfaces";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
dotenv.config();

export const MONGODB_URI = process.env.MONGO_URI ?? "mongodb+srv://s151398:Password@web-ont-oefeningen.fv5lt.mongodb.net/";
const client = new MongoClient(MONGODB_URI);
const saltRounds: number = 10;

export const PokemonCollection: Collection<Pokemon> = client.db("webont").collection<Pokemon>("pokemons");
export const TrainerCollection: Collection<Trainer> = client.db("webont").collection<Trainer>("trainers");
export const UserCollection: Collection<User> = client.db("webont").collection<User>("users");

const pokemonUrl = "https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/pokemon.json";
const trainerUrl = "https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/trainers.json";


async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function createInitialUsers() {
    if (await UserCollection.countDocuments() > 0) { return; }
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
        throw new Error("Admin and User email or password must be set in the environment");
    }

    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    const userHash = await bcrypt.hash(userPassword, saltRounds);

    await UserCollection.insertMany([
        { email: adminEmail, password: adminHash, role: "ADMIN" },
        { email: userEmail, password: userHash, role: "USER" }
    ]);
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user: User | null = await findUserByEmail(email);
    if (user) {
        if (user.password && await bcrypt.compare(password, user.password)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function register(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser: User = {
        email: email,
        password: hashedPassword,
        role: "USER"
    };
    
    const result = await UserCollection.insertOne(newUser);
    return result.insertedId;
}

export async function loadDataToTheDatabase() {
  const pokemons: Pokemon[] = await getAllPokemons();
  const trainers: Trainer[] = await getAllTrainers();

  if (pokemons.length === 0) {
    console.log("Pokémon collection is empty, loading data into the database");
      const response = await fetchData<Pokemon[]>(pokemonUrl);
      if (pokemons.length === 0 ) {
        await PokemonCollection.insertMany(response);
        console.log("Inserted Pokémon data into the DB");
      }
  }

  if (trainers.length === 0) {
    console.log("Trainer collection is empty, loading data into the database");
      const response = await fetchData<Trainer[]>(trainerUrl);
      if (trainers.length === 0) {
        await TrainerCollection.insertMany(response);
        console.log("Inserted Trainer data into the DB");
    }
  }
}

export async function getSortedPokemons(
  sortField: string,
  sortDirection: "asc" | "desc",
  filterName?: string
) {
  const filter = filterName ? { name: { $regex: filterName, $options: "i" } } : {};
  const mongoSortField = sortField === "trainer" ? "trainerAffiliation.name" : sortField;
  const sortOrder = sortDirection === "asc" ? 1 : -1;
  return await PokemonCollection.find(filter).sort({ [mongoSortField]: sortOrder }).toArray();
}

export async function getSortedTrainers(
  sortField: string,
  sortDirection: "asc" | "desc",
  filterName?: string
) {
  const filter = filterName ? { name: { $regex: filterName, $options: "i" } } : {};
  const sortOrder = sortDirection === "asc" ? 1 : -1;
  return await TrainerCollection.find(filter)
    .sort({ [sortField]: sortOrder })
    .toArray();
}

export async function getAllPokemons() {
  return await PokemonCollection.find().toArray();
}

export async function findPokemonByName(name: string) {
  return await PokemonCollection.findOne({ name });
}

export async function findPokemonById(id: ObjectId) {
  return await PokemonCollection.findOne({ _id: id });
}

export async function getAllTrainers() {
  return await TrainerCollection.find().toArray();
}

export async function findTrainerByName(name: string) {
  return await TrainerCollection.findOne({ name });
}

export async function findTrainerById(id: ObjectId) {
  return await TrainerCollection.findOne({ _id: id });
}

export async function updatePokemonById(id: ObjectId, updateData: Partial<Pokemon>) {
    return await PokemonCollection.updateOne({ _id: id }, { $set: updateData });
}

export async function findUserByEmail(email: string) {
    return await UserCollection.findOne({ email: email });
}


export async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    await createInitialUsers();
    await loadDataToTheDatabase();
    process.on("SIGINT", exit);
  } catch (error) {
    console.error("Error connecting to MongoDB: " + error);
  }
}

async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}