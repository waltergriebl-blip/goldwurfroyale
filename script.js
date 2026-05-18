const APP_VERSION = globalThis.APP_VERSION || "114";

let winningScore = 50;
let difficulty = "normal";
let playerName = "Du";
let opponentName = "Spieler 2";
let gameMode = "single";
let diceCount = 1;
let startPlayer = "human";
let soundEnabled = true;
let musicEnabled = false;
let riskMode = false;
let gambleMode = false;
let audioContext;
let computerStartTimer;
let backgroundMusicBuffer;
let backgroundMusicGain;
let backgroundMusicSource;
let backgroundMusicLoadingPromise;
let htmlBackgroundMusic;
let musicIsPlaying = false;
let musicStartPending = false;
let rulesLockedByRematch = false;
let royalMomentTimer;

const state = {
  humanScore: 0,
  computerScore: 0,
  humanWins: 0,
  computerWins: 0,
  roundScore: 0,
  turnScore: 0,
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
const turnScore = document.querySelector("#turnScore");
const turnScorePanel = document.querySelector("#turnScorePanel");
const dieFace = document.querySelector("#dieFace");
const dieFaceTwo = document.querySelector("#dieFaceTwo");
const message = document.querySelector("#message");
const rollButton = document.querySelector("#rollButton");
const tablePanel = document.querySelector("#tablePanel");
const victoryBurst = document.querySelector("#victoryBurst");
const royalMoment = document.querySelector("#royalMoment");
const royalMomentText = document.querySelector("#royalMomentText");
const winnerOverlay = document.querySelector("#winnerOverlay");
const winnerTitle = document.querySelector("#winnerTitle");
const winnerScoreLine = document.querySelector("#winnerScoreLine");
const rematchButton = document.querySelector("#rematchButton");
const overlayNewGameButton = document.querySelector("#overlayNewGameButton");
const newGameButton = document.querySelector("#newGameButton");
const resetWinsButton = document.querySelector("#resetWinsButton");
const bankButton = document.querySelector("#bankButton");
const lightModeButton = document.querySelector("#lightModeButton");
const darkModeButton = document.querySelector("#darkModeButton");
const soundOnButton = document.querySelector("#soundOnButton");
const soundOffButton = document.querySelector("#soundOffButton");
const musicOnButton = document.querySelector("#musicOnButton");
const musicOffButton = document.querySelector("#musicOffButton");
const riskOnButton = document.querySelector("#riskOnButton");
const riskOffButton = document.querySelector("#riskOffButton");
const gambleOnButton = document.querySelector("#gambleOnButton");
const gambleOffButton = document.querySelector("#gambleOffButton");
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
const lockedRuleControls = [
  singleModeButton,
  multiModeButton,
  riskOnButton,
  riskOffButton,
  gambleOnButton,
  gambleOffButton,
  winningScoreInput,
  applyScoreButton,
  normalModeButton,
  hardModeButton,
  oneDieButton,
  twoDiceButton,
].filter(Boolean);
const rollDie = () => Math.floor(Math.random() * 6) + 1;

function render() {
  humanScore.textContent = state.humanScore;
  computerScore.textContent = state.computerScore;
  humanWins.textContent = state.humanWins;
  computerWins.textContent = state.computerWins;
  roundScore.textContent = state.roundScore;
  turnScore.textContent = state.turnScore;
  turnScorePanel.hidden = !gambleMode;
  humanNameLabel.textContent = playerName;
  opponentNameLabel.textContent = getOpponentName();
  document.body.classList.toggle("gamble-mode", gambleMode);
  rulesWinningScore.textContent = winningScore;
  rulesDifficultyText.textContent =
    difficulty === "normal" ? "Erreiche zuerst" : "Erreiche genau";

  humanPanel.classList.toggle("active", state.currentPlayer === "human" && !state.isGameOver);
  computerPanel.classList.toggle("active", state.currentPlayer === "computer" && !state.isGameOver);
  humanPanel.classList.toggle("winner", hasWinningScore(state.humanScore));
  computerPanel.classList.toggle("winner", hasWinningScore(state.computerScore));
  opponentNameLabel.disabled = gameMode === "single";
  if (humanStarterButton && computerStarterButton) {
    const canChooseStarter = canChooseStartPlayer();
    humanStarterButton.hidden = false;
    computerStarterButton.hidden = false;
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
  riskOnButton?.classList.toggle("active", riskMode);
  riskOffButton?.classList.toggle("active", !riskMode);
  riskOnButton?.setAttribute("aria-pressed", String(riskMode));
  riskOffButton?.setAttribute("aria-pressed", String(!riskMode));
  musicOnButton?.classList.toggle("active", musicEnabled);
  musicOffButton?.classList.toggle("active", !musicEnabled);
  musicOnButton?.setAttribute("aria-pressed", String(musicEnabled));
  musicOffButton?.setAttribute("aria-pressed", String(!musicEnabled));
  gambleOnButton?.classList.toggle("active", gambleMode);
  gambleOffButton?.classList.toggle("active", !gambleMode);
  gambleOnButton?.setAttribute("aria-pressed", String(gambleMode));
  gambleOffButton?.setAttribute("aria-pressed", String(!gambleMode));
  updateRuleControlsLock();
  bankButton.hidden = !gambleMode;
  bankButton.disabled =
    !gambleMode ||
    state.turnScore <= 0 ||
    state.isGameOver ||
    (gameMode === "single" && state.currentPlayer !== "human") ||
    state.isComputerThinking ||
    state.isRolling;

  rollButton.disabled =
    state.isGameOver ||
    (gameMode === "single" && state.currentPlayer !== "human") ||
    state.isComputerThinking ||
    state.isRolling;
}

function areRuleControlsLocked() {
  return rulesLockedByRematch || state.hasRolled || state.isRolling || state.isComputerThinking;
}

function updateRuleControlsLock() {
  const isLocked = areRuleControlsLocked();
  lockedRuleControls.forEach((control) => {
    control.disabled = isLocked;
    control.closest(".setting")?.classList.toggle("locked", isLocked);
  });
  oneDieButton?.closest(".dice-switcher")?.classList.toggle("locked", isLocked);
}

function setMessage(text, isBadRoll = false) {
  message.textContent = text;
  message.classList.toggle("bad-roll", isBadRoll);
}

function getWinnerName(winner) {
  return winner === "human" ? playerName : getOpponentName();
}

function showWinnerOverlay(winner) {
  if (!winnerOverlay || !winnerTitle || !winnerScoreLine) return;

  winnerTitle.textContent = `${getWinnerName(winner)} gewinnt`;
  winnerScoreLine.textContent = `Endstand ${state.humanScore} zu ${state.computerScore}`;
  winnerOverlay.hidden = false;
  winnerOverlay.classList.remove("show");

  requestAnimationFrame(() => {
    winnerOverlay.classList.add("show");
  });
}

function hideWinnerOverlay() {
  if (!winnerOverlay) return;

  winnerOverlay.classList.remove("show");
  window.setTimeout(() => {
    if (!winnerOverlay.classList.contains("show")) {
      winnerOverlay.hidden = true;
    }
  }, 160);
}

function playWinAnimation(winner) {
  const winnerPanel = winner === "human" ? humanPanel : computerPanel;

  winnerPanel.classList.remove("win-pop");
  tablePanel?.classList.remove("win-flash");
  message.classList.remove("win-message");
  victoryBurst?.classList.remove("show");

  requestAnimationFrame(() => {
    winnerPanel.classList.add("win-pop");
    tablePanel?.classList.add("win-flash");
    message.classList.add("win-message");
    victoryBurst?.classList.add("show");
    showWinnerOverlay(winner);
  });

  window.setTimeout(() => {
    winnerPanel.classList.remove("win-pop");
    tablePanel?.classList.remove("win-flash");
    message.classList.remove("win-message");
    victoryBurst?.classList.remove("show");
  }, 1500);
}

function detectSpecialMoment(details) {
  const {
    values = [],
    currentScore = 0,
    nextScore = 0,
    scoreApplied = false,
    riskInvalid = false,
    gambleSecured = 0,
  } = details;

  if (riskInvalid) {
    return { text: "RISIKO VERLOREN!", tone: "dark" };
  }

  if (gambleSecured >= 20) {
    return { text: "GROSSER GAMBLE!", tone: "royal" };
  }

  if (
    difficulty === "hard" &&
    scoreApplied &&
    currentScore < winningScore &&
    nextScore === winningScore
  ) {
    return { text: "PERFEKTER SIEG!", tone: "royal" };
  }

  if (values.length === 2 && values[0] === 6 && values[1] === 6) {
    return { text: "ROYAL WURF!", tone: "royal" };
  }

  return null;
}

function showRoyalMoment(text, tone = "royal") {
  if (!royalMoment || !royalMomentText || !text) return;

  window.clearTimeout(royalMomentTimer);
  royalMomentText.textContent = text;
  royalMoment.dataset.tone = tone;
  royalMoment.hidden = false;
  royalMoment.classList.remove("show");

  requestAnimationFrame(() => {
    royalMoment.classList.add("show");
  });

  royalMomentTimer = window.setTimeout(() => {
    royalMoment.classList.remove("show");
    window.setTimeout(() => {
      if (!royalMoment.classList.contains("show")) {
        royalMoment.hidden = true;
      }
    }, 180);
  }, 1500);
}

function playRoyalMomentSound(tone = "royal") {
  if (!soundEnabled) return;

  if (tone === "dark") {
    playDarkMomentSound();
    return;
  }

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    playTone(frequency, now + index * 0.075, 0.13, 0.06, "triangle");
  });
  playTone(392, now + 0.08, 0.28, 0.035, "sine");
}

function playDarkMomentSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(150, now, 0.18, 0.06, "sawtooth");
  playTone(95, now + 0.11, 0.26, 0.05, "sawtooth");
  playTone(70, now + 0.24, 0.22, 0.035, "triangle");
}

function triggerSpecialMoment(details) {
  const moment = detectSpecialMoment(details);
  if (!moment) return;

  showRoyalMoment(moment.text, moment.tone);
  playRoyalMomentSound(moment.tone);
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
  state.turnScore = 0;
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
    playWinAnimation("human");
  }

  if (hasWinningScore(state.computerScore)) {
    state.isGameOver = true;
    state.computerWins += 1;
    hasNewWinner = true;
    playWinSound();
    setMessage(`${getOpponentName()} gewinnt diese Runde. Direkt Revanche?`);
    playWinAnimation("computer");
  }

  if (hasNewWinner) {
    saveWins();
  }

  render();
}

function bankTurn() {
  if (!gambleMode || state.isGameOver || state.isRolling || state.turnScore <= 0) return;
  if (gameMode === "single" && state.currentPlayer === "computer" && !state.isComputerThinking) return;

  const securedPoints = state.turnScore;
  if (state.currentPlayer === "human") {
    state.humanScore += securedPoints;
  } else {
    state.computerScore += securedPoints;
  }

  state.turnScore = 0;
  setMessage(`${getCurrentPlayerName()} sichert ${securedPoints} Punkte.`);
  triggerSpecialMoment({ gambleSecured: securedPoints });
  checkWinner();

  if (!state.isGameOver) {
    switchTurn();
  }
}

async function rollForCurrentPlayer() {
  if (state.isGameOver || state.isRolling) return;
  if (checkCurrentPlayerRiskDeadEnd()) return;

  state.hasRolled = true;
  const values = Array.from({ length: getEffectiveDiceCount() }, rollDie);
  const value = values.reduce((total, nextValue) => total + nextValue, 0);
  playRollSound();
  setMessage(`${getCurrentPlayerName()} würfelt...`);
  await rollWithSuspense(values);
  state.roundScore = value;
  const currentScore = state.currentPlayer === "human" ? state.humanScore : state.computerScore;
  const nextScore = currentScore + value;
  let gambleTurnLost = false;
  let riskInvalid = false;
  let scoreApplied = false;

  if (gambleMode && values.includes(1)) {
    playInvalidSound();
    state.turnScore = 0;
    gambleTurnLost = true;
    setMessage(`${getCurrentPlayerName()} würfelt ${formatRoll(values)}. Gamble verloren, die Zugpunkte verfallen.`, true);
  } else if (gambleMode) {
    const nextTurnScore = state.turnScore + value;
    if (difficulty === "hard" && currentScore + nextTurnScore > winningScore) {
      playInvalidSound();
      state.turnScore = 0;
      gambleTurnLost = true;
      setMessage(`${getCurrentPlayerName()} würfelt ${formatRoll(values)}. Zu viel für genau ${winningScore}, die Zugpunkte verfallen.`, true);
    } else {
      state.turnScore = nextTurnScore;
      setMessage(`${getCurrentPlayerName()} würfelt ${formatRoll(values)}. Zugpunkte: ${state.turnScore}.`);
    }
  } else if (riskMode && values.includes(1)) {
    playInvalidSound();
    riskInvalid = true;
    setMessage(`${getCurrentPlayerName()} würfelt ${formatRoll(values)}. Risiko! Eine 1 macht den Wurf ungültig.`, true);
  } else if (difficulty === "hard" && nextScore > winningScore) {
    playInvalidSound();
    setMessage(
      state.currentPlayer === "human"
        ? `${playerName} hat ${formatRoll(values)} gewürfelt. Zu viel für genau ${winningScore}, der Wurf zählt nicht.`
        : `${getOpponentName()} würfelt ${formatRoll(values)}. Zu viel für genau ${winningScore}, der Wurf zählt nicht.`,
    );
  } else if (state.currentPlayer === "human") {
    state.humanScore = nextScore;
    scoreApplied = true;
    setMessage(`${playerName} hat ${formatRoll(values)} gewürfelt. ${getOpponentName()} ist dran.`);
  } else {
    state.computerScore = nextScore;
    scoreApplied = true;
    setMessage(`${getOpponentName()} würfelt ${formatRoll(values)}. ${playerName} ist dran.`);
  }

  triggerSpecialMoment({
    values,
    currentScore,
    nextScore,
    scoreApplied,
    riskInvalid,
  });
  checkWinner();

  if (gambleTurnLost && !state.isGameOver) {
    switchTurn();
  } else if (gambleMode && !state.isGameOver) {
    render();
    if (gameMode === "single" && state.currentPlayer === "computer") {
      await wait(650);
      await runComputerGambleDecision();
    }
  } else if (!state.isGameOver) {
    switchTurn();
  }
}

async function computerTurn() {
  if (state.isComputerThinking || state.isGameOver || state.currentPlayer !== "computer") return;

  state.isComputerThinking = true;
  setMessage("Computer denkt kurz nach...");
  render();

  if (checkCurrentPlayerRiskDeadEnd()) {
    state.isComputerThinking = false;
    render();
    return;
  }

  if (!state.isGameOver && state.currentPlayer === "computer" && gambleMode) {
    await runComputerGambleDecision();
  } else if (!state.isGameOver && state.currentPlayer === "computer") {
    await wait(850);
    await rollForCurrentPlayer();
  }

  state.isComputerThinking = false;
  render();
}

async function runComputerGambleDecision() {
  if (!gambleMode || state.isGameOver || state.currentPlayer !== "computer") return;

  if (shouldComputerBankGamble()) {
    await wait(550);
    bankTurn();
    return;
  }

  await wait(850);
  await rollForCurrentPlayer();
}

function shouldComputerBankGamble() {
  const turnPoints = state.turnScore;
  if (turnPoints <= 0) return false;

  const bankScore = state.computerScore + turnPoints;
  if (hasWinningScore(bankScore)) return true;
  if (difficulty === "hard" && bankScore > winningScore) return false;

  const pointsLeftBefore = winningScore - state.computerScore;
  const pointsLeftAfter = winningScore - bankScore;
  const opponentLead = state.humanScore - state.computerScore;
  const randomShift = Math.floor(Math.random() * 3) - 1;

  if (difficulty === "hard") {
    if (pointsLeftAfter === 1) return false;

    let threshold = 10;
    if (pointsLeftAfter > 1 && pointsLeftAfter <= 6) {
      threshold = 4;
    } else if (pointsLeftAfter <= 12) {
      threshold = 6;
    } else if (opponentLead >= 10) {
      threshold = 8;
    } else if (state.computerScore - state.humanScore >= 10) {
      threshold = 9;
    }

    threshold += randomShift;
    return turnPoints >= Math.max(4, threshold);
  }

  let threshold = 10;
  if (pointsLeftBefore <= 8) {
    threshold = Math.max(4, pointsLeftBefore - 2);
  } else if (pointsLeftBefore <= 14) {
    threshold = 7;
  } else if (opponentLead >= 10) {
    threshold = 8;
  } else if (state.computerScore - state.humanScore >= 12) {
    threshold = 9;
  }

  threshold += randomShift;
  return turnPoints >= Math.max(4, threshold);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearComputerStartTimer() {
  if (!computerStartTimer) return;

  window.clearTimeout(computerStartTimer);
  computerStartTimer = undefined;
}

function scheduleComputerStart(delay = 2200) {
  clearComputerStartTimer();
  computerStartTimer = window.setTimeout(() => {
    computerStartTimer = undefined;
    if (!state.hasRolled && !state.isGameOver && state.currentPlayer === "computer") {
      computerTurn();
    }
  }, delay);
}

function newGame(keepRulesLocked = false) {
  clearComputerStartTimer();
  hideWinnerOverlay();
  rulesLockedByRematch = keepRulesLocked;
  state.humanScore = 0;
  state.computerScore = 0;
  state.roundScore = 0;
  state.turnScore = 0;
  state.currentPlayer = startPlayer;
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

  if (gameMode === "single" && state.currentPlayer === "computer") {
    scheduleComputerStart();
  }
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
  const activePoints = getCurrentScore() + (gambleMode ? state.turnScore : 0);
  const pointsLeft = winningScore - activePoints;
  return getEffectiveDiceCountForPointsLeft(pointsLeft);
}

function getEffectiveDiceCountForPointsLeft(pointsLeft) {
  if (gambleMode && difficulty === "hard" && diceCount === 2 && pointsLeft > 0 && pointsLeft <= 6) {
    return 1;
  }

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
  if (areRuleControlsLocked()) return;

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
  return difficulty === "normal" ? score >= winningScore : score === winningScore;
}

function hasRiskDeadEnd(score) {
  if (gambleMode || !riskMode || difficulty !== "hard") return false;

  const pointsLeft = winningScore - score;
  const effectiveDiceCount = getEffectiveDiceCountForPointsLeft(pointsLeft);
  const minimumValidRoll = effectiveDiceCount * 2;
  return pointsLeft > 0 && pointsLeft < minimumValidRoll;
}

function checkCurrentPlayerRiskDeadEnd() {
  const currentScore = getCurrentScore() + (gambleMode ? state.turnScore : 0);
  if (checkCurrentPlayerGambleDeadEnd(currentScore)) return true;
  if (!hasRiskDeadEnd(currentScore)) return false;

  const pointsLeft = winningScore - currentScore;
  const humanFinalScore = state.currentPlayer === "human" ? currentScore : state.humanScore;
  const computerFinalScore = state.currentPlayer === "computer" ? currentScore : state.computerScore;
  state.isGameOver = true;
  playWinSound();

  if (humanFinalScore > computerFinalScore) {
    state.humanWins += 1;
    setMessage(`Risiko-Ende: Noch ${pointsLeft} Punkt${pointsLeft === 1 ? "" : "e"} bis zum Ziel, aber kein gültiger Siegwurf ist möglich. ${playerName} gewinnt mit ${humanFinalScore} zu ${computerFinalScore}.`);
    playWinAnimation("human");
  } else if (computerFinalScore > humanFinalScore) {
    state.computerWins += 1;
    setMessage(`Risiko-Ende: Noch ${pointsLeft} Punkt${pointsLeft === 1 ? "" : "e"} bis zum Ziel, aber kein gültiger Siegwurf ist möglich. ${getOpponentName()} gewinnt mit ${computerFinalScore} zu ${humanFinalScore}.`);
    playWinAnimation("computer");
  } else {
    setMessage(`Risiko-Ende: Noch ${pointsLeft} Punkt${pointsLeft === 1 ? "" : "e"} bis zum Ziel, aber kein gültiger Siegwurf ist möglich. Gleichstand mit ${humanFinalScore} zu ${computerFinalScore}.`);
  }

  saveWins();
  render();
  return true;
}

function hasGambleHardDeadEnd(score) {
  return gambleMode && difficulty === "hard" && winningScore - score === 1;
}

function finishDeadEndByScore(reason) {
  state.isGameOver = true;

  if (state.humanScore > state.computerScore) {
    state.humanWins += 1;
    playWinSound();
    setMessage(`${reason} ${playerName} gewinnt mit ${state.humanScore} zu ${state.computerScore}.`);
    playWinAnimation("human");
  } else if (state.computerScore > state.humanScore) {
    state.computerWins += 1;
    playWinSound();
    setMessage(`${reason} ${getOpponentName()} gewinnt mit ${state.computerScore} zu ${state.humanScore}.`);
    playWinAnimation("computer");
  } else {
    setMessage(`${reason} Gleichstand mit ${state.humanScore} zu ${state.computerScore}.`);
  }

  saveWins();
  render();
}

function checkCurrentPlayerGambleDeadEnd(currentScore) {
  if (!hasGambleHardDeadEnd(currentScore)) return false;

  const opponentScore = state.currentPlayer === "human" ? state.computerScore : state.humanScore;
  const opponentCanStillWin = !hasGambleHardDeadEnd(opponentScore);

  if (opponentCanStillWin) {
    const blockedName = getCurrentPlayerName();
    switchTurn();
    setMessage(`${blockedName} braucht noch 1 Punkt. Im Gamble-Modus ist das nicht gültig möglich. ${getCurrentPlayerName()} bekommt noch die Chance.`);
    return true;
  }

  finishDeadEndByScore("Gamble-Ende: Beide können keinen gültigen Siegwurf mehr schaffen.");
  return true;
}

function getStartMessage() {
  if (gambleMode) {
    return difficulty === "hard"
      ? `Gamble: Würfle weiter oder sichere genau bei ${winningScore} Punkten.`
      : "Gamble: Würfle weiter oder sichere deine Zugpunkte.";
  }

  if (gameMode === "multi") {
    return `Startspieler: ${getCurrentPlayerName()}. Vor dem ersten Wurf kannst du wechseln.`;
  }

  return difficulty === "hard"
    ? `Würfle einmal. Wer genau ${winningScore} Punkte erreicht, gewinnt.`
    : `Würfle einmal. Wer zuerst ${winningScore} Punkte erreicht, gewinnt.`;
}

function canChooseStartPlayer() {
  return !state.hasRolled && !state.isRolling && !state.isGameOver && !state.isComputerThinking;
}

function setStartPlayer(player) {
  if (!canChooseStartPlayer()) return;

  clearComputerStartTimer();
  startPlayer = player === "computer" ? "computer" : "human";
  state.currentPlayer = startPlayer;
  setMessage(`Startspieler: ${getCurrentPlayerName()}.`);
  render();

  if (gameMode === "single" && state.currentPlayer === "computer") {
    scheduleComputerStart();
  }
}

function setDifficulty(nextDifficulty) {
  if (areRuleControlsLocked()) return;

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
  if (areRuleControlsLocked()) return;

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
  if (areRuleControlsLocked()) return;

  diceCount = nextCount === 2 ? 2 : 1;
  localStorage.setItem("wuerfelduell-dice-count", String(diceCount));
  newGame();
}

function setRiskMode(isEnabled) {
  if (areRuleControlsLocked()) return;

  riskMode = isEnabled;
  localStorage.setItem("wuerfelduell-risk-mode", riskMode ? "on" : "off");
  newGame();
}

function setGambleMode(isEnabled) {
  if (areRuleControlsLocked()) return;

  gambleMode = isEnabled;
  localStorage.setItem("wuerfelduell-gamble-mode", gambleMode ? "on" : "off");
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

function getMusicVolume() {
  const isMobileView = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
  return isMobileView ? 0.028 : 0.055;
}

function shouldUseWebAudioMusic() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function getHtmlBackgroundMusic() {
  if (!htmlBackgroundMusic) {
    htmlBackgroundMusic = new Audio(`background-music.wav?v=${APP_VERSION}`);
    htmlBackgroundMusic.loop = true;
    htmlBackgroundMusic.preload = "auto";
  }

  htmlBackgroundMusic.volume = getMusicVolume();
  return htmlBackgroundMusic;
}

function getBackgroundMusicGain(context) {
  if (!backgroundMusicGain) {
    backgroundMusicGain = context.createGain();
    backgroundMusicGain.connect(context.destination);
  }

  backgroundMusicGain.gain.value = getMusicVolume();
  return backgroundMusicGain;
}

function loadBackgroundMusic() {
  if (backgroundMusicBuffer) {
    return Promise.resolve(backgroundMusicBuffer);
  }

  if (!backgroundMusicLoadingPromise) {
    backgroundMusicLoadingPromise = fetch(`background-music.wav?v=${APP_VERSION}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Musik konnte nicht geladen werden.");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        const context = ensureAudioContext();
        if (!context) {
          throw new Error("Audio wird nicht unterstützt.");
        }
        return context.decodeAudioData(data);
      })
      .then((buffer) => {
        backgroundMusicBuffer = buffer;
        return buffer;
      });
  }

  return backgroundMusicLoadingPromise;
}

function stopBackgroundMusic() {
  if (htmlBackgroundMusic) {
    htmlBackgroundMusic.pause();
    htmlBackgroundMusic.currentTime = 0;
  }

  if (!backgroundMusicSource) {
    musicIsPlaying = false;
    return;
  }

  backgroundMusicSource.onended = null;
  try {
    backgroundMusicSource.stop();
  } catch (error) {
    // Quelle kann bereits beendet sein.
  }
  backgroundMusicSource.disconnect();
  backgroundMusicSource = null;
  musicIsPlaying = false;
}

function startBackgroundMusic(showBlockedMessage = false) {
  if (!musicEnabled) return;

  if (!shouldUseWebAudioMusic()) {
    const music = getHtmlBackgroundMusic();
    musicStartPending = false;
    music.play()
      .then(() => {
        musicIsPlaying = true;
      })
      .catch(() => {
        musicStartPending = true;
        musicIsPlaying = false;
        if (showBlockedMessage) {
          setMessage("Musik ist bereit. Tippe einmal ins Spiel, dann startet sie.");
        }
      });
    return;
  }

  const context = ensureAudioContext();
  if (!context) {
    musicStartPending = true;
    return;
  }

  if (backgroundMusicGain) {
    backgroundMusicGain.gain.value = getMusicVolume();
  }

  if (musicIsPlaying && backgroundMusicSource) {
    context.resume().catch(() => {});
    return;
  }

  musicStartPending = false;

  context.resume()
    .then(() => loadBackgroundMusic())
    .then((buffer) => {
      if (!musicEnabled || musicIsPlaying) return;

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(getBackgroundMusicGain(context));
      source.onended = () => {
        if (backgroundMusicSource === source) {
          backgroundMusicSource = null;
          musicIsPlaying = false;
        }
      };
      source.start(0);
      backgroundMusicSource = source;
      musicIsPlaying = true;
    })
    .catch(() => {
      musicStartPending = true;
      if (showBlockedMessage) {
        setMessage("Musik ist bereit. Tippe einmal ins Spiel, dann startet sie.");
      }
    });
}

function setMusic(isEnabled) {
  musicEnabled = isEnabled;
  localStorage.setItem("wuerfelduell-music", musicEnabled ? "on" : "off");
  musicOnButton?.classList.toggle("active", musicEnabled);
  musicOffButton?.classList.toggle("active", !musicEnabled);
  musicOnButton?.setAttribute("aria-pressed", String(musicEnabled));
  musicOffButton?.setAttribute("aria-pressed", String(!musicEnabled));

  if (musicEnabled) {
    startBackgroundMusic(true);
  } else {
    musicStartPending = false;
    stopBackgroundMusic();
  }
}

function unlockMusicAfterGesture() {
  const htmlMusicIsPlaying = htmlBackgroundMusic && !htmlBackgroundMusic.paused;
  if (!musicEnabled || (!musicStartPending && (musicIsPlaying || htmlMusicIsPlaying))) return;
  startBackgroundMusic(false);
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
setTheme(savedTheme === "light" ? "light" : "dark");

const savedSound = localStorage.getItem("wuerfelduell-sound");
setSound(savedSound === "off" ? false : true);

const savedMusic = localStorage.getItem("wuerfelduell-music");
setMusic(savedMusic === "on");
if (musicEnabled) {
  startBackgroundMusic(false);
}
window.addEventListener("load", () => {
  if (musicEnabled) {
    startBackgroundMusic(false);
  }
});
window.addEventListener("pageshow", () => {
  if (musicEnabled) {
    startBackgroundMusic(false);
  }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && musicEnabled) {
    startBackgroundMusic(false);
  }
});

const savedRiskMode = localStorage.getItem("wuerfelduell-risk-mode");
riskMode = savedRiskMode === "on";

const savedGambleMode = localStorage.getItem("wuerfelduell-gamble-mode");
gambleMode = savedGambleMode === "on";

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
newGameButton.addEventListener("click", () => newGame());
resetWinsButton.addEventListener("click", resetWins);
bankButton?.addEventListener("click", () => {
  playClickSound();
  bankTurn();
});
rematchButton?.addEventListener("click", () => {
  playClickSound();
  newGame(true);
});
overlayNewGameButton?.addEventListener("click", () => {
  playClickSound();
  newGame();
});
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
musicOnButton?.addEventListener("click", () => {
  playClickSound();
  setMusic(true);
});
musicOffButton?.addEventListener("click", () => {
  playClickSound();
  setMusic(false);
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
riskOnButton?.addEventListener("click", () => {
  playClickSound();
  setRiskMode(true);
});
riskOffButton?.addEventListener("click", () => {
  playClickSound();
  setRiskMode(false);
});
gambleOnButton?.addEventListener("click", () => {
  playClickSound();
  setGambleMode(true);
});
gambleOffButton?.addEventListener("click", () => {
  playClickSound();
  setGambleMode(false);
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
document.addEventListener("pointerdown", unlockMusicAfterGesture, { capture: true, passive: true });
document.addEventListener("touchstart", unlockMusicAfterGesture, { capture: true, passive: true });

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`sw.js?v=${APP_VERSION}`).then((registration) => registration.update()).catch(() => {});
  });
}
