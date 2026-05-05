let winningScore = 50;
let difficulty = "normal";
let playerName = "Du";
let opponentName = "Spieler 2";
let gameMode = "single";
let diceCount = 1;
let startPlayer = "human";
let soundEnabled = true;
let audioContext;

const state = {
  humanScore: 0,
  computerScore: 0,
  humanWins: 0,
  computerWins: 0,
  roundScore: 0,
  currentPlayer: "human",
  isComputerThinking: false,
  isRolling: false,
  isGameOver: false,
  hasRolled: false,
};

const humanScore = document.querySelector("#humanScore");
const computerScore = document.querySelector("#computerScore");
const humanWins = document.querySelector("#humanWins");
const computerWins = document.querySelector("#computerWins");
const roundScore = document.querySelector("#roundScore");
const dieFace = document.querySelector("#dieFace");
const dieFaceTwo = document.querySelector("#dieFaceTwo");
const message = document.querySelector("#message");
const rollButton = document.querySelector("#rollButton");
const newGameButton = document.querySelector("#newGameButton");
const resetWinsButton = document.querySelector("#resetWinsButton");
const lightModeButton = document.querySelector("#lightModeButton");
const darkModeButton = document.querySelector("#darkModeButton");
const soundOnButton = document.querySelector("#soundOnButton");
const soundOffButton = document.querySelector("#soundOffButton");
const winningScoreInput = document.querySelector("#winningScoreInput");
const applyScoreButton = document.querySelector("#applyScoreButton");
const rulesWinningScore = document.querySelector("#rulesWinningScore");
const rulesDifficultyText = document.querySelector("#rulesDifficultyText");
const normalModeButton = document.querySelector("#normalModeButton");
const hardModeButton = document.querySelector("#hardModeButton");
const playerNameInput = document.querySelector("#playerNameInput");
const applyNameButton = document.querySelector("#applyNameButton");
const humanNameLabel = document.querySelector("#humanNameLabel");
const nameEditor = document.querySelector("#nameEditor");
const opponentNameLabel = document.querySelector("#opponentNameLabel");
const opponentNameEditor = document.querySelector("#opponentNameEditor");
const opponentNameInput = document.querySelector("#opponentNameInput");
const applyOpponentNameButton = document.querySelector("#applyOpponentNameButton");
const singleModeButton = document.querySelector("#singleModeButton");
const multiModeButton = document.querySelector("#multiModeButton");
const oneDieButton = document.querySelector("#oneDieButton");
const twoDiceButton = document.querySelector("#twoDiceButton");
const humanPanel = document.querySelector("#humanPanel");
const computerPanel = document.querySelector("#computerPanel");
const humanStarterButton = document.querySelector("#humanStarterButton");
const computerStarterButton = document.querySelector("#computerStarterButton");
const menuShell = document.querySelector("#settingsShell");
const menuTrigger = document.querySelector("#menuTrigger");
const infoShell = document.querySelector("#infoShell");
const infoTrigger = document.querySelector("#infoTrigger");

const rollDie = () => Math.floor(Math.random() * 6) + 1;

function render() {
  humanScore.textContent = state.humanScore;
  computerScore.textContent = state.computerScore;
  humanWins.textContent = state.humanWins;
  computerWins.textContent = state.computerWins;
  roundScore.textContent = state.roundScore;
  humanNameLabel.textContent = playerName;
  opponentNameLabel.textContent = getOpponentName();
  rulesWinningScore.textContent = winningScore;
  rulesDifficultyText.textContent =
    difficulty === "hard" ? "Erreiche genau" : "Erreiche zuerst";

  humanPanel.classList.toggle("active", state.currentPlayer === "human" && !state.isGameOver);
  computerPanel.classList.toggle("active", state.currentPlayer === "computer" && !state.isGameOver);
  humanPanel.classList.toggle("winner", hasWinningScore(state.humanScore));
  computerPanel.classList.toggle("winner", hasWinningScore(state.computerScore));
  opponentNameLabel.disabled = gameMode === "single";
  if (humanStarterButton && computerStarterButton) {
    const canChooseStarter = canChooseStartPlayer();
    humanStarterButton.hidden = gameMode !== "multi";
    computerStarterButton.hidden = gameMode !== "multi";
    humanStarterButton.disabled = !canChooseStarter;
    computerStarterButton.disabled = !canChooseStarter;
    humanStarterButton.classList.toggle("active", state.currentPlayer === "human");
    computerStarterButton.classList.toggle("active", state.currentPlayer === "computer");
    humanStarterButton.textContent = state.currentPlayer === "human" ? "Startet" : "Start";
    computerStarterButton.textContent = state.currentPlayer === "computer" ? "Startet" : "Start";
  }
  rollButton.dataset.diceCount = String(getEffectiveDiceCount());
  oneDieButton.classList.toggle("active", diceCount === 1);
  twoDiceButton.classList.toggle("active", diceCount === 2);
  oneDieButton.setAttribute("aria-pressed", String(diceCount === 1));
  twoDiceButton.setAttribute("aria-pressed", String(diceCount === 2));

  rollButton.disabled =
    state.isGameOver ||
    (gameMode === "single" && state.currentPlayer !== "human") ||
    state.isComputerThinking ||
    state.isRolling;
}

function setMessage(text, isBadRoll = false) {
  message.textContent = text;
  message.classList.toggle("bad-roll", isBadRoll);
}

async function rollWithSuspense(finalValues) {
  state.isRolling = true;
  rollButton.classList.add("rolling");
  render();

  for (let step = 0; step < 12; step += 1) {
    dieFace.dataset.value = String(rollDie());
    dieFaceTwo.dataset.value = String(rollDie());
    await wait(70 + step * 18);
  }

  dieFace.dataset.value = String(finalValues[0]);
  dieFaceTwo.dataset.value = String(finalValues[1] ?? 1);
  rollButton.setAttribute("aria-label", `${formatRoll(finalValues)} gewürfelt`);
  rollButton.classList.remove("rolling");
  rollButton.classList.remove("shake");
  void rollButton.offsetWidth;
  rollButton.classList.add("shake");
  state.isRolling = false;
  render();
}

function switchTurn() {
  state.currentPlayer = state.currentPlayer === "human" ? "computer" : "human";
  render();

  if (gameMode === "single" && state.currentPlayer === "computer" && !state.isGameOver) {
    computerTurn();
  }
}

function checkWinner() {
  if (state.isGameOver) return;

  let hasNewWinner = false;

  if (hasWinningScore(state.humanScore)) {
    state.isGameOver = true;
    state.humanWins += 1;
    hasNewWinner = true;
    playWinSound();
    setMessage("Gewonnen! Sehr sauber gesichert.");
  }

  if (hasWinningScore(state.computerScore)) {
    state.isGameOver = true;
    state.computerWins += 1;
    hasNewWinner = true;
    playWinSound();
    setMessage(`${getOpponentName()} gewinnt diese Runde. Direkt Revanche?`);
  }

  if (hasNewWinner) {
    saveWins();
  }

  render();
}

async function rollForCurrentPlayer() {
  if (state.isGameOver || state.isRolling) return;

  state.hasRolled = true;
  const values = Array.from({ length: getEffectiveDiceCount() }, rollDie);
  const value = values.reduce((total, nextValue) => total + nextValue, 0);
  playRollSound();
  setMessage(`${getCurrentPlayerName()} würfelt...`);
  await rollWithSuspense(values);
  state.roundScore = value;
  const currentScore = state.currentPlayer === "human" ? state.humanScore : state.computerScore;
  const nextScore = currentScore + value;

  if (difficulty === "hard" && nextScore > winningScore) {
    playInvalidSound();
    setMessage(
      state.currentPlayer === "human"
        ? `${playerName} hat ${formatRoll(values)} gewürfelt. Zu viel fuer genau ${winningScore}, der Wurf zaehlt nicht.`
        : `${getOpponentName()} würfelt ${formatRoll(values)}. Zu viel fuer genau ${winningScore}, der Wurf zaehlt nicht.`,
    );
  } else if (state.currentPlayer === "human") {
    state.humanScore = nextScore;
    setMessage(`${playerName} hat ${formatRoll(values)} gewürfelt. ${getOpponentName()} ist dran.`);
  } else {
    state.computerScore = nextScore;
    setMessage(`${getOpponentName()} würfelt ${formatRoll(values)}. ${playerName} ist dran.`);
  }

  checkWinner();

  if (!state.isGameOver) {
    switchTurn();
  }
}

async function computerTurn() {
  state.isComputerThinking = true;
  setMessage("Computer denkt kurz nach...");
  render();

  if (!state.isGameOver && state.currentPlayer === "computer") {
    await wait(850);
    await rollForCurrentPlayer();
  }

  state.isComputerThinking = false;
  render();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newGame() {
  state.humanScore = 0;
  state.computerScore = 0;
  state.roundScore = 0;
  state.currentPlayer = gameMode === "multi" ? startPlayer : "human";
  state.isComputerThinking = false;
  state.isRolling = false;
  state.isGameOver = false;
  state.hasRolled = false;
  dieFace.dataset.value = "1";
  dieFaceTwo.dataset.value = "1";
  rollButton.classList.remove("rolling", "shake");
  rollButton.setAttribute("aria-label", "Würfeln");
  setMessage(getStartMessage());
  render();
}

function resetWins() {
  state.humanWins = 0;
  state.computerWins = 0;
  saveWins();
  render();
}

function saveWins() {
  localStorage.setItem("wuerfelduell-human-wins", String(state.humanWins));
  localStorage.setItem("wuerfelduell-computer-wins", String(state.computerWins));
}

function getCurrentPlayerName() {
  return state.currentPlayer === "human" ? playerName : getOpponentName();
}

function getOpponentName() {
  return gameMode === "single" ? "Computer" : opponentName;
}

function getCurrentScore() {
  return state.currentPlayer === "human" ? state.humanScore : state.computerScore;
}

function getEffectiveDiceCount() {
  const pointsLeft = winningScore - getCurrentScore();
  return difficulty === "hard" && diceCount === 2 && pointsLeft === 1 ? 1 : diceCount;
}

function formatRoll(values) {
  if (values.length === 1) {
    return `eine ${values[0]}`;
  }

  const total = values.reduce((sum, nextValue) => sum + nextValue, 0);
  return `${values.join(" + ")} = ${total}`;
}

function applyWinningScore() {
  const nextScore = Number(winningScoreInput.value);
  winningScore = Math.min(999, Math.max(10, Number.isFinite(nextScore) ? nextScore : 50));
  winningScoreInput.value = winningScore;
  localStorage.setItem("wuerfelduell-winning-score", String(winningScore));
  newGame();
}

function applyPlayerName() {
  const cleanName = playerNameInput.value.trim().slice(0, 18);
  playerName = cleanName || "Du";
  playerNameInput.value = playerName;
  localStorage.setItem("wuerfelduell-player-name", playerName);
  closeNameEditor();
  render();
}

function applyOpponentName() {
  const cleanName = opponentNameInput.value.trim().slice(0, 18);
  opponentName = cleanName || "Spieler 2";
  opponentNameInput.value = opponentName;
  localStorage.setItem("wuerfelduell-opponent-name", opponentName);
  closeOpponentNameEditor();
  render();
}

function openNameEditor() {
  nameEditor.hidden = false;
  humanNameLabel.hidden = true;
  playerNameInput.value = playerName;
  playerNameInput.focus();
  playerNameInput.select();
}

function closeNameEditor() {
  nameEditor.hidden = true;
  humanNameLabel.hidden = false;
}

function openOpponentNameEditor() {
  if (gameMode === "single") return;

  opponentNameEditor.hidden = false;
  opponentNameLabel.hidden = true;
  opponentNameInput.value = opponentName;
  opponentNameInput.focus();
  opponentNameInput.select();
}

function closeOpponentNameEditor() {
  opponentNameEditor.hidden = true;
  opponentNameLabel.hidden = false;
}

function hasWinningScore(score) {
  return difficulty === "hard" ? score === winningScore : score >= winningScore;
}

function getStartMessage() {
  if (gameMode === "multi") {
    return `Startspieler: ${getCurrentPlayerName()}. Vor dem ersten Wurf kannst du wechseln.`;
  }

  return difficulty === "hard"
    ? `Wuerfle einmal. Wer genau ${winningScore} Punkte erreicht, gewinnt.`
    : `Wuerfle einmal. Wer zuerst ${winningScore} Punkte erreicht, gewinnt.`;
}

function canChooseStartPlayer() {
  return gameMode === "multi" && !state.hasRolled && !state.isRolling && !state.isGameOver;
}

function setStartPlayer(player) {
  if (!canChooseStartPlayer()) return;

  startPlayer = player === "computer" ? "computer" : "human";
  state.currentPlayer = startPlayer;
  setMessage(`Startspieler: ${getCurrentPlayerName()}.`);
  render();
}

function setDifficulty(nextDifficulty) {
  difficulty = nextDifficulty === "hard" ? "hard" : "normal";
  const isHard = difficulty === "hard";
  normalModeButton.classList.toggle("active", !isHard);
  hardModeButton.classList.toggle("active", isHard);
  normalModeButton.setAttribute("aria-pressed", String(!isHard));
  hardModeButton.setAttribute("aria-pressed", String(isHard));
  localStorage.setItem("wuerfelduell-difficulty", difficulty);
  newGame();
}

function setGameMode(nextMode) {
  gameMode = nextMode === "multi" ? "multi" : "single";
  if (gameMode === "single") {
    startPlayer = "human";
  }
  const isMulti = gameMode === "multi";
  singleModeButton.classList.toggle("active", !isMulti);
  multiModeButton.classList.toggle("active", isMulti);
  singleModeButton.setAttribute("aria-pressed", String(!isMulti));
  multiModeButton.setAttribute("aria-pressed", String(isMulti));
  localStorage.setItem("wuerfelduell-game-mode", gameMode);
  closeOpponentNameEditor();
  newGame();
}

function setDiceCount(nextCount) {
  diceCount = nextCount === 2 ? 2 : 1;
  localStorage.setItem("wuerfelduell-dice-count", String(diceCount));
  newGame();
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark", isDark);
  lightModeButton.classList.toggle("active", !isDark);
  darkModeButton.classList.toggle("active", isDark);
  lightModeButton.setAttribute("aria-pressed", String(!isDark));
  darkModeButton.setAttribute("aria-pressed", String(isDark));
  localStorage.setItem("wuerfelduell-theme", theme);
}

function setSound(isEnabled) {
  soundEnabled = isEnabled;
  if (!soundOnButton || !soundOffButton) return;

  soundOnButton.classList.toggle("active", soundEnabled);
  soundOffButton.classList.toggle("active", !soundEnabled);
  soundOnButton.setAttribute("aria-pressed", String(soundEnabled));
  soundOffButton.setAttribute("aria-pressed", String(!soundEnabled));
  localStorage.setItem("wuerfelduell-sound", soundEnabled ? "on" : "off");

  if (soundEnabled) {
    ensureAudioContext();
  }
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone(frequency, startTime, duration, volume = 0.05, type = "sine") {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

function playRollSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  [180, 240, 210, 280, 230].forEach((frequency, index) => {
    playTone(frequency, now + index * 0.055, 0.05, 0.035, "square");
  });
}

function playWinSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
    playTone(frequency, now + index * 0.09, 0.12, 0.055, "sine");
  });
}

function playInvalidSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(180, now, 0.14, 0.055, "sawtooth");
  playTone(120, now + 0.13, 0.18, 0.045, "sawtooth");
}

function playClickSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(420, now, 0.045, 0.035, "sine");
  playTone(620, now + 0.035, 0.055, 0.03, "sine");
}

function setMenuOpen(shell, trigger, isOpen) {
  if (!shell || !trigger) return;

  shell.classList.toggle("menu-open", isOpen);
  trigger.setAttribute("aria-expanded", String(isOpen));
}

function closePanels() {
  setMenuOpen(menuShell, menuTrigger, false);
  setMenuOpen(infoShell, infoTrigger, false);
}

function togglePanel(shell, trigger) {
  if (!shell) return;

  const shouldOpen = !shell.classList.contains("menu-open");
  closePanels();
  setMenuOpen(shell, trigger, shouldOpen);
}

const savedTheme = localStorage.getItem("wuerfelduell-theme");
setTheme(savedTheme === "dark" ? "dark" : "light");

const savedSound = localStorage.getItem("wuerfelduell-sound");
setSound(savedSound === "off" ? false : true);

const savedHumanWins = Number(localStorage.getItem("wuerfelduell-human-wins"));
const savedComputerWins = Number(localStorage.getItem("wuerfelduell-computer-wins"));
if (Number.isFinite(savedHumanWins) && savedHumanWins >= 0) {
  state.humanWins = savedHumanWins;
}
if (Number.isFinite(savedComputerWins) && savedComputerWins >= 0) {
  state.computerWins = savedComputerWins;
}

const savedWinningScore = Number(localStorage.getItem("wuerfelduell-winning-score"));
if (Number.isFinite(savedWinningScore) && savedWinningScore >= 10) {
  winningScore = Math.min(999, savedWinningScore);
}
winningScoreInput.value = winningScore;
rulesWinningScore.textContent = winningScore;

const savedDifficulty = localStorage.getItem("wuerfelduell-difficulty");
setDifficulty(savedDifficulty === "hard" ? "hard" : "normal");

const savedPlayerName = localStorage.getItem("wuerfelduell-player-name");
if (savedPlayerName) {
  playerName = savedPlayerName.slice(0, 18);
}
playerNameInput.value = playerName;
humanNameLabel.textContent = playerName;

const savedOpponentName = localStorage.getItem("wuerfelduell-opponent-name");
if (savedOpponentName) {
  opponentName = savedOpponentName.slice(0, 18);
}
opponentNameInput.value = opponentName;

const savedGameMode = localStorage.getItem("wuerfelduell-game-mode");
setGameMode(savedGameMode === "multi" ? "multi" : "single");

const savedDiceCount = Number(localStorage.getItem("wuerfelduell-dice-count"));
if (savedDiceCount === 2) {
  diceCount = 2;
}
render();

rollButton.addEventListener("click", rollForCurrentPlayer);
newGameButton.addEventListener("click", newGame);
resetWinsButton.addEventListener("click", resetWins);
applyScoreButton.addEventListener("click", () => {
  playClickSound();
  applyWinningScore();
});
applyNameButton.addEventListener("click", applyPlayerName);
applyOpponentNameButton.addEventListener("click", applyOpponentName);
humanNameLabel.addEventListener("click", openNameEditor);
opponentNameLabel.addEventListener("click", openOpponentNameEditor);
winningScoreInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyWinningScore();
  }
});
playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyPlayerName();
  }

  if (event.key === "Escape") {
    closeNameEditor();
  }
});
opponentNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyOpponentName();
  }

  if (event.key === "Escape") {
    closeOpponentNameEditor();
  }
});
lightModeButton.addEventListener("click", () => {
  playClickSound();
  setTheme("light");
});
darkModeButton.addEventListener("click", () => {
  playClickSound();
  setTheme("dark");
});
soundOnButton?.addEventListener("click", () => {
  setSound(true);
  playClickSound();
});
soundOffButton?.addEventListener("click", () => {
  playClickSound();
  setSound(false);
});
normalModeButton.addEventListener("click", () => {
  playClickSound();
  setDifficulty("normal");
});
hardModeButton.addEventListener("click", () => {
  playClickSound();
  setDifficulty("hard");
});
singleModeButton.addEventListener("click", () => {
  playClickSound();
  setGameMode("single");
});
multiModeButton.addEventListener("click", () => {
  playClickSound();
  setGameMode("multi");
});
oneDieButton.addEventListener("click", () => setDiceCount(1));
twoDiceButton.addEventListener("click", () => setDiceCount(2));
humanStarterButton?.addEventListener("click", () => setStartPlayer("human"));
computerStarterButton?.addEventListener("click", () => setStartPlayer("computer"));
menuTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  playClickSound();
  togglePanel(menuShell, menuTrigger);
});
menuShell?.addEventListener("click", (event) => {
  event.stopPropagation();
});
infoTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  playClickSound();
  togglePanel(infoShell, infoTrigger);
});
infoShell?.addEventListener("click", (event) => {
  event.stopPropagation();
});
document.addEventListener("click", (event) => {
  if (!menuShell?.contains(event.target) && !infoShell?.contains(event.target)) {
    closePanels();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanels();
  }
});

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=41").then((registration) => registration.update()).catch(() => {});
  });
}
