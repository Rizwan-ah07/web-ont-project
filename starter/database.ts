import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Series } from "./types";
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

// TODO: Maak de nodige collections aan.

function seedDatabase() {
    // TODO: Spreek de API aan om alle series binnen te halen en vervolgens in de database te steken. Doe dit alleen als er nog geen series in de database zitten. De API Url is https://raw.githubusercontent.com/similonap/json/master/netflix.json
    // TODO: Maak ook twee gebruikers aan als er nog geen gebruikers in de database zitten.
    // TODO: Zorg ervoor dat de wachtwoorden van de gebruikers gehasht worden voordat ze in de database gestoken worden.
}

export function getSeries(q: string, sortField: string, direction: number) {
    // TODO: Geef alle series terug waarvan de naam overeenkomt met de query `q`. Sorteer de series op basis van het veld `sortField` in de richting `direction`.
    return [];
}

export function login(email: string, password: string) {
    // TODO: Controleer of de gebruiker bestaat en of het wachtwoord overeenkomt met het gehashte wachtwoord in de database.
    // TODO: Geef de gebruiker terug als alles in orde is.
    // TODO: Gooi een error als de gebruiker niet bestaat of als het wachtwoord niet overeenkomt.
}

export function getUser(email: string) {
    // TODO: Geef de gebruiker terug die overeenkomt met het emailadres.
    return [];
}

export function createSeries(series: Series) {
    // TODO: Voeg de meegegeven serie toe aan de database.
}

export function connect() {
    // TODO: Maak de connectie met de database
    // TODO: Zorg ervoor dat de seedDatabase functie wordt aangeroepen.
    // TODO: Zorg ervoor dat de verbinding met de database wordt afgesloten als het proces wordt afgesloten (SIGINT)
}