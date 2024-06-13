import session, { MemoryStore } from "express-session";

declare module "express-session" {
    export interface SessionData {
        // TODO: Voeg de benodigde properties toe aan de SessionData interface.
    }
}

export default session({
    // TODO: Haal de secret uit de dotenv file. Gebruik hiervoor SESSION_SECRET.
    secret: "my-super-secret-secret",
    store: new MemoryStore(),
    resave: true,
    saveUninitialized: true
});