let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp"; 
let aiDifficulty = "hard";
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0, draws: 0 };

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

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8], 
  [0, 4, 8], [2, 4, 6]             
];

function initGame() {
  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  resetBtn.addEventListener("click", resetGame);
  newGameBtn.addEventListener("click", newGame);
  modeBtns.forEach(btn => btn.addEventListener("click", handleModeChange));
  difficultyBtns.forEach(btn => btn.addEventListener("click", handleDifficultyChange));
  updateScoreDisplay();
  updateDifficultyDisplay();
}

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-index"));

  if (gameState[index] !== "" || !gameActive) return;

  makeMove(index, currentPlayer);

  if (checkGameEnd()) return;

  if (gameMode === "ai" && currentPlayer === "X") {
    currentPlayer = "O";
    updateStatus();
      setTimeout(() => {
        const aiMove = getBestMove();
        makeMove(aiMove, "O");
    
        if (checkGameEnd()) return;
        currentPlayer = "X";
        updateStatus();
      }, 500);
  } else if (gameMode === "pvp") {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  cells[index].textContent = player;
  cells[index].setAttribute("data-player", player);
  cells[index].classList.add("taken");
}

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

function checkWinner() {
  return winningCombinations.some(combination => {
    return combination.every(index => gameState[index] === currentPlayer);
  });
}
function checkDraw() {
  return !gameState.includes("");
}

function endGame(message) {
  gameActive = false;
  statusText.textContent = message;
}

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

function updateStatus() {
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function updateScore(winner) {
  if (winner === "draw") {
    scores.draws++;
  } else {
    scores[winner]++;
  }
  updateScoreDisplay();
}

function updateScoreDisplay() {
  scoreText.textContent = `Score - X: ${scores.X} | O: ${scores.O} | Draws: ${scores.draws}`;
}

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

function getRandomMove() {
  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  
  if (Math.random() < 0.95) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else {
    return getVeryEasyMove();
  }
}

function getVeryEasyMove() {
  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  if (Math.random() < 0.1) {
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

  if (Math.random() < 0.15) {
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
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
  if (Math.random() < 0.25) {
    return getSmartMove();
  } else {
    return getRandomMove();
  }
}

function getSmartMove() {
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
  
  if (gameState[4] === "" && Math.random() < 0.3) return 4;
  if (Math.random() < 0.25) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => gameState[index] === "");
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }

  const availableMoves = gameState
    .map((cell, index) => cell === "" ? index : -1)
    .filter(index => index !== -1);
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

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

function minimax(board, depth, isMaximizing) {
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

function checkWinnerForAI(board, player) {
  return winningCombinations.some(combination => {
    return combination.every(index => board[index] === player);
  });
}

function checkDrawForAI(board) {
  return !board.includes("");
}

function handleModeChange(e) {
  const selectedMode = e.target.getAttribute("data-mode");

  modeBtns.forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  
  gameMode = selectedMode;
  
  if (selectedMode === "ai") {
    document.body.classList.add("ai-mode");
    difficultyLevels.classList.remove("hidden");
    difficultyText.classList.remove("hidden");
  } else {
    document.body.classList.remove("ai-mode");
    difficultyLevels.classList.add("hidden");
    difficultyText.classList.add("hidden");
  }
  
  resetGame();
}
function handleDifficultyChange(e) {
  const selectedDifficulty = e.target.getAttribute("data-difficulty");

  difficultyBtns.forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");

  aiDifficulty = selectedDifficulty;
  
  currentDifficultyText.textContent = aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1);
  
  resetGame();
}

function updateDifficultyDisplay() {
  currentDifficultyText.textContent = aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1);
}

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
function newGame() {
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreDisplay();
  resetGame();
}

document.addEventListener("DOMContentLoaded", initGame);
