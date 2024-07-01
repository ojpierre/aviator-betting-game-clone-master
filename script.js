// JavaScript for controlling the game logic and animations

// Get references to the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set the size of the canvas
canvas.width = 800;
canvas.height = 250;

// Set the starting position of the dot
let x = 0;
let y = canvas.height;

// Animation speed variables (adjust as needed)
let speedX = 1;
let speedY = 1;

// Start the animation
let animationId = requestAnimationFrame(draw);

// Array to store dot's path
let dotPath = [];

// Counter and related variables
let counter = 1.0;
let counterDepo = [
  1.01, 18.45, 2.02, 5.21, 1.22, 1.25, 2.03, 4.55, 65.11, 1.03, 1.1, 3.01, 8.85,
  6.95, 11.01, 2.07, 4.05, 1.51, 1.02, 1.95, 1.05, 3.99, 2.89, 4.09, 11.2, 2.55,
];
let randomStop = Math.random() * (10 - 0.1) + 0.8;
let cashedOut = false; // Flag to indicate if the user has cashed out
let placedBet = false;
let isFlying = true;

// Load the image
const image = new Image();
image.src = "./img/aviator_jogo.png";
image.style.minWidth = "100%";
image.style.width = "100%";

// Balance and Bet Button references
let balanceAmount = document.getElementById("balance-amount");
let calculatedBalanceAmount = 3000; // Example starting balance
balanceAmount.textContent = calculatedBalanceAmount.toString() + "€";
let betButton = document.getElementById("bet-button");
betButton.textContent = "Bet";

// Reference to display previous counters
let lastCounters = document.getElementById("last-counters");
let classNameForCounter = "";

// Function to update the display of previous counters
function updateCounterDepo() {
  lastCounters.innerHTML = counterDepo
    .map(function (i) {
      if (i < 2.0) {
        classNameForCounter = "blueBorder";
      } else if (i >= 2 && i < 10) {
        classNameForCounter = "purpleBorder";
      } else {
        classNameForCounter = "burgundyBorder";
      }
      return "<p class='" + classNameForCounter + "'>" + i + "</p>";
    })
    .join("");
}

// Function to prevent non-numeric characters in bet input
let inputBox = document.getElementById("bet-input");
let invalidChars = ["-", "+", "e"];

inputBox.addEventListener("keydown", function (e) {
  if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
});

// Message field for displaying game status
let messageField = document.getElementById("message");
messageField.textContent = "Wait for the next round";

// Loading screen references
const loadingScreen = document.getElementById("loading-screen");
const crashOddsElement = document.getElementById("crash-odds");

// Animation loop function
function draw() {
  // Increment the counter
  counter += 0.001;
  document.getElementById("counter").textContent = counter.toFixed(2) + "x";

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update the display of previous counters
  updateCounterDepo();

  // Update the dot's position
  x += speedX;
  if (counter < randomStop) {
    y -= speedY;
    y = canvas.height / 2 + 50 * Math.cos(x / 100);
    isFlying = true;
  } else {
    x = 0;
    y = 0;
    isFlying = false;
  }

  // Check if the animation should stop
  if (counter >= randomStop) {
    // Update message and stop animation
    messageField.textContent = "Place your bet";
    cancelAnimationFrame(animationId);

    // Add current counter to counter history and display crash odds
    counterDepo.unshift(counter.toFixed(2));
    crashOddsElement.textContent = randomStop.toFixed(2);

    // Show loading screen
    loadingScreen.style.display = "flex";

    // Wait for 8 seconds and start a new animation
    setTimeout(() => {
      // Generate new randomStop value and reset animation variables
      randomStop = Math.random() * (10 - 0.1) + 0.8;
      counter = 1.0;
      x = canvas.width / 2;
      y = canvas.height / 2;
      dotPath = [];
      cashedOut = false;
      isFlying = true;
      messageField.textContent = "";
      loadingScreen.style.display = "none"; // Hide loading screen after delay

      // Reset bet button text if necessary
      if (!placedBet && cashedOut) {
        betButton.textContent = "Bet";
      }

      // Start animation loop again
      animationId = requestAnimationFrame(draw);
    }, 8000);

    return;
  }

  // Store dot's current coordinates
  dotPath.push({ x: x, y: y });

  // Calculate canvas translation based on dot's position
  const canvasOffsetX = canvas.width / 2 - x;
  const canvasOffsetY = canvas.height / 2 - y;

  // Save current transformation matrix
  ctx.save();

  // Translate canvas based on dot's position
  ctx.translate(canvasOffsetX, canvasOffsetY);

  // Draw dot's path
  for (let i = 1; i < dotPath.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "#dc3545";
    ctx.moveTo(dotPath[i - 1].x, dotPath[i - 1].y);
    ctx.lineTo(dotPath[i].x, dotPath[i].y);
    ctx.stroke();
  }

  // Draw dot
  ctx.beginPath();
  ctx.fillStyle = "#dc3545";
  ctx.lineWidth = 5;
  ctx.arc(x, y, 1, 0, 2 * Math.PI);
  ctx.fill();

  // Draw image on top of dot
  ctx.drawImage(image, x - 28, y - 78, 185, 85);

  // Restore original transformation matrix
  ctx.restore();

  // Request next frame of animation
  animationId = requestAnimationFrame(draw);
}

// Start animation loop
draw();

// Event listener for bet button
betButton.addEventListener("click", () => {
  if (placedBet) {
    cashOut();
  } else {
    placeBet();
  }
  if (!placedBet && !isFlying) {
    messageField.textContent = "Place your bet";
  }
});

// Function to place a bet
function placeBet() {
  if (
    placedBet ||
    inputBox.value === 0 ||
    isNaN(inputBox.value) ||
    isFlying ||
    inputBox.value > calculatedBalanceAmount
  ) {
    // Prevent bet placement under invalid conditions
    messageField.textContent = "Wait for the next round";
    return;
  }

  // Check if animation has ended before allowing bet placement
  if (
    counter >= randomStop &&
    !isFlying &&
    inputBox.value <= calculatedBalanceAmount
  ) {
    // Place the bet if conditions are met
    if (inputBox.value && inputBox.value <= calculatedBalanceAmount) {
      calculatedBalanceAmount -= inputBox.value;
      balanceAmount.textContent =
        calculatedBalanceAmount.toFixed(2).toString() + "€";
      betButton.textContent = "Cash Out";
      placedBet = true;
      messageField.textContent = "Placed Bet";
    } else {
      messageField.textContent = "Insufficient balance to place bet";
    }
  } else {
    if (isFlying) {
      messageField.textContent = "Wait for the next round";
    }
  }
}

// Function to cash out bet
function cashOut() {
  if (cashedOut || inputBox.value === 0) {
    // Prevent cash out under invalid conditions
    messageField.textContent = "Wait for the next round";
    return;
  }

  // Perform cash out calculation and update balance
  if (counter < randomStop) {
    const winnings = inputBox.value * counter; // Calculate winnings based on counter
    calculatedBalanceAmount += winnings; // Add winnings to balance
    balanceAmount.textContent =
      calculatedBalanceAmount.toFixed(2).toString() + "€";
    messageField.textContent = "Cashed Out!";
    cashedOut = true;
    placedBet = false;
    betButton.textContent = "Bet";
  } else {
    messageField.textContent = "Plane has already crashed!";
    betButton.textContent = "Bet";
  }
}

// Initialize display of previous counters
updateCounterDepo();
