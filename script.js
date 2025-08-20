// Game state variables
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp"; // "pvp" or "ai"
let aiDifficulty = "hard"; // "easy", "medium", "hard"
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0, draws: 0 };

// DOM elements
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const newGameBtn = document.getElementById("newGame");
const modeBtns = document.querySelectorAll(".mode-btn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const difficultyLevels = document.getElementById("difficultyLevels");
const difficultyText = document.getElementById("difficulty");
const currentDifficultyText = document.getElementById("currentDifficulty");
const scoreText = document.getElementById("score");
let cells = Array.from(document.querySelectorAll(".cell"));

// Winning combinations
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize the game
function initGame() {
  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  resetBtn.addEventListener("click", resetGame);
  newGameBtn.addEventListener("click", newGame);
  modeBtns.forEach(btn => btn.addEventListener("click", handleModeChange));
  difficultyBtns.forEach(btn => btn.addEventListener("click", handleDifficultyChange));
  updateScoreDisplay();
  updateDifficultyDisplay();
}

// Handle cell click
function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-index"));

  if (gameState[index] !== "" || !gameActive) return;

  // Make player move
  makeMove(index, currentPlayer);

  // Check for game end
  if (checkGameEnd()) return;

  // Switch players or make AI move
  if (gameMode === "ai" && currentPlayer === "X") {
    // Player X made a move, now it's AI's turn (O)
    currentPlayer = "O";
    updateStatus();
    
          // AI's turn
      setTimeout(() => {
        const aiMove = getBestMove();
        makeMove(aiMove, "O");
        
        // Check if AI's move ended the game
        if (checkGameEnd()) return;
        
        // Switch back to player X for next turn
        currentPlayer = "X";
        updateStatus();
      }, 500);
  } else if (gameMode === "pvp") {
    // Player vs Player mode - normal turn switching
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
  }
}

// Make a move on the board
function makeMove(index, player) {
  gameState[index] = player;
  cells[index].textContent = player;
  cells[index].setAttribute("data-player", player);
  cells[index].classList.add("taken");
}

// Check if game has ended
function checkGameEnd() {
  if (checkWinner()) {
    endGame(`Player ${currentPlayer} Wins!`);
    highlightWinningCells();
    updateScore(currentPlayer);
    return true;
  }

  if (checkDraw()) {
    endGame("It's a Draw!");
    updateScore("draw");
    return true;
  }

  return false;
}

// Check for winner
function checkWinner() {
  return winningCombinations.some(combination => {
    return combination.every(index => gameState[index] === currentPlayer);
  });
}

// Check for draw
function checkDraw() {
  return !gameState.includes("");
}

// End the game
function endGame(message) {
  gameActive = false;
  statusText.textContent = message;
}

// Highlight winning cells
function highlightWinningCells() {
  const winningCombo = winningCombinations.find(combination => {
    return combination.every(index => gameState[index] === currentPlayer);
  });
  
  if (winningCombo) {
    winningCombo.forEach(index => {
      cells[index].classList.add("winner");
    });
  }
}

// Update status text
function updateStatus() {
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// Update score
function updateScore(winner) {
  if (winner === "draw") {
    scores.draws++;
  } else {
    scores[winner]++;
  }
  updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
  scoreText.textContent = `Score - X: ${scores.X} | O: ${scores.O} | Draws: ${scores.draws}`;
}

// AI Logic - Different difficulty levels
function getBestMove() {
  switch (aiDifficulty) {
    case "easy":
      return getRandomMove();
    case "medium":
      return getMediumMove();
    case "hard":
      return getHardMove();
    default:
      return getHardMove();
  }
}

// Easy AI - Super easy to beat
function getRandomMove() {
  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  
  // 95% chance to make a completely random move
  // 5% chance to make a slightly smart move
  if (Math.random() < 0.95) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else {
    return getVeryEasyMove();
  }
}

// Very Easy AI - Makes lots of obvious mistakes
function getVeryEasyMove() {
  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  
  // Only 10% chance to look for winning move
  if (Math.random() < 0.1) {
    // Look for winning move
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "O";
        if (checkWinnerForAI(gameState, "O")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }
  }
  
  // Only 15% chance to block player wins
  if (Math.random() < 0.15) {
    // Look for blocking move
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "X";
        if (checkWinnerForAI(gameState, "X")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }
  }
  
  // 85% chance to just pick randomly
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Medium AI - Much easier than before
function getMediumMove() {
  // 25% chance to make a smart move, 75% chance to make a random move
  if (Math.random() < 0.25) {
    return getSmartMove();
  } else {
    return getRandomMove();
  }
}

// Medium AI - Smart moves (but makes lots of mistakes)
function getSmartMove() {
  // 40% chance to try to win if possible
  if (Math.random() < 0.4) {
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "O";
        if (checkWinnerForAI(gameState, "O")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }
  }
  
  // 35% chance to block player from winning
  if (Math.random() < 0.35) {
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "X";
        if (checkWinnerForAI(gameState, "X")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }
  }
  
  // 30% chance to take center if available
  if (gameState[4] === "" && Math.random() < 0.3) return 4;
  
  // 25% chance to take corners if available
  if (Math.random() < 0.25) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => gameState[index] === "");
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }
  
  // Just pick randomly most of the time
  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Hard AI - Perfect minimax algorithm
function getHardMove() {
  let bestScore = -Infinity;
  let bestMove = 0;

  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      gameState[i] = "O";
      let score = minimax(gameState, 0, false);
      gameState[i] = "";
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
  // Check for terminal states
  if (checkWinnerForAI(board, "O")) return 10 - depth;
  if (checkWinnerForAI(board, "X")) return depth - 10;
  if (checkDrawForAI(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Check winner for AI (without affecting current player)
function checkWinnerForAI(board, player) {
  return winningCombinations.some(combination => {
    return combination.every(index => board[index] === player);
  });
}

// Check draw for AI
function checkDrawForAI(board) {
  return !board.includes("");
}

// Handle mode change
function handleModeChange(e) {
  const selectedMode = e.target.getAttribute("data-mode");
  
  // Update active button
  modeBtns.forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  
  // Update game mode
  gameMode = selectedMode;
  
  // Switch themes based on game mode
  if (selectedMode === "ai") {
    document.body.classList.add("ai-mode");
    difficultyLevels.classList.remove("hidden");
    difficultyText.classList.remove("hidden");
  } else {
    document.body.classList.remove("ai-mode");
    difficultyLevels.classList.add("hidden");
    difficultyText.classList.add("hidden");
  }
  
  // Reset game when changing modes
  resetGame();
}

// Handle difficulty change
function handleDifficultyChange(e) {
  const selectedDifficulty = e.target.getAttribute("data-difficulty");
  
  // Update active button
  difficultyBtns.forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  
  // Update AI difficulty
  aiDifficulty = selectedDifficulty;
  
  // Update current difficulty text
  currentDifficultyText.textContent = aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1);
  
  // Reset game when changing difficulty
  resetGame();
}

// Update difficulty display
function updateDifficultyDisplay() {
  currentDifficultyText.textContent = aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1);
}

// Reset current game
function resetGame() {
  gameActive = true;
  currentPlayer = "X";
  gameState = ["", "", "", "", "", "", "", "", ""];
  
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("taken", "winner");
    cell.removeAttribute("data-player");
  });
  
  updateStatus();
}

// Start completely new game (reset scores)
function newGame() {
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreDisplay();
  resetGame();
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
