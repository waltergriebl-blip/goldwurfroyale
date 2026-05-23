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
const DEFAULT_OWNED_SKINS = ["gold"];
const DICE_PURCHASE_RESET_KEY = "goldwurf-royale-dice-purchases-reset-v1";
let ownedSkins = new Set(DEFAULT_OWNED_SKINS);
let activeSkin = "gold";
const DEFAULT_AVATAR_SKIN = "standard-gold";
const AVATAR_PURCHASE_RESET_KEY = "goldwurf-royale-avatar-purchases-reset-v1";
let ownedAvatarSkins = new Set([DEFAULT_AVATAR_SKIN]);
let activeAvatarSkin = DEFAULT_AVATAR_SKIN;
const DEFAULT_AUDIO_TRACK = "classic";
const DEFAULT_OWNED_AUDIO_TRACKS = [DEFAULT_AUDIO_TRACK];
const DICE_ROLL_SOUND_URL = `assets/wuerfel_sound/dice-roll.mp3?v=${APP_VERSION}`;
const PRELOADED_VERSION_KEY = "goldwurf-royale-preloaded-version";
const PRELOAD_VERSION = APP_VERSION || "dev";
const WELCOME_READY_TEXT = "Update erfolgreich geladen. Viel Spaß.";
const WELCOME_READY_HTML = '<span class="welcome-status-line">Update erfolgreich geladen.</span><span class="welcome-status-line">Viel Spaß.</span>';
const DRAW_GOLD_REWARD = 25;
let ownedAudioTracks = new Set(DEFAULT_OWNED_AUDIO_TRACKS);
let activeAudioTrack = DEFAULT_AUDIO_TRACK;
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
  perfectThrowCandidatePlayer: null,
  perfectThrowNeededValue: 0,
  perfectThrowReady: false,
  perfectThrowSpent: false,
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
    name: "Standard Goldw\u00fcrfel",
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
    id: "starfrost",
    name: "Sternenfrost",
    rarity: "Legendary",
    price: 150,
    description: "Gefrorenes Sternenlicht in blauem Kristall.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 20% 20%, rgba(160, 245, 255, 0.95), transparent 0 16%, transparent 34%), radial-gradient(circle at 80% 20%, rgba(160, 245, 255, 0.9), transparent 0 15%, transparent 32%), radial-gradient(circle at 20% 80%, rgba(130, 235, 255, 0.85), transparent 0 15%, transparent 32%), radial-gradient(circle at 80% 80%, rgba(130, 235, 255, 0.9), transparent 0 16%, transparent 34%), radial-gradient(circle at 50% 50%, rgba(45, 196, 255, 0.26), transparent 0 28%, transparent 56%), linear-gradient(145deg, #102d45 0%, #061827 42%, #05283e 68%, #8eeeff 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ecfbff, #4edfff 52%, #062437 100%)",
      glow: "rgba(95, 223, 255, 0.66)",
      text: "#d7f8ff",
    },
    assetRef: "assets/skins/starfrost.png",
    useImageAsset: true,
  },
  {
    id: "glutkern",
    name: "Glutkern",
    rarity: "Legendary",
    price: 150,
    description: "Ein feuriger Kristallwürfel mit flüssiger Lava-Aura.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 20% 20%, rgba(255, 207, 82, 0.95), transparent 0 16%, transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 145, 20, 0.9), transparent 0 15%, transparent 32%), radial-gradient(circle at 20% 80%, rgba(255, 174, 37, 0.85), transparent 0 15%, transparent 32%), radial-gradient(circle at 80% 80%, rgba(255, 126, 14, 0.9), transparent 0 16%, transparent 34%), radial-gradient(circle at 50% 50%, rgba(255, 91, 0, 0.34), transparent 0 28%, transparent 56%), linear-gradient(145deg, #3b0b02 0%, #170503 42%, #5b1605 68%, #ff8a12 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff3c2, #ff8a12 52%, #3b0900 100%)",
      glow: "rgba(255, 105, 10, 0.68)",
      text: "#ffe1a8",
    },
    assetRef: "assets/skins/glutkern.png",
    useImageAsset: true,
  },
  {
    id: "kronenglut",
    name: "Kronenglut",
    rarity: "Legendary",
    price: 150,
    description: "Goldene Dornen, Sternenfunken und königliche Glut.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 50% 18%, rgba(255, 224, 116, 0.88), transparent 0 18%, transparent 38%), radial-gradient(circle at 50% 50%, rgba(255, 153, 18, 0.32), transparent 0 30%, transparent 58%), linear-gradient(145deg, #3a1604 0%, #120704 42%, #5a2506 70%, #ffc449 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff5c8, #ffb21e 52%, #3a1200 100%)",
      glow: "rgba(255, 178, 30, 0.7)",
      text: "#ffe6a8",
    },
    assetRef: "assets/skins/kronenglut.png",
    useImageAsset: true,
  },
  {
    id: "drachenasche",
    name: "Drachenasche",
    rarity: "Legendary",
    price: 150,
    description: "Schwarze Drachenschuppen und brodelnde Lava-Risse.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 20% 24%, rgba(255, 83, 12, 0.65), transparent 0 18%, transparent 38%), radial-gradient(circle at 80% 24%, rgba(255, 83, 12, 0.65), transparent 0 18%, transparent 38%), radial-gradient(circle at 50% 50%, rgba(255, 45, 8, 0.28), transparent 0 32%, transparent 60%), linear-gradient(145deg, #1a0804 0%, #070303 44%, #4b1006 72%, #ff4b12 100%)",
      pip: "radial-gradient(circle at 34% 28%, #ffe2b6, #ff5a13 52%, #290300 100%)",
      glow: "rgba(255, 74, 18, 0.72)",
      text: "#ffd2a8",
    },
    assetRef: "assets/skins/drachenasche.png",
    useImageAsset: true,
  },
  {
    id: "astrallicht",
    name: "Astrallicht",
    rarity: "Legendary",
    price: 150,
    description: "Kosmisches Eis mit goldenen Sternenflammen.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 18% 20%, rgba(255, 200, 86, 0.82), transparent 0 18%, transparent 36%), radial-gradient(circle at 82% 20%, rgba(255, 200, 86, 0.82), transparent 0 18%, transparent 36%), radial-gradient(circle at 50% 50%, rgba(104, 191, 255, 0.28), transparent 0 30%, transparent 58%), linear-gradient(145deg, #0f1728 0%, #05070d 44%, #1c2b42 70%, #f5f8ff 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff8df, #8bcfff 50%, #07111f 100%)",
      glow: "rgba(161, 212, 255, 0.66)",
      text: "#edf7ff",
    },
    assetRef: "assets/skins/astrallicht.png",
    useImageAsset: true,
  },
  {
    id: "himmelskrone",
    name: "Himmelskrone",
    rarity: "Legendary",
    price: 150,
    description: "Strahlender Diamantglanz in königlichem Gold.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 50% 22%, rgba(255, 255, 255, 0.94), transparent 0 20%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(255, 222, 114, 0.34), transparent 0 32%, transparent 60%), linear-gradient(145deg, #fffaf0 0%, #f6dda0 38%, #dba83a 68%, #5f3605 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fffdf4, #ffd65f 50%, #5b3100 100%)",
      glow: "rgba(255, 216, 95, 0.68)",
      text: "#4d2b00",
    },
    assetRef: "assets/skins/himmelskrone.png",
    useImageAsset: true,
  },
  {
    id: "meereskrone",
    name: "Meereskrone",
    rarity: "Legendary",
    price: 150,
    description: "Tiefsee-Kristall mit goldener Krone und Wasserwirbeln.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 50% 20%, rgba(66, 210, 255, 0.82), transparent 0 20%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(20, 159, 210, 0.34), transparent 0 32%, transparent 60%), linear-gradient(145deg, #082332 0%, #031017 42%, #0f4f68 70%, #ffbc4a 100%)",
      pip: "radial-gradient(circle at 34% 28%, #f7fdff, #47d7ff 50%, #032434 100%)",
      glow: "rgba(72, 213, 255, 0.68)",
      text: "#dff9ff",
    },
    assetRef: "assets/skins/meereskrone.png",
    useImageAsset: true,
  },
  {
    id: "goldmatrix",
    name: "Goldmatrix",
    rarity: "Legendary",
    price: 250,
    description: "Schwarzer Goldrahmen mit funkelnden Matrix-Kristallen.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 50% 20%, rgba(255, 221, 92, 0.88), transparent 0 18%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(218, 156, 42, 0.3), transparent 0 32%, transparent 60%), linear-gradient(145deg, #1c1308 0%, #080604 42%, #6b450b 72%, #ffd45e 100%)",
      pip: "radial-gradient(circle at 34% 28%, #fff8d7, #ffc52e 50%, #2e1a02 100%)",
      glow: "rgba(255, 194, 46, 0.7)",
      text: "#ffe8a8",
    },
    assetRef: "assets/skins/goldmatrix.png",
    useImageAsset: true,
  },
  {
    id: "smaragdzahn",
    name: "Smaragdzahn",
    rarity: "Legendary",
    price: 250,
    description: "Smaragdschlangen, goldene Fassung und lebendige Wasserfunken.",
    unlockCondition: { type: "none" },
    preview: {
      background: "radial-gradient(circle at 50% 20%, rgba(44, 226, 159, 0.82), transparent 0 18%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(14, 150, 103, 0.34), transparent 0 32%, transparent 60%), linear-gradient(145deg, #072a1e 0%, #03120d 42%, #0e6048 70%, #ffc45a 100%)",
      pip: "radial-gradient(circle at 34% 28%, #f6fff7, #2ce29f 50%, #031f17 100%)",
      glow: "rgba(44, 226, 159, 0.68)",
      text: "#dfffee",
    },
    assetRef: "assets/skins/smaragdzahn.png",
    useImageAsset: true,
  },
];

const AVATAR_SKINS = [
  {
    id: "standard-gold",
    name: "Standard Gold",
    assetPath: "assets/avatars/avatar_standard_gold.svg",
    price: 0,
    description: "Ein schlichtes goldenes Feld als klassischer Standard-Avatar.",
  },
  {
    id: "sun-king",
    name: "Sonnenk\u00f6nig",
    assetPath: "assets/avatars/avatar_sun_king.png",
    price: 150,
    description: "Ein erhabener Herrscher aus Licht, Gold und göttlicher Glut.",
  },
  {
    id: "demon",
    name: "D\u00e4monenf\u00fcrst",
    assetPath: "assets/avatars/avatar_demon.png",
    price: 250,
    description: "Ein finsterer Royal-Avatar im goldenen Höllenfeuer.",
  },
  {
    id: "ice-skeleton",
    name: "Eisskelett",
    assetPath: "assets/avatars/avatar_ice_skeleton.png",
    price: 250,
    description: "Ein frostiger Knochenkönig aus Eis, Schatten und blauer Magie.",
  },
  {
    id: "card-master",
    name: "Kartenbaron",
    assetPath: "assets/avatars/avatar_card_master.png",
    price: 250,
    description: "Ein eleganter Glücksritter mit Karten, Würfeln und goldener Aura.",
  },
  {
    id: "fortune-dealer",
    name: "Gl\u00fccksdealer",
    assetPath: "assets/avatars/avatar_fortune_dealer.png",
    price: 250,
    description: "Ein charmanter Spieltisch-Meister mit Karten, Chips und sicherem Blick.",
  },
  {
    id: "dice-dealer",
    name: "W\u00fcrfeldealer",
    assetPath: "assets/avatars/avatar_dice_dealer.png",
    price: 250,
    description: "Der KI-Gegner am goldenen Spieltisch, mit Würfeln und Siegesblick.",
  },
  {
    id: "demon-gambler",
    name: "D\u00e4monenspieler",
    assetPath: "assets/avatars/avatar_demon_gambler.png",
    price: 250,
    description: "Ein finsterer Würfelherr mit roten Augen, Feuer und dämonischem Glück.",
  },
  {
    id: "meerjungfrauen",
    name: "Meeresköniginnen",
    assetPath: "assets/avatars/avatar_meerjungfrauen.png",
    price: 250,
    description: "Zwei royale Sirenen aus Gold, Smaragdlicht und Tiefseezauber.",
  },
  {
    id: "lichtkoenigin",
    name: "Lichtkönigin",
    assetPath: "assets/avatars/avatar_lichtkoenigin.png",
    price: 250,
    description: "Eine strahlende Königin aus Gold, Licht und eisblauen Kristallen.",
  },
];

const COMPUTER_AVATAR_SKIN_ID = "dice-dealer";

const AUDIO_TRACKS = [
  {
    id: "classic",
    name: "Classic",
    assetPath: "assets/music/jazz-casino.mp3",
    price: 0,
    description: "Der klassische Hintergrundtrack von Goldwurf Royale.",
  },
  {
    id: "black-iron-sky",
    name: "Black Iron Sky",
    assetPath: "assets/music/black-iron-sky.mp3",
    price: 100,
    description: "Dunkle Spannung fuer dramatische Runden am Spieltisch.",
  },
  {
    id: "black-velvet-rain",
    name: "Black Velvet Rain",
    assetPath: "assets/music/black-velvet-rain.mp3",
    price: 100,
    description: "Ein samtiger Regen aus Casino-Stimmung und Nachtglanz.",
  },
  {
    id: "ashen-oath",
    name: "Ashen Oath",
    assetPath: "assets/music/ashen-oath.mp3",
    price: 100,
    description: "Ein dunkler Schwur aus Asche, Spannung und Spieltisch-Drama.",
  },
  {
    id: "high-roller",
    name: "High Roller",
    assetPath: "assets/music/high-roller.mp3",
    price: 100,
    description: "Ein schwungvoller Track fuer riskante Wuerfe und grosse Gewinne.",
  },
];

const imagePreloadPromises = new Map();

function preloadImageAsset(src, options = {}) {
  if (!src || typeof Image !== "function") return Promise.resolve(src);
  if (imagePreloadPromises.has(src)) return imagePreloadPromises.get(src);

  const { swallowErrors = true } = options;
  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";
  image.src = src;

  const loadPromise = (image.decode ? image.decode() : new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  }))
    .catch((error) => {
      if (!swallowErrors) throw error;
    })
    .then(() => src);

  imagePreloadPromises.set(src, loadPromise);
  return loadPromise;
}

function preloadImageAssets(sources = []) {
  sources.filter(Boolean).forEach((src) => preloadImageAsset(src));
}

function preloadWelcomeImageAsset(src) {
  if (!src || typeof Image !== "function") return Promise.resolve(src);
  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`Asset-Timeout: ${src}`));
    }, 15000);
    const finish = (callback) => {
      window.clearTimeout(timeout);
      callback(src);
    };

    image.onload = () => {
      if (image.decode) {
        image.decode().catch(() => {}).then(() => finish(resolve));
      } else {
        finish(resolve);
      }
    };
    image.onerror = () => finish(() => reject(new Error(`Asset konnte nicht geladen werden: ${src}`)));
    image.src = src;
  });
}

function getUniqueSources(sources = []) {
  return Array.from(new Set(sources.filter(Boolean)));
}

function getImageSkinAssets() {
  return SHOP_SKINS.filter((skin) => skin.useImageAsset && skin.assetRef).map((skin) => skin.assetRef);
}

function getWelcomePreloadImageAssets() {
  return getUniqueSources([
    "assets/table-bg.png",
    "assets/player-bg.png",
    ...getImageSkinAssets(),
    ...AVATAR_SKINS.map((skin) => skin.assetPath),
    "icon-192.png",
    "icon-512.png",
    "apple-touch-icon.png",
    "favicon-32.png",
  ]);
}

function getWelcomeCacheWarmupAssets() {
  return getUniqueSources([
    DICE_ROLL_SOUND_URL,
    ...AUDIO_TRACKS.map((track) => `${track.assetPath}?v=${APP_VERSION}`),
  ]);
}

function preloadStartupImageAssets() {
  const activeDiceSkin = getSkinById(activeSkin);
  preloadImageAssets([
    "assets/table-bg.png",
    "assets/player-bg.png",
    activeDiceSkin?.useImageAsset ? activeDiceSkin.assetRef : null,
    getAvatarSkinById(activeAvatarSkin)?.assetPath,
    getAvatarSkinById(COMPUTER_AVATAR_SKIN_ID)?.assetPath,
  ]);
}

function preloadShopImageAssets() {
  preloadImageAssets([
    ...getImageSkinAssets(),
    ...AVATAR_SKINS.map((skin) => skin.assetPath),
  ]);
}

function warmupCacheAsset(src) {
  if (!src || typeof fetch !== "function") return Promise.resolve(src);
  return fetch(src, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Asset konnte nicht geladen werden: ${src}`);
      return src;
    });
}

function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker
    .register(`service-worker.js?v=${APP_VERSION}`)
    .then((registration) => {
      registration.update().catch(() => {});
      return registration;
    })
    .catch(() => null);
}

const serviceWorkerRegistrationPromise = registerAppServiceWorker();

function prepareImageElement(image, src) {
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.loading = "eager";
  preloadImageAsset(src);
}

function getSkinById(skinId) {
  return SHOP_SKINS.find((skin) => skin.id === skinId);
}

function getAvatarSkinById(skinId) {
  return AVATAR_SKINS.find((skin) => skin.id === skinId);
}

function getAudioTrackById(trackId) {
  return AUDIO_TRACKS.find((track) => track.id === trackId);
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
  if (!skin?.unlockCondition || skin.unlockCondition.type === "none") return "Sofort verf\u00fcgbar";
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
  if (skin.useImageAsset && skin.assetRef) {
    element.style.setProperty("--skin-image", `url("${skin.assetRef}")`);
  } else {
    element.style.removeProperty("--skin-image");
  }
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
const shopSkinsCategory = document.querySelector("#shopSkinsCategory");
const shopItems = document.querySelector("#shopItems");
const jukeboxCategory = document.querySelector("#jukeboxCategory");
const jukeboxItems = document.querySelector("#jukeboxItems");
const avatarSkinsCategory = document.querySelector("#avatarSkinsCategory");
const avatarShopItems = document.querySelector("#avatarShopItems");
const goldBalance = document.querySelector("#goldBalance");
const goldGainToast = document.querySelector("#goldGainToast");
const infoShell = document.querySelector("#infoShell");
const infoTrigger = document.querySelector("#infoTrigger");
const appVersion = document.querySelector("#appVersion");
const impressumLink = document.querySelector("#impressumLink");
const privacyLink = document.querySelector("#privacyLink");
const legalOverlay = document.querySelector("#legalOverlay");
const legalDialog = document.querySelector(".legal-dialog");
const legalTitle = document.querySelector("#legalTitle");
const legalKicker = document.querySelector("#legalKicker");
const legalContent = document.querySelector("#legalContent");
const legalCloseButton = document.querySelector("#legalCloseButton");
const legalPrimaryCloseButton = document.querySelector("#legalPrimaryCloseButton");
const humanAvatarFrame = document.querySelector("#humanAvatarFrame");
const humanAvatarImage = document.querySelector("#humanAvatarImage");
const computerAvatarFrame = document.querySelector("#computerAvatarFrame");
const computerAvatarImage = document.querySelector("#computerAvatarImage");
const welcomeLoader = document.querySelector("#welcomeLoader");
const welcomeLoaderStatus = document.querySelector("#welcomeLoaderStatus");
const welcomeLoaderProgress = document.querySelector("#welcomeLoaderProgress");
const welcomeLoaderPercent = document.querySelector("#welcomeLoaderPercent");
const welcomeLoaderButton = document.querySelector("#welcomeLoaderButton");
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

function setWelcomeLoaderProgress(completed, total, statusText) {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 100;
  if (welcomeLoaderProgress) {
    welcomeLoaderProgress.style.width = `${progress}%`;
  }
  if (welcomeLoaderPercent) {
    welcomeLoaderPercent.textContent = `${progress}%`;
  }
  if (welcomeLoaderStatus && statusText) {
    welcomeLoaderStatus.textContent = statusText;
  }
}

function hideWelcomeLoader() {
  if (!welcomeLoader) return;
  welcomeLoader.classList.add("is-hidden");
  welcomeLoader.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    welcomeLoader.hidden = true;
  }, 260);
}

function markWelcomeLoaderReady(statusText) {
  setWelcomeLoaderProgress(1, 1, statusText);
  if (welcomeLoaderStatus && statusText === WELCOME_READY_TEXT) {
    welcomeLoaderStatus.innerHTML = WELCOME_READY_HTML;
  }
  if (welcomeLoaderButton) {
    welcomeLoaderButton.disabled = false;
    welcomeLoaderButton.textContent = "Jetzt spielen";
    welcomeLoaderButton.focus({ preventScroll: true });
  }
}

function shouldShowWelcomeLoader() {
  try {
    return localStorage.getItem(PRELOADED_VERSION_KEY) !== PRELOAD_VERSION;
  } catch {
    return true;
  }
}

function rememberWelcomePreloadComplete() {
  try {
    localStorage.setItem(PRELOADED_VERSION_KEY, PRELOAD_VERSION);
  } catch {
    // Private Browser-Modi koennen localStorage blockieren.
  }
}

function warmupWelcomeCacheAssets() {
  getWelcomeCacheWarmupAssets().forEach((src) => {
    warmupCacheAsset(src).catch(() => {});
  });
}

function startWelcomePreload() {
  if (!welcomeLoader) {
    preloadShopImageAssets();
    warmupWelcomeCacheAssets();
    return;
  }

  welcomeLoaderButton?.addEventListener("click", hideWelcomeLoader, { once: true });

  if (!shouldShowWelcomeLoader()) {
    preloadShopImageAssets();
    warmupWelcomeCacheAssets();
    markWelcomeLoaderReady(WELCOME_READY_TEXT);
    return;
  }

  const imageAssets = getWelcomePreloadImageAssets();
  const total = imageAssets.length || 1;
  let completed = 0;
  let failed = 0;
  setWelcomeLoaderProgress(0, total, "Lade Spielgrafiken und Skins...");

  const imageLoads = imageAssets.map((src) => (
    preloadWelcomeImageAsset(src)
      .catch(() => {
        failed += 1;
      })
      .then(() => {
        completed += 1;
        setWelcomeLoaderProgress(
          completed,
          total,
          completed < total ? `Lade Inhalte ${completed} von ${total}...` : "Update wird abgeschlossen..."
        );
      })
  ));

  Promise.all(imageLoads)
    .then(() => serviceWorkerRegistrationPromise.catch(() => null))
    .then(() => {
      rememberWelcomePreloadComplete();
      warmupWelcomeCacheAssets();
      markWelcomeLoaderReady(WELCOME_READY_TEXT);
    });
}

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
  renderAvatarShop();
  renderJukebox();
}

function loadGold() {
  const savedGold = Number(localStorage.getItem("goldwurf-royale-gold"));
  gold = Number.isFinite(savedGold) && savedGold >= 0 ? Math.floor(savedGold) : 0;
  renderGold();
  renderJukebox();
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
  renderAvatarShop();
  renderJukebox();
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

function roundToNearest5(value) {
  return Math.round(value / 5) * 5;
}

function calculateHumanWinGold() {
  const baseReward = riskMode ? 50 : 25;
  const diceFactor = diceCount === 1 ? 1.5 : 1;
  const targetFactor = Math.max(1, Math.floor(winningScore / 10));
  const difficultyFactor = difficulty === "hard" ? 2 : 1;
  const gambleBonus = gambleMode ? 25 : 0;

  return roundToNearest5(baseReward * diceFactor * targetFactor * difficultyFactor + gambleBonus);
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

function resetPerfectThrowChance() {
  state.perfectThrowCandidatePlayer = null;
  state.perfectThrowNeededValue = 0;
  state.perfectThrowReady = false;
  state.perfectThrowSpent = false;
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

function awardDrawGold() {
  state.lastGoldReward += DRAW_GOLD_REWARD;
  addGold(DRAW_GOLD_REWARD, "draw");
  return DRAW_GOLD_REWARD;
}

function loadShopState() {
  if (localStorage.getItem(DICE_PURCHASE_RESET_KEY) !== "done") {
    localStorage.removeItem("goldwurf-royale-owned-skins");
    localStorage.removeItem("goldwurf-royale-active-skin");
    localStorage.setItem(DICE_PURCHASE_RESET_KEY, "done");
  }

  try {
    const savedOwned = JSON.parse(localStorage.getItem("goldwurf-royale-owned-skins") || "[]");
    if (Array.isArray(savedOwned)) {
      ownedSkins = new Set([...DEFAULT_OWNED_SKINS, ...savedOwned.filter((skinId) => getSkinById(skinId))]);
    }
  } catch {
    ownedSkins = new Set(DEFAULT_OWNED_SKINS);
  }

  const savedActiveSkin = localStorage.getItem("goldwurf-royale-active-skin");
  activeSkin = ownedSkins.has(savedActiveSkin) ? savedActiveSkin : "gold";
  saveShopState();
  const skin = getSkinById(activeSkin) || getSkinById("gold");
  preloadImageAsset(skin?.useImageAsset ? skin.assetRef : null).then(() => {
    if (activeSkin === skin?.id) applyActiveSkin();
  });
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
  preloadImageAsset(skin.useImageAsset ? skin.assetRef : null).then(() => {
    if (activeSkin === skin.id) applyActiveSkin();
  });
  renderGold();
  renderShop();
  renderAvatarShop();
  showGoldSpend(skin.price, skin.id);
  playShopPurchaseSound();
}

function selectSkin(skinId) {
  if (!ownedSkins.has(skinId)) return;

  const skin = getSkinById(skinId);
  activeSkin = skinId;
  saveShopState();
  preloadImageAsset(skin?.useImageAsset ? skin.assetRef : null).then(() => {
    if (activeSkin === skinId) {
      applyActiveSkin();
      renderShop();
    }
  });
}

function loadAvatarShopState() {
  if (localStorage.getItem(AVATAR_PURCHASE_RESET_KEY) !== "done") {
    localStorage.removeItem("goldwurf-royale-owned-avatar-skins");
    localStorage.removeItem("goldwurf-royale-active-avatar-skin");
    localStorage.setItem(AVATAR_PURCHASE_RESET_KEY, "done");
  }

  try {
    const savedOwned = JSON.parse(localStorage.getItem("goldwurf-royale-owned-avatar-skins") || "[]");
    if (Array.isArray(savedOwned)) {
      ownedAvatarSkins = new Set([DEFAULT_AVATAR_SKIN, ...savedOwned.filter((skinId) => getAvatarSkinById(skinId))]);
    }
  } catch {
    ownedAvatarSkins = new Set([DEFAULT_AVATAR_SKIN]);
  }

  const savedActiveAvatar = localStorage.getItem("goldwurf-royale-active-avatar-skin");
  activeAvatarSkin = ownedAvatarSkins.has(savedActiveAvatar) ? savedActiveAvatar : DEFAULT_AVATAR_SKIN;
  saveAvatarShopState();
  const avatarSkin = getAvatarSkinById(activeAvatarSkin) || getAvatarSkinById(DEFAULT_AVATAR_SKIN);
  preloadImageAsset(avatarSkin?.assetPath).then(() => {
    if (activeAvatarSkin === avatarSkin?.id) applyActiveAvatar();
  });
  const computerSkin = getAvatarSkinById(COMPUTER_AVATAR_SKIN_ID);
  preloadImageAsset(computerSkin?.assetPath).then(() => applyComputerAvatar());
  renderAvatarShop();
}

function saveAvatarShopState() {
  localStorage.setItem("goldwurf-royale-owned-avatar-skins", JSON.stringify(Array.from(ownedAvatarSkins)));
  localStorage.setItem("goldwurf-royale-active-avatar-skin", activeAvatarSkin);
}

function buyAvatarSkin(skinId) {
  const skin = getAvatarSkinById(skinId);
  if (!skin || ownedAvatarSkins.has(skin.id) || gold < skin.price) return;

  gold -= skin.price;
  ownedAvatarSkins.add(skin.id);
  activeAvatarSkin = skin.id;
  saveGold();
  saveAvatarShopState();
  preloadImageAsset(skin.assetPath).then(() => {
    if (activeAvatarSkin === skin.id) applyActiveAvatar();
  });
  renderGold();
  renderAvatarShop();
  showAvatarGoldSpend(skin.price, skin.id);
  playShopPurchaseSound();
}

function selectAvatarSkin(skinId) {
  if (!ownedAvatarSkins.has(skinId)) return;

  const skin = getAvatarSkinById(skinId);
  activeAvatarSkin = skinId;
  saveAvatarShopState();
  preloadImageAsset(skin?.assetPath).then(() => {
    if (activeAvatarSkin === skinId) {
      applyActiveAvatar();
      renderAvatarShop();
    }
  });
}

function loadJukeboxState() {
  try {
    const savedOwned = JSON.parse(localStorage.getItem("goldwurf-royale-owned-audio-tracks") || "[]");
    if (Array.isArray(savedOwned)) {
      ownedAudioTracks = new Set([
        ...DEFAULT_OWNED_AUDIO_TRACKS,
        ...savedOwned.filter((trackId) => getAudioTrackById(trackId)),
      ]);
    }
  } catch {
    ownedAudioTracks = new Set(DEFAULT_OWNED_AUDIO_TRACKS);
  }

  const savedActiveAudio = localStorage.getItem("goldwurf-royale-active-audio");
  activeAudioTrack = ownedAudioTracks.has(savedActiveAudio) ? savedActiveAudio : DEFAULT_AUDIO_TRACK;
  saveJukeboxState();
  renderJukebox();
}

function saveJukeboxState() {
  localStorage.setItem("goldwurf-royale-owned-audio-tracks", JSON.stringify(Array.from(ownedAudioTracks)));
  localStorage.setItem("goldwurf-royale-active-audio", activeAudioTrack);
}

function buyAudioTrack(trackId) {
  const track = getAudioTrackById(trackId);
  if (!track || ownedAudioTracks.has(track.id) || gold < track.price) return;

  gold -= track.price;
  ownedAudioTracks.add(track.id);
  activeAudioTrack = track.id;
  saveGold();
  saveJukeboxState();
  resetBackgroundMusicTrack();
  renderGold();
  renderJukebox();
  showJukeboxGoldSpend(track.price, track.id);
  playShopPurchaseSound();
  if (musicEnabled) {
    startBackgroundMusic(true);
  }
}

function selectAudioTrack(trackId) {
  if (!ownedAudioTracks.has(trackId) || activeAudioTrack === trackId) return;

  activeAudioTrack = trackId;
  saveJukeboxState();
  resetBackgroundMusicTrack();
  renderJukebox();
  if (musicEnabled) {
    startBackgroundMusic(true);
  }
}

function renderShop(force = false) {
  if (!shopItems) return;
  if (!force && !shopShell?.classList.contains("menu-open") && shopItems.childElementCount === 0) return;

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
    if (skin.useImageAsset && skin.assetRef) {
      preview.classList.add("skin-preview-image");
      const image = document.createElement("img");
      prepareImageElement(image, skin.assetRef);
      preview.append(image);
    } else {
      for (let index = 0; index < 5; index += 1) {
        preview.append(document.createElement("i"));
      }
    }

    const meta = document.createElement("span");
    meta.className = "shop-item-meta shop-item-inline-price";
    meta.textContent = isOwned ? "Freigeschaltet" : `${skin.price} Gold`;

    const title = document.createElement("strong");
    title.className = `shop-item-title rarity-${skin.rarity.toLowerCase()}`;
    title.textContent = skin.name;

    const action = document.createElement("button");
    action.type = "button";
    action.dataset.skinId = skin.id;
    if (isActive) {
      action.textContent = "Ausgew\u00e4hlt";
      action.disabled = true;
    } else if (isOwned) {
      action.textContent = "Ausw\u00e4hlen";
      action.dataset.action = "select";
    } else if (!isUnlocked) {
      action.textContent = getUnlockText(skin);
      action.disabled = true;
    } else if (canBuy) {
      action.textContent = "Kaufen";
      action.dataset.action = "buy";
    } else {
      action.textContent = `Noch ${skin.price - gold} Gold`;
      action.classList.add("shop-shortfall-button");
      action.disabled = true;
    }

    item.append(preview, meta, title, action);
    shopItems.append(item);
  });
}

function renderAvatarShop(force = false) {
  if (!avatarShopItems) return;
  if (!force && !shopShell?.classList.contains("menu-open") && avatarShopItems.childElementCount === 0) return;

  avatarShopItems.innerHTML = "";
  AVATAR_SKINS.forEach((skin) => {
    const isOwned = ownedAvatarSkins.has(skin.id);
    const isActive = activeAvatarSkin === skin.id;
    const canBuy = gold >= skin.price;
    const item = document.createElement("article");
    item.className = "shop-item avatar-shop-item";
    item.classList.toggle("owned", isOwned);
    item.classList.toggle("active", isActive);

    const preview = document.createElement("span");
    preview.className = "avatar-preview-frame";
    preview.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    prepareImageElement(image, skin.assetPath);
    preview.append(image);

    const meta = document.createElement("span");
    meta.className = "shop-item-meta shop-item-inline-price";
    meta.textContent = isOwned ? "Freigeschaltet" : `${skin.price} Gold`;

    const title = document.createElement("strong");
    title.className = "shop-item-title rarity-legendary";
    title.textContent = skin.name;

    const action = document.createElement("button");
    action.type = "button";
    action.dataset.avatarSkinId = skin.id;
    if (isActive) {
      action.textContent = "Ausgew\u00e4hlt";
      action.disabled = true;
    } else if (isOwned) {
      action.textContent = "Ausw\u00e4hlen";
      action.dataset.avatarAction = "select";
    } else if (canBuy) {
      action.textContent = "Kaufen";
      action.dataset.avatarAction = "buy";
    } else {
      action.textContent = `Noch ${skin.price - gold} Gold`;
      action.classList.add("shop-shortfall-button");
      action.disabled = true;
    }

    item.append(preview, meta, title, action);
    avatarShopItems.append(item);
  });
}

function renderJukebox(force = false) {
  if (!jukeboxItems) return;
  if (!force && !shopShell?.classList.contains("menu-open") && jukeboxItems.childElementCount === 0) return;

  jukeboxItems.innerHTML = "";
  AUDIO_TRACKS.forEach((track) => {
    const isOwned = ownedAudioTracks.has(track.id);
    const isActive = activeAudioTrack === track.id;
    const canBuy = gold >= track.price;
    const item = document.createElement("article");
    item.className = "shop-item jukebox-shop-item";
    item.classList.toggle("owned", isOwned);
    item.classList.toggle("active", isActive);

    const preview = document.createElement("span");
    preview.className = "jukebox-preview-frame";
    preview.setAttribute("aria-hidden", "true");
    preview.textContent = "\u266a";

    const price = document.createElement("span");
    price.className = "shop-item-meta shop-item-inline-price";
    price.textContent = isOwned ? "Freigeschaltet" : `${track.price} Gold`;

    const title = document.createElement("strong");
    title.className = "shop-item-title";
    title.textContent = track.name;

    const action = document.createElement("button");
    action.type = "button";
    action.dataset.audioTrackId = track.id;
    if (isActive) {
      action.textContent = "Ausgew\u00e4hlt";
      action.disabled = true;
    } else if (isOwned) {
      action.textContent = "Ausw\u00e4hlen";
      action.dataset.audioAction = "select";
    } else if (canBuy) {
      action.textContent = "Kaufen";
      action.dataset.audioAction = "buy";
    } else {
      action.textContent = `Noch ${track.price - gold} Gold`;
      action.disabled = true;
    }

    item.append(preview, price, title, action);
    jukeboxItems.append(item);
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

function showAvatarGoldSpend(amount, skinId) {
  showGoldGain(-amount);

  if (!avatarShopItems) return;
  const item = avatarShopItems.querySelector(`[data-avatar-skin-id="${skinId}"]`)?.closest(".shop-item");
  if (!item) return;

  item.classList.remove("purchase-pop");
  void item.offsetWidth;
  item.classList.add("purchase-pop");
  window.setTimeout(() => item.classList.remove("purchase-pop"), 920);
}

function showJukeboxGoldSpend(amount, trackId) {
  showGoldGain(-amount);

  if (!jukeboxItems) return;
  const item = jukeboxItems.querySelector(`[data-audio-track-id="${trackId}"]`)?.closest(".shop-item");
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

function applyActiveAvatar() {
  const skin = getAvatarSkinById(activeAvatarSkin) || getAvatarSkinById(DEFAULT_AVATAR_SKIN);
  if (!skin) return;

  activeAvatarSkin = skin.id;
  if (humanAvatarImage) {
    prepareImageElement(humanAvatarImage, skin.assetPath);
  }
  humanAvatarFrame?.setAttribute("title", skin.name);
}

function applyComputerAvatar() {
  const skin = getAvatarSkinById(COMPUTER_AVATAR_SKIN_ID);
  if (!skin) return;

  if (computerAvatarImage) {
    prepareImageElement(computerAvatarImage, skin.assetPath);
  }
  computerAvatarFrame?.setAttribute("title", skin.name);
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

function countComboValue(selection, value) {
  return selection.filter((selectedValue) => selectedValue === value).length;
}

function formatComboSelection(selection) {
  return selection.length ? selection.slice().sort((a, b) => a - b).join(" + ") : "-";
}

function getComboPlayerName(player) {
  return player === "human" ? playerName : getOpponentName();
}

function getComboSelectionInstruction(player, required = getRequiredComboPickCount()) {
  const name = getComboPlayerName(player);
  const verb = name.trim().toLowerCase() === "du" ? "wählst" : "wählt";
  return `${name} ${verb} ${required} Zahl${required === 1 ? "" : "en"}.`;
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
    const humanPickCount = countComboValue(comboState.humanSelection, value);
    const computerPickCount = countComboValue(comboState.computerSelection, value);
    const maxPickCount = Math.max(humanPickCount, computerPickCount);
    const canSelect =
      !state.isGameOver &&
      !state.isRolling &&
      (comboState.phase === "select-human" || comboState.phase === "select-computer");
    button.classList.toggle("selected-human", isHumanSelected);
    button.classList.toggle("selected-computer", isComputerSelected);
    button.classList.toggle("selected-both", isHumanSelected && isComputerSelected);
    button.classList.toggle("selected-double", maxPickCount > 1);
    button.classList.toggle("current-selectable", canSelect);
    button.dataset.pickCount = maxPickCount > 1 ? String(maxPickCount) : "";
    button.disabled = !canSelect || (gameMode === "single" && comboState.currentSelector === "computer");
    button.setAttribute("aria-pressed", String(isHumanSelected || isComputerSelected));
  });
}

function getComboStartMessage() {
  return `Orakel: ${getComboSelectionInstruction(comboState.currentSelector)}`;
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

    comboState.computerSelection = Array.from({ length: getRequiredComboPickCount() }, rollDie).sort((a, b) => a - b);
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
    setMessage(getComboSelectionInstruction(nextSelector, required));
  }
}

function selectComboNumber(value) {
  if (!isComboMode() || state.isRolling || state.isGameOver) return;
  if (comboState.phase !== "select-human" && comboState.phase !== "select-computer") return;
  if (gameMode === "single" && comboState.currentSelector === "computer") return;

  const selection = getComboSelection(comboState.currentSelector);
  const required = getRequiredComboPickCount();
  const selectedCount = countComboValue(selection, value);
  if (required === 2 && selectedCount === 1 && selection.length < required) {
    selection.push(value);
    selection.sort((a, b) => a - b);
  } else if (selectedCount > 0) {
    selection.splice(selection.lastIndexOf(value), 1);
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
    setMessage(getComboSelectionInstruction("human"));
  } else if (comboState.phase === "select-computer" && gameMode === "multi") {
    setMessage(getComboSelectionInstruction("computer"));
  }
  render();
}

function selectionMatchesRoll(selection, values) {
  if (selection.length !== getRequiredComboPickCount()) return false;
  if (values.length !== getRequiredComboPickCount()) return false;

  const sortedSelection = selection.slice().sort((a, b) => a - b);
  const sortedValues = values.slice().sort((a, b) => a - b);
  return sortedSelection.every((value, index) => value === sortedValues[index]);
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
    const drawGoldReward = awardDrawGold();
    const totalDrawReward = humanGoldReward + drawGoldReward;
    setMessage(`Gewürfelt: ${formatRoll(values)}. Unentschieden. +${drawGoldReward} Gold.${humanGoldReward > 0 ? ` Dein Orakel war richtig: insgesamt +${totalDrawReward} Gold.` : ""}`);
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
    const reward = state.lastGoldReward;
    winnerGoldReward.hidden = reward <= 0;
    winnerGoldReward.textContent = `+${reward} Gold`;
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

  const delay = isRoyalMomentActive() ? 1600 : 0;
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
    perfectThrowHit = false,
  } = context;
  const rolledValues = Array.isArray(values) ? values : [];
  const isHumanMoment = currentPlayer === "human";
  const pointsLeft = winningScore - currentScore;
  const rollTotal = getRollTotal(rolledValues);
  const isRoyalRoll =
    (rolledValues.length === 1 && rolledValues[0] === 6) ||
    (rolledValues.length === 2 && rolledValues[0] === 6 && rolledValues[1] === 6);

  if (riskInvalid) {
    return { text: "RISIKO VERLOREN!", type: "dark" };
  }

  if (gambleSecured >= 20) {
    return { text: "GROSSER GAMBLE!", type: "gold", reward: isHumanMoment ? 50 : 0 };
  }

  if (isRoyalRoll && rollTotal <= pointsLeft) {
    return { text: "ROYAL WURF!", type: "gold", reward: isHumanMoment ? rolledValues.length * 50 : 0 };
  }

  if (
    winningScore === 10 &&
    rolledValues.length === 2 &&
    rollTotal === 10 &&
    currentScore === 0 &&
    scoreApplied &&
    nextScore === winningScore
  ) {
    return { text: "PERFEKTER WURF!", type: "gold", reward: isHumanMoment ? 50 : 0 };
  }

  if (
    perfectThrowHit
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

function getRollTotal(values = []) {
  return values.reduce((total, nextValue) => total + nextValue, 0);
}

function canPerfectThrowValueBeRolled(pointsLeft) {
  if (pointsLeft <= 0) return false;

  const effectiveDiceCount = getEffectiveDiceCountForPointsLeft(pointsLeft);
  const minimumValidRoll = riskMode ? effectiveDiceCount * 2 : effectiveDiceCount;
  const maximumValidRoll = effectiveDiceCount * 6;
  return pointsLeft >= minimumValidRoll && pointsLeft <= maximumValidRoll;
}

function updatePerfectThrowReadyForCurrentPlayer() {
  if (
    state.perfectThrowSpent ||
    !state.perfectThrowCandidatePlayer ||
    state.perfectThrowCandidatePlayer !== state.currentPlayer
  ) {
    return;
  }

  state.perfectThrowReady = true;
}

function registerPerfectThrowChance(currentPlayer, nextScore, scoreApplied) {
  if (
    state.perfectThrowSpent ||
    state.perfectThrowCandidatePlayer ||
    isComboMode() ||
    gambleMode ||
    difficulty !== "hard" ||
    !scoreApplied ||
    nextScore >= winningScore
  ) {
    return;
  }

  const pointsLeft = winningScore - nextScore;
  if (canPerfectThrowValueBeRolled(pointsLeft)) {
    state.perfectThrowCandidatePlayer = currentPlayer;
    state.perfectThrowNeededValue = pointsLeft;
    state.perfectThrowReady = false;
  } else {
    state.perfectThrowSpent = true;
  }
}

function consumePerfectThrowChance(values, context = {}) {
  if (
    state.perfectThrowSpent ||
    !state.perfectThrowReady ||
    state.perfectThrowCandidatePlayer !== context.currentPlayer
  ) {
    return false;
  }

  const hit =
    context.scoreApplied &&
    context.nextScore === winningScore &&
    getRollTotal(values) === state.perfectThrowNeededValue;

  state.perfectThrowReady = false;
  state.perfectThrowSpent = true;
  return hit;
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
  updatePerfectThrowReadyForCurrentPlayer();
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
  const rollingPlayer = state.currentPlayer;
  const values = Array.from({ length: getEffectiveDiceCount() }, rollDie);
  const value = values.reduce((total, nextValue) => total + nextValue, 0);
  playRollSound();
  setMessage(`${getCurrentPlayerName()} würfelt...`);
  await rollWithSuspense(values);
  state.roundScore = value;
  const currentScore = rollingPlayer === "human" ? state.humanScore : state.computerScore;
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
  } else if (rollingPlayer === "human") {
    state.humanScore = nextScore;
    scoreApplied = true;
    setMessage(`${playerName} hat ${formatRoll(values)} gewürfelt. ${getOpponentName()} ist dran.`);
  } else {
    state.computerScore = nextScore;
    scoreApplied = true;
    setMessage(`${getOpponentName()} würfelt ${formatRoll(values)}. ${playerName} ist dran.`);
  }

  const perfectThrowHit = consumePerfectThrowChance(values, {
    currentPlayer: rollingPlayer,
    nextScore,
    scoreApplied,
  });

  triggerSpecialMoment(values, {
    currentScore,
    nextScore,
    currentPlayer: rollingPlayer,
    scoreApplied,
    riskInvalid,
    perfectThrowHit,
  });
  registerPerfectThrowChance(rollingPlayer, nextScore, scoreApplied);
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
  resetPerfectThrowChance();
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
    const drawGoldReward = awardDrawGold();
    setMessage(`Risiko-Ende: Noch ${pointsLeft} Punkt${pointsLeft === 1 ? "" : "e"} bis zum Ziel, aber kein gültiger Siegwurf ist möglich. Gleichstand mit ${humanFinalScore} zu ${computerFinalScore}. +${drawGoldReward} Gold.`);
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
    const drawGoldReward = awardDrawGold();
    setMessage(`${reason} Gleichstand mit ${state.humanScore} zu ${state.computerScore}. +${drawGoldReward} Gold.`);
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

function getActiveAudioTrack() {
  const track = getAudioTrackById(activeAudioTrack) || getAudioTrackById(DEFAULT_AUDIO_TRACK);
  activeAudioTrack = track.id;
  return track;
}

function getBackgroundMusicUrl() {
  return `${getActiveAudioTrack().assetPath}?v=${APP_VERSION}`;
}

function resetBackgroundMusicTrack() {
  stopBackgroundMusic();
  backgroundMusicBuffer = null;
  backgroundMusicLoadingPromise = null;
  htmlBackgroundMusic = null;
}

function getHtmlBackgroundMusic() {
  const musicUrl = getBackgroundMusicUrl();
  if (!htmlBackgroundMusic) {
    htmlBackgroundMusic = new Audio(musicUrl);
    htmlBackgroundMusic.loop = true;
    htmlBackgroundMusic.preload = "auto";
  } else if (!htmlBackgroundMusic.src.endsWith(musicUrl)) {
    htmlBackgroundMusic.pause();
    htmlBackgroundMusic = new Audio(musicUrl);
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
    backgroundMusicLoadingPromise = fetch(getBackgroundMusicUrl())
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

  const rollAudio = new Audio(DICE_ROLL_SOUND_URL);
  rollAudio.volume = 0.45;
  rollAudio.play().catch(() => {
    playSyntheticRollSound();
  });
}

function playSyntheticRollSound() {
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
  if (shell === shopShell && shouldOpen) {
    preloadShopImageAssets();
    renderShop(true);
    renderAvatarShop(true);
    renderJukebox(true);
    shopSkinsCategory?.removeAttribute("open");
    jukeboxCategory?.removeAttribute("open");
  }
}

const LEGAL_CONTENT = {
  impressum: {
    title: "Impressum",
    kicker: "Anbieterkennzeichnung",
    html: `
      <h3>Angaben gemäß Impressumspflicht</h3>
      <p><strong>Anbieter:</strong><br>Walter Griebl</p>
      <p><strong>Anschrift:</strong><br><span class="legal-placeholder">[Adresse eintragen]</span></p>
      <p><strong>Kontakt:</strong><br><span class="legal-placeholder">[E-Mail-Adresse eintragen]</span></p>
      <h3>Verantwortlich für den Inhalt</h3>
      <p>Walter Griebl</p>
      <h3>Hinweis</h3>
      <p>Diese Angaben sind eine Vorlage und müssen vor der Veröffentlichung mit den korrekten rechtlichen Daten ergänzt werden.</p>
    `,
  },
  privacy: {
    title: "Datenschutz",
    kicker: "Datenschutzerklärung",
    html: `
      <h3>Verantwortlicher</h3>
      <p>Walter Griebl<br><span class="legal-placeholder">[E-Mail-Adresse eintragen]</span></p>
      <h3>Lokale Speicherung</h3>
      <p>Goldwurf Royale speichert Spieldaten lokal in deinem Browser. Dazu gehören Einstellungen, Spielernamen, Siege, Gold, Shop-Freischaltungen, Avatar-Auswahl, Würfel-Skins und Soundauswahl.</p>
      <h3>PWA und Offline-Nutzung</h3>
      <p>Für die installierbare Web-App speichert ein Service Worker wichtige App-Dateien, Icons, Musik und Assets im Browser-Cache, damit das Spiel nach dem ersten Laden auch offline starten kann.</p>
      <h3>Cloudflare Web Analytics</h3>
      <p>Auf der Webseite ist Cloudflare Web Analytics eingebunden. Dabei können technische Zugriffsdaten verarbeitet werden, um die Nutzung der Webseite statistisch auszuwerten.</p>
      <h3>Hinweis</h3>
      <p>Diese Datenschutzerklärung ist eine Vorlage und sollte vor der Veröffentlichung rechtlich geprüft und mit den vollständigen Kontaktdaten ergänzt werden.</p>
    `,
  },
};

function openLegalDialog(type) {
  const content = LEGAL_CONTENT[type];
  if (!content || !legalOverlay || !legalTitle || !legalKicker || !legalContent) return;

  closePanels();
  legalTitle.textContent = content.title;
  legalKicker.textContent = content.kicker;
  legalContent.innerHTML = content.html;
  legalOverlay.hidden = false;
  legalOverlay.classList.remove("show");
  requestAnimationFrame(() => {
    legalOverlay.classList.add("show");
    legalContent.focus();
  });
}

function closeLegalDialog() {
  if (!legalOverlay) return;

  legalOverlay.classList.remove("show");
  window.setTimeout(() => {
    if (!legalOverlay.classList.contains("show")) {
      legalOverlay.hidden = true;
    }
  }, 180);
}

const savedTheme = localStorage.getItem("wuerfelduell-theme");
setTheme(savedTheme === "light" ? "light" : "dark");

const savedSound = localStorage.getItem("wuerfelduell-sound");
setSound(savedSound === "off" ? false : true);

loadJukeboxState();

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
loadAvatarShopState();
preloadStartupImageAssets();
startWelcomePreload();

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
avatarShopItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-avatar-action]");
  if (!button) return;

  playClickSound();
  if (button.dataset.avatarAction === "buy") {
    buyAvatarSkin(button.dataset.avatarSkinId);
  } else if (button.dataset.avatarAction === "select") {
    selectAvatarSkin(button.dataset.avatarSkinId);
  }
});
jukeboxItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-audio-action]");
  if (!button) return;

  playClickSound();
  if (button.dataset.audioAction === "buy") {
    buyAudioTrack(button.dataset.audioTrackId);
  } else if (button.dataset.audioAction === "select") {
    selectAudioTrack(button.dataset.audioTrackId);
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
impressumLink?.addEventListener("click", () => {
  playClickSound();
  openLegalDialog("impressum");
});
privacyLink?.addEventListener("click", () => {
  playClickSound();
  openLegalDialog("privacy");
});
legalCloseButton?.addEventListener("click", () => {
  playClickSound();
  closeLegalDialog();
});
legalPrimaryCloseButton?.addEventListener("click", () => {
  playClickSound();
  closeLegalDialog();
});
legalOverlay?.addEventListener("click", closeLegalDialog);
legalDialog?.addEventListener("click", (event) => {
  event.stopPropagation();
});
document.addEventListener("click", (event) => {
  if (!menuShell?.contains(event.target) && !shopShell?.contains(event.target) && !infoShell?.contains(event.target)) {
    closePanels();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLegalDialog();
    closePanels();
  }
});
document.addEventListener("pointerdown", unlockMusicAfterGesture, { capture: true, passive: true });
document.addEventListener("touchstart", unlockMusicAfterGesture, { capture: true, passive: true });

render();
