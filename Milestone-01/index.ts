import * as readlineSync from 'readline-sync';
import { Pokemon, Trainer } from './interfaces';
import chalk from "chalk";

const POKEMON_URL =
  'https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/pokemon.json';
const TRAINER_URL =
  'https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/trainers.json';

async function fetchPokemonData(): Promise<Pokemon[]> {
  try {
    const response = await fetch(POKEMON_URL);
    const data: Pokemon[] = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching pokemon data:', error);
    return [];
  }
}

async function fetchTrainerData(): Promise<Trainer[]> {
  try {
    const response = await fetch(TRAINER_URL);
    const data: Trainer[] = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching trainer data:', error);
    return [];
  }
}

async function main() {
  const pokemonData = await fetchPokemonData();
  const trainerData = await fetchTrainerData();

  if (pokemonData.length === 0) {
    console.log('No pokemon data available.');
    return;
  }

  if (trainerData.length === 0) {
    console.log('No trainer data available.');
  }

  let exit = false;
  while (!exit) {
    console.log('\nWelcome to the JSON data viewer!');
    console.log('1. View all pokemons');
    console.log('2. Filter Pokemon by ID');
    console.log('3. View all trainers');
    console.log('4. View what trainer has which pokemon');
    console.log('5. Exit');

    const choice = Number(readlineSync.question('Please enter your choice: '));

    switch (choice) {
      case 1:
        console.log('\nAll Pokémon:');
        pokemonData.forEach((p) => {
          console.log(`- ${p.name} (${p.id})`);
        });
        break;
      case 2: {
        const idInput = readlineSync.question(
          'Please enter the Pokemon ID you want to filter by: (start with POK-0..) '
        );
        const found = pokemonData.find(
          (p) => p.id.toLowerCase() === idInput.toLowerCase()
        );

        if (found) {
          console.log(chalk.magenta(`\n${found.name} (${found.id})`));
          console.log(
            chalk.magenta('  Description:') + chalk.white(` ${found.description}`)
          );
          console.log(
            chalk.magenta('  Image:') + chalk.white(` ${found.imageUrl}`)
          );
          console.log(
            chalk.magenta('  Rarity:') + chalk.white(` ${found.rarity}`)
          );
          console.log(
            chalk.magenta('  Abilities:') +
              chalk.white(` ${found.abilities.join(', ')}`)
          );
        } else {
          console.log(`\nNo Pokémon found with ID: ${idInput}`);
        }
        break;
      }
      case 3:
        console.log('\nAll Trainers:');
        trainerData.forEach((t) => {
          console.log(`- ${t.name} (${t.id})`);
        });
        break;
      case 4:
        console.log('\nTrainer and their Pokémon:');
        trainerData.forEach((trainer) => {
          console.log(chalk.blue(`\nTrainer: ${trainer.name} (${trainer.id})`));
          const pokemonsForTrainer = pokemonData.filter(
            (pokemon) => pokemon.trainerAffiliation.id === trainer.id
          );
          if (pokemonsForTrainer.length > 0) {
            pokemonsForTrainer.forEach((pokemon) => {
              console.log(`  - ${pokemon.name} (${pokemon.id})`);
            });
          } else {
            console.log('  No Pokémon found for this trainer.');
          }
        });
        break;
      case 5:
        console.log('Goodbye!');
        exit = true;
        break;
      default:
        console.log('Invalid choice, please try again.');
        break;
    }
  }
}

main();
