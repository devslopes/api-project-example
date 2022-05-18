const pokemonGrid = document.querySelector(".pokemon-grid");
const favPokemons = document.querySelector(".fav-grid");
const types = document.querySelector(".types");
const searchBox = document.getElementById("search");
const navLinks = document.querySelectorAll(".filter-link");
const dropDown = document.getElementById("order");
const TOTAL_POKEMONS = 30;
const GET_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";

const POKEMON_TYPES = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

//FETCH DATA FROM API

async function fetchPokemon(url) {
  //Fetch a single pokemon
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error! Fetching Single Pokemon status: ${response.status}`);
  }
  return await response.json();
}

async function fetchPokemons() {
  //Use the fetched URLs to fetch all the pokemons
  let pokemons = [];
  const promises = [];
  for (let i = 1; i <= TOTAL_POKEMONS; i++) {
    promises.push(fetchPokemon(`${GET_POKEMON_URL}${i}`));
  }
  pokemons = await Promise.all(promises);
  return pokemons;
}

function removePokemon(node, pokemon) {
  node.removeChild(pokemon);
}
function addPokemon(node, pokemon) {
  node.appendChild(pokemon);
}

//CREATE POKEMON CARD DOM ELEMENT
function createPokemonCard(pokemon) {
  const pokemonCard = document.createElement("div");
  pokemonCard.classList.add("pokemon-card");
  pokemonCard.setAttribute("id", pokemon.id);
  pokemonCard.setAttribute("data-name", pokemon.name);
  const pokemonContainer = document.createElement("div");
  pokemonContainer.classList.add("pokemon-container");
  const pokemonId = document.createElement("p");
  pokemonId.classList.add("id");
  pokemonId.textContent = `#${pokemon.id}`;
  const imgWrapper = document.createElement("div");
  imgWrapper.classList.add("img-wrapper");
  const pokemonImg = document.createElement("img");
  pokemonImg.src = pokemon.sprites.front_default;
  const text = document.createElement("div");
  text.classList.add("text-content");
  const pokemonName = document.createElement("h3");
  pokemonName.textContent = pokemon.name;
  const pokemonType = document.createElement("p");
  pokemonType.textContent = `Type: ${pokemon.types[0].type.name}`;
  text.appendChild(pokemonName);
  text.appendChild(pokemonType);
  imgWrapper.appendChild(pokemonImg);
  pokemonContainer.appendChild(pokemonId);
  pokemonContainer.appendChild(imgWrapper);
  pokemonContainer.appendChild(text);
  pokemonCard.appendChild(pokemonContainer);
  pokemonCard.style.background = POKEMON_TYPES[pokemon.types[0].type.name];

  return pokemonCard;
}

//Count of Pokemon Types in the api response
function createTypes(data) {
  const pokemonTypes = {};

  data.forEach((item) => {
    pokemonTypes[item.types[0].type.name] = pokemonTypes[item.types[0].type.name] + 1 || 1;
  });
  return pokemonTypes;
}

function createTypeChart(container, types) {
  const typesWrapper = document.createElement("div");
  typesWrapper.classList.add("types-wrapper");
  const header = document.createElement("h4");
  header.textContent = "Available Pokemon Types";
  container.appendChild(header);
  for (const type in types) {
    const typeName = document.createElement("p");
    typeName.textContent = `${type.toUpperCase()}: ${types[type]}`;
    typesWrapper.appendChild(typeName);
  }
  container.appendChild(typesWrapper);
}

const setActive = (elm, selector) => {
  // set active state to theme buttons
  if (document.querySelector(`${selector}.active`) !== null) {
    document.querySelector(`${selector}.active`).classList.remove("active");
  }
  elm.classList.add("active");
};

pokemonGrid.addEventListener("click", function (e) {
  if (!e.target.matches(".pokemon-card")) {
    return;
  }
  let pokemon = e.target;
  removePokemon(pokemonGrid, pokemon);
  addPokemon(favPokemons, pokemon);
});

favPokemons.addEventListener("click", function (e) {
  if (!e.target.matches(".pokemon-card")) {
    return;
  }
  let pokemon = e.target;
  removePokemon(favPokemons, pokemon);
  pokemon.setAttribute("data-fav", "fav");
  addPokemon(pokemonGrid, pokemon);
});

//START MAIN LOGIC
fetchPokemons().then((pokemons) => {
  const pokemonArr = pokemons;
  for (const pokemon of pokemonArr) {
    pokemonGrid.appendChild(createPokemonCard(pokemon));
  }
  console.log(createTypeChart(types, createTypes(pokemons)));
  //search pokemons
  const allPokemons = document.querySelectorAll(".pokemon-card");
  searchBox.addEventListener("keyup", (e) => {
    const searchInput = e.target.value.toLowerCase().trim();
    allPokemons.forEach((card) => {
      card.style.display = card.dataset.name.includes(searchInput) ? "block" : "none";
    });
  });
  //   End of Search Pokemons

  //Start NavLink Filter
  for (const link of navLinks) {
    link.addEventListener("click", function () {
      const filter = link.dataset.filter;
      allPokemons.forEach((card) => {
        if (filter === "all") {
          favPokemons.style.display = "none";
          favPokemons.classList.add("hidden");
          pokemonGrid.style.display = "flex";
          pokemonGrid.classList.remove("hidden");
          types.classList.remove("hidden");
        } else if (filter === "fav") {
          pokemonGrid.style.display = "none";
          favPokemons.style.display = "flex";
          pokemonGrid.classList.add("hidden");
          favPokemons.classList.remove("hidden");
          types.classList.add("hidden");
        }
      });
      setActive(link, ".filter-link");
    });
  }
  //   End of NavLink filter

  //Start of order alphabetically
  dropDown.addEventListener("change", function (e) {
    const sorted = pokemonGrid.classList.contains("hidden") ? favPokemons : pokemonGrid;
    const sortVal = e.target.value === "a" ? 1 : -1;
    [...sorted.children]
      .sort((a, b) => (a.dataset.name > b.dataset.name ? sortVal : sortVal * (-1) ))
      .forEach((card) => sorted.appendChild(card)
    );
  });
});
