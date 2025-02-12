import * as readlineSync from 'readline-sync';
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
      
      if (found) {
        console.log(`\n${found.name} (${found.id})`);
        console.log(`  Description: ${found.description}`);
        console.log(`  Age: ${found.age}`);
        console.log(`  Active: ${found.isActive}`);
        console.log(`  Birthdate: ${found.birthDate}`);
        console.log(`  Image: ${found.imageUrl}`);
        console.log(`  Rarity: ${found.rarity}`);
        console.log(`  Abilities: ${found.abilities.join(', ')}`);
        console.log('  Trainer:');
        console.log(`    Name: ${found.trainerAffiliation.name}`);
        console.log(`    Region: ${found.trainerAffiliation.region}`);
        console.log(`    Image: ${found.trainerAffiliation.imageUrl}`);
      } else {
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
