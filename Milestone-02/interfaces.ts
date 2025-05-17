import { ObjectId } from "mongodb";

export interface TrainerAffiliation {
    id: string;
    name: string;
    region: string;
    imageUrl: string;
  }
  
  export interface Pokemon {
    id: string;
    name: string;
    description: string;
    age: number;
    isActive: boolean;
    birthDate: string;
    imageUrl: string;
    rarity: string; 
    abilities: string[];
    trainerAffiliation: TrainerAffiliation;
  }
  
  export interface Trainer {
    id: string;
    name: string;
    description: string;
    age: number;
    isActive: boolean;
    birthDate: string;
    imageUrl: string;
    region: string;
    hobbies: string[];
  }

  export interface User{
    _id?: ObjectId;
    role : "ADMIN" | "USER";
    email : string;
    password? : string;
  }
  