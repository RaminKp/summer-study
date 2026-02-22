// ============ GLOBAL CONFIGS ============
const scaleFactor = 10;  // 10px = 1 meter
const maxDepth = 4000;   // submarine cannot go below 4000m
const step = 20;         // arrow key movement in px (2m per press to make it a bit faster)
let userName = '';
let score = 0;
let encounteredCreatures = []; // store names of creatures within or at current depth for quiz
let visitedCreatures = new Set();

function logEvent(eventData) {
  const timestamp = new Date().toISOString();
  const log = {
    timestamp,
    ...eventData,
    player: userName || 'Anonymous'
  };
  console.log("LOG:", log);

  // Send to Django (optional)
  fetch('/log_event/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(log)
  }).catch(err => console.error("Logging failed:", err));
}


// ============ DOM ELEMENTS ============
const scoreDisplay = document.getElementById('score-display');
const compass = document.getElementById('compass');
const blinkingSpots = document.getElementById('blinking-spots');
const factPopup = document.getElementById('fact-popup');
const factContent = document.getElementById('fact-text');
const closeFactBtn = document.getElementById('close-fact');

const cameraBtn = document.getElementById('camera-btn');
const qrModal = document.getElementById('qr-modal');
const closeQrBtn = document.getElementById('close-qr');

const subSound = document.getElementById('submarine-sound');
const nameMicBtn = document.getElementById('name-mic-btn');

const splashScreen = document.getElementById('splash-screen');
const enterGameBtn = document.getElementById('enter-game-btn');
const userInfoModal = document.getElementById('user-info');
const startGameBtn = document.getElementById('start-game');
const userNameInput = document.getElementById('user-name');
const gameContainer = document.getElementById('game-container');
const submarine = document.getElementById('submarine');
const contentContainer = document.getElementById('content-container');
const depthIndicator = document.getElementById('depth-indicator');

// Quiz modal
const quizModal = document.getElementById('quiz-modal');
const quizQuestionEl = document.getElementById('quiz-question');
const quizAnswerEl = document.getElementById('quiz-answer');
const micBtn = document.getElementById('mic-btn');
const submitQuizBtn = document.getElementById('submit-quiz');
const closeModalBtn = document.getElementById('close-modal');

// ============ POSITION & SCROLL ============
let posX = window.innerWidth / 2 - 60;  // submarine left
let posY = 0;                           // submarine top in px

// ============ CREATURES & SPECIAL TEXT DATA ============
// Each creature has: name, depth, weight, lifespan, image, fact (optional)
const creaturesData = [
  {
    name: "Clownfish",
    depth: 12,
    weight: "250 g",
    lifespan: "6-8 years",
    image: "clownfish.png",
    fact: "It is known as a famous Disney character.",
    size: 200
  },
  {
    name: "Seahorse",
    depth: 100,
    weight: "0.5 Kg",
    lifespan: "1-5 years",
    image: "seahorse.png",
    fact: "Male seahorse gives birth to younger ones, not females. Seahorses are terrible swimmers.",
    size: 90
  },
  {
    name: "African Penguin",
    depth: 130,
    weight: "3-3.5 Kg",
    lifespan: "10-15 years",
    image: "African Penguin.png",
    fact: "African penguins are also known as 'Jackass Penguins'. They are really fast swimmers and were considered a fish once.",
    size: 200
  },
  {
    name: "Bat Ray",
    depth: 150,
    weight: "45 Kg",
    lifespan: "35 years",
    image: "Bat Ray.png",
    fact: "They have venomous spines on their tails which they use for defense. They don’t have bones, but cartilage, like your ears.",
    size: 200
  },
  {
    name: "Bull Shark",
    depth: 160,
    weight: "95-130 Kg",
    lifespan: "18-25 years",
    image: "Bull shark.png",
    fact: "Bull sharks can live in saltwater as well as freshwater. Bull sharks are dangerous to humans.",
    size: 300
  },
  {
    name: "Human",
    depth: 340,
    weight: "80kg",
    lifespan: "72 years",
    image: "human.png",
    staticFact: "AT 332 METERS, THIS IS THE DEEPEST ANY HUMAN HAS EVER SCUBA DIVED. SET BY AHMED GABR IN 2014.",
    size: 170
  },
  {
    name: "Orca fish",
    depth: 260,
    weight: "5000 Kg",
    lifespan: "50-90 years",
    image: "Orca.png",
    fact: "Orcas are actually dolphins, not whales. They have their own language. Orcas are pregnant for 17 months.",
    size: 300
  },
  {
    name: "Great White Shark",
    depth: 280,
    weight: "600-800 Kg",
    lifespan: "70 years",
    image: "great_white_shark.png",
    fact: "Great white sharks can smell a single drop of blood from miles. They are the largest predatory fish on Earth.",
    size: 270
  },
  {
    name: "Bottlenose Dolphins",
    depth: 300,
    weight: "150-220 Kg",
    lifespan: "40-50 years",
    image: "bottlenose_dolphins.png",
    fact: "These dolphins are considered kings of communication. Dolphins are very intelligent mammals and can swim fast.",
    size: 210
  },
  {
    name: "Blue Whale",
    depth: 500,
    weight: "130000 Kg",
    lifespan: "80-90 years",
    image: "blue_whale.png",
    fact: "Blue whales are the largest animals on Earth, growing over 100 feet. They have one of the loudest voices on the planet.",
    size: 350
  },
  {
    name: "Coelacanth",
    depth: 700,
    weight: "90kg",
    lifespan: "100 years",
    image: "coelacanth.png",
    fact: "Coelacanths were thought to be extinct until rediscovered in 1938. They are mostly active at night and hide in caves during the day.",
    size: 120
  },
  {
    name: "Giant Oarfish",
    depth: 820,
    weight: "300-400 Kg",
    lifespan: "7-12 years",
    image: "giant_oarfish.png",
    fact: "They are the longest bony fish in the world. They are not dangerous to humans.",
    staticFact: "GIANT OARFISH CAN GROW UP TO 15 M LONG.",
    size: 180
  },
  {
    name: "Leatherback Turtle",
    depth: 960,
    weight: "250-700 Kg",
    lifespan: "50 years",
    image: "Leather back Turtle.png",
    fact: "They are the largest sea turtles. They don’t have teeth.",
    size: 190
  },
  {
    name: "Anglerfish",
    depth: 1050,
    weight: "32 Kg",
    lifespan: "21-25 years",
    image: "anglerfish.png",
    fact: "Anglerfish have a glowing lure to attract prey in darkness. They live in the deepest part of the ocean where there is no light.",
    size: 100
  },
  {
    name: "Orange Roughy",
    depth: 1200,
    weight: "1-1.5 Kg",
    lifespan: "Over 100 years",
    image: "orange_roughy.png",
    fact: "They are slow-growing and don't reach maturity until they're quite old. They live in very cold, dark environments.",
    size: 100
  },
  {
    name: "Goblin shark",
    depth: 1300,
    weight: "150-200 Kg",
    lifespan: "30-60 years",
    image: "goblin_shark.png",
    fact: "They are cool deep-sea creatures with unique jaws. Goblin sharks are known as 'living fossils' as they haven’t changed in millions of years.",
    size: 160
  },
  {
    name: "Big red jellyfish",
    depth: 1500,
    weight: "40 Kg",
    lifespan: "It is currently unknown.",
    image: "big_red_jellyfish.png",
    fact: "Its deep red color helps it hide in the deep dark sea. It uses fleshy feeding arms instead of stinging tentacles to capture food.",
    size: 190
  },
  {
    name: "Giant Tube Worm",
    depth: 1630,
    weight: "650 g",
    lifespan: "100-300 years",
    image: "giant_tube_worm.png",
    fact: "The giant tubeworm doesn't have a stomach or a mouth. They are some of the fastest-growing marine invertebrates.",
    size: 100
  },
  {
    name: "Six-gill Shark",
    depth: 1750,
    weight: "500 Kg",
    lifespan: "80 years",
    image: "sixgill_shark.png",
    fact: "Six-gill sharks are cool deep-sea creatures with six gill slits. They spend their day in deep waters and nights in shallow waters.",
    size: 180
  },
  {
    name: "Telescope Octopus",
    depth: 2020,
    weight: "1-6 Kg",
    lifespan: "1-2 years",
    image: "telescope_octopus.png",
    fact: "Their eyes stick out of their heads like telescopes. Telescope octopuses are almost completely transparent.",
    size: 120
  },
  {
    name: "Giant Isopod",
    depth: 2120,
    weight: "1 kg",
    lifespan: "2 years",
    image: "giant_isopod.png",
    fact: "The giant isopod is one of an estimated 10,000 species of isopods. They live on the ocean floor and are scavengers, eating dead animals.",
    size: 100
  },
  {
    name: "Colossal Squid",
    depth: 2215,
    weight: "500-600 Kg",
    lifespan: "1-2 years",
    image: "colossal_squid.png",
    fact: "The colossal squid is the largest squid species, with the biggest eyes in the animal kingdom. Squids have ten arms, not eight.",
    size: 300
  },
  {
    name: "Squid-worm",
    depth: 2700,
    weight: "100-200 g",
    lifespan: "4-9 months",
    image: "squidworm.png",
    fact: "The squid-worm looks like a combination of a squid and a worm. It has 10 long tentacles, some for feeding and others for breathing.",
    size: 90
  },
  {
    name: "Vampire Squid",
    depth: 2900,
    weight: "0.5-1 Kg",
    lifespan: "10 years",
    image: "vampire_squid.png",
    fact: "Vampire squids live in the oxygen minimum zone and eat marine snow. They emit glowing sticky mucus instead of ink.",
    size: 300
  },
  {
    name: "Cuvier's Beaked Whale",
    depth: 3000,
    weight: "2000-3500 Kg",
    lifespan: "30-60 years",
    image: "beaked_whale.png",
    fact: "Cuvier's beaked whales are champion divers among whales. They are also vulnerable to loud noises like military sonar.",
    size: 200
  },
  {
    name: "Cookiecutter Shark",
    depth: 3400,
    weight: "4-5 Kg",
    lifespan: "25 years",
    image: "cookiecutter_shark.png",
    fact: "The cookiecutter shark never grows bigger than 50 cm. This shark leaves cookie-shaped wound marks on its prey.",
    size: 150
  },
  {
    name: "Patagonian Toothfish",
    depth: 3800,
    weight: "7-10 Kg",
    lifespan: "50 years",
    image: "patagonian_toothfish.png",
    fact: "They have antifreeze proteins to survive near-freezing temperatures. This deep-sea fish can grow up to 7.5 feet long.",
    size: 120
  },
  {
    name: "Dumbo Octopus",
    depth: 3900,
    weight: "2-6 Kg",
    lifespan: "3-5 years",
    image: "dumbo_octopus.png",
    fact: "They don't have ink sacs and instead change color to camouflage. Dumbo octopuses are named for their large, ear-like fins.",
    size: 190
  }
];


// Special text markers (depth-based).
// We'll position these absolutely (like creatures).
const specialTexts = [
  { depth: 200, text: "The Twilight Zone" },
  {
    depth: 1000,
    text: "The Midnight Zone\n(No sunlight is able to reach this deep. Many deep-sea creatures cope by creating light themselves - also known as bioluminescence.)"
  },
  {
    depth: 1600,
    text: "Hydrothermal vents are formed from seawater passing through extremely hot volcanic rocks.\nThey release heavy metals that are toxic to most animals.\nBut even in those extreme conditions specialized life finds a way to survive."
  },
  {
    depth: 3700,
    text: "This is the average depth of the ocean.\nBut in some places it goes deeper.\nMuch deeper."
  },
  {
    depth: 3800,
    text: "Titanic Wreckage\nOn April 14th, 1912 the Titanic sank to its final resting place at a depth of 3,800 meters.",
    image: "titanic.png" // optional
  },
  {
    depth: 4000,
    text: "The Abyssal Zone\nThe temperature here is near freezing and very few animals can survive the extreme pressure."
  }
];

// ============ INIT GAME ELEMENTS ============

// 1) Hide splash screen on button click
enterGameBtn.addEventListener('click', () => {


  splashScreen.style.display = 'none';
  document.getElementById('game-ui').style.display = 'block';

    const bgMusic = document.getElementById('bg-music');
    bgMusic.src = "static/ocean_explore/audio/ocean bg.m4a";
    bgMusic.play();
  
    subSound.src = "static/ocean_explore/audio/submarine bg2.m4a";
    subSound.play();
  
    compass.style.display = 'block';
    scoreDisplay.style.display = 'block';

  logEvent({
  screen: 'Home Page',
  action: 'Entered name screen',
  message: 'User clicked Dive In'
  });

});


// 2) Start game after user enters name
// startGameBtn.addEventListener('click', () => {
//   let nameVal = userNameInput.value.trim();
//   if (!nameVal) {
//     alert("Please enter your name.");
//     return;
//   }
//   userName = nameVal;

//   logEvent({
//   screen: 'Level 1',
//   action: 'Start Game',
//   message: `Game started by ${userName}`
// });

//   userInfoModal.style.display = 'none';

//   document.getElementById('game-ui').style.display = 'block';

//   const bgMusic = document.getElementById('bg-music');
//   bgMusic.src = "static/ocean_explore/audio/ocean bg.m4a";
//   bgMusic.play();

//   subSound.src = "static/ocean_explore/audio/submarine bg2.m4a";
//   subSound.play();

//   compass.style.display = 'block';
//   scoreDisplay.style.display = 'block';
// });


// 3) Create creature elements
// 3) Create creature elements
creaturesData.forEach(creature => {
  if (creature.depth <= maxDepth) {
    let div = document.createElement('div');
    div.classList.add('creature');

    // Position top based on depth
    div.style.top = (creature.depth * scaleFactor) + 'px';

    // Deterministic horizontal position
    let nameHash = Array.from(creature.name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let leftPercent = 10 + (nameHash % 80); // value between 10% and 90%
    div.style.left = `${leftPercent}%`;

    // Create image element
    let img = document.createElement('img');
    img.src = `static/ocean_explore/images/${creature.image}`;
    img.alt = creature.name;

    // Use custom size (width in px)
    let size = creature.size || 100; // default if not provided
    img.style.width = `${size}px`;

    // Add name label
    let nameLabel = document.createElement('span');
    nameLabel.classList.add('creature-name');
    nameLabel.innerText = creature.name.toUpperCase();

    // Store data attributes for quiz/fact
    div.dataset.name = creature.name.toUpperCase();
    div.dataset.weight = creature.weight || 'N/A';
    div.dataset.lifespan = creature.lifespan || 'Unknown';
    if (creature.fact) {
      div.dataset.fact = creature.fact.toUpperCase();
    }

    // Append to container
    div.appendChild(img);
    div.appendChild(nameLabel);
    contentContainer.appendChild(div);
  }
});

// 4) Create special text elements
specialTexts.forEach(st => {
  if (st.depth <= maxDepth) {
    let div = document.createElement('div');
    div.classList.add('special-text');
    div.style.top = (st.depth * scaleFactor) + 'px';

    // If there's an image (like Titanic), we can show it on the left or above text
    if (st.image) {
      let img = document.createElement('img');
      img.src = `static/ocean_explore/images/${st.image}`;
      img.alt = st.text;
      img.style.display = 'block';
      img.style.margin = '0 auto';
      img.style.width = '150px';
      div.appendChild(img);
    }

    // multiline text
    let lines = st.text.toUpperCase().split('\n');
    lines.forEach(line => {
      let p = document.createElement('p');
      p.innerText = line;
      div.appendChild(p);
    });


    contentContainer.appendChild(div);
  }
});

// ============ MOVEMENT & SCROLL ============

// Track quiz triggers: every 200m until 1000, then 500m after
let quizThresholds = [];
for (let m = 200; m <= 1000; m += 200) quizThresholds.push(m);
for (let m = 1500; m <= 4000; m += 500) quizThresholds.push(m);
quizThresholds.sort((a, b) => a - b);

// track next quiz depth
function checkQuizTrigger(currentDepth) {
  if (quizThresholds.length > 0 && currentDepth >= quizThresholds[0]) {
    // remove threshold
    quizThresholds.shift();
    triggerQuiz();
  }
}

// Listen for arrow keys
document.addEventListener('keydown', (e) => {
  if (quizModal.style.display === 'block') return;

  let moved = false;
  if (e.key === 'ArrowUp') {
    posY = Math.max(0, posY - step);
    moved = true;
  }
  if (e.key === 'ArrowDown') {
    posY = Math.min(maxDepth * scaleFactor, posY + step);
    moved = true;
  }
  if (e.key === 'ArrowLeft') {
    posX = Math.max(0, posX - step);
    moved = true;
  }
  if (e.key === 'ArrowRight') {
    posX += step;
    moved = true;
  }

  if (moved) {
    moveSubmarine();
  }
});


// Make the ocean darker beyond certain depths
function updateBackgroundColor(depth) {
  if (depth <= 600) {
    // Interpolate from light blue (#a0e8ff) to black (#000000) over 600 meters
    let ratio = depth / 600;
    document.body.style.backgroundColor = interpolateColor("#a0e8ff", "#000000", ratio);
  } else {
    document.body.style.backgroundColor = "#000000";
  }
}


// Helper for color interpolation
function interpolateColor(color1, color2, factor) {
  let c1 = hexToRgb(color1);
  let c2 = hexToRgb(color2);
  let r = Math.round(c1.r + factor * (c2.r - c1.r));
  let g = Math.round(c1.g + factor * (c2.g - c1.g));
  let b = Math.round(c1.b + factor * (c2.b - c1.b));
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  let c = hex.replace('#','');
  if (c.length === 3) {
    c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  }
  let num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// ============ COLLISION DETECTION ============
function checkCollisions() {
  const subRect = submarine.getBoundingClientRect();
  let foundCollision = false;

  document.querySelectorAll('.creature').forEach(creatureEl => {
    const rect = creatureEl.getBoundingClientRect();
    if (
      subRect.left < rect.left + rect.width &&
      subRect.left + subRect.width > rect.left &&
      subRect.top < rect.top + rect.height &&
      subRect.top + subRect.height > rect.top
    ) {
      // Only show fact if we haven't visited this creature before
      if (!foundCollision && !visitedCreatures.has(creatureEl.dataset.name)) {
        visitedCreatures.add(creatureEl.dataset.name);
        showCreatureFact(creatureEl);
        foundCollision = true;
      }
    }
  });
}


// Mark creatures as "encountered" if current depth >= creature depth
function markEncounteredCreatures(currentDepth) {
  creaturesData.forEach(c => {
    if (currentDepth >= c.depth && !encounteredCreatures.includes(c.name)) {
      encounteredCreatures.push(c.name);
    }
  });
}

// ============ QUIZ ============

// We'll pick a random encountered creature for the quiz
// "Easier" quiz: We only do a small underscore replacement.
let currentQuizSolution = '';

function triggerQuiz() {
logEvent({
  screen: 'Quiz',
  trial: `Trial ${score / 10 + 1}`,
  message: `Quiz started with creature: ${currentQuizSolution}`
});

  if (encounteredCreatures.length === 0) return;
  quizModal.style.display = 'block';

  // pick random from encountered
  let name = encounteredCreatures[Math.floor(Math.random() * encounteredCreatures.length)];
  currentQuizSolution = name;

  quizQuestionEl.innerText = generateQuizQuestion(name);
}

function generateQuizQuestion(name) {
  // Replace up to 30% of letters with underscores, ignoring spaces
  let chars = name.split('');
  for (let i = 0; i < chars.length; i++) {
    if (/[a-zA-Z]/.test(chars[i]) && Math.random() < 0.3) {
      chars[i] = '_';
    }
  }
  return chars.join('');
}

// On quiz submit
submitQuizBtn.addEventListener('click', checkQuizAnswer);
closeModalBtn.addEventListener('click', () => {
  if (!quizAnswerEl.value.trim()) {
    alert("Please try the quiz before closing!");
    return;
  }
  quizModal.style.display = 'none';
});

function checkQuizAnswer() {
  let userAnswer = quizAnswerEl.value.trim().toUpperCase();
  const isCorrect = (userAnswer === currentQuizSolution.toUpperCase());

logEvent({
  screen: 'Quiz',
  trial: `Trial ${score / 10 + 1}`,
  userAnswer,
  correctAnswer: currentQuizSolution,
  result: isCorrect ? 'Correct' : 'Incorrect',
  score: score,
  message: isCorrect ? '✅ Correct Answer' : '❌ Wrong Answer'
});

  if (!userAnswer) {
    alert("Please type or scan your answer.");
    return;
  }

  quizAnswerEl.value = '';
  quizModal.style.display = 'none';

  if (userAnswer === currentQuizSolution.toUpperCase()) {
    score += 10;
    alert("✅ Correct!");
  } else {
    alert(`❌ Wrong! The correct answer was: ${currentQuizSolution}`);
  }

  let currentDepth = posY / scaleFactor;
  if (currentDepth >= maxDepth) {
    submitQuizResult();
  }
}

// Submit quiz result to Django
function submitQuizResult() {
  fetch('submit_quiz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
    },
    body: JSON.stringify({ user_name: userName, score: score })
  })
  .then(res => res.json())
  .then(data => {
  logEvent({
  screen: 'End',
  action: 'Game Over',
  score: score,
  totalTrials: score / 10,
  message: 'Game session ended'
});

    alert(`Game Over! Your final score: ${score}`);
  })
  .catch(err => console.error(err));
}

// ============ SPEECH RECOGNITION ============

micBtn.addEventListener('click', function() {
logEvent({
  screen: 'Quiz',
  type: 'Mic Button',
  message: 'Player used voice input'
});

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    quizAnswerEl.value = transcript;
  };
});

function startSpeechRecognition(inputElement) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new Recognition();
  recog.lang = 'en-US';
  recog.start();
  recog.onresult = e => {
    inputElement.value = e.results[0][0].transcript.toUpperCase();
  };
}


// ============ HELPER FOR CSRF TOKEN ============

function getCSRFToken() {
  let cookieValue = null;
  let name = 'csrftoken';
  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');
    for (let i=0; i<cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.substring(0, name.length+1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length+1));
        break;
      }
    }
  }
  return cookieValue;
}

// nameMicBtn.addEventListener('click', () => {
//   startSpeechRecognition(userNameInput);
// });

function moveSubmarine() {
  // Update submarine position
  submarine.style.left = posX + 'px';
  submarine.style.top = window.innerHeight / 2 + 'px';  // Always center vertically

  // Shift the entire content (background, creatures, etc.)
  const offsetY = -(posY - window.innerHeight / 2);
  contentContainer.style.transform = `translateY(${offsetY}px)`;

  updateAfterMove();
}

function updateAfterMove() {
  let currentDepth = posY / scaleFactor;
  depthIndicator.innerText = `Depth: ${Math.round(currentDepth)} m`;
  scoreDisplay.innerText = `Score: ${score}`;
  updateBackgroundColor(currentDepth);
  checkCollisions();
  markEncounteredCreatures(currentDepth);
  checkQuizTrigger(currentDepth);
}

function showCreatureFact(el) {
  const name = el.dataset.name;
  const weight = el.dataset.weight;
  const lifespan = el.dataset.lifespan;
  const fact = el.dataset.fact || "NO FACT AVAILABLE.";

  const message = `Creature: ${name}\nWeight: ${weight}\nLifespan: ${lifespan}\nFact: ${fact}`;

  factContent.innerText = message;
  factPopup.style.display = 'block';

  // Pause background and sub sounds
  const bgMusic = document.getElementById('bg-music');
  bgMusic.pause();
  subSound.pause();

  speak(message, () => {
    bgMusic.play();
    subSound.play();
  });
  logEvent({
  screen: 'Creature Fact',
  player: userName,
  voice: message,
  action: `Displayed fact for ${name}`
});
}


function speak(text, onEndCallback = null) {
logEvent({
  screen: 'Voice Agent',
  action: 'Speak',
  message: text
});

  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  speechSynthesis.speak(utterance);
}


function stopSpeaking() {
  speechSynthesis.cancel();
}

closeFactBtn.addEventListener('click', () => {
  factPopup.style.display = 'none';
  stopSpeaking();

  // Resume background and submarine sounds
  const bgMusic = document.getElementById('bg-music');
  const subSound = document.getElementById('submarine-sound');

  if (bgMusic && subSound) {
    bgMusic.play();
    subSound.play();
  }
});


cameraBtn.addEventListener('click', () => {
logEvent({
  screen: 'Quiz',
  action: 'Hint Used',
  type: 'Camera Button',
  message: 'Player opened QR Scanner'
});

  qrModal.style.display = 'block';

  const qr = new Html5Qrcode("qr-reader");
  qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      quizAnswerEl.value = decodedText.toUpperCase();
      qr.stop().then(() => {
        qrModal.style.display = 'none';
      });
    },
    (err) => {
      console.warn(`QR Scan Error: ${err}`);
    }
  ).catch(err => {
    alert("Camera error: " + err);
  });
});

closeQrBtn.addEventListener('click', () => {
  qrModal.style.display = 'none';
});

function logEvent({
  screen = '',
  player = '',
  trial_number = null,
  voice_text = '',
  button_clicked = '',
  score = 0,
  duration = null,
  total_trials = 0,
  correct_trials = 0,
  incorrect_trials = 0,
  hints_used = 0
}) {
  fetch('log_event/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify({
      screen,
      player,
      trial_number,
      voice_text,
      button_clicked,
      score,
      duration,
      total_trials,
      correct_trials,
      incorrect_trials,
      hints_used
    })
  });
}

document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener('click', () => {
    logEvent({
      screen: 'Any',
      action: 'Button Click',
      buttonText: btn.innerText
    });
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const welcomeMessage = "Welcome to Sea of Secrets. Press Dive in and start exploring";
  speak(welcomeMessage);
});
