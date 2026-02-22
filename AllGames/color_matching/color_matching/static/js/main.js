document.addEventListener('DOMContentLoaded', () => {
  const virtualAgentDisplay = document.getElementById('virtual-agent');
  const startBtn = document.getElementById('start-btn');
  const tutorialBtn = document.getElementById('tutorial-btn');
  const welcomeScreen = document.getElementById('welcome-screen');
  const gameScreen = document.getElementById('game-screen');
  const scoreElement = document.getElementById('score');
  const resetBtn = document.getElementById('reset-btn');
  const winnerScreen = document.getElementById('winner-screen');
  const winnerResetBtn = document.getElementById('winner-reset-btn');
  const parentalBtn = document.getElementById('parental-guide-btn');
  const parentalModal = document.getElementById('parental-guide-modal');
  const closeParentalBtn = document.getElementById('close-parental-guide-btn');
  const downloadLogBtn = document.createElement('button');
  downloadLogBtn.textContent = "Download Logs";
  downloadLogBtn.className = "btn";
  downloadLogBtn.style.position = 'fixed';
  downloadLogBtn.style.bottom = '20px';
  downloadLogBtn.style.right = '20px';
  document.body.appendChild(downloadLogBtn);

  let score = 0;
  let isGamePlaying = false;

  let gameLogs = [];
  let trialCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let startTime = null;
  let hintsUsed = 0;

  function logEvent(type, details = {}) {
    gameLogs.push({
      timestamp: new Date().toISOString(),
      screen: getCurrentScreen(),
      type,
      details
    });
  }

  function getCurrentScreen() {
    if (welcomeScreen.style.display !== 'none') return 'Home Page';
    if (gameScreen.style.display !== 'none') return 'Level 1';
    if (winnerScreen.style.display !== 'none') return 'Winner Screen';
    return 'Unknown';
  }

  function logVoice(text) {
    logEvent('Voice Agent', { text });
  }

  function logButtonClick(label) {
    logEvent('Button Click', { label });
  }

  function logTrial(correct) {
    trialCount++;
    if (correct) {
      correctCount++;
      logEvent('Trial', { result: 'Correct', score });
    } else {
      incorrectCount++;
      logEvent('Trial', { result: 'Incorrect', score });
    }
  }

  function logHintUsed() {
    hintsUsed++;
    logEvent('Hint Used');
  }

  function startGameLogging() {
    startTime = Date.now();
    trialCount = 0;
    correctCount = 0;
    incorrectCount = 0;
    gameLogs = [];
    logEvent('Game Start');
  }

  function endGameLogging() {
    const durationMs = Date.now() - startTime;
    logEvent('Game End', {
      totalTrials: trialCount,
      correct: correctCount,
      incorrect: incorrectCount,
      durationMs
    });
    console.table(gameLogs);
  }

  function downloadLogs() {
    const blob = new Blob([JSON.stringify(gameLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-matching-log-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadLogBtn.addEventListener('click', () => {
    downloadLogs();
  });

  function speak(text, callback) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    virtualAgentDisplay.textContent = text;
    virtualAgentDisplay.style.display = 'block';
    logVoice(text);
    if (typeof responsiveVoice !== "undefined" && responsiveVoice.voiceSupport && responsiveVoice.voiceSupport()) {
      responsiveVoice.speak(text, "UK English Female", {
        rate: 0.8,
        volume: 1.0
      }, function() {
        virtualAgentDisplay.style.display = 'none';
        virtualAgentDisplay.textContent = '';
        if (callback) callback();
      });
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      let soothingVoice = voices.find(voice =>
        voice.lang === 'en-GB' && voice.name.toLowerCase().includes('female')
      );
      if (!soothingVoice) {
        soothingVoice = voices.find(voice =>
          voice.lang === 'en-US' && voice.name.toLowerCase().includes('female')
        );
      }
      if (soothingVoice) {
        utterance.voice = soothingVoice;
      }
      utterance.onend = function() {
        virtualAgentDisplay.style.display = 'none';
        virtualAgentDisplay.textContent = '';
        if (callback) callback();
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  function speakMotivation() {
    const phrases = [
      "Wow, you're as bright as a rainbow!",
      "That was epic! You're on fire—in a super cool way!",
      "You just made the colors dance!",
      "Fantastic! I bet even unicorns are giggling!",
      "Keep going, you magical color master!"
    ];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    speak(phrases[randomIndex]);
  }

  if (welcomeScreen.style.display !== 'none') {
    setTimeout(() => {
      speak("Hello, little color explorer! Welcome to the Color Matching Game. When you're ready, press the Start button to begin your colorful adventure!", null);
    }, 1000);
  }

  startBtn.addEventListener('click', () => {
    logButtonClick("Start Game");
    startGameLogging();
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    isGamePlaying = true;
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    speak("Get set for a splash of fun! Let’s start our colorful journey and turn every match into a giggle!");
  });

  tutorialBtn.addEventListener('click', () => {
    logButtonClick("Tutorial");
    logEvent("Tutorial Start");
    isGamePlaying = false;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    speak("Watch the tutorial and learn how to play!", function() {
      runTutorialDemo();
    });
  });

  parentalBtn.addEventListener('click', () => {
    logButtonClick("Parental Guide");
    logEvent("Viewed Parental Guide");
    parentalModal.style.display = 'flex';
    speak("This game helps children learn to recognize and match colors using familiar objects like fruits, vegetables, and animals, while enhancing skills such as visual discrimination, hand-eye coordination, and basic categorization. With a built-in voice assistant providing spoken instructions and encouragement, it also promotes parental involvement by guiding you to describe objects and colors to your child.");
  });

  closeParentalBtn.addEventListener('click', () => {
    parentalModal.style.display = 'none';
  });

  const draggableItems = document.querySelectorAll('.draggable-item');
  draggableItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-color'));
    });
  });

  const bins = document.querySelectorAll('.bin');
  bins.forEach(bin => {
    bin.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    bin.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedColor = e.dataTransfer.getData('text/plain');
      const binColor = bin.getAttribute('data-color');
      const isCorrect = draggedColor === binColor;
      if (isCorrect) {
        score += 10;
        if (Math.random() < 0.5) {
          speakMotivation();
        }
      } else {
        score -= 5;
        speak("Oops, try again.");
      }
      logTrial(isCorrect);
      scoreElement.textContent = `Score: ${score}`;
      if (isGamePlaying && score >= 100) {
        showWinnerScreen();
      }
    });
  });

  function runTutorialDemo() {
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    speak("Welcome to the tutorial! In this game, you'll match colorful items to their corresponding bins. A correct match earns you ten points, while an incorrect match deducts five points.", function() {
      const greenItem = document.querySelector('.draggable-item[data-color="green"]');
      const greenBin = document.querySelector('.bin[data-color="green"]');
      const blueBin = document.querySelector('.bin[data-color="blue"]');
      if (!greenItem || !greenBin || !blueBin) return;
      highlightElements(greenItem, greenBin);
      speak("Watch this example. Here, the green item is dropped into the green bin. This is a correct match and will add ten points to your score.", function() {
        simulateDrop(greenItem, greenBin, 10, function() {
          highlightElements(greenItem, blueBin);
          speak("Now, see what happens when the green item is dropped into the blue bin. This is an incorrect match and you will lose five points.", function() {
            simulateDrop(greenItem, blueBin, -5, function() {
              removeHighlights();
              gameScreen.style.display = 'none';
              welcomeScreen.style.display = 'block';
              speak("That's how you play the game! Remember to match each item with its correct colored bin to earn points. When you reach 100 points, you win. Good luck and have fun!");
            });
          });
        });
      });
    });
  }

  function simulateDrop(item, targetBin, points, callback) {
    const itemRect = item.getBoundingClientRect();
    const binRect = targetBin.getBoundingClientRect();
    const clone = item.cloneNode(true);
    clone.classList.add('tutorial-clone');
    clone.style.position = 'absolute';
    clone.style.left = `${itemRect.left}px`;
    clone.style.top = `${itemRect.top}px`;
    clone.style.width = `${itemRect.width}px`;
    clone.style.height = `${itemRect.height}px`;
    clone.style.transition = 'left 1s ease-out, top 1s ease-out';
    document.body.appendChild(clone);
    clone.offsetWidth;
    const targetX = binRect.left + (binRect.width - itemRect.width) / 2;
    const targetY = binRect.top + (binRect.height - itemRect.height) / 2;
    clone.style.left = `${targetX}px`;
    clone.style.top = `${targetY}px`;
    let transitionHandled = false;
    const cleanUp = () => {
      if (!transitionHandled) {
        transitionHandled = true;
        clone.remove();
        score += points;
        scoreElement.textContent = `Score: ${score}`;
        if (callback) setTimeout(callback, 1000);
      }
    };
    clone.addEventListener('transitionend', () => {
      cleanUp();
    });
    setTimeout(() => {
      cleanUp();
    }, 1200);
  }

  function highlightElements(item, bin) {
    removeHighlights();
    item.classList.add('highlight');
    bin.classList.add('highlight');
    document.querySelectorAll('.draggable-item, .bin').forEach(el => {
      if (el !== item && el !== bin) el.classList.add('dimmed');
    });
  }

  function removeHighlights() {
    document.querySelectorAll('.highlight, .dimmed').forEach(el => {
      el.classList.remove('highlight', 'dimmed');
    });
  }

  function showWinnerScreen() {
    endGameLogging();
    const durationMs = Date.now() - startTime;
    const durationSec = Math.round(durationMs / 1000);
    const scoreboardHTML = `
      <h2>Your Scoreboard</h2>
      <p>Total Trials: ${trialCount}</p>
      <p>Correct Answers: ${correctCount}</p>
      <p>Incorrect Answers: ${incorrectCount}</p>
      <p>Hints Used: ${hintsUsed}</p>
      <p>Game Duration: ${durationSec} seconds</p>
    `;
    let scoreboardElement = document.getElementById('scoreboard');
    if (!scoreboardElement) {
      scoreboardElement = document.createElement('div');
      scoreboardElement.id = 'scoreboard';
      scoreboardElement.style.marginTop = '20px';
      scoreboardElement.style.textAlign = 'center';
      winnerScreen.appendChild(scoreboardElement);
    }
    scoreboardElement.innerHTML = scoreboardHTML;
    gameScreen.style.display = 'none';
    winnerScreen.style.display = 'flex';
    speak("Congratulations, you are a Color Matching Champion!", function() {
      speak(`Here is your scoreboard: Total Trials ${trialCount}, Correct ${correctCount}, Incorrect ${incorrectCount}, and you played for ${durationSec} seconds. Great job!`);
    });
  }

  winnerResetBtn.addEventListener('click', () => {
    logButtonClick("Play Again");
    endGameLogging();
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    winnerScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    isGamePlaying = false;
  });

  resetBtn.addEventListener('click', () => {
    logButtonClick("Reset Game");
    endGameLogging();
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    isGamePlaying = false;
    speak("Game reset. Please choose an option to begin.");
  });
});
