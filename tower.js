// Dragon Tower Game - Complete JavaScript
const buttons = document.querySelectorAll('.click');
const currencyDisplay = document.getElementById('currency');
const betInput = document.getElementById('query');
const winningDisplay = document.querySelector('.winning span');
const multiplierDisplay = document.querySelector('.multiplier span');
const resetMoneyBtn = document.querySelector('.addmoney');
const difficultyOption1 = document.getElementById("option-1");
const difficultyOption2 = document.getElementById("option-2");

// Initialize game state
let balance = 1000; // Default value
let currentBet = 0;
let currentLevel = 0;
const maxLevels = 7;
let difficulty = "Easy";
let path = [];
let multiplier = 1;
let gameActive = false;
const multipliers1 = [1, 1.5, 2.25, 3.4, 5.1, 7.65, 11.5]; // Easy multipliers
const multipliers2 = [1, 2, 3, 5, 7, 10, 13]; // Medium multipliers

// Load saved balance from localStorage
function loadBalance() {
  try {
    const savedBalance = localStorage.getItem("currency");
    if (savedBalance && !isNaN(savedBalance)) {
      balance = parseInt(savedBalance);
    }
  } catch (e) {
    console.log("Error loading balance, using default");
  }
  updateUI();
}

// Save balance to localStorage
function saveBalance() {
  try {
    localStorage.setItem("currency", balance.toString());
  } catch (e) {
    console.error("Failed to save balance:", e);
  }
}

// Update all UI elements
function updateUI() {
  // Ensure all values are valid numbers
  if (isNaN(balance)) balance = 1000;
  if (isNaN(currentBet)) currentBet = 0;
  if (isNaN(multiplier)) multiplier = 1;
  
  currencyDisplay.textContent = balance;
  winningDisplay.textContent = Math.floor(currentBet * multiplier);
  multiplierDisplay.textContent = multiplier.toFixed(2);
}

// Generate safe paths based on difficulty
function generateSafeBoxes() {
  path = [];
  
  for (let i = 0; i < maxLevels; i++) {
    if (difficulty === "Rigged") {
      path.push([-1, -1, -1]); // No safe boxes
    } else if (difficulty === "Medium") {
      // For Medium, only 1 safe box (so 2 red boxes)
      const safeBox = Math.floor(Math.random() * 3);
      path.push([safeBox]);
    } else {
      // For Easy, 2 safe boxes (1 red box)
      let safeBoxes = [];
      while (safeBoxes.length < 2) {
        let rand = Math.floor(Math.random() * 3);
        if (!safeBoxes.includes(rand)) safeBoxes.push(rand);
      }
      path.push(safeBoxes);
    }
  }
}

// Reset game to initial state
function resetGame() {
  gameActive = true;
  currentLevel = 0;
  multiplier = 1;
  generateSafeBoxes();
  
  // Hide all buttons initially
  buttons.forEach(btn => {
    btn.style.display = "none";
    btn.style.background = "rgba(27, 42, 80, 0.6)";
    btn.disabled = false;
  });
  
  // Show just the first level
  showLevel(0);
  updateUI();
}

// Show buttons for current level and all previous levels
function showLevel(level) {
  // Show all buttons up to current level
  for (let l = 0; l <= level; l++) {
    const startIndex = (maxLevels - 1 - l) * 3;
    
    for (let i = 0; i < 3; i++) {
      const btn = buttons[startIndex + i];
      btn.style.display = "block";
      
      // Only make current level clickable
      if (l === level) {
        btn.onclick = () => handleClick(i, btn);
        btn.disabled = false;
      } else {
        btn.onclick = null;
        btn.disabled = true;
      }
    }
  }
}

// Handle button clicks
function handleClick(choice, btn) {
  if (!gameActive) return;

  const safe = path[currentLevel];
  btn.disabled = true;

  if (!safe.includes(choice)) {
    // Wrong choice
    btn.style.background = "red";
    revealSafe(currentLevel);
    endGame(false);
  } else {
    // Correct choice
    btn.style.background = "limegreen";
    currentLevel++;
    // Use appropriate multiplier based on difficulty
    if (difficulty === "Medium") {
      multiplier = multipliers2[currentLevel] || multiplier;
    } else {
      multiplier = multipliers1[currentLevel] || multiplier;
    }
    updateUI();
    
    if (currentLevel < maxLevels) {
      setTimeout(() => showLevel(currentLevel), 500);
    } else {
      endGame(true);
    }
  }
}

// Reveal correct path when game ends
function revealSafe(level) {
  const startIndex = (maxLevels - 1 - level) * 3;
  for (let i = 0; i < 3; i++) {
    if (path[level].includes(i)) {
      buttons[startIndex + i].style.background = "limegreen";
    }
  }
}

// End game with win/loss
function endGame(won) {
  gameActive = false;
  
  // Re-enable difficulty selection when game ends
  difficultyOption1.disabled = false;
  difficultyOption2.disabled = false;
  
  if (won) {
    const winAmount = Math.floor(currentBet * multiplier);
    balance += winAmount;
    alert(`You won ₹${winAmount}!`);
  }
  
  saveBalance();
  updateUI();
  buttons.forEach(btn => btn.disabled = true);
}

// Start a new bet
function startBet() {
  const betValue = betInput.value.trim();
  
  // Validate input
  if (!betValue || isNaN(betValue)) {
    alert("Please enter a valid number");
    betInput.value = "";
    return;
  }
  
  currentBet = parseInt(betValue);
  
  if (currentBet <= 0) {
    alert("Bet amount must be positive");
    return;
  }
  
  if (currentBet > balance) {
    alert("You don't have enough balance");
    return;
  }

  // Get all difficulty options
  const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
  
  // Disable ALL difficulty options
  difficultyOptions.forEach(option => {
    option.disabled = true;
  });
  
  // Set difficulty based on selection
  const opt1 = document.getElementById("option-1");
  const opt2 = document.getElementById("option-2");
  
  if (opt2.checked) {
    difficulty = "Rigged";
  } else if (opt1.checked) {
    difficulty = "Medium";
  } else {
    difficulty = "Easy"; // Default to Easy if neither is checked
  }

  // Start game
  balance -= currentBet;
  saveBalance();
  resetGame();
}

// Cash out current bet
function cashOut() {
  if (!gameActive || currentLevel === 0) {
    alert("No active game to cash out");
    return;
  }
  
  const amount = Math.floor(currentBet * multiplier);
  balance += amount;
  alert(`Cashed out ₹${amount}!`);
  gameActive = false;
  
  // Re-enable difficulty selection when cashing out
  difficultyOption1.disabled = false;
  difficultyOption2.disabled = false;
  
  saveBalance();
  updateUI();
  buttons.forEach(btn => btn.disabled = true);
}

// Reset balance to default
function resetBalance() {
  balance = 1000;
  saveBalance();
  updateUI();
  alert("Balance reset to ₹1000");
}

// Input validation
betInput.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9]/g, '');
  if (parseInt(this.value) > balance) {
    this.value = balance;
  }
});

// Initialize game
loadBalance();
updateUI();

// Event listeners
resetMoneyBtn.addEventListener('click', resetBalance);

// Make functions available globally for HTML onclick attributes
window.startBet = startBet;
window.cashOut = cashOut;