import { Request, Response, NextFunction } from "express";

export function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    // TODO: Implementeer deze middleware functie zodat deze controleert of de gebruiker is ingelogd.
    next();
}