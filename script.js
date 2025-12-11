// get references to HTML elements we need
const pokemonNameEl = document.getElementById("pokemon-name");
const pokemonImageEl = document.querySelector(".image-container img");
const input = document.querySelector("input");
const submitBtn = document.querySelector(".submit-btn");
const giveUpBtn = document.querySelector(".giveup-btn");
const feedbackEl = document.getElementById("feedback");
const currentStreakEl = document.getElementById("current-streak");
const bestStreakEl = document.getElementById("best-streak");

//global variables to track game state
let currentBST = 0;
let currentStreak = 0;
let bestStreak = parseInt(localStorage.getItem("bestStreak")) || 0;

// Update best streak display on load
bestStreakEl.textContent = bestStreak;

//random pokemon ID between 1 and 1025
function getRandomPokemonId() {
  return Math.floor(Math.random() * 1025) + 1;
}

// stats array contains the 6 pokemon stats
// reduce gets us our base stat total by summing the stats up
// total = running sum (starts at 0)
// stat = current stat object
// stat.base_stat = extracts just the number we want
function calculateBST(stats) {
  return stats.reduce((total, stat) => total + stat.base_stat, 0);
}
// Example: 45 + 49 + 49 + 65 + 65 + 45 = 318 for Bulbasaur

// Fetch a new random Pokémon and update the UI
async function loadNewPokemon() {
  // Step 1: Get a random Pokémon ID (e.g., 25 for Pikachu)
  const pokemonId = getRandomPokemonId();

  try {
    // Step 2: Fetch data from PokéAPI for THAT specific Pokémon, in this case Pikachu
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    // step 3: convert the response to JSON
    const data = await response.json();

    // data now contains everything about this Pokémon:
    // - data.name (e.g., "pikachu")
    // - data.stats (array of 6 stat objects)
    // - data.sprites (images)

    // step 4: calculate base stats for THIS pokemon, e.g., Pikachu
    // pass in data.stats to calculateBST function
    currentBST = calculateBST(data.stats);
    console.log("Current BST:", currentBST); // for debugging

    // step 5: update site with the pokemons name, inital letter capitalzed
    const pokemonName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    pokemonNameEl.textContent = pokemonName;

    //step 6: update site with the pokemons image
    pokemonImageEl.src = data.sprites.other["official-artwork"].front_default;
    pokemonImageEl.alt = pokemonName;

    // step 7: clear input and feedback
    input.value = "";
    feedbackEl.classList.remove("show", "correct", "incorrect");
  } catch (error) {
    // handle errors (e.g., network issues)
    console.error("Error fetching Pokemon:", error);
  }
}

// update streak counter
// if correct, increment current streak
// if current streak exceeds best streak, update best streak
// if incorrect, reset current streak to 0
function updateStreak(correct) {
  if (correct) {
    // increment current streak
    currentStreak++;
    //check if this is a personal best streak
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
      // save new best streak to local storage
      localStorage.setItem("bestStreak", bestStreak);
      bestStreakEl.textContent = bestStreak;
    }
  } else {
    // reset current streak
    currentStreak = 0;
  }
  // update current streak display
  currentStreakEl.textContent = currentStreak;
}

// show feedback message to user
function showFeedback(message, isCorrect) {
  // set feedback text and style
  feedbackEl.textContent = message;

  // Add CSS classes for styling and animation
  // "show" makes it visible
  // "correct" or "incorrect" determines color/animation
  feedbackEl.className =
    "feedback show " + (isCorrect ? "correct" : "incorrect");

  // Wait 1.5 seconds, then load the next Pokémon
  setTimeout(() => {
    loadNewPokemon();
  }, 1500);
}

// check user's guess against current BST
function checkGuess() {
  // get user's guess from input and convert to number
  const userGuess = parseInt(input.value);

  // validate input, make sure its a valid number
  if (isNaN(userGuess)) {
    feedbackEl.textContent = "Please enter a valid number!";
    feedbackEl.className = "feedback show incorrect";
    return; //exit the function early, don't process guess
  }

  // compare user's guess to actual BST
  if (userGuess === currentBST) {
    // correct guess
    updateStreak(true);
    showFeedback(`🎉 Correct! BST: ${currentBST}`, true);
  } else {
    // incorrect guess
    updateStreak(false);
    showFeedback(`❌ Wrong! The BST was ${currentBST}`, false);
  }
}

// event listener for when user clicks submit button
submitBtn.addEventListener("click", checkGuess);

// event listener for when user clicks give up button
giveUpBtn.addEventListener("click", () => {
  //treat it as an incorrect guess
  updateStreak(false);
  // show the correct answer, dont say wrong since they gave up
  showFeedback(`The BST was ${currentBST}`, false);
});

// allows enter key to submit guess
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkGuess();
  }
});

// load the first pokemon when page loads
loadNewPokemon();
