const APP_VERSION = String(globalThis.APP_VERSION || "");

let winningScore = 50;
let difficulty = "normal";
let playerName = "Du";
let opponentName = "Spieler 2";
let gameMode = "single";
let gameVariant = "standard";
let diceCount = 1;
let startPlayer = "human";
let soundEnabled = true;
let musicEnabled = false;
let riskMode = false;
let gambleMode = false;
let gold = 0;
let ownedSkins = new Set(["gold"]);
let activeSkin = "gold";
let audioContext;
let computerStartTimer;
let backgroundMusicBuffer;
let backgroundMusicGain;
let backgroundMusicSource;
let backgroundMusicLoadingPromise;
let htmlBackgroundMusic;
let musicIsPlaying = false;
let musicStartPending = false;
let comboComputerTimer;
let rulesLockedByRematch = false;
let royalMomentTimer;
let winnerOverlayTimer;
let goldGainTimer;

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
  goldAwarded: false,
  lastGoldReward: 0,
};

const comboState = {
  phase: "select-human",
  currentSelector: "human",
  humanSelection: [],
  computerSelection: [],
  rollValues: [],
  result: "",
  winner: null,
};

const SHOP_SKINS = [
  {
    id: "gold",
    name: "Standard Goldwürfel",
    rarity: "Common",
    price: 0,
    description: "Der klassische Goldwurf-Look.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #fff4c9, #c58c30 60%, #5f380c)",
      pip: "radial-gradient(circle at 34% 28%, #33312c, #050403 64%, #000 100%)",
      glow: "rgba(241, 200, 106, 0.24)",
      text: "#070604",
    },
    assetRef: "assets/skins/gold.png",
  },
  {
    id: "obsidian",
    name: "Obsidian-Würfel",
    rarity: "Rare",
    price: 100,
    description: "Dunkler Stein mit warmer Goldkante.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #777068 0%, #24211e 42%, #030303 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffd76f, #1a1204 68%, #000 100%)",
      glow: "rgba(255, 190, 52, 0.2)",
      text: "#ffd76f",
    },
    assetRef: "assets/skins/obsidian.png",
  },
  {
    id: "ruby",
    name: "Rubin-Würfel",
    rarity: "Rare",
    price: 250,
    description: "Rot geschliffen, heiß belohnt.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #ffe4dc 0%, #e12a48 42%, #5a0615 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff0d0, #4a0611 68%, #1a0205 100%)",
      glow: "rgba(255, 68, 96, 0.28)",
      text: "#ffe8b6",
    },
    assetRef: "assets/skins/ruby.png",
  },
  {
    id: "diamond",
    name: "Diamant-Würfel",
    rarity: "Epic",
    price: 500,
    description: "Klar, kalt und funkelnd.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #ffffff 0%, #dbf8ff 38%, #6ed1ff 72%, #315b7d 100%)",
      pip: "radial-gradient(circle at 34% 28%, #0a2432, #02070a 68%, #000 100%)",
      glow: "rgba(150, 229, 255, 0.34)",
      text: "#081722",
    },
    assetRef: "assets/skins/diamond.png",
  },
  {
    id: "royal",
    name: "Royal-Würfel",
    rarity: "Epic",
    price: 1000,
    description: "Macht, Reichtum, Ehre.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #fff7b8 0%, #ffc83f 36%, #c47a0c 72%, #5e3202 100%)",
      pip: "radial-gradient(circle at 34% 28%, #2c1702, #050301 68%, #000 100%)",
      glow: "rgba(255, 203, 73, 0.48)",
      text: "#070604",
    },
    assetRef: "assets/skins/royal.png",
  },
  {
    id: "diamond-deluxe",
    name: "Diamant Deluxe",
    rarity: "Legendary",
    price: 2500,
    description: "Luxus aus Licht und Eis.",
    unlockCondition: { type: "none" },
    preview: {
      background: "conic-gradient(from 215deg at 50% 50%, #ffffff, #9de9ff, #8767ff, #ffffff, #dff9ff, #ffffff)",
      pip: "radial-gradient(circle at 34% 28%, #0a2432, #02070a 68%, #000 100%)",
      glow: "rgba(174, 231, 255, 0.46)",
      text: "#081722",
    },
    assetRef: "assets/skins/diamond-deluxe.png",
  },
  {
    id: "dragonfire",
    name: "Drachenfeuer",
    rarity: "Legendary",
    price: 3000,
    description: "Geboren aus Feuer und Zorn.",
    unlockCondition: { type: "wins", value: 10 },
    preview: {
      background: "radial-gradient(circle at 62% 70%, rgba(255, 196, 62, 0.55), transparent 0 18%, transparent 42%), linear-gradient(145deg, #1b1512 0%, #4b1307 42%, #ff5b16 74%, #140704 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffd871, #ff4a13 54%, #140300 100%)",
      glow: "rgba(255, 92, 22, 0.52)",
      text: "#ffd871",
    },
    assetRef: "assets/skins/dragonfire.png",
  },
  {
    id: "void-eclipse",
    name: "Void Eclipse",
    rarity: "Legendary",
    price: 3600,
    description: "Verschlungen von der Leere.",
    unlockCondition: { type: "wins", value: 15 },
    preview: {
      background: "radial-gradient(circle at 70% 28%, rgba(183, 73, 255, 0.55), transparent 0 24%, transparent 48%), linear-gradient(145deg, #27113c 0%, #09040f 52%, #000 100%)",
      pip: "radial-gradient(circle at 34% 28%, #f0d7ff, #8d35ff 58%, #100018 100%)",
      glow: "rgba(154, 64, 255, 0.48)",
      text: "#ecd7ff",
    },
    assetRef: "assets/skins/void-eclipse.png",
  },
  {
    id: "lightbringer",
    name: "Lichtbringer",
    rarity: "Legendary",
    price: 4200,
    description: "Segen des Himmels.",
    unlockCondition: { type: "wins", value: 20 },
    preview: {
      background: "radial-gradient(circle at 45% 35%, rgba(255, 255, 255, 0.96), transparent 0 22%, transparent 44%), linear-gradient(145deg, #ffffff 0%, #ffe8a7 42%, #d69a1f 74%, #70460b 100%)",
      pip: "radial-gradient(circle at 34% 28%, #7a4500, #231202 68%, #000 100%)",
      glow: "rgba(255, 230, 142, 0.58)",
      text: "#4a2700",
    },
    assetRef: "assets/skins/lightbringer.png",
  },
  {
    id: "chaos-core",
    name: "Chaos Core",
    rarity: "Mythic",
    price: 5000,
    description: "Instabil. Unberechenbar. Mächtig.",
    unlockCondition: { type: "wins", value: 25 },
    preview: {
      background: "radial-gradient(circle at 50% 50%, rgba(255, 35, 20, 0.86), transparent 0 16%, transparent 38%), linear-gradient(145deg, #30201d 0%, #080504 45%, #b61610 70%, #030101 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffedc8, #ff2115 54%, #120000 100%)",
      glow: "rgba(255, 35, 20, 0.62)",
      text: "#ffb29c",
    },
    assetRef: "assets/skins/chaos-core.png",
  },
  {
    id: "timekeeper",
    name: "Zeitwächter",
    rarity: "Mythic",
    price: 5500,
    description: "Herrscher über Sekunden.",
    unlockCondition: { type: "wins", value: 30 },
    preview: {
      background: "radial-gradient(circle at 50% 50%, rgba(41, 219, 255, 0.42), transparent 0 24%, transparent 48%), linear-gradient(145deg, #a76f22 0%, #2f2111 44%, #062d3c 72%, #02080b 100%)",
      pip: "radial-gradient(circle at 34% 28%, #bdf6ff, #19b9e6 58%, #031116 100%)",
      glow: "rgba(41, 219, 255, 0.48)",
      text: "#8eeeff",
    },
    assetRef: "assets/skins/timekeeper.png",
  },
  {
    id: "god-dice",
    name: "Götter Würfel",
    rarity: "Mythic",
    price: 7500,
    description: "Nur für Auserwählte.",
    unlockCondition: { type: "wins", value: 50 },
    preview: {
      background: "radial-gradient(circle at 72% 22%, rgba(108, 215, 255, 0.5), transparent 0 20%, transparent 42%), linear-gradient(145deg, #ffffff 0%, #d7d1c4 36%, #d7a53a 64%, #5f3a0c 100%)",
      pip: "radial-gradient(circle at 34% 28%, #7b4a00, #1b1203 68%, #000 100%)",
      glow: "rgba(255, 232, 170, 0.62)",
      text: "#5c3700",
    },
    assetRef: "assets/skins/god-dice.png",
  },
  {
    id: "halloween",
    name: "Halloween",
    rarity: "Epic",
    price: 1200,
    description: "Schaurig schön.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 45% 28%, rgba(255, 183, 64, 0.58), transparent 0 20%, transparent 42%), linear-gradient(145deg, #2b1608 0%, #f5821f 42%, #1a0a04 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff0a8, #ff7b00 58%, #140400 100%)",
      glow: "rgba(255, 130, 31, 0.5)",
      text: "#ffe1a3",
    },
    assetRef: "assets/skins/halloween.png",
  },
  {
    id: "christmas",
    name: "Weihnachten",
    rarity: "Epic",
    price: 1200,
    description: "Festlich. Fröhlich. Goldwurf.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.85), transparent 0 18%, transparent 34%), linear-gradient(145deg, #fff8e8 0%, #d93030 34%, #1f7d3d 70%, #0d321b 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff4cf, #b80d1e 58%, #180204 100%)",
      glow: "rgba(255, 244, 207, 0.44)",
      text: "#fff4cf",
    },
    assetRef: "assets/skins/christmas.png",
  },
  {
    id: "pirate-gold",
    name: "Piraten Gold",
    rarity: "Epic",
    price: 1800,
    description: "Techdreh und gewinnen.",
    unlockCondition: { type: "wins", value: 5 },
    preview: {
      background: "linear-gradient(145deg, #21160b 0%, #050403 42%, #d19b2a 70%, #3e2606 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffe2a0, #9b6712 58%, #050201 100%)",
      glow: "rgba(209, 155, 42, 0.42)",
      text: "#ffe2a0",
    },
    assetRef: "assets/skins/pirate-gold.png",
  },
  {
    id: "oktoberfest",
    name: "Oktoberfest",
    rarity: "Rare",
    price: 900,
    description: "O'zapft is!",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #f8fbff 0%, #267ec8 42%, #d69b2c 72%, #102d4b 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffe4a3, #0e4f8d 62%, #020b13 100%)",
      glow: "rgba(55, 153, 230, 0.4)",
      text: "#ffe4a3",
    },
    assetRef: "assets/skins/oktoberfest.png",
  },
  {
    id: "spring-magic",
    name: "Frühlingszauber",
    rarity: "Rare",
    price: 900,
    description: "Blumen, Glück und Gold.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 72% 28%, rgba(255, 162, 203, 0.75), transparent 0 18%, transparent 38%), linear-gradient(145deg, #e6ffd4 0%, #4e9d3d 44%, #17451a 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff0f8, #ff83b8 58%, #16320e 100%)",
      glow: "rgba(154, 229, 112, 0.42)",
      text: "#fff0f8",
    },
    assetRef: "assets/skins/spring-magic.png",
  },
  {
    id: "summer-vibes",
    name: "Sommer Vibes",
    rarity: "Rare",
    price: 900,
    description: "Sonne. Strand. Gewinnen.",
    unlockCondition: { type: "none" },
    preview: {
      background: "linear-gradient(145deg, #fff0a6 0%, #40d4d4 42%, #1a90b2 70%, #b57728 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff1a8, #d27913 60%, #062f38 100%)",
      glow: "rgba(64, 212, 212, 0.44)",
      text: "#fff1a8",
    },
    assetRef: "assets/skins/summer-vibes.png",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    rarity: "Legendary",
    price: 2800,
    description: "Plug in. Level up.",
    unlockCondition: { type: "wins", value: 8 },
    preview: {
      background: "linear-gradient(145deg, #10131b 0%, #081122 42%, #00d8ff 58%, #ff3bce 82%, #13031b 100%)",
      pip: "radial-gradient(circle at 34% 28%, #d8fbff, #00c8ff 48%, #ff39d2 82%, #06020a 100%)",
      glow: "rgba(0, 216, 255, 0.56)",
      text: "#bff8ff",
    },
    assetRef: "assets/skins/cyber-neon.png",
  },
  {
    id: "hologram",
    name: "Hologramm",
    rarity: "Legendary",
    price: 3200,
    description: "Nichts ist, wie es scheint.",
    unlockCondition: { type: "wins", value: 12 },
    preview: {
      background: "conic-gradient(from 180deg at 50% 50%, rgba(255, 255, 255, 0.9), #8ff4ff, #f09cff, #ffe7a8, #9affd6, rgba(255, 255, 255, 0.9))",
      pip: "radial-gradient(circle at 34% 28%, #08242a, #5b34a8 58%, #010407 100%)",
      glow: "rgba(196, 244, 255, 0.58)",
      text: "#092129",
    },
    assetRef: "assets/skins/hologram.png",
  },
  {
    id: "titan-core",
    name: "Titan Core",
    rarity: "Legendary",
    price: 3400,
    description: "Technologie der Titanen.",
    unlockCondition: { type: "wins", value: 14 },
    preview: {
      background: "radial-gradient(circle at 50% 50%, rgba(0, 194, 255, 0.44), transparent 0 22%, transparent 48%), linear-gradient(145deg, #2e3b42 0%, #0b1015 46%, #00aee8 70%, #02060a 100%)",
      pip: "radial-gradient(circle at 34% 28%, #d6f8ff, #00aee8 58%, #02060a 100%)",
      glow: "rgba(0, 174, 232, 0.48)",
      text: "#b8f2ff",
    },
    assetRef: "assets/skins/titan-core.png",
  },
  {
    id: "quantum-shift",
    name: "Quantum Shift",
    rarity: "Legendary",
    price: 3800,
    description: "Zukunft. Jetzt.",
    unlockCondition: { type: "wins", value: 18 },
    preview: {
      background: "linear-gradient(145deg, #151021 0%, #6c27d9 40%, #13d6ff 64%, #1d062e 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ebd8ff, #8a35ff 48%, #05c6ff 80%, #05020a 100%)",
      glow: "rgba(128, 67, 255, 0.52)",
      text: "#eadcff",
    },
    assetRef: "assets/skins/quantum-shift.png",
  },
  {
    id: "robotic-steel",
    name: "Robotic Steel",
    rarity: "Epic",
    price: 2200,
    description: "Kalt. Präzise. Dominant.",
    unlockCondition: { type: "wins", value: 7 },
    preview: {
      background: "linear-gradient(145deg, #d9e4ea 0%, #6d8794 36%, #1f2c35 68%, #071017 100%)",
      pip: "radial-gradient(circle at 34% 28%, #e7f8ff, #4bb8ff 58%, #061018 100%)",
      glow: "rgba(96, 188, 255, 0.38)",
      text: "#d8f4ff",
    },
    assetRef: "assets/skins/robotic-steel.png",
  },
  {
    id: "plasma-drive",
    name: "Plasma Drive",
    rarity: "Legendary",
    price: 4000,
    description: "Energie ohne Grenzen.",
    unlockCondition: { type: "wins", value: 22 },
    preview: {
      background: "radial-gradient(circle at 50% 64%, rgba(255, 123, 21, 0.68), transparent 0 20%, transparent 42%), linear-gradient(145deg, #16110d 0%, #050403 42%, #ff7a15 70%, #220802 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffe2a0, #ff7814 58%, #120300 100%)",
      glow: "rgba(255, 122, 21, 0.56)",
      text: "#ffd99a",
    },
    assetRef: "assets/skins/plasma-drive.png",
  },
];

function getSkinById(skinId) {
  return SHOP_SKINS.find((skin) => skin.id === skinId);
}

function getSkinClassName(skinId) {
  return `skin-${skinId}`;
}

function isSkinUnlocked(skin) {
  if (!skin?.unlockCondition || skin.unlockCondition.type === "none") return true;
  if (skin.unlockCondition.type === "wins") {
    return state.humanWins >= skin.unlockCondition.value;
  }
  return false;
}

function getUnlockText(skin) {
  if (!skin?.unlockCondition || skin.unlockCondition.type === "none") return "Sofort verfügbar";
  if (skin.unlockCondition.type === "wins") {
    const wins = skin.unlockCondition.value;
    return `Ab ${wins} ${wins === 1 ? "Sieg" : "Siegen"}`;
  }
  return "Freischaltung erforderlich";
}

function applySkinPreviewStyles(element, skin) {
  if (!element || !skin?.preview) return;

  element.style.setProperty("--skin-die-bg", skin.preview.background);
  element.style.setProperty("--skin-pip-bg", skin.preview.pip);
  element.style.setProperty("--skin-glow", skin.preview.glow);
  element.style.setProperty("--skin-die-text", skin.preview.text);
}

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
const royalMomentReward = document.querySelector("#royalMomentReward");
const winnerOverlay = document.querySelector("#winnerOverlay");
const winnerTitle = document.querySelector("#winnerTitle");
const winnerScoreLine = document.querySelector("#winnerScoreLine");
const winnerGoldReward = document.querySelector("#winnerGoldReward");
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
const standardVariantButton = document.querySelector("#standardVariantButton");
const comboVariantButton = document.querySelector("#comboVariantButton");
const oneDieButton = document.querySelector("#oneDieButton");
const twoDiceButton = document.querySelector("#twoDiceButton");
const comboPanel = document.querySelector("#comboPanel");
const comboTurnLabel = document.querySelector("#comboTurnLabel");
const comboHumanSelection = document.querySelector("#comboHumanSelection");
const comboComputerSelection = document.querySelector("#comboComputerSelection");
const comboRollResult = document.querySelector("#comboRollResult");
const comboDiceGrid = document.querySelector("#comboDiceGrid");
const humanPanel = document.querySelector("#humanPanel");
const computerPanel = document.querySelector("#computerPanel");
const humanStarterButton = document.querySelector("#humanStarterButton");
const computerStarterButton = document.querySelector("#computerStarterButton");
const menuShell = document.querySelector("#settingsShell");
const menuTrigger = document.querySelector("#menuTrigger");
const shopShell = document.querySelector("#shopShell");
const shopTrigger = document.querySelector("#shopTrigger");
const shopItems = document.querySelector("#shopItems");
const goldBalance = document.querySelector("#goldBalance");
const goldGainToast = document.querySelector("#goldGainToast");
const infoShell = document.querySelector("#infoShell");
const infoTrigger = document.querySelector("#infoTrigger");
const appVersion = document.querySelector("#appVersion");
if (appVersion && APP_VERSION) {
  appVersion.textContent = APP_VERSION;
}
const lockedRuleControls = [
  singleModeButton,
  multiModeButton,
  standardVariantButton,
  comboVariantButton,
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
  const comboMode = isComboMode();
  humanScore.textContent = comboMode ? formatComboSelection(comboState.humanSelection) : state.humanScore;
  computerScore.textContent = comboMode ? formatComboSelection(comboState.computerSelection) : state.computerScore;
  humanScore.nextElementSibling.textContent = comboMode ? "Gewählte Zahlen" : "Gesamtpunkte";
  computerScore.nextElementSibling.textContent = comboMode ? "Gewählte Zahlen" : "Gesamtpunkte";
  humanWins.textContent = state.humanWins;
  computerWins.textContent = state.computerWins;
  roundScore.textContent = state.roundScore;
  turnScore.textContent = state.turnScore;
  turnScorePanel.hidden = false;
  humanNameLabel.textContent = playerName;
  opponentNameLabel.textContent = getOpponentName();
  document.body.classList.toggle("gamble-mode", gambleMode);
  document.body.classList.toggle("combo-mode", comboMode);
  document.body.classList.toggle("combo-roll-ready", comboMode && (comboState.phase === "ready" || comboState.phase === "result"));
  rulesWinningScore.textContent = winningScore;
  rulesDifficultyText.textContent =
    difficulty === "normal" ? "Erreiche zuerst" : "Erreiche genau";

  const activePlayer = comboMode ? comboState.currentSelector : state.currentPlayer;
  humanPanel.classList.toggle("active", activePlayer === "human" && !state.isGameOver);
  computerPanel.classList.toggle("active", activePlayer === "computer" && !state.isGameOver);
  humanPanel.classList.toggle("winner", comboMode ? comboState.winner === "human" : hasWinningScore(state.humanScore));
  computerPanel.classList.toggle("winner", comboMode ? comboState.winner === "computer" : hasWinningScore(state.computerScore));
  opponentNameLabel.disabled = gameMode === "single";
  if (newGameButton) newGameButton.textContent = comboMode ? "Neue Runde" : "Neues Spiel";
  if (humanStarterButton && computerStarterButton) {
    const canChooseStarter = canChooseStartPlayer();
    const selectedStarter = comboMode ? startPlayer : state.currentPlayer;
    humanStarterButton.hidden = false;
    computerStarterButton.hidden = false;
    humanStarterButton.disabled = !canChooseStarter;
    computerStarterButton.disabled = !canChooseStarter;
    humanStarterButton.classList.toggle("active", selectedStarter === "human");
    computerStarterButton.classList.toggle("active", selectedStarter === "computer");
    humanStarterButton.textContent = selectedStarter === "human" ? "Startet" : "Start";
    computerStarterButton.textContent = selectedStarter === "computer" ? "Startet" : "Start";
  }
  rollButton.dataset.diceCount = String(comboMode ? getRequiredComboPickCount() : getEffectiveDiceCount());
  oneDieButton.classList.toggle("active", diceCount === 1);
  twoDiceButton.classList.toggle("active", diceCount === 2);
  oneDieButton.setAttribute("aria-pressed", String(diceCount === 1));
  twoDiceButton.setAttribute("aria-pressed", String(diceCount === 2));
  standardVariantButton?.classList.toggle("active", !comboMode);
  comboVariantButton?.classList.toggle("active", comboMode);
  standardVariantButton?.setAttribute("aria-pressed", String(!comboMode));
  comboVariantButton?.setAttribute("aria-pressed", String(comboMode));
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
  renderComboMode();
  bankButton.hidden = false;
  bankButton.disabled =
    comboMode ||
    !gambleMode ||
    state.turnScore <= 0 ||
    state.isGameOver ||
    (gameMode === "single" && state.currentPlayer !== "human") ||
    state.isComputerThinking ||
    state.isRolling;

  rollButton.disabled =
    state.isGameOver ||
    (comboMode && !canRollCombo()) ||
    (!comboMode && gameMode === "single" && state.currentPlayer !== "human") ||
    state.isComputerThinking ||
    state.isRolling;
  renderGold();
  renderShop();
}

function loadGold() {
  const savedGold = Number(localStorage.getItem("goldwurf-royale-gold"));
  gold = Number.isFinite(savedGold) && savedGold >= 0 ? Math.floor(savedGold) : 0;
  renderGold();
}

function saveGold() {
  localStorage.setItem("goldwurf-royale-gold", String(gold));
}

function addGold(amount, reason = "") {
  const cleanAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (cleanAmount <= 0) return;

  gold += cleanAmount;
  saveGold();
  renderGold();
  renderShop();
  showGoldGain(cleanAmount, reason);
}

function renderGold() {
  if (goldBalance) goldBalance.textContent = gold;
}

function showGoldGain(amount) {
  if (!goldGainToast) return;

  window.clearTimeout(goldGainTimer);
  const isSpend = amount < 0;
  goldGainToast.textContent = `${isSpend ? "" : "+"}${amount} Gold`;
  goldGainToast.hidden = false;
  goldGainToast.classList.toggle("spend", isSpend);
  goldGainToast.classList.remove("show");

  requestAnimationFrame(() => {
    goldGainToast.classList.add("show");
  });

  goldGainTimer = window.setTimeout(() => {
    goldGainToast.classList.remove("show");
    window.setTimeout(() => {
      if (!goldGainToast.classList.contains("show")) {
        goldGainToast.hidden = true;
      }
    }, 180);
  }, 1450);
}

function calculateHumanWinGold() {
  let reward = 10;
  if (difficulty === "hard") reward += 10;
  if (riskMode && !gambleMode) reward += 10;
  if (gambleMode) reward += 15;
  if (diceCount === 2) reward += 5;
  // Bewusst zusätzlicher Bonus: Im schweren Modus ist jeder Sieg exakt, dieser Moment soll trotzdem extra belohnt werden.
  if (difficulty === "hard" && state.humanScore === winningScore) reward += 10;
  return reward;
}

function awardHumanWinGold() {
  if (state.goldAwarded) return;

  const reward = calculateHumanWinGold();
  state.goldAwarded = true;
  state.lastGoldReward = reward;
  addGold(reward, "win");
}

function getSpecialMomentGoldReward(moment) {
  if (!moment || moment.type === "dark") return 0;
  return moment.reward ?? 50;
}

function calculateHumanComboGoldReward() {
  return getRequiredComboPickCount() === 2 ? 500 : 100;
}

function awardHumanComboGold() {
  if (state.goldAwarded) return 0;

  const reward = calculateHumanComboGoldReward();
  state.goldAwarded = true;
  state.lastGoldReward = reward;
  addGold(reward, "combo");
  return reward;
}

function loadShopState() {
  try {
    const savedOwned = JSON.parse(localStorage.getItem("goldwurf-royale-owned-skins") || "[]");
    if (Array.isArray(savedOwned)) {
      ownedSkins = new Set(["gold", ...savedOwned.filter((skinId) => getSkinById(skinId))]);
    }
  } catch {
    ownedSkins = new Set(["gold"]);
  }

  const savedActiveSkin = localStorage.getItem("goldwurf-royale-active-skin");
  activeSkin = ownedSkins.has(savedActiveSkin) ? savedActiveSkin : "gold";
  saveShopState();
  applyActiveSkin();
  renderShop();
}

function saveShopState() {
  localStorage.setItem("goldwurf-royale-owned-skins", JSON.stringify(Array.from(ownedSkins)));
  localStorage.setItem("goldwurf-royale-active-skin", activeSkin);
}

function buySkin(skinId) {
  const skin = getSkinById(skinId);
  if (!skin || ownedSkins.has(skin.id) || gold < skin.price || !isSkinUnlocked(skin)) return;

  gold -= skin.price;
  ownedSkins.add(skin.id);
  activeSkin = skin.id;
  saveGold();
  saveShopState();
  applyActiveSkin();
  renderGold();
  renderShop();
  showGoldSpend(skin.price, skin.id);
  playShopPurchaseSound();
}

function selectSkin(skinId) {
  if (!ownedSkins.has(skinId)) return;

  activeSkin = skinId;
  saveShopState();
  applyActiveSkin();
  renderShop();
}

function renderShop() {
  if (!shopItems) return;

  shopItems.innerHTML = "";
  SHOP_SKINS.forEach((skin) => {
    const isOwned = ownedSkins.has(skin.id);
    const isActive = activeSkin === skin.id;
    const isUnlocked = isSkinUnlocked(skin);
    const canBuy = gold >= skin.price;
    const item = document.createElement("article");
    item.className = `shop-item skin-preview-${skin.id}`;
    item.classList.toggle("owned", isOwned);
    item.classList.toggle("active", isActive);
    item.classList.toggle("locked", !isOwned && !isUnlocked);

    const preview = document.createElement("span");
    preview.className = "skin-preview-die";
    preview.setAttribute("aria-hidden", "true");
    applySkinPreviewStyles(preview, skin);
    for (let index = 0; index < 5; index += 1) {
      preview.append(document.createElement("i"));
    }

    const meta = document.createElement("span");
    meta.className = `shop-item-meta rarity-${skin.rarity.toLowerCase()}`;
    meta.textContent = `${skin.rarity} · ${getUnlockText(skin)}`;

    const title = document.createElement("strong");
    title.textContent = skin.name;

    const description = document.createElement("p");
    description.className = "shop-item-description";
    description.textContent = skin.description;

    const price = document.createElement("span");
    price.className = "shop-item-price";
    price.textContent = isOwned ? "Freigeschaltet" : `${skin.price} Gold`;

    const action = document.createElement("button");
    action.type = "button";
    action.dataset.skinId = skin.id;
    if (isActive) {
      action.textContent = "Ausgewählt";
      action.disabled = true;
    } else if (isOwned) {
      action.textContent = "Auswählen";
      action.dataset.action = "select";
    } else if (!isUnlocked) {
      action.textContent = getUnlockText(skin);
      action.disabled = true;
    } else if (canBuy) {
      action.textContent = "Kaufen";
      action.dataset.action = "buy";
    } else {
      action.textContent = `Noch ${skin.price - gold} Gold`;
      action.disabled = true;
    }

    item.append(preview, meta, title, description, price, action);
    shopItems.append(item);
  });
}

function showGoldSpend(amount, skinId) {
  showGoldGain(-amount);

  if (!shopItems) return;
  const item = shopItems.querySelector(`[data-skin-id="${skinId}"]`)?.closest(".shop-item");
  if (!item) return;

  item.classList.remove("purchase-pop");
  void item.offsetWidth;
  item.classList.add("purchase-pop");
  window.setTimeout(() => item.classList.remove("purchase-pop"), 920);
}

function applyActiveSkin() {
  SHOP_SKINS.forEach((skin) => document.body.classList.remove(getSkinClassName(skin.id)));
  const skin = getSkinById(activeSkin) || getSkinById("gold");
  activeSkin = skin.id;
  document.body.classList.add(getSkinClassName(activeSkin));
  applySkinPreviewStyles(document.body, skin);
}

function isComboMode() {
  return gameVariant === "combo";
}

function areRuleControlsLocked() {
  return rulesLockedByRematch || state.hasRolled || hasComboSelectionStarted() || state.isRolling || state.isComputerThinking;
}

function updateRuleControlsLock() {
  const isLocked = areRuleControlsLocked();
  lockedRuleControls.forEach((control) => {
    const isRiskControl = control === riskOnButton || control === riskOffButton;
    const isStandardOnlyControl = [
      riskOnButton,
      riskOffButton,
      gambleOnButton,
      gambleOffButton,
      winningScoreInput,
      applyScoreButton,
      normalModeButton,
      hardModeButton,
    ].includes(control);
    const shouldLock = isLocked || (gambleMode && isRiskControl) || (isComboMode() && isStandardOnlyControl);
    control.disabled = shouldLock;
    control.closest(".setting")?.classList.toggle("locked", shouldLock);
  });
  oneDieButton?.closest(".dice-switcher")?.classList.toggle("locked", isLocked);
}

function setMessage(text, isBadRoll = false) {
  message.textContent = text;
  message.classList.toggle("bad-roll", isBadRoll);
}

function getRequiredComboPickCount() {
  return diceCount === 2 ? 2 : 1;
}

function getComboSelection(player) {
  return player === "computer" ? comboState.computerSelection : comboState.humanSelection;
}

function formatComboSelection(selection) {
  return selection.length ? selection.slice().sort((a, b) => a - b).join(" + ") : "-";
}

function getComboPlayerName(player) {
  return player === "human" ? playerName : getOpponentName();
}

function getOtherComboPlayer(player) {
  return player === "human" ? "computer" : "human";
}

function getComboPhaseForPlayer(player) {
  return player === "computer" ? "select-computer" : "select-human";
}

function hasComboSelectionStarted() {
  return isComboMode() && (comboState.humanSelection.length > 0 || comboState.computerSelection.length > 0);
}

function resetComboState() {
  comboState.currentSelector = startPlayer;
  comboState.phase = getComboPhaseForPlayer(comboState.currentSelector);
  comboState.humanSelection = [];
  comboState.computerSelection = [];
  comboState.rollValues = [];
  comboState.result = "";
  comboState.winner = null;
}

function canRollCombo() {
  return (
    isComboMode() &&
    comboState.phase === "ready" &&
    comboState.humanSelection.length === getRequiredComboPickCount() &&
    comboState.computerSelection.length === getRequiredComboPickCount()
  );
}

function renderComboMode() {
  if (!comboPanel) return;

  comboPanel.hidden = !isComboMode();
  if (!isComboMode()) return;

  if (comboTurnLabel) {
    comboTurnLabel.textContent =
      comboState.phase === "ready"
        ? "Bereit zum Würfeln"
        : comboState.phase === "result"
          ? "Runde beendet"
          : getComboPlayerName(comboState.currentSelector);
  }
  if (comboHumanSelection) comboHumanSelection.textContent = formatComboSelection(comboState.humanSelection);
  if (comboComputerSelection) comboComputerSelection.textContent = formatComboSelection(comboState.computerSelection);
  if (comboRollResult) comboRollResult.textContent = comboState.rollValues.length ? formatRoll(comboState.rollValues) : "-";

  comboDiceGrid?.querySelectorAll(".combo-die-button").forEach((button) => {
    const value = Number(button.dataset.comboValue);
    const isHumanSelected = comboState.humanSelection.includes(value);
    const isComputerSelected = comboState.computerSelection.includes(value);
    const canSelect =
      !state.isGameOver &&
      !state.isRolling &&
      (comboState.phase === "select-human" || comboState.phase === "select-computer");
    button.classList.toggle("selected-human", isHumanSelected);
    button.classList.toggle("selected-computer", isComputerSelected);
    button.classList.toggle("selected-both", isHumanSelected && isComputerSelected);
    button.classList.toggle("current-selectable", canSelect);
    button.disabled = !canSelect || (gameMode === "single" && comboState.currentSelector === "computer");
    button.setAttribute("aria-pressed", String(isHumanSelected || isComputerSelected));
  });
}

function getComboStartMessage() {
  return `Orakel: ${getComboPlayerName(comboState.currentSelector)} wählt ${getRequiredComboPickCount()} Zahl${getRequiredComboPickCount() === 1 ? "" : "en"}.`;
}

function autoSelectComboForComputer() {
  if (!isComboMode() || gameMode !== "single" || comboState.phase !== "select-computer") return;

  state.isComputerThinking = true;
  setMessage("KI wählt ihre Orakel-Zahlen...");
  render();

  window.clearTimeout(comboComputerTimer);
  comboComputerTimer = window.setTimeout(() => {
    comboComputerTimer = undefined;
    if (!isComboMode() || gameMode !== "single" || comboState.phase !== "select-computer") return;

    const values = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
    comboState.computerSelection = values.slice(0, getRequiredComboPickCount()).sort((a, b) => a - b);
    state.isComputerThinking = false;
    completeComboSelectionIfReady();
    if (comboState.phase === "ready") {
      setMessage("KI hat gewählt. Jetzt würfeln.");
    }
    render();
  }, 650);
}

function completeComboSelectionIfReady() {
  const required = getRequiredComboPickCount();

  if (getComboSelection(comboState.currentSelector).length !== required) return;

  const nextSelector = getOtherComboPlayer(comboState.currentSelector);
  if (getComboSelection(nextSelector).length === required) {
    comboState.phase = "ready";
    comboState.currentSelector = startPlayer;
    setMessage("Beide Orakel-Auswahlen stehen. Jetzt würfeln.");
    return;
  }

  comboState.currentSelector = nextSelector;
  comboState.phase = getComboPhaseForPlayer(nextSelector);

  if (nextSelector === "computer" && gameMode === "single") {
      autoSelectComboForComputer();
  } else {
    setMessage(`${getComboPlayerName(nextSelector)} wählt ${required} Zahl${required === 1 ? "" : "en"}.`);
  }
}

function selectComboNumber(value) {
  if (!isComboMode() || state.isRolling || state.isGameOver) return;
  if (comboState.phase !== "select-human" && comboState.phase !== "select-computer") return;
  if (gameMode === "single" && comboState.currentSelector === "computer") return;

  const selection = getComboSelection(comboState.currentSelector);
  const selectedIndex = selection.indexOf(value);
  if (selectedIndex >= 0) {
    selection.splice(selectedIndex, 1);
  } else if (selection.length < getRequiredComboPickCount()) {
    selection.push(value);
    selection.sort((a, b) => a - b);
  } else {
    playInvalidSound();
    setMessage(`Du kannst nur ${getRequiredComboPickCount()} Zahl${getRequiredComboPickCount() === 1 ? "" : "en"} wählen.`, true);
    render();
    return;
  }

  playClickSound();
  completeComboSelectionIfReady();
  if (comboState.phase === "select-human") {
    setMessage(`${playerName} wählt ${getRequiredComboPickCount()} Zahl${getRequiredComboPickCount() === 1 ? "" : "en"}.`);
  } else if (comboState.phase === "select-computer" && gameMode === "multi") {
    setMessage(`${getOpponentName()} wählt ${getRequiredComboPickCount()} Zahl${getRequiredComboPickCount() === 1 ? "" : "en"}.`);
  }
  render();
}

function selectionMatchesRoll(selection, values) {
  if (selection.length !== getRequiredComboPickCount()) return false;
  if (values.length !== getRequiredComboPickCount()) return false;
  return selection.every((value) => values.includes(value));
}

function getComboWinMessage(player) {
  const selectionText = formatComboSelection(getComboSelection(player));
  if (player === "human" && playerName === "Du") {
    return `Du triffst ${selectionText} und gewinnst die Orakel-Runde.`;
  }
  return `${getComboPlayerName(player)} trifft ${selectionText} und gewinnt die Orakel-Runde.`;
}

function finishComboRoll(values) {
  const humanHit = selectionMatchesRoll(comboState.humanSelection, values);
  const computerHit = selectionMatchesRoll(comboState.computerSelection, values);
  const humanGoldReward = gameMode === "single" && humanHit ? awardHumanComboGold() : 0;

  comboState.rollValues = values;
  comboState.phase = "result";
  state.isGameOver = true;

  if (humanHit && !computerHit) {
    comboState.winner = "human";
    state.humanWins += 1;
    playWinSound();
    playWinAnimation("human");
    setMessage(`${getComboWinMessage("human")}${humanGoldReward > 0 ? ` +${humanGoldReward} Gold.` : ""}`);
  } else if (computerHit && !humanHit) {
    comboState.winner = "computer";
    state.computerWins += 1;
    playWinSound();
    playWinAnimation("computer");
    setMessage(getComboWinMessage("computer"));
  } else {
    comboState.winner = null;
    setMessage(`Gewürfelt: ${formatRoll(values)}. Unentschieden.${humanGoldReward > 0 ? ` Dein Orakel war richtig: +${humanGoldReward} Gold.` : ""}`);
    playDrawAnimation();
  }

  saveWins();
  render();
}

function playComboWinAnimation(winner) {
  const winnerPanel = winner === "human" ? humanPanel : computerPanel;
  winnerPanel.classList.remove("win-pop");
  void winnerPanel.offsetWidth;
  winnerPanel.classList.add("win-pop");
  tablePanel.classList.remove("win-flash");
  void tablePanel.offsetWidth;
  tablePanel.classList.add("win-flash");
  window.setTimeout(() => {
    winnerPanel.classList.remove("win-pop");
    tablePanel.classList.remove("win-flash");
  }, 950);
}

function showDrawOverlay() {
  if (!winnerOverlay || !winnerTitle || !winnerScoreLine) return;
  window.clearTimeout(winnerOverlayTimer);

  winnerTitle.textContent = "Unentschieden";
  winnerScoreLine.textContent = `Orakel | Wurf ${formatRoll(comboState.rollValues)}`;
  if (winnerGoldReward) {
    winnerGoldReward.hidden = true;
  }
  winnerOverlay.hidden = false;
  winnerOverlay.classList.remove("show");

  requestAnimationFrame(() => {
    winnerOverlay.classList.add("show");
  });
}

function playDrawAnimation() {
  tablePanel?.classList.remove("win-flash");
  message.classList.remove("win-message");
  victoryBurst?.classList.remove("show");

  requestAnimationFrame(() => {
    tablePanel?.classList.add("win-flash");
    message.classList.add("win-message");
    showDrawOverlay();
  });

  window.setTimeout(() => {
    tablePanel?.classList.remove("win-flash");
    message.classList.remove("win-message");
  }, 1500);
}

function getWinnerName(winner) {
  return winner === "human" ? playerName : getOpponentName();
}

function showWinnerOverlay(winner) {
  if (!winnerOverlay || !winnerTitle || !winnerScoreLine) return;
  window.clearTimeout(winnerOverlayTimer);

  winnerTitle.textContent = `${getWinnerName(winner)} gewinnt`;
  winnerScoreLine.textContent = isComboMode()
    ? `Orakel ${formatComboSelection(getComboSelection(winner))} | Wurf ${formatRoll(comboState.rollValues)}`
    : `Endstand ${state.humanScore} zu ${state.computerScore}`;
  if (winnerGoldReward) {
    const reward = winner === "human" ? state.lastGoldReward : 0;
    winnerGoldReward.hidden = reward <= 0;
    winnerGoldReward.textContent = `+${reward} Gold`;
  }
  winnerOverlay.hidden = false;
  winnerOverlay.classList.remove("show");

  requestAnimationFrame(() => {
    winnerOverlay.classList.add("show");
  });
}

function hideWinnerOverlay() {
  if (!winnerOverlay) return;

  window.clearTimeout(winnerOverlayTimer);
  winnerOverlay.classList.remove("show");
  window.setTimeout(() => {
    if (!winnerOverlay.classList.contains("show")) {
      winnerOverlay.hidden = true;
    }
  }, 160);
}

function isRoyalMomentActive() {
  return Boolean(royalMoment && !royalMoment.hidden && royalMoment.classList.contains("show"));
}

function scheduleWinnerOverlay(winner) {
  window.clearTimeout(winnerOverlayTimer);

  const delay = isRoyalMomentActive() ? 900 : 0;
  if (delay === 0) {
    showWinnerOverlay(winner);
    return;
  }

  winnerOverlayTimer = window.setTimeout(() => {
    if (state.isGameOver) {
      showWinnerOverlay(winner);
    }
  }, delay);
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
    scheduleWinnerOverlay(winner);
  });

  window.setTimeout(() => {
    winnerPanel.classList.remove("win-pop");
    tablePanel?.classList.remove("win-flash");
    message.classList.remove("win-message");
    victoryBurst?.classList.remove("show");
  }, 1500);
}

function detectSpecialMoment(values = [], context = {}) {
  const {
    currentScore = 0,
    nextScore = 0,
    currentPlayer = state.currentPlayer,
    scoreApplied = false,
    riskInvalid = false,
    gambleSecured = 0,
  } = context;
  const rolledValues = Array.isArray(values) ? values : [];
  const isHumanMoment = currentPlayer === "human";

  if (riskInvalid) {
    return { text: "RISIKO VERLOREN!", type: "dark" };
  }

  if (gambleSecured >= 20) {
    return { text: "GROSSER GAMBLE!", type: "gold", reward: isHumanMoment ? 50 : 0 };
  }

  if (rolledValues.length === 2 && rolledValues[0] === 6 && rolledValues[1] === 6) {
    return { text: "ROYAL WURF!", type: "gold", reward: isHumanMoment ? 100 : 0 };
  }

  if (
    riskMode &&
    difficulty === "hard" &&
    scoreApplied &&
    nextScore === winningScore &&
    isLastChanceWin(currentScore)
  ) {
    return { text: "LETZTE CHANCE GENUTZT!", type: "gold", reward: isHumanMoment ? 50 : 0 };
  }

  if (
    difficulty === "hard" &&
    scoreApplied &&
    currentScore < winningScore &&
    nextScore === winningScore
  ) {
    return { text: "PERFEKTER WURF!", type: "gold", reward: isHumanMoment ? 50 : 0 };
  }

  return null;
}

function showRoyalMoment(text, type = "gold", reward = 0) {
  if (!royalMoment || !royalMomentText || !text) return;

  window.clearTimeout(royalMomentTimer);
  royalMomentText.textContent = text;
  if (royalMomentReward) {
    royalMomentReward.textContent = `+${reward} Gold`;
    royalMomentReward.hidden = reward <= 0;
  }
  royalMoment.dataset.tone = type === "dark" ? "dark" : "gold";
  royalMoment.hidden = false;
  royalMoment.classList.remove("show");

  requestAnimationFrame(() => {
    royalMoment.classList.add("show");
  });

  royalMomentTimer = window.setTimeout(hideRoyalMoment, 1500);
}

function hideRoyalMoment() {
  if (!royalMoment) return;

  royalMoment.classList.remove("show");
  window.setTimeout(() => {
    if (!royalMoment.classList.contains("show")) {
      royalMoment.hidden = true;
    }
  }, 180);
}

function playRoyalMomentSound(type = "gold") {
  if (!soundEnabled) return;

  if (type === "dark") {
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

function triggerSpecialMoment(values = [], context = {}) {
  const moment = detectSpecialMoment(values, context);
  if (!moment) return;
  const reward = getSpecialMomentGoldReward(moment);

  if (reward > 0) {
    addGold(reward, "special");
  }
  showRoyalMoment(moment.text, moment.type, reward);
  playRoyalMomentSound(moment.type);
  if (moment.type !== "dark") {
    navigator.vibrate?.(60);
  }
}

function isLastChanceWin(scoreBefore) {
  if (!riskMode || difficulty !== "hard") return false;

  const pointsLeft = winningScore - scoreBefore;
  if (pointsLeft <= 0) return false;

  const effectiveDiceCount = getEffectiveDiceCountForPointsLeft(pointsLeft);
  const minimumValidRoll = effectiveDiceCount * 2;
  return pointsLeft === minimumValidRoll;
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
    awardHumanWinGold();
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
  const currentScore = state.currentPlayer === "human" ? state.humanScore : state.computerScore;
  const nextScore = currentScore + securedPoints;
  if (state.currentPlayer === "human") {
    state.humanScore = nextScore;
  } else {
    state.computerScore = nextScore;
  }

  state.turnScore = 0;
  setMessage(`${getCurrentPlayerName()} sichert ${securedPoints} Punkte.`);
  triggerSpecialMoment([], {
    currentScore,
    nextScore,
    scoreApplied: true,
    gambleSecured: securedPoints,
  });
  checkWinner();

  if (!state.isGameOver) {
    switchTurn();
  }
}

async function rollForCurrentPlayer() {
  if (state.isGameOver || state.isRolling) return;
  if (isComboMode()) {
    if (!canRollCombo()) return;

    state.hasRolled = true;
    const values = Array.from({ length: getRequiredComboPickCount() }, rollDie);
    const value = values.reduce((total, nextValue) => total + nextValue, 0);
    playRollSound();
    setMessage("Orakel rollt...");
    await rollWithSuspense(values);
    state.roundScore = value;
    finishComboRoll(values);
    return;
  }

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

  triggerSpecialMoment(values, {
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
  setMessage("KI denkt kurz nach...");
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
  window.clearTimeout(comboComputerTimer);
  comboComputerTimer = undefined;
  hideWinnerOverlay();
  rulesLockedByRematch = keepRulesLocked;
  resetComboState();
  state.humanScore = 0;
  state.computerScore = 0;
  state.roundScore = 0;
  state.turnScore = 0;
  state.currentPlayer = startPlayer;
  state.isComputerThinking = false;
  state.isRolling = false;
  state.isGameOver = false;
  state.hasRolled = false;
  state.goldAwarded = false;
  state.lastGoldReward = 0;
  dieFace.dataset.value = "1";
  dieFaceTwo.dataset.value = "1";
  rollButton.classList.remove("rolling", "shake");
  rollButton.setAttribute("aria-label", "Würfeln");
  setMessage(isComboMode() ? getComboStartMessage() : getStartMessage());
  render();

  if (isComboMode() && gameMode === "single" && comboState.currentSelector === "computer") {
    autoSelectComboForComputer();
  } else if (!isComboMode() && gameMode === "single" && state.currentPlayer === "computer") {
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
  return gameMode === "single" ? "KI" : opponentName;
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
    awardHumanWinGold();
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
    awardHumanWinGold();
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
  return !state.hasRolled && !hasComboSelectionStarted() && !state.isRolling && !state.isGameOver && !state.isComputerThinking;
}

function setStartPlayer(player) {
  if (!canChooseStartPlayer()) return;

  clearComputerStartTimer();
  window.clearTimeout(comboComputerTimer);
  comboComputerTimer = undefined;
  startPlayer = player === "computer" ? "computer" : "human";
  state.currentPlayer = startPlayer;

  if (isComboMode()) {
    resetComboState();
    setMessage(getComboStartMessage());
  } else {
    setMessage(`Startspieler: ${getCurrentPlayerName()}.`);
  }
  render();

  if (isComboMode() && gameMode === "single" && comboState.currentSelector === "computer") {
    autoSelectComboForComputer();
  } else if (gameMode === "single" && state.currentPlayer === "computer") {
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

function setGameVariant(nextVariant) {
  if (areRuleControlsLocked()) return;

  gameVariant = nextVariant === "combo" ? "combo" : "standard";
  localStorage.setItem("wuerfelduell-game-variant", gameVariant);
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

function playShopPurchaseSound() {
  if (!soundEnabled) return;

  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  [740, 980, 1240, 1560].forEach((frequency, index) => {
    playTone(frequency, now + index * 0.045, 0.075, 0.038 - index * 0.004, "triangle");
  });
  playTone(260, now + 0.015, 0.12, 0.024, "sine");
}

function setMenuOpen(shell, trigger, isOpen) {
  if (!shell || !trigger) return;

  shell.classList.toggle("menu-open", isOpen);
  trigger.setAttribute("aria-expanded", String(isOpen));
}

function closePanels() {
  setMenuOpen(menuShell, menuTrigger, false);
  setMenuOpen(shopShell, shopTrigger, false);
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

loadGold();
loadShopState();

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

const savedGameVariant = localStorage.getItem("wuerfelduell-game-variant");
setGameVariant(savedGameVariant === "combo" ? "combo" : "standard");

const savedDiceCount = Number(localStorage.getItem("wuerfelduell-dice-count"));
if (savedDiceCount === 2) {
  diceCount = 2;
}
if (isComboMode()) {
  setMessage(getComboStartMessage());
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
standardVariantButton?.addEventListener("click", () => {
  playClickSound();
  setGameVariant("standard");
});
comboVariantButton?.addEventListener("click", () => {
  playClickSound();
  setGameVariant("combo");
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
comboDiceGrid?.addEventListener("click", (event) => {
  const button = event.target.closest(".combo-die-button");
  if (!button) return;
  selectComboNumber(Number(button.dataset.comboValue));
});
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
shopTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  playClickSound();
  togglePanel(shopShell, shopTrigger);
});
shopShell?.addEventListener("click", (event) => {
  event.stopPropagation();
});
shopItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  playClickSound();
  if (button.dataset.action === "buy") {
    buySkin(button.dataset.skinId);
  } else if (button.dataset.action === "select") {
    selectSkin(button.dataset.skinId);
  }
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
  if (!menuShell?.contains(event.target) && !shopShell?.contains(event.target) && !infoShell?.contains(event.target)) {
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
    navigator.serviceWorker.register(`service-worker.js?v=${APP_VERSION}`).then((registration) => registration.update()).catch(() => {});
  });
}
