import * as readlineSync from 'readline-sync';
import chalk from 'chalk';
import { Pokemon } from './interfaces';

const POKEMON_URL =
  'https://raw.githubusercontent.com/Rizwan-ah07/web-ont-json/refs/heads/main/pokemon.json';

async function fetchPokemonData(): Promise<Pokemon[]> {
  try {
    const response = await fetch(POKEMON_URL);
    const data: Pokemon[] = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching data:', error);
    return [];
  }
}

async function main() {
  const pokemonData = await fetchPokemonData();

  if (pokemonData.length === 0) {
    console.log('No data available.');
    return;
  }

  let exit = false;
  while (!exit) {
    console.log('\nWelcome to the JSON data viewer!');
    console.log('1. View all data');
    console.log('2. Filter by ID');
    console.log('3. Exit');
    
    const choice = readlineSync.question('Please enter your choice: ');
    
    if (choice === '1') {
      console.log('\nAll Pokémon:');
      pokemonData.forEach((p) => {
        console.log(`- ${p.name} (${p.id})`);
      });
      
    } else if (choice === '2') {
      const idInput = readlineSync.question(
        'Please enter the ID you want to filter by: '
      );
      const found = pokemonData.find(
        (p) => p.id.toLowerCase() === idInput.toLowerCase()
      );

      // chalk toegevoed om de data duidelijker te maken
      if (found) {
        console.log(chalk.magenta(`\n${found.name} (${found.id})`));
        console.log(chalk.magenta(`  Description:`) + chalk.white(` ${found.description}`));
        console.log(chalk.magenta(`  Age:`) + chalk.white(` ${found.age}`));
        console.log(chalk.magenta(`  Active:`) + chalk.white(` ${found.isActive}`));
        console.log(chalk.magenta(`  Birthdate:`) + chalk.white(` ${found.birthDate}`));
        console.log(chalk.magenta(`  Image:`) + chalk.white(` ${found.imageUrl}`));
        console.log(chalk.magenta(`  Rarity:`) + chalk.white(` ${found.rarity}`));
        console.log(chalk.magenta(`  Abilities:`) + chalk.white(` ${found.abilities.join(', ')}`));
        console.log(chalk.magenta('  Trainer:'));
        console.log(chalk.magenta(`    Name:`) + chalk.white(` ${found.trainerAffiliation.name}`));
        console.log(chalk.magenta(`    Region:`) + chalk.white(` ${found.trainerAffiliation.region}`));
        console.log(chalk.magenta(`    Image:`) + chalk.white(` ${found.trainerAffiliation.imageUrl}`));
      }
       else {
        console.log(`\nNo Pokémon found with ID: ${idInput}`);
      }
      
    } else if (choice === '3') {
      console.log('Goodbye!');
      exit = true;
    } else {
      console.log('Invalid choice, please try again.');
    }
  }
}

main();
