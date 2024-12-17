const words = ["HANGMAN", "MYSTERY", "CAPTAIN", "CHAMBER", "ELEMENT", "FAILURE", "JOURNEY", "SUPREME"];
const wordHints = {
  HANGMAN: "A classic word-guessing game.",
  MYSTERY: "Something unknown or puzzling.",
  CAPTAIN: "A leader, often of a ship or team.",
  CHAMBER: "A small room or enclosed space.",
  ELEMENT: "A basic or essential part of something.",
  FAILURE: "The opposite of success.",
  JOURNEY: "An act of traveling from one place to another.",
  SUPREME: "The highest in rank or authority."
};

// Game State
let selectedWord = "";
let guessedWord = [];
let attempts = 0;
let score = 0;
let highscore = parseInt(localStorage.getItem("highscore")) || 0;
let maxAttempts = 5;

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const playerNameDisplay = document.getElementById("player-name");
const keyboardContainer = document.getElementById("keyboard");
const wordContainer = document.getElementById("word-container");
const hangmanImg = document.getElementById("hangman-img");
const cheerMessage = document.getElementById("cheer");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const attemptsDisplay = document.getElementById("remaining-attempts");
const starContainer = document.getElementById("star-container");
const stars = document.querySelectorAll("#stars .fa-star");

// Handle Login
document.getElementById("login-btn").onclick = () => {
  const username = document.getElementById("username").value.trim();
  if (username) {
    localStorage.setItem("playerName", username);
    playerNameDisplay.textContent = username;
    transitionScreen(loginScreen, startScreen);
  } else {
    showErrorMessage("Please enter a valid username!");
  }
};

// Start Game
document.getElementById("start-btn").onclick = () => {
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  setDifficulty(difficulty);
  transitionScreen(startScreen, gameContainer);
  initializeGame();
};

// Set Difficulty
function setDifficulty(level) {
  maxAttempts = level === "easy" ? 5 : level === "hard" ? 3 : 5;
  document.getElementById("selected-difficulty").textContent = `Difficulty: ${level.toUpperCase()}`;
}

// Initialize Game
function initializeGame() {
  selectedWord = getRandomWord();
  guessedWord = Array(selectedWord.length).fill("_");
  attempts = 0;
  score = 0;
  cheerMessage.textContent = "";
  resetStars();
  updateGameDisplay();
  generateKeyboard();
}

// Generate Keyboard
function generateKeyboard() {
  keyboardContainer.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const button = document.createElement("button");
    button.textContent = letter;
    button.classList.add("keyboard-btn");
    button.onclick = () => handleGuess(letter, button);
    keyboardContainer.appendChild(button);
  }
}

// Handle Letter Guess
function handleGuess(letter, button) {
  button.disabled = true;
  button.classList.add("disabled");

  if (selectedWord.includes(letter)) {
    updateGuessedWord(letter);
    score += 10;
    cheerMessage.textContent = "Correct! Keep going!";
    animateFeedback("success");
  } else {
    attempts++;
    cheerMessage.textContent = "Wrong guess!";
    animateFeedback("error");
  }

  updateGameDisplay();
  checkGameState();
}

// Update Guessed Word
function updateGuessedWord(letter) {
  selectedWord.split("").forEach((char, index) => {
    if (char === letter) guessedWord[index] = letter;
  });
}

// Check Game State
function checkGameState() {
  if (guessedWord.join("") === selectedWord || attempts >= maxAttempts) {
    const isWin = guessedWord.join("") === selectedWord;
    
    if (isWin) {
      updateHighScore();
    }
    
    disableKeyboard();
    displayStars();
    showGameEndPopup(isWin);
  }
}

// Disable Keyboard
function disableKeyboard() {
  const buttons = document.querySelectorAll(".keyboard-btn");
  buttons.forEach((button) => (button.disabled = true));
}

// Update Game Display
function updateGameDisplay() {
  wordContainer.textContent = guessedWord.join(" ");
  scoreDisplay.textContent = `Score: ${score}`;
  highscoreDisplay.textContent = `High Score: ${highscore}`;
  hangmanImg.src = `assets/hangman${attempts}.png`;
  attemptsDisplay.textContent = maxAttempts - attempts;
}

// Update High Score
function updateHighScore() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("highscore", highscore);
  }
}

// Restart Game
document.getElementById("restart-btn").onclick = () => {
  resetStars();
  initializeGame();
};

// Reset Stars
function resetStars() {
  stars.forEach((star) => {
    star.classList.remove("animate");
    star.style.color = "gray";
  });
}

// Display Stars
function displayStars() {
  const starCount = calculateStars();
  starContainer.style.display = "block";
  stars.forEach((star, index) => {
    if (index < starCount) {
      star.classList.add("animate");
      star.style.color = "gold";
    }
  });
}

// Calculate Stars
function calculateStars() {
  const percentage = (maxAttempts - attempts) / maxAttempts;
  if (percentage > 0.8) return 3; // 3 stars
  if (percentage > 0.5) return 2; // 2 stars
  return 1; // 1 star
}

// Show Error Message
function showErrorMessage(message) {
  const error = document.getElementById("login-error");
  error.textContent = message;
  error.style.display = "block";
  setTimeout(() => (error.style.display = "none"), 3000);
}

// Transition Between Screens
function transitionScreen(from, to) {
  gsap.to(from, { opacity: 0, duration: 0.5, onComplete: () => (from.style.display = "none") });
  gsap.fromTo(to, { opacity: 0 }, { opacity: 1, display: "block", duration: 0.5 });
}

// Animate Feedback
function animateFeedback(type) {
  const color = type === "success" ? "green" : "red";
  gsap.fromTo(cheerMessage, { color: color, scale: 1.2 }, { scale: 1, duration: 0.3 });
}

// Get Random Word
function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// Initialize App
window.onload = () => {
  const savedPlayerName = localStorage.getItem("playerName");
  if (savedPlayerName) {
    playerNameDisplay.textContent = savedPlayerName;
    loginScreen.style.display = "none";
    startScreen.style.display = "block";
  } else {
    loginScreen.style.display = "block";
    startScreen.style.display = "none";
  }
};

function showGameEndPopup(isWin) {
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.innerHTML = `
    <div class="popup">
      <h2>${isWin ? 'Congratulations! 🎉' : 'Game Over! 😢'}</h2>
      <p>${isWin ? `You won with ${attempts} wrong attempts!` : `The word was "${selectedWord}"`}</p>
      <div class="popup-buttons">
        <button onclick="restartGame()">Play Again</button>
        <button onclick="backToMenu()">Back to Menu</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  popup.style.display = 'flex';
  
  // Animation avec GSAP
  gsap.to(popup.querySelector('.popup'), {
    scale: 1,
    opacity: 1,
    duration: 0.3,
    ease: 'back.out'
  });
}

function restartGame() {
  const popup = document.querySelector('.popup-overlay');
  gsap.to(popup.querySelector('.popup'), {
    scale: 0.8,
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      popup.remove();
      resetStars();
      initializeGame();
    }
  });
}

function backToMenu() {
  const popup = document.querySelector('.popup-overlay');
  gsap.to(popup.querySelector('.popup'), {
    scale: 0.8,
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      popup.remove();
      transitionScreen(gameContainer, startScreen);
    }
  });
}