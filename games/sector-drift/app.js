const STORAGE_KEY = "sectorDriftSaveV1";
const PRODUCTION_COOLDOWN_MS = 10 * 60 * 1000;
const STARTING_TURNS = 100;
const DAILY_TURN_GRANT = 100;
const BASE_MAX_TURN_BANK = 500;
const ENGINE_TURN_BANK_BONUS = 50;
const ENGINE_DAILY_TURN_BONUS = 10;
const FUEL_COST_PER_UNIT = 8;
const FIGHTER_COST = 12;
const FIGHTER_SELL_VALUE = 6;
const CARGO_HOLD_CAPACITY_BONUS = 20;
const SHIELD_FIGHTER_CAPACITY_BONUS = 25;
const HYPERDRIVE_COST = 100000;
const HYPERDRIVE_FUEL_MULTIPLIER = 2;
const PORT_CODE_RESOURCES = ["Food", "Ore", "Tech"];
const VALID_PORT_CODES = ["SSS", "SSB", "SBS", "SBB", "BSS", "BSB", "BBS", "BBB"];
const CARGO_GOBLIN_CAPACITY_THRESHOLD = 400;
const FIGHTER_SCREEN_THRESHOLD = 125;
const FREIGHTER_ROLE_CARGO_THRESHOLD = 500;
const BOARDING_HULL_THRESHOLD = 5;
const BOARDING_MAX_PIRATE_FIGHTERS = 3;
const PIRATE_REPUTATION_MULTIPLIER = 1;
const COMBAT_RANDOMNESS = 0.14;
const RETREAT_DAMAGE_RISK = 0.08;
const MAX_FIGHTER_LOSS_RATE = 0.65;
const ESCAPE_POD_CASH_PENALTY = 0;
const PIRATE_MIN_SECTORS_FROM_START = 3;
const SHIP_TRADE_IN_RATE = 0.45;
const PROTECTED_SPACE_DEPTH = 2;
const LAMONT_PRIME_SECTOR = 1;
const LAMONT_PRIME_NAME = "Lamont Prime";
const BEGINNER_SAFE_ZONE_COPY = "Sector 1 is protected space. Use this sector to refuel, trade, repair, accept missions, and learn systems. Hostile actions are disabled here.";
const SMUGGLED_RESOURCE = "Smuggled";
const SMUGGLED_DISPLAY_NAME = "Smuggled Inventory";
const SMUGGLED_DESCRIPTION = "Unregistered cargo that local authorities would rather not find.";
const RESOURCES = ["Ore", "Food", "Tech"];

const CAPTAIN_TITLES = ["Cadet", "Captain", "Mr.", "Mrs.", "Mx.", "Commander"];
const CAPTAIN_SPECIALTIES = {
  Explorer: { label: "Explorer", bonus: "Anomaly scans get a tiny +2% discovery nudge and scanner visibility feels a little sharper." },
  Engineer: { label: "Engineer", bonus: "Repair bills are reduced by 5% and hazards treat your ship as slightly tougher." },
  Trader: { label: "Trader", bonus: "Cargo sales earn a tiny 2% market bonus, rounded down safely." },
  Marshal: { label: "Marshal", bonus: "Pirate encounters grant +2 combat power and +1 reputation on victories." },
  Miner: { label: "Miner", bonus: "Asteroid mining yields +1 Ore when cargo space is available." },
};
const DEFAULT_CAPTAIN_PROFILE = { name: "Cadet", title: "Cadet", specialty: "Explorer", setupComplete: false };
const REQUIRE_FIREBASE_LOGIN = true;
const ALLOW_LOCAL_PROTOTYPE_MODE = true;
const PRESENCE_ONLINE_WINDOW_MS = 4 * 60 * 1000;
const LIVE_EVENT_LIMIT = 5;
const COMPETITIVE_EVENT_LIMIT = 20;
const COMPETITIVE_PROFILE_WRITE_THROTTLE_MS = 60 * 1000;
const COMPETITIVE_EVENT_THROTTLE_MS = 90 * 1000;
const CLASSROOM_BUILD_LABEL = "Classroom Launch Pass 2026-05";
const SHIP_UPGRADE_OPTIONS = [
  { key: "cargoHold", label: "Cargo Hold", description: `Cargo capacity increases by ${CARGO_HOLD_CAPACITY_BONUS} units per level.`, success: "Cargo capacity increased." },
  { key: "engine", label: "Engine", description: "Max fuel, daily turn grant, and turn bank improve.", success: "Fuel capacity and route endurance improved." },
  { key: "scanner", label: "Scanner", description: "Nearby sector identification, mining, anomaly scans, and route visibility improve.", success: "More nearby sectors can now be identified." },
  { key: "shield", label: "Shield", description: "Max hull, fighter storage, and hazard resilience improve.", success: "Hull strength and hazard resilience improved." },
  { key: "hyperdrive", label: "Hyperdrive", description: "One-time rapid-route drive. Engage plotted routes step-by-step for double fuel until danger interrupts.", success: "Hyperdrive installed. Rapid route jumps are now available from Warp / Autopilot." },
];

const PLANET_UPGRADE_TRACKS = ["production", "industry", "defense", "fighterBays", "research"];
const PLANET_PRODUCTION_RESOURCES = ["Ore", "Food", "Tech", "Fighters"];
const PLANET_UPGRADE_BASE_COSTS = {
  production: { Ore: 8, Food: 8, Tech: 4 },
  industry: { Ore: 12, Food: 4, Tech: 6 },
  defense: { Ore: 10, Food: 6, Tech: 8, Fighters: 5 },
  fighterBays: { Ore: 8, Food: 10, Tech: 8 },
  research: { Ore: 4, Food: 6, Tech: 14 },
};
const PLANET_TYPE_DATA = {
  Rocky: { description: "Ore-rich stone worlds with practical industry and modest research potential.", profile: { Ore: 3, Food: 1, Tech: 2, Fighters: 0.25, defense: 5, strengths: "High Ore, low Food, moderate Tech, low Fighters" }, caps: { production: 7, industry: 8, defense: 5, fighterBays: 4, research: 3 }, tech: ["Refinery Grid", "Planetary Cannon", "Industrial Foundry"] },
  Water: { description: "Ocean colonies grow food quickly and support balanced civilian research.", profile: { Ore: 1, Food: 3, Tech: 2, Fighters: 0.2, defense: 4, strengths: "High Food, low Ore, moderate Tech, low Fighters" }, caps: { production: 8, industry: 4, defense: 4, fighterBays: 3, research: 5 }, tech: ["Colony Growth Network", "Trade Beacon", "Shield Grid"] },
  "Gas Giant": { description: "High-atmosphere platforms harvest strange energy for advanced Tech work.", profile: { Ore: 1, Food: 1, Tech: 4, Fighters: 0.2, defense: 5, strengths: "High Tech, low Ore, low Food, low Fighters" }, caps: { production: 6, industry: 5, defense: 5, fighterBays: 4, research: 8 }, tech: ["Fuel Reactor", "Planetary Warp Core", "Deep Scanner Array"] },
  Fire: { description: "Volcanic worlds forge Ore and Tech while demanding imported food support.", profile: { Ore: 3, Food: 0.5, Tech: 3, Fighters: 0.55, defense: 7, strengths: "High Ore, high Tech, very low Food, moderate Fighters" }, caps: { production: 6, industry: 8, defense: 7, fighterBays: 5, research: 4 }, tech: ["Industrial Furnace", "Planetary Cannon", "Shield Grid"] },
  Boreal: { description: "Cold forest worlds balance colony growth, resource work, and steady defenses.", profile: { Ore: 2, Food: 2, Tech: 1.5, Fighters: 0.3, defense: 5, strengths: "Balanced Ore/Food, low-to-moderate Tech, low Fighters" }, caps: { production: 7, industry: 6, defense: 5, fighterBays: 4, research: 5 }, tech: ["Colony Network", "Trade Beacon", "Resource Refinery"] },
  Icy: { description: "Frozen labs and mineral seams favor Tech discoveries over agriculture.", profile: { Ore: 2, Food: 0.75, Tech: 3, Fighters: 0.25, defense: 6, strengths: "Moderate Ore, moderate/high Tech, low Food, low Fighters" }, caps: { production: 5, industry: 5, defense: 6, fighterBays: 3, research: 7 }, tech: ["Cryo Research Lab", "Shield Grid", "Scanner Array"] },
  Jungle: { description: "Dense bio-worlds overflow with Food and can nurture light Fighter support.", profile: { Ore: 0.75, Food: 4, Tech: 1, Fighters: 0.55, defense: 4, strengths: "Very high Food, low Ore, low Tech, moderate Fighters" }, caps: { production: 9, industry: 4, defense: 4, fighterBays: 5, research: 3 }, tech: ["Bio-Dome Network", "Fighter Hatchery", "Colony Growth Network"] },
  Desert: { description: "Harsh solar colonies provide dependable Ore, Tech, and defensible outposts.", profile: { Ore: 2, Food: 0.75, Tech: 2, Fighters: 0.3, defense: 6, strengths: "Moderate Ore, moderate Tech, low Food, low Fighters" }, caps: { production: 5, industry: 6, defense: 6, fighterBays: 4, research: 4 }, tech: ["Solar Array", "Trade Beacon", "Defense Grid"] },
  Crystal: { description: "Resonant crystal crusts create exceptional Tech paths with lighter colonies.", profile: { Ore: 2, Food: 0.5, Tech: 5, Fighters: 0.2, defense: 4, strengths: "Very high Tech, moderate Ore, low Food, low Fighters" }, caps: { production: 6, industry: 5, defense: 4, fighterBays: 3, research: 9 }, tech: ["Research Spire", "Scanner Array", "Tech Refinery"] },
  Fortress: { description: "Militarized strongpoints excel at defense and planet-stored Fighter production.", profile: { Ore: 2, Food: 2, Tech: 2, Fighters: 1.4, defense: 10, strengths: "High Fighters, moderate Ore, Food, and Tech" }, caps: { production: 6, industry: 7, defense: 9, fighterBays: 9, research: 5 }, tech: ["Fighter Factory", "Planetary Cannon", "Interdiction Field", "Shield Grid"] },
  "Pirate Homeworld": { description: "Future-only deep-threat capital world for late-game pirate systems.", profile: { Ore: 4, Food: 2, Tech: 4, Fighters: 2, defense: 14, strengths: "Very high Fighters, high Tech, high Ore, moderate Food" }, caps: { production: 9, industry: 9, defense: 10, fighterBays: 10, research: 8 }, tech: ["Black Market Foundry", "Fighter Armada", "Interdiction Field", "Planetary Warp Core"] },
};
const MAX_SECTOR = 50;
const DEFAULT_MAP_ZOOM = 1;
const MIN_MAP_ZOOM = 0.75;
const MAX_MAP_ZOOM = 2.5;
const MAP_ZOOM_STEP = 0.25;
const HAZARD_TYPES = {
  radiation: { label: "Radiation", icon: "☢", hull: 3, fuel: 0, note: "shield plating absorbs most of the glow" },
  pirates: { label: "Pirate Activity", icon: "⚑", hull: 2, fuel: 1, note: "evasive routes reduce the risk" },
  nebula: { label: "Nebula", icon: "✦", hull: 1, fuel: 2, note: "engine tuning helps with the drag" },
};
const SHIPS = {
  rustyComet: {
    id: "rustyComet",
    name: "Rusty Comet",
    description: "A reliable starter ship with room to learn every system.",
    price: 0,
    cargoCapacity: 200,
    maxFuel: 20,
    maxHull: 30,
    basePower: 8,
    fighterCapacity: 125,
    boardingBonus: 0,
    captureResistance: 0,
    hazardResist: 0,
    upgradeCaps: { cargoHold: 5, engine: 5, scanner: 5, shield: 5, hyperdrive: 1 },
  },
  nebulaSkiff: {
    id: "nebulaSkiff",
    name: "Nebula Skiff",
    aliases: ["Sparrow Scout"],
    description: "A light courier with efficient engines, a sharper scanner, and nimble fighter control.",
    price: 1300,
    cargoCapacity: 180,
    maxFuel: 30,
    maxHull: 24,
    basePower: 12,
    fighterCapacity: 175,
    boardingBonus: 1,
    captureResistance: 1,
    hazardResist: 1,
    upgradeCaps: { cargoHold: 4, engine: 7, scanner: 7, shield: 4, hyperdrive: 1 },
  },
  atlasHauler: {
    id: "atlasHauler",
    name: "Atlas Hauler",
    aliases: ["Mule Hauler"],
    description: "A heavy trader built for big cargo jobs, sturdy repairs, and a roomy fighter bay.",
    price: 2200,
    cargoCapacity: 360,
    maxFuel: 24,
    maxHull: 44,
    basePower: 10,
    fighterCapacity: 300,
    boardingBonus: 0,
    captureResistance: 1,
    hazardResist: 1,
    upgradeCaps: { cargoHold: 8, engine: 4, scanner: 4, shield: 6, hyperdrive: 1 },
  },
  rockhogMiner: {
    id: "rockhogMiner",
    name: "Rockhog Miner",
    description: "A mining workhorse with reinforced plating and steady defensive systems.",
    price: 3000,
    cargoCapacity: 300,
    maxFuel: 28,
    maxHull: 48,
    basePower: 14,
    fighterCapacity: 250,
    boardingBonus: 0,
    captureResistance: 2,
    hazardResist: 2,
    upgradeCaps: { cargoHold: 7, engine: 5, scanner: 5, shield: 7, hyperdrive: 1 },
  },
  horizonRunner: {
    id: "horizonRunner",
    name: "Horizon Runner",
    aliases: ["Frontier Skiff"],
    description: "An advanced explorer with long range, strong hazard systems, and serious frontier defense power.",
    price: 3800,
    cargoCapacity: 280,
    maxFuel: 38,
    maxHull: 36,
    basePower: 20,
    fighterCapacity: 400,
    boardingBonus: 2,
    captureResistance: 2,
    hazardResist: 2,
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 7, hyperdrive: 1 },
  },
  patrolCutter: {
    id: "patrolCutter",
    name: "Patrol Cutter",
    description: "An early lawful combat ship for captains helping secure local lanes.",
    price: 2600,
    cargoCapacity: 240,
    maxFuel: 30,
    maxHull: 42,
    basePower: 24,
    fighterCapacity: 350,
    boardingBonus: 2,
    captureResistance: 3,
    hazardResist: 1,
    unlock: { reputation: 10, combatRank: "Patrol Volunteer", text: "Requires reputation 10+ or Patrol Volunteer rank" },
    upgradeCaps: { cargoHold: 5, engine: 6, scanner: 6, shield: 7, hyperdrive: 1 },
  },
  marshalCorvette: {
    id: "marshalCorvette",
    name: "Marshal Corvette",
    description: "A strong anti-pirate ship with durable shields and a broad fighter deck.",
    price: 6200,
    cargoCapacity: 300,
    maxFuel: 34,
    maxHull: 58,
    basePower: 38,
    fighterCapacity: 600,
    boardingBonus: 3,
    captureResistance: 4,
    hazardResist: 2,
    unlock: { reputation: 40, combatRank: "Lane Guard", text: "Requires reputation 40+ or Lane Guard rank" },
    upgradeCaps: { cargoHold: 6, engine: 7, scanner: 7, shield: 8, hyperdrive: 1 },
  },
  starWardenFrigate: {
    id: "starWardenFrigate",
    name: "Star Warden Frigate",
    description: "A high-end lawful ship for Star Marshals who protect deep routes.",
    price: 10500,
    cargoCapacity: 340,
    maxFuel: 40,
    maxHull: 72,
    basePower: 55,
    fighterCapacity: 900,
    boardingBonus: 4,
    captureResistance: 5,
    hazardResist: 3,
    unlock: { reputation: 75, combatRank: "Marshal", text: "Requires reputation 75+ or Marshal rank" },
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 9, hyperdrive: 1 },
  },
  deepRouteFreighter: {
    id: "deepRouteFreighter",
    name: "Deep Route Freighter",
    description: "An advanced neutral cargo ship for experienced trade captains.",
    price: 7200,
    cargoCapacity: 580,
    maxFuel: 32,
    maxHull: 54,
    basePower: 18,
    fighterCapacity: 450,
    boardingBonus: 0,
    captureResistance: 3,
    hazardResist: 2,
    unlock: { rank: "Trade Runner", credits: 1000, text: "Requires Trade Runner rank or 1000 credits" },
    upgradeCaps: { cargoHold: 9, engine: 5, scanner: 5, shield: 7, hyperdrive: 1 },
  },
  surveyorSloop: {
    id: "surveyorSloop",
    name: "Surveyor Sloop",
    description: "A neutral exploration ship with excellent scanner growth and safe route tools.",
    price: 4800,
    cargoCapacity: 220,
    maxFuel: 42,
    maxHull: 34,
    basePower: 16,
    fighterCapacity: 275,
    boardingBonus: 2,
    captureResistance: 2,
    hazardResist: 2,
    unlock: { scanner: 4, visitedSectors: 12, text: "Requires scanner level 4 or 12 visited sectors" },
    upgradeCaps: { cargoHold: 5, engine: 8, scanner: 9, shield: 6, hyperdrive: 1 },
  },
  blackfinRaider: {
    id: "blackfinRaider",
    name: "Blackfin Raider",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 200,
    maxFuel: 34,
    maxHull: 38,
    basePower: 28,
    fighterCapacity: 425,
    boardingBonus: 4,
    captureResistance: 2,
    hazardResist: 1,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 5, engine: 7, scanner: 6, shield: 6, hyperdrive: 1 },
  },
  corsairPike: {
    id: "corsairPike",
    name: "Corsair Pike",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 240,
    maxFuel: 38,
    maxHull: 48,
    basePower: 40,
    fighterCapacity: 650,
    boardingBonus: 5,
    captureResistance: 3,
    hazardResist: 2,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 5, engine: 8, scanner: 7, shield: 7, hyperdrive: 1 },
  },
  dreadhookFrigate: {
    id: "dreadhookFrigate",
    name: "Dreadhook Frigate",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 320,
    maxFuel: 42,
    maxHull: 68,
    basePower: 58,
    fighterCapacity: 950,
    boardingBonus: 6,
    captureResistance: 5,
    hazardResist: 3,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 9, hyperdrive: 1 },
  },
};

let sessionRecoveryMessages = [];
let localSaveStatus = "Local save ready.";
let localStorageAvailable = true;
let lastLocalSaveError = "";

let sectorMap = createSectorMap();
let game = loadGame();
let selectedSectorNumber = game.player.currentSector;
let selectedMapClickSector = null;
let firebaseUnsubscribe = null;
let presenceUnsubscribe = null;
let liveEvents = [];
let liveEventPulseToken = 0;
const sectorTrafficState = { status: "local mode", message: "Sector traffic unavailable. Local prototype mode active.", records: [], listening: false, initialized: false, knownSectors: new Map(), currentSectorOccupants: [] };
const competitiveState = { leaderboards: {}, publicEvents: [], eventsStatus: "local mode", eventsMessage: "Competitive leaderboards require Google sign-in.", eventsListening: false, loadingBoards: false, lastProfileWriteAt: 0, lastProfileSignature: "", lastEventSignature: "", lastEventAt: 0, recentEventSignatures: new Map(), lastRefreshAt: 0 };
const cloudUiState = { status: "not initialized", message: "Cloud backup unavailable until Firebase finishes loading.", busy: false, user: null, role: "unknown", roleReason: "Waiting for Firebase role lookup.", lastCloudResult: "No cloud action this session." };
const launchGate = { mode: "checkingAuth", message: "Checking classroom sign-in status...", enteredAt: Date.now() };

const panels = {};

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    panels.ship = document.getElementById("shipPanel");
    panels.sector = document.getElementById("sectorPanel");
    panels.action = document.getElementById("actionPanel");
    panels.docked = document.getElementById("dockedPanel");
    panels.location = document.getElementById("locationPanel");
    panels.math = document.getElementById("mathPanel");
    panels.mission = document.getElementById("missionPanel");
    panels.tutorial = document.getElementById("tutorialPanel");
    panels.upgrade = document.getElementById("upgradePanel");
    panels.achievements = document.getElementById("achievementsPanel");
    panels.stats = document.getElementById("statsPanel");
    panels.log = document.getElementById("logPanel");

    document.getElementById("resetButton").addEventListener("click", () => {
      if (confirm("Reset Sector Drift progress on this device?")) {
        localStorage.removeItem(STORAGE_KEY);
        sectorMap = createSectorMap();
        game = defaultGameState();
        addLog("Prototype reset. Welcome back, Cadet.");
        saveGame();
        render();
      }
    });

    if (typeof window !== "undefined") {
      window.addEventListener("sectorDriftFirebaseReady", () => { refreshFirebaseUiState(); updateLaunchGateFromAuth(); updatePresenceStatus("online"); if (["settings", "launch", "adminPanel"].includes(activeScreenName())) render(); });
      window.setTimeout(() => { refreshFirebaseUiState(); updateLaunchGateFromAuth(); updatePresenceStatus("online"); if (["settings", "launch", "adminPanel"].includes(activeScreenName())) render(); }, 500);
      window.addEventListener("beforeunload", () => { updatePresenceStatus("offline", { silent: true }); });
    }

    refreshDailyTurns();
    updateAchievements();
    saveGame();
    refreshFirebaseUiState();
    initializeLaunchGate();
    render();
  });
}

function createSectorMap() {
  const planetNames = ["Emberfall", "Quiet Vesta", "Blue Rook", "Juniper Moon", "Cinder Vale", "New Lumen", "Frost Harbor", "Copperleaf", "Aster Well", "Kindle Rest"];
  const lanePairs = [
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
    [3, 11], [11, 12], [12, 13], [13, 14],
    [3, 15], [15, 16], [16, 17], [17, 18], [18, 19],
    [5, 20], [20, 21], [21, 22], [22, 23],
    [5, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 8],
    [7, 29], [29, 30], [30, 31], [31, 32],
    [8, 33], [33, 34], [34, 35], [35, 36], [36, 37],
    [10, 38], [38, 39], [39, 40], [40, 41],
    [2, 42], [42, 43], [43, 44], [44, 45], [45, 6],
    [6, 46], [46, 47], [47, 48],
    [9, 49], [49, 50],
    [1, 5], [2, 7], [4, 8], [10, 1], [18, 31], [33, 25],
  ];
  const coordinates = {
    1: { x: 10, y: 48 }, 2: { x: 20, y: 45 }, 3: { x: 30, y: 42 }, 4: { x: 40, y: 43 }, 5: { x: 50, y: 45 },
    6: { x: 60, y: 46 }, 7: { x: 70, y: 44 }, 8: { x: 80, y: 42 }, 9: { x: 88, y: 48 }, 10: { x: 94, y: 58 },
    11: { x: 28, y: 30 }, 12: { x: 24, y: 20 }, 13: { x: 18, y: 13 }, 14: { x: 11, y: 9 },
    15: { x: 33, y: 55 }, 16: { x: 31, y: 66 }, 17: { x: 26, y: 76 }, 18: { x: 19, y: 84 }, 19: { x: 10, y: 91 },
    20: { x: 51, y: 32 }, 21: { x: 54, y: 22 }, 22: { x: 59, y: 14 }, 23: { x: 66, y: 8 },
    24: { x: 54, y: 56 }, 25: { x: 60, y: 65 }, 26: { x: 67, y: 72 }, 27: { x: 76, y: 72 }, 28: { x: 82, y: 62 },
    29: { x: 70, y: 32 }, 30: { x: 72, y: 22 }, 31: { x: 77, y: 13 }, 32: { x: 86, y: 8 },
    33: { x: 82, y: 32 }, 34: { x: 88, y: 24 }, 35: { x: 93, y: 16 }, 36: { x: 96, y: 9 }, 37: { x: 91, y: 4 },
    38: { x: 89, y: 66 }, 39: { x: 82, y: 75 }, 40: { x: 75, y: 84 }, 41: { x: 68, y: 92 },
    42: { x: 18, y: 57 }, 43: { x: 15, y: 68 }, 44: { x: 18, y: 78 }, 45: { x: 30, y: 86 },
    46: { x: 59, y: 58 }, 47: { x: 55, y: 71 }, 48: { x: 49, y: 84 },
    49: { x: 95, y: 49 }, 50: { x: 98, y: 39 },
  };
  const typeOverrides = {
    1: "port", 3: "port", 5: "port", 7: "port", 8: "port", 10: "port", 14: "planet", 19: "planet", 23: "planet", 31: "port", 32: "planet", 37: "planet", 41: "planet", 45: "port", 48: "planet",
    12: "asteroid", 16: "anomaly", 21: "asteroid", 25: "anomaly", 30: "asteroid", 34: "anomaly", 39: "asteroid", 43: "anomaly", 47: "asteroid", 50: "anomaly",
  };
  const routeRoles = {
    1: "core", 3: "crossroad", 5: "crossroad", 6: "crossroad", 7: "crossroad", 8: "crossroad", 10: "crossroad", 14: "deadEnd", 19: "deadEnd", 23: "deadEnd", 32: "deadEnd", 37: "deadEnd", 41: "deadEnd", 48: "deadEnd", 50: "deadEnd",
    11: "tunnel", 12: "tunnel", 13: "tunnel", 15: "tunnel", 16: "tunnel", 17: "tunnel", 18: "tunnel", 20: "tunnel", 21: "tunnel", 22: "tunnel", 24: "tunnel", 25: "tunnel", 26: "tunnel", 27: "tunnel", 28: "tunnel", 29: "tunnel", 30: "tunnel", 31: "tunnel", 33: "tunnel", 34: "tunnel", 35: "tunnel", 36: "tunnel", 38: "tunnel", 39: "tunnel", 40: "tunnel", 42: "tunnel", 43: "tunnel", 44: "tunnel", 45: "frontier", 46: "tunnel", 47: "tunnel", 49: "tunnel",
  };
  const strategicNotes = {
    core: "Core route: reliable lanes radiate from this safe classroom port.",
    tunnel: "Tunnel lane: a narrow chain of systems rewards careful scouting.",
    deadEnd: "Dead-end system: valuable but difficult to reach or defend.",
    crossroad: "Crossroad system: several lanes meet here, making this a major navigation choice.",
    frontier: "Frontier station: a remote route anchor for future defensive play.",
  };
  const sectors = {};

  for (let number = 1; number <= MAX_SECTOR; number += 1) {
    sectors[number] = { number, adjacent: [], coordinates: coordinates[number] || createSectorCoordinates(number) };
  }

  lanePairs.forEach(([a, b]) => {
    sectors[a].adjacent.push(b);
    sectors[b].adjacent.push(a);
  });

  for (let number = 1; number <= MAX_SECTOR; number += 1) {
    const sector = sectors[number];
    sector.adjacent = Array.from(new Set(sector.adjacent)).sort((a, b) => a - b);
    const degree = sector.adjacent.length;
    const routeRole = routeRoles[number] || (degree >= 4 ? "crossroad" : degree === 1 ? "deadEnd" : degree === 2 ? "tunnel" : "frontier");
    const type = typeOverrides[number] || (["empty", "asteroid", "anomaly", "empty", "planet"][stableNumber(number, 11) % 5]);
    const dangerLevel = createDangerLevel(number, type);
    const hazardType = dangerLevel > 0 ? Object.keys(HAZARD_TYPES)[stableNumber(number, 17) % Object.keys(HAZARD_TYPES).length] : null;
    const economy = type === "port" ? createPortEconomy(number) : null;
    Object.assign(sector, {
      type,
      dangerLevel,
      hazardType,
      routeRole,
      isChokepoint: routeRole === "crossroad" || [13, 18, 22, 31, 36, 40, 44, 47].includes(number),
      strategicNote: strategicNotes[routeRole] || strategicNotes.frontier,
      flavor: getSectorFlavor(type, number),
      objects: getSectorObjects(type, number, hazardType),
    });
    sector.signals = createSectorSignals(number, type, routeRole, dangerLevel);
    sector.identityType = sector.signals.identity;
    sector.identityLabel = sectorIdentityLabel(sector.identityType);

    if (economy) Object.assign(sector, economy);
    if ([1, 5, 8, 45].includes(number)) sector.hasShipyard = true;
    if ([1, 5, 8, 45].includes(number)) sector.portType = number === 1 ? "Core Port" : number === 45 ? "Frontier Starbase" : "Major Station";
    if (type === "planet") sector.planet = createPlanetState(number, planetNames[number % planetNames.length], routeRole, dangerLevel);
    if (number === LAMONT_PRIME_SECTOR) {
      sector.homeworld = createLamontPrimeState();
      sector.objects = Array.from(new Set([...(sector.objects || []), LAMONT_PRIME_NAME, "Alliance Starship patrol", "restricted landing clearance", "safe classroom launch zone"]));
    }
  }

  function localSectorDistance(a, b) {
    if (a === b) return 0;
    const visited = new Set([a]);
    let frontier = [a];
    for (let distance = 1; distance <= MAX_SECTOR; distance += 1) {
      const next = [];
      frontier.forEach((sectorNumber) => {
        (sectors[sectorNumber]?.adjacent || []).forEach((neighbor) => {
          if (neighbor === b) next.push(neighbor);
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            next.push(neighbor);
          }
        });
      });
      if (next.includes(b)) return distance;
      frontier = next;
    }
    return Infinity;
  }
  Object.values(sectors).forEach((sector) => {
    sector.protectedSpace = localSectorDistance(1, sector.number) <= PROTECTED_SPACE_DEPTH;
    sector.pirateActivity = Boolean(pirateBlueprints()[sector.number]) && !sector.protectedSpace;
    sector.signals.smugglingRisk = sector.signals.smugglingRisk && !sector.protectedSpace;
    sector.identityType = sectorIdentityType(sector);
    sector.identityLabel = sectorIdentityLabel(sector.identityType);
  });

  return sectors;
}

function createSectorCoordinates(number) {
  const ring = Math.floor((number - 1) / 10);
  const slot = (number - 1) % 10;
  const angle = ((slot / 10) * Math.PI * 2) + (ring * 0.35);
  const radius = 18 + ring * 8 + (stableNumber(number, 3) % 5);
  return {
    x: Math.round(50 + Math.cos(angle) * radius),
    y: Math.round(50 + Math.sin(angle) * radius),
  };
}

function createDangerLevel(number, type) {
  if (number === 1 || type === "port") return 0;
  return stableNumber(number, 29) % 4;
}

function createPortCode(number) {
  if (number === 1) return "SSB";
  return VALID_PORT_CODES[stableNumber(number, 37) % VALID_PORT_CODES.length];
}

function portCodeRole(code, resource) {
  const index = PORT_CODE_RESOURCES.indexOf(resource);
  return index >= 0 ? code[index] : "S";
}

function pairedPortCode(code) {
  return String(code || "SSS").split("").map((letter) => letter === "S" ? "B" : "S").join("");
}

function portCodeHelpText() {
  return "S = cheaper to buy here. B = better to sell here. Order: Food / Ore / Tech.";
}

function portCodeTradeTip(code) {
  const pair = pairedPortCode(code);
  const sellHere = PORT_CODE_RESOURCES.filter((resource) => portCodeRole(code, resource) === "S");
  const buyHere = PORT_CODE_RESOURCES.filter((resource) => portCodeRole(code, resource) === "B");
  return `Trade clue: ${code} pairs well with ${pair}. Buy ${sellHere.join("/") || "discount cargo"} here, sell them at ${pair} ports${buyHere.length ? `, then bring ${buyHere.join("/")} back` : ""}.`;
}

function createPortEconomy(number) {
  const code = createPortCode(number);
  const portTypes = [
    { name: "Mining Port", note: "Ore brokers run loud loading bays and clear role-coded market boards." },
    { name: "Agri Port", note: "Hydroponics domes post simple S/B cargo signals for visiting captains." },
    { name: "Tech Port", note: "Fabricators tune prices around a published Food / Ore / Tech role code." },
    { name: "Frontier Port", note: "Risky lanes raise demand, so captains should read the S/B code before trading." },
    { name: "Core Port", note: "Stable classrooms, stable ledgers, and a clear role code keep margins readable." },
  ];
  const port = portTypes[stableNumber(number, 41) % portTypes.length];
  const base = {
    Ore: { buy: 14 + (number % 6), sell: 9 + (number % 5) },
    Food: { buy: 10 + ((number * 2) % 5), sell: 6 + (number % 4) },
    Tech: { buy: 34 + ((number * 3) % 12), sell: 22 + (number % 9) },
  };
  const portPrices = Object.fromEntries(RESOURCES.map((resource) => {
    const role = portCodeRole(code, resource);
    const variation = 0.94 + (stableNumber(number, resource.charCodeAt(0)) % 13) / 100;
    const buyMultiplier = role === "S" ? 0.72 + (stableNumber(number, resource.length + 11) % 8) / 100 : 1.12 + (stableNumber(number, resource.length + 17) % 12) / 100;
    const sellMultiplier = role === "B" ? 1.28 + (stableNumber(number, resource.length + 23) % 13) / 100 : 0.72 + (stableNumber(number, resource.length + 29) % 10) / 100;
    const buy = Math.max(1, Math.round(base[resource].buy * buyMultiplier * variation));
    const sell = Math.max(1, Math.round(base[resource].sell * sellMultiplier * variation));
    return [resource, { buy: Math.max(buy, sell + 1), sell, role }];
  }));
  return {
    portCode: code,
    portType: `${code} ${port.name}`,
    marketNote: `${port.note} ${portCodeHelpText()}`,
    tradeTip: portCodeTradeTip(code),
    portPrices,
    hasShipyard: number === 1 || stableNumber(number, 53) % 4 === 0,
    repairService: { baseFee: 20 + (stableNumber(number, 67) % 18), perHull: 4 + (stableNumber(number, 71) % 4) },
  };
}
function stableNumber(number, salt = 0) {
  const raw = Math.sin((number + 1) * 9301 + salt * 49297) * 233280;
  return Math.abs(Math.floor(raw));
}

function choosePlanetType(sectorNumber, routeRole = "tunnel", dangerLevel = 0) {
  const early = ["Rocky", "Water", "Boreal", "Desert", "Jungle"];
  const general = ["Rocky", "Water", "Boreal", "Desert", "Jungle", "Gas Giant", "Icy"];
  const deadEnd = ["Fortress", "Crystal", "Icy", "Fire", "Rocky", "Gas Giant"];
  const dangerous = ["Fortress", "Fire", "Crystal", "Icy", "Desert"];
  const pool = dangerLevel >= 3 ? dangerous : routeRole === "deadEnd" || routeRole === "tunnel" ? deadEnd : sectorNumber <= 20 ? early : general;
  return pool[stableNumber(sectorNumber, 91) % pool.length];
}

function getPlanetTypeProfile(type) {
  return PLANET_TYPE_DATA[type] || PLANET_TYPE_DATA.Rocky;
}

function createLamontPrimeState() {
  return normalizePlanetState({
    id: "lamont-prime",
    name: LAMONT_PRIME_NAME,
    owner: "Alliance Protected",
    productionLevel: 1,
    stored: { Ore: 0, Food: 0, Tech: 0, Fighters: 0 },
    type: "Water",
    sectorNumber: LAMONT_PRIME_SECTOR,
    protectedHomeworld: true,
    claimLocked: true,
    attackLocked: true,
    defenseRatingOverride: 9999,
    typeDescription: "Alliance-protected civilian homeworld and tutorial safe zone.",
  }, LAMONT_PRIME_SECTOR, "core", 0);
}

function isLamontPrimeSector(sectorNumber) {
  return Number(sectorNumber) === LAMONT_PRIME_SECTOR;
}

function isProtectedHomeworld(planet) {
  return Boolean(planet?.protectedHomeworld) || planet?.id === "lamont-prime" || planet?.name === LAMONT_PRIME_NAME;
}

function lamontPrimeStatusText() {
  return "Lamont Prime is Alliance protected, impossible for normal players to attack or claim, and guarded by overwhelming Alliance defense.";
}

function lamontPrimeSafetyText() {
  return `${BEGINNER_SAFE_ZONE_COPY} Massive fighter defense and Alliance Starship patrols keep civilian/tutorial traffic safe; landing clearance is restricted to classroom launch operations.`;
}

function homeworldScannerDetail(sector) {
  if (!sector?.homeworld) return "";
  const scanner = game?.player?.upgrades?.scanner || 1;
  const visited = game?.visitedSectors?.includes(sector.number) || sector.number === game?.player?.currentSector;
  if (scanner <= 1 && !visited) return `${LAMONT_PRIME_NAME}: protected homeworld beacon`;
  if (scanner <= 2 && !visited) return `${LAMONT_PRIME_NAME}: Alliance protected civilian/tutorial safe zone`;
  if (scanner <= 3 && !visited) return `${LAMONT_PRIME_NAME}: protected homeworld · hostile actions disabled`;
  return `${LAMONT_PRIME_NAME}: restricted landing clearance · overwhelming Alliance fighter defense · cannot be claimed or attacked`;
}

function canClaimPlanetInSector(sector, planet) {
  if (!sector || !planet) return false;
  if (isProtectedHomeworld(planet) || sector.homeworld?.id === planet.id) return false;
  if (planet.owner) return false;
  if (isProtectedSpace(sector.number)) return false;
  return sector.type === "planet";
}

function createPlanetState(sectorNumber, name, routeRole, dangerLevel) {
  const type = choosePlanetType(sectorNumber, routeRole, dangerLevel);
  return normalizePlanetState({
    id: `planet-${sectorNumber}`,
    name,
    owner: null,
    productionLevel: 1,
    stored: { Ore: 0, Food: 0, Tech: 0, Fighters: 0 },
    type,
  }, sectorNumber, routeRole, dangerLevel);
}

function normalizePlanetState(planet = {}, sectorNumber = Number(String(planet.id || "").replace(/\D+/g, "")) || 1, routeRole = "tunnel", dangerLevel = 0) {
  const type = planet.type && PLANET_TYPE_DATA[planet.type] ? planet.type : choosePlanetType(sectorNumber, routeRole, dangerLevel);
  const data = getPlanetTypeProfile(type);
  const stored = { Ore: 0, Food: 0, Tech: 0, Fighters: 0, ...(planet.stored || {}) };
  PLANET_PRODUCTION_RESOURCES.forEach((resource) => { stored[resource] = Math.max(0, Math.floor(Number(stored[resource]) || 0)); });
  const legacyProduction = Math.max(1, Math.floor(Number(planet.productionLevel) || 1));
  const upgrades = { production: legacyProduction, industry: 1, defense: 0, fighterBays: 0, research: 0, ...(planet.upgrades || {}) };
  PLANET_UPGRADE_TRACKS.forEach((track) => { upgrades[track] = Math.max(track === "production" || track === "industry" ? 1 : 0, Math.floor(Number(upgrades[track]) || 0)); });
  upgrades.production = Math.max(upgrades.production, legacyProduction);
  const caps = { ...data.caps, ...(planet.upgradeCaps || {}) };
  PLANET_UPGRADE_TRACKS.forEach((track) => { upgrades[track] = Math.min(upgrades[track], caps[track]); });
  return {
    ...planet,
    id: planet.id || `planet-${sectorNumber}`,
    name: planet.name || `Planet ${sectorNumber}`,
    owner: planet.owner || null,
    productionLevel: upgrades.production,
    stored,
    type,
    typeDescription: data.description,
    productionProfile: { ...data.profile },
    upgradeCaps: caps,
    upgrades,
    tech: {
      unlocked: Array.isArray(planet.tech?.unlocked) ? planet.tech.unlocked : [],
      available: Array.isArray(planet.tech?.available) && planet.tech.available.length ? planet.tech.available : [...data.tech],
    },
  };
}

function formatProduction(production) {
  return PLANET_PRODUCTION_RESOURCES.map((resource) => `+${production[resource] || 0} ${resource}`).join(", ");
}

function getPlanetProduction(planet) {
  const normalized = normalizePlanetState(planet);
  const profile = getPlanetTypeProfile(normalized.type).profile;
  const upgrades = normalized.upgrades;
  const base = Math.max(1, upgrades.production);
  const industryBonus = Math.max(0, upgrades.industry - 1);
  const researchBonus = Math.max(0, upgrades.research);
  const fighterBonus = Math.max(0, upgrades.fighterBays);
  return {
    Ore: Math.max(0, Math.ceil(profile.Ore * base + industryBonus * 1.2)),
    Food: Math.max(0, Math.ceil(profile.Food * base + Math.max(0, base - 1) * 0.25)),
    Tech: Math.max(0, Math.ceil(profile.Tech * base + industryBonus * 0.7 + researchBonus * 1.6)),
    Fighters: Math.max(0, Math.floor(profile.Fighters * base + fighterBonus * (1 + profile.Fighters))),
  };
}

function getPlanetProductionPreview(planet, track) {
  const preview = normalizePlanetState(planet);
  if (track && preview.upgrades[track] < preview.upgradeCaps[track]) {
    preview.upgrades[track] += 1;
    if (track === "production") preview.productionLevel = preview.upgrades.production;
  }
  return getPlanetProduction(preview);
}

function getPlanetDefenseRating(planet) {
  const normalized = normalizePlanetState(planet);
  if (isProtectedHomeworld(normalized)) return normalized.defenseRatingOverride || 9999;
  const data = getPlanetTypeProfile(normalized.type);
  const storedFighters = normalized.stored.Fighters || 0;
  const futureTechBonus = (normalized.tech.unlocked || []).length * 3;
  // TODO: Future multiplayer invasion logic can compare attacking fleets against this rating.
  return Math.round(data.profile.defense + normalized.upgrades.defense * 8 + normalized.upgrades.fighterBays * 3 + Math.sqrt(storedFighters) * 2 + futureTechBonus);
}

function getPlanetUpgradeCost(planet, track) {
  const normalized = normalizePlanetState(planet);
  const level = normalized.upgrades[track] || 0;
  const base = PLANET_UPGRADE_BASE_COSTS[track] || {};
  return Object.fromEntries(Object.entries(base).map(([resource, amount]) => [resource, Math.ceil(amount * Math.pow(level + 1, 1.8))]));
}

function getPlanetUpgradeMissing(planet, track) {
  const cost = getPlanetUpgradeCost(planet, track);
  const stored = normalizePlanetState(planet).stored;
  return Object.fromEntries(Object.entries(cost).filter(([resource, amount]) => (stored[resource] || 0) < amount).map(([resource, amount]) => [resource, amount - (stored[resource] || 0)]));
}

function canAffordPlanetUpgrade(planet, track) {
  return Object.keys(getPlanetUpgradeMissing(planet, track)).length === 0;
}

function formatResourceAmounts(amounts) {
  const entries = Object.entries(amounts).filter(([, amount]) => amount > 0);
  return entries.length ? entries.map(([resource, amount]) => `${amount} ${resource}`).join(", ") : "None";
}

function planetUpgradeLabel(track) {
  return ({ production: "Production", industry: "Industry", defense: "Defense", fighterBays: "Fighter Bays", research: "Research" })[track] || titleCase(track);
}

function planetUpgradeBenefit(planet, track) {
  const nextPreview = formatProduction(getPlanetProductionPreview(planet, track));
  if (track === "production") return `Increases base production. Next preview: ${nextPreview}.`;
  if (track === "industry") return `Improves Ore and Tech processing. Next preview: ${nextPreview}.`;
  if (track === "defense") return `Increases Defense Rating to ${getPlanetDefenseRating({ ...planet, upgrades: { ...planet.upgrades, defense: planet.upgrades.defense + 1 } })}. Future-ready for invasions and planetary shields.`;
  if (track === "fighterBays") return `Increases planet-stored Fighter production. Next preview: ${nextPreview}.`;
  if (track === "research") return `Increases Tech output and future tech potential. Next preview: ${nextPreview}.`;
  return `Next preview: ${nextPreview}.`;
}

function sectorIdentityType(sector) {
  if (!sector) return "empty";
  if (sector.type === "port") return "port";
  if (sector.type === "asteroid") return "asteroid";
  if (sector.type === "anomaly") return "anomaly";
  if (sector.type === "planet") return "planet";
  if (sector.pirateActivity) return "pirate";
  if (sector.protectedSpace) return "protected";
  if (sector.routeRole === "crossroad" || [6, 8, 10, 29, 33].includes(sector.number)) return "tradeCorridor";
  if ([18, 36, 44].includes(sector.number)) return "ruins";
  if ([11, 22, 35, 42, 49].includes(sector.number)) return "nebula";
  if (sector.routeRole === "deadEnd" || sector.dangerLevel >= 3) return "deadZone";
  return "empty";
}

function sectorIdentityLabel(type) {
  return ({ port: "Port", asteroid: "Asteroid Field", nebula: "Nebula", anomaly: "Anomaly", pirate: "Pirate Sector", deadZone: "Dead Zone", protected: "Protected Space", planet: "Planetary Sector", tradeCorridor: "Trade Corridor", ruins: "Ruins", empty: "Open Space" })[type] || titleCase(type);
}

function sectorIdentityBrief(sector, options = {}) {
  if (!sector) return "Uncharted readout.";
  let activeGame = null;
  try { activeGame = game; } catch (error) { activeGame = null; }
  const scanner = options.scanner || activeGame?.player?.upgrades?.scanner || 1;
  const visited = options.force || activeGame?.visitedSectors?.includes(sector.number) || sector.number === activeGame?.player?.currentSector;
  const identity = sectorIdentityType(sector);
  const base = {
    port: sector.homeworld ? `${stationDisplayName(sector)} orbits ${LAMONT_PRIME_NAME}, a protected classroom launch zone with Alliance patrol cover.` : `${stationDisplayName(sector)} keeps docks, market calls, and ${sector.hasShipyard ? "shipyard traffic" : "repair crews"} close together.`,
    asteroid: `${sector.signals?.oreRichness || "Ore"} field; broken rocks make slow mining passes worthwhile.`,
    anomaly: `${sector.signals?.anomalyInstability || "Shifting"} signal; scan carefully before trusting the instruments.`,
    planet: `${sector.planet?.name || "Survey world"} anchors colony opportunity and orbital route markers.`,
    pirate: "Encrypted bursts and cold engines mark likely raider traffic.",
    protected: "Alliance patrol pings make this a safe, watched pocket of space.",
    tradeCorridor: "Freighter wakes and market buoys mark a useful trade lane.",
    deadZone: "A thin lane ends here; quiet space may hide salvage or risk.",
    nebula: "Ion haze bends scanner returns around the lane.",
    ruins: "Old hull frames and dust trails hint at salvage.",
    empty: "Open stars, clean bearings, and room to plan the next jump.",
  };
  const route = {
    core: "Core classroom hub.",
    crossroad: "Crossroad with several choices.",
    deadEnd: "Dead-end system logged.",
    tunnel: "Tunnel lane; scout step by step.",
    frontier: "Frontier anchor point.",
  }[sector.routeRole] || "Local lane marker.";
  if (!visited && scanner <= 1) return sector.dangerLevel > 0 ? "Vague mass return with possible danger." : "Vague mass return; details unresolved.";
  if (!visited && scanner === 2) return `${sectorIdentityLabel(identity)} signature. ${sector.type === "port" ? `Port code ${sector.portCode || "---"} visible.` : route}`;
  if (!visited && scanner === 3) return `${base[identity] || base.empty} ${sector.dangerLevel > 0 ? `Threat estimate ${sector.dangerLevel}.` : "No major threat resolved."}`;
  return `${base[identity] || base.empty} ${route}`;
}

function createSectorSignals(number, type, routeRole, dangerLevel) {
  const identity = sectorIdentityType({ number, type, routeRole, dangerLevel });
  return {
    identity,
    oreRichness: type === "asteroid" ? ["Trace Ore", "Workable Ore", "Rich Ore", "Dense Ore"][stableNumber(number, 101) % 4] : "",
    anomalyInstability: type === "anomaly" ? ["Low", "Shifting", "Unstable", "Volatile"][stableNumber(number, 103) % 4] : "",
    traffic: routeRole === "crossroad" || type === "port" ? ["Steady", "High", "Convoy", "Busy"][stableNumber(number, 107) % 4] : routeRole === "deadEnd" ? "Sparse" : ["Light", "Patchy", "Moderate"][stableNumber(number, 109) % 3],
    salvage: [18, 36, 44].includes(number) || identity === "ruins" || (dangerLevel >= 2 && stableNumber(number, 113) % 3 === 0),
    hiddenBonus: stableNumber(number, 127) % 5 === 0 ? "Unusual readings worth revisiting after scanner upgrades" : "",
    smugglingRisk: dangerLevel >= 2,
  };
}

function sectorArrivalFlavor(sector) {
  const identity = sectorIdentityType(sector);
  const variants = {
    port: ["Docking lights blink through orderly approach lanes. Cargo calls promise safe profit if you compare prices.", "Station beacons sweep across the hull. Merchants, repairs, and mission boards wait inside."],
    asteroid: ["Dense rock fields drift through the sector. Mining lasers could operate here.", "Ore-bright stones tumble in slow arcs. Rich pockets may reward a careful mining pass."],
    nebula: ["Static crawls across the cockpit glass. Scanner returns flicker through ionized clouds.", "Colored vapor folds around the lane. Contacts blur, but hidden paths glimmer at the edge of scan range."],
    anomaly: ["The scanner bends around a pulsing signal. A careful scan could uncover fuel, data, or trouble.", "Instrument needles twitch in impossible rhythms. The anomaly invites a one-turn survey."],
    pirate: ["Encrypted bursts chatter across the lane. Pirate traffic may be using the local shadows.", "Weapon scars mark old buoy plating. This sector feels watched by raiders."],
    deadZone: ["Beacon echoes fade into a cold quiet. Few ships cross this far without a reason.", "The lane thins into dark static. Salvage and risk tend to travel together here."],
    protected: ["Alliance patrol signatures dominate local channels. Civilian traffic moves under heavy escort.", "Clean patrol pings bracket the route. This is protected space, safer but closely watched."],
    planet: ["A planetary disc rises beyond the canopy. Survey beacons mark future colony work.", "Cloud bands and orbital markers fill the viewer. Builders could make a home here."],
    tradeCorridor: ["Freighter wakes cross the lane in bright lines. Trade traffic hints at routes worth mapping.", "Buoys repeat market codes and jump timings. This corridor wants to be charted."],
    ruins: ["Broken hull plates drift around silent beacons. Salvage traces suggest someone left in a hurry.", "Ancient frames turn slowly in the dark. The scanner marks salvage dust among the wreckage."],
    empty: ["Quiet stars drift beyond the cockpit glass. It is a clean place to plan the next jump.", "The lane is calm and mostly empty. Scanner buoys whisper just enough to keep moving."],
  };
  const list = variants[identity] || variants.empty;
  return list[stableNumber(sector.number, 131) % list.length];
}

function sectorSignalTags(sector, options = {}) {
  const scanner = game?.player?.upgrades?.scanner || 1;
  const visited = game?.visitedSectors?.includes(sector.number) || sector.number === game?.player?.currentSector;
  const tags = [];
  const identity = sectorIdentityType(sector);
  const canShowBasics = options.force || visited || getVisibleSectorNumbers().includes(sector.number);
  if (!canShowBasics) return ["Uncharted"];
  if (missionTargetIntel(sector.number)) tags.push("Mission Target");
  if (sector.dangerLevel > 0 && (visited || scanner >= 3)) tags.push("Hazardous");
  if (sector.pirateActivity && (visited || scanner >= 3)) tags.push("Pirate Signal");
  if (sector.protectedSpace) tags.push("Protected");
  if (sector.homeworld) tags.push("Lamont Prime");
  if (sector.protectedSpace && (visited || scanner >= 3)) tags.push("Heavy Patrol");
  if ((identity === "tradeCorridor" || sector.routeRole === "crossroad" || sector.type === "port") && (visited || scanner >= 4)) tags.push("Trade Route");
  if (sector.routeRole === "crossroad" && (visited || scanner >= 4)) tags.push("Crossroad");
  if (sector.routeRole === "deadEnd" && (visited || scanner >= 4)) tags.push("Dead End");
  if (sector.signals?.traffic && (visited || scanner >= 4) && ["High", "Convoy", "Busy"].includes(sector.signals.traffic)) tags.push("High Traffic");
  if (sector.type === "asteroid" && (visited || scanner >= 2)) tags.push((sector.signals?.oreRichness || "Ore Field").includes("Rich") || (sector.signals?.oreRichness || "").includes("Dense") ? "Rich Ore" : "Ore Field");
  if (sector.type === "anomaly" && (visited || scanner >= 3)) tags.push(["Unstable", "Volatile"].includes(sector.signals?.anomalyInstability) ? "Unstable" : "Anomaly");
  if (sector.signals?.salvage && (visited || scanner >= 4)) tags.push("Salvage Traces");
  if (sector.signals?.smugglingRisk && (visited || scanner >= 4)) tags.push("Smuggling Risk");
  if (identity === "nebula") tags.push(scanner >= 3 || visited ? "Nebula Drift" : "Sensor Static");
  if (identity === "ruins" && (visited || scanner >= 4)) tags.push("Ruins");
  return Array.from(new Set(tags)).slice(0, 6);
}

function renderSectorTags(sector, options = {}) {
  const tags = sectorSignalTags(sector, options);
  if (!tags.length) return "";
  return `<div class="sector-tags" aria-label="Sector signals">${tags.map((tag) => `<span class="sector-tag">${tag}</span>`).join("")}</div>`;
}

function scannerIntelDetails(sector) {
  const scanner = game.player.upgrades?.scanner || 1;
  const visited = game.visitedSectors.includes(sector.number) || sector.number === game.player.currentSector;
  const visible = getVisibleSectorNumbers().includes(sector.number);
  if (!visible) return "Outside current scanner range.";
  const lines = [`L${scanner}: ${visited ? "local chart confirmed" : "adjacent returns acquired"}`];
  if (!visited && scanner <= 1) {
    lines.push(sector.dangerLevel > 0 ? "vague danger shadow" : "no clear danger shape");
  }
  if (scanner >= 2 || visited) {
    lines.push(`type ${sectorIdentityLabel(sectorIdentityType(sector))}`);
    if (sector.type === "port") lines.push(`port code ${sector.portCode || "---"}`);
    if (sector.type === "asteroid") lines.push(`ore ${sector.signals?.oreRichness || "unknown"}`);
    if (sector.type === "anomaly") lines.push("anomaly hint");
  }
  if (scanner >= 3 || visited) {
    const pirate = game.pirates?.[sector.number];
    if (pirate && !pirate.defeated) lines.push(`pirate threat L${pirate.threatLevel}`);
    else if (sector.pirateActivity) lines.push("pirate signal estimate");
    else if (sector.dangerLevel > 0) lines.push(`threat estimate ${sector.dangerLevel}`);
    if (sector.type === "anomaly") lines.push(`instability ${sector.signals?.anomalyInstability || "unknown"}`);
    if (sector.type === "planet") lines.push(sector.planet ? `${sector.planet.type} world` : "planet opportunity");
    if (sector.homeworld) lines.push(homeworldScannerDetail(sector));
  }
  if (scanner >= 4 || visited) {
    lines.push(`route role ${titleCase(sector.routeRole)}`);
    if (sector.signals?.traffic) lines.push(`traffic ${sector.signals.traffic}`);
    if (sector.homeworld && !lines.includes(homeworldScannerDetail(sector))) lines.push(homeworldScannerDetail(sector));
    if (sector.signals?.salvage) lines.push("salvage traces");
    if (sector.signals?.hiddenBonus) lines.push("deep-scan warning logged");
  }
  return lines.join(" · ");
}

function getSectorFlavor(type, number) {
  const temp = { number, type, routeRole: "tunnel", dangerLevel: createDangerLevel(number, type), signals: {} };
  return `${sectorArrivalFlavor(temp)} Registry code SD-${String(number).padStart(2, "0")}.`;
}

function getSectorObjects(type, number, hazardType) {
  const base = {
    empty: ["navigation buoy", "distant starlight"],
    port: ["spaceport", "fuel broker", "cargo market"],
    planet: ["survey planet", "claim beacon"],
    asteroid: ["asteroid field", "ore fragments"],
    anomaly: ["scanner anomaly", "unknown signal"],
  }[type] || [];
  const identity = sectorIdentityType({ number, type, routeRole: "tunnel", dangerLevel: createDangerLevel(number, type) });
  if (identity === "nebula") base.push("ionized clouds");
  if (identity === "tradeCorridor") base.push("trade buoys");
  if (identity === "deadZone") base.push("faint beacon");
  if (identity === "ruins") base.push("salvage traces");
  const objects = [...base];
  if (type === "port" && createPortEconomy(number).hasShipyard) objects.push("shipyard");
  if (hazardType) objects.push(HAZARD_TYPES[hazardType].label.toLowerCase());
  return objects;
}


function pirateBlueprints() {
  return {
    13: { name: "Scrap Raider", threatLevel: 1, fighters: 8, hull: 14, basePower: 7, bounty: 150, reputationReward: 6 },
    14: { name: "Redline Cutter", threatLevel: 1, fighters: 10, hull: 16, basePower: 8, bounty: 175, reputationReward: 7 },
    18: { name: "Lane Shark", threatLevel: 2, fighters: 14, hull: 22, basePower: 11, bounty: 230, reputationReward: 9 },
    19: { name: "Static Corsair", threatLevel: 2, fighters: 20, hull: 28, basePower: 15, bounty: 310, reputationReward: 12 },
    23: { name: "Black Flag Skiff", threatLevel: 3, fighters: 28, hull: 36, basePower: 20, bounty: 430, reputationReward: 16 },
    29: { name: "Nebula Knifeboat", threatLevel: 3, fighters: 34, hull: 40, basePower: 23, bounty: 500, reputationReward: 18 },
    32: { name: "Drift Vulture", threatLevel: 4, fighters: 48, hull: 50, basePower: 30, bounty: 650, reputationReward: 22 },
    37: { name: "Dead-End Warlord", threatLevel: 4, fighters: 58, hull: 58, basePower: 34, bounty: 820, reputationReward: 28, isStronghold: true },
    41: { name: "Iron Ledger Captain", threatLevel: 4, fighters: 62, hull: 62, basePower: 38, bounty: 900, reputationReward: 30 },
    48: { name: "Broken Beacon Crew", threatLevel: 5, fighters: 82, hull: 78, basePower: 48, bounty: 1250, reputationReward: 38, isStronghold: true },
  };
}

function createPirateEncounters() {
  return Object.fromEntries(Object.entries(pirateBlueprints()).filter(([sectorNumber]) => !isProtectedSpace(Number(sectorNumber))).map(([sectorNumber, blueprint]) => {
    const hull = blueprint.hull;
    return [sectorNumber, {
      id: `pirate-${sectorNumber}`,
      sector: Number(sectorNumber),
      name: blueprint.name,
      threatLevel: blueprint.threatLevel,
      fighters: blueprint.fighters,
      hull,
      maxHull: hull,
      basePower: blueprint.basePower,
      bounty: blueprint.bounty,
      reputationReward: blueprint.reputationReward,
      defeated: false,
      isStronghold: Boolean(blueprint.isStronghold),
      cleared: false,
      npcOnly: true,
    }];
  }));
}

function mergePirateEncounters(savedPirates = {}) {
  const fresh = createPirateEncounters();
  Object.entries(savedPirates || {}).forEach(([sectorNumber, savedPirate]) => {
    if (!fresh[sectorNumber] || !savedPirate) return;
    fresh[sectorNumber] = {
      ...fresh[sectorNumber],
      ...savedPirate,
      npcOnly: true,
      sector: Number(sectorNumber),
      maxHull: fresh[sectorNumber].maxHull,
      hull: Math.max(0, Math.min(typeof savedPirate.hull === "number" ? savedPirate.hull : fresh[sectorNumber].hull, fresh[sectorNumber].maxHull)),
      fighters: Math.max(0, Math.floor(typeof savedPirate.fighters === "number" ? savedPirate.fighters : fresh[sectorNumber].fighters)),
      defeated: Boolean(savedPirate.defeated),
      isStronghold: Boolean(fresh[sectorNumber].isStronghold || savedPirate.isStronghold),
      cleared: Boolean(savedPirate.cleared),
    };
    if (fresh[sectorNumber].defeated) {
      fresh[sectorNumber].hull = 0;
      fresh[sectorNumber].fighters = 0;
    }
  });
  return fresh;
}

function defaultGameState() {
  const today = todayKey();
  const starter = SHIPS.rustyComet;
  return {
    player: {
      pilotName: "Cadet",
      captainProfile: { ...DEFAULT_CAPTAIN_PROFILE },
      shipId: starter.id,
      shipName: starter.name,
      credits: 500,
      fuel: starter.maxFuel,
      maxFuel: starter.maxFuel,
      turns: STARTING_TURNS,
      maxTurns: calculateMaxTurnBank(1),
      lastTurnRefreshDate: today,
      cargoCapacity: starter.cargoCapacity,
      currentSector: 1,
      hull: starter.maxHull,
      maxHull: starter.maxHull,
      cargo: { Ore: 0, Food: 0, Tech: 0, Smuggled: 0 },
      cargoCostBasis: defaultCargoCostBasis(),
      reputation: 0,
      lawfulReputation: 0,
      pirateReputation: 0,
      alignmentStatus: "Independent",
      combatRank: "Civilian Pilot",
      fighters: 0,
      fighterCapacity: starter.fighterCapacity,
      combatWins: 0,
      combatLosses: 0,
      piratesDefeated: 0,
      shipsCaptured: 0,
      fightersLost: 0,
      fightersDestroyed: 0,
      fightersBought: 0,
      fightersSold: 0,
      bountiesEarned: 0,
      strongholdsCleared: 0,
      playerHullDamageTaken: 0,
      pirateHullDamageDealt: 0,
      upgrades: { cargoHold: 1, engine: 1, scanner: 1, shield: 1, hyperdrive: 0 },
      ownedShips: [starter.id],
      legacyUpgradeOverride: false,
      legacyUpgradeNoteShown: false,
    },
    planets: {},
    pirates: createPirateEncounters(),
    visitedSectors: [1],
    revealedSectors: [1],
    activeMissions: missionTemplates().slice(0, 3).map((mission) => createActiveMission(mission.id)),
    completedMissions: [],
    tutorial: { completedSteps: [], finished: false, guidedStartComplete: false, guidedStartStep: 0 },
    achievements: [],
    stats: defaultStats(),
    log: ["Welcome to Sector Drift. Start at Sector 1 and move at your own pace."],
    arrivalReport: "Standing by in Sector 1. Core Port detected. Alliance protected space.",
    dockingLedger: defaultDockingLedger(500),
    currentMission: generateMission(),
    missionAttempts: 0,
    missionLocked: false,
    missionFeedback: "Solve the mission for credits, fuel, turns, or cargo.",
    missionFeedbackClass: "",
    selectedMissionTier: 2,
    ui: { mapZoom: DEFAULT_MAP_ZOOM, activeScreen: "cockpit", warpDestination: null, exploratoryWarp: false, lastSectorActionResult: null },
    deliveryQuests: createDeliveryQuests(),
    stationActivities: defaultStationActivities(),
    lastProductionAt: 0,
  };
}


function defaultCargoCostBasis() {
  return [...RESOURCES, SMUGGLED_RESOURCE].reduce((basis, resource) => {
    basis[resource] = { quantity: 0, totalCost: 0, known: true };
    return basis;
  }, {});
}

function migrateCargoCostBasis(savedBasis = {}, cargo = {}) {
  const basis = defaultCargoCostBasis();
  [...RESOURCES, SMUGGLED_RESOURCE].forEach((resource) => {
    const saved = savedBasis && typeof savedBasis === "object" ? savedBasis[resource] : null;
    const quantity = Math.max(0, Math.floor(Number(cargo[resource]) || 0));
    if (saved && typeof saved === "object") {
      const known = saved.known !== false;
      const savedQuantity = Math.max(0, Math.floor(Number(saved.quantity) || 0));
      const totalCost = Math.max(0, Number(saved.totalCost) || 0);
      basis[resource] = { quantity: Math.min(quantity, savedQuantity || quantity), totalCost: known ? Math.min(totalCost, quantity * Math.max(0, totalCost / Math.max(1, savedQuantity || quantity))) : 0, known };
      if (quantity === 0) basis[resource] = { quantity: 0, totalCost: 0, known: true };
      return;
    }
    basis[resource] = quantity > 0 ? { quantity, totalCost: 0, known: false } : { quantity: 0, totalCost: 0, known: true };
  });
  return basis;
}

function defaultDockingLedger(startingCredits = 0, sectorNumber = null) {
  return {
    active: false,
    sectorNumber,
    startedWith: Math.max(0, Math.floor(Number(startingCredits) || 0)),
    current: Math.max(0, Math.floor(Number(startingCredits) || 0)),
    earned: 0,
    spent: 0,
    tradeProfit: 0,
    activityRewards: 0,
    serviceCosts: 0,
  };
}

function migrateDockingLedger(savedLedger = {}, credits = 0) {
  const base = defaultDockingLedger(credits);
  if (!savedLedger || typeof savedLedger !== "object") return base;
  return {
    ...base,
    active: Boolean(savedLedger.active),
    sectorNumber: Number(savedLedger.sectorNumber) || null,
    startedWith: Math.max(0, Math.floor(Number(savedLedger.startedWith) || 0)),
    current: Math.max(0, Math.floor(Number(credits) || 0)),
    earned: Math.max(0, Math.floor(Number(savedLedger.earned) || 0)),
    spent: Math.max(0, Math.floor(Number(savedLedger.spent) || 0)),
    tradeProfit: Math.floor(Number(savedLedger.tradeProfit) || 0),
    activityRewards: Math.max(0, Math.floor(Number(savedLedger.activityRewards) || 0)),
    serviceCosts: Math.max(0, Math.floor(Number(savedLedger.serviceCosts) || 0)),
  };
}

function createDeliveryQuests() {
  return [
    { id: "deliver-food-24", title: "Deliver 20 Food to Sector 24", description: "A lane outpost requested classroom-safe food supplies near Sector 24.", targetSector: 24, originSector: 1, requiredResource: "Food", requiredAmount: 20, reward: { credits: 520, fuel: 8, turns: 8, reputation: 1 }, status: "available", acceptedAtSector: null },
    { id: "deliver-tech-31", title: "Deliver 15 Tech to the Sector 31 port", description: "A deep lane depot needs replacement classroom lab parts delivered from the Sector 1 hub.", targetSector: 31, originSector: 1, requiredResource: "Tech", requiredAmount: 15, reward: { credits: 760, fuel: 10, turns: 10, reputation: 2 }, status: "available", acceptedAtSector: null },
    { id: "deliver-fuel-45", title: "Deliver 20 Fuel to Frontier Starbase 45", description: "A frontier station filed a long-range refuel request. Bring reserve fuel and plan the route before launching.", targetSector: 45, originSector: 1, requiredResource: "Fuel", requiredAmount: 20, reward: { credits: 980, fuel: 16, turns: 14, reputation: 3 }, status: "available", acceptedAtSector: null },
    { id: "fetch-danger-18", title: "Survey Sector 18 and Return to Sector 1", description: "Visit a dangerous lane marker, then return to the safe Sector 1 mission hub with your report.", targetSector: 18, returnSector: 1, originSector: 1, requiredResource: "Survey Report", requiredAmount: 1, reward: { credits: 430, fuel: 6, turns: 6, reputation: 1 }, status: "available", acceptedAtSector: null, visitedTarget: false },
  ];
}


function sanitizeCaptainName(value) {
  const cleaned = safePlainText(value, DEFAULT_CAPTAIN_PROFILE.name).replace(/[^A-Za-z0-9 ._'-]/g, "").trim().slice(0, 24);
  return cleaned || DEFAULT_CAPTAIN_PROFILE.name;
}

function normalizeCaptainTitle(value) {
  return CAPTAIN_TITLES.includes(value) ? value : DEFAULT_CAPTAIN_PROFILE.title;
}

function normalizeCaptainSpecialty(value) {
  return CAPTAIN_SPECIALTIES[value] ? value : DEFAULT_CAPTAIN_PROFILE.specialty;
}

function normalizeCaptainProfile(profile = {}, fallbackName = DEFAULT_CAPTAIN_PROFILE.name, setupFallback = false) {
  const safeProfile = safeObject(profile);
  const name = sanitizeCaptainName(safeProfile.name || fallbackName || DEFAULT_CAPTAIN_PROFILE.name);
  const title = normalizeCaptainTitle(safeProfile.title);
  const specialty = normalizeCaptainSpecialty(safeProfile.specialty);
  return { name, title, specialty, setupComplete: Boolean(safeProfile.setupComplete ?? setupFallback) };
}

function captainProfile() {
  game.player.captainProfile = normalizeCaptainProfile(game.player.captainProfile, game.player.pilotName, game.player.captainProfile?.setupComplete);
  game.player.pilotName = captainDisplayName(game.player.captainProfile);
  return game.player.captainProfile;
}

function captainDisplayName(profile = captainProfile()) {
  const normalized = normalizeCaptainProfile(profile, profile.name, profile.setupComplete);
  return normalized.title === normalized.name ? normalized.name : `${normalized.title} ${normalized.name}`.trim();
}

function captainSpecialtyKey() {
  return normalizeCaptainSpecialty(game?.player?.captainProfile?.specialty);
}

function captainSpecialtyData(key = captainSpecialtyKey()) {
  return CAPTAIN_SPECIALTIES[key] || CAPTAIN_SPECIALTIES[DEFAULT_CAPTAIN_PROFILE.specialty];
}

function captainSpecialtyBonusText(key = captainSpecialtyKey()) {
  const specialty = captainSpecialtyData(key);
  return `${specialty.label}: ${specialty.bonus}`;
}

function needsCaptainSetup() {
  return !game?.player?.captainProfile?.setupComplete;
}

function applyCaptainProfile({ name, title, specialty } = {}) {
  const profile = normalizeCaptainProfile({ name, title, specialty, setupComplete: true }, game.player.pilotName, true);
  game.player.captainProfile = profile;
  game.player.pilotName = captainDisplayName(profile);
  addLog(`Captain profile saved: ${game.player.pilotName}, ${profile.specialty}.`);
  updatePresenceStatus("online", { silent: true });
  scheduleCompetitiveProfileUpdate("captain profile saved", { force: true });
  publishCompetitiveEvent("captainLaunched", `${game.player.pilotName} launched ${game.player.shipName || currentShip().name}.`, { sectorNumber: game.player.currentSector });
  saveGame();
  game.ui.activeScreen = "cockpit";
  render();
  return profile;
}

function renderCaptainProfileForm({ compact = false } = {}) {
  const profile = captainProfile();
  const titleOptions = CAPTAIN_TITLES.map((title) => `<option value="${title}" ${profile.title === title ? "selected" : ""}>${title}</option>`).join("");
  const specialtyCards = Object.values(CAPTAIN_SPECIALTIES).map((specialty) => `<label class="specialty-option"><input type="radio" name="captainSpecialty" value="${specialty.label}" ${profile.specialty === specialty.label ? "checked" : ""}><strong>${specialty.label}</strong><span>${specialty.bonus}</span></label>`).join("");
  return `<section class="captain-profile-card mini-card"><h3>${compact ? "Edit Captain Profile" : "Create Your Captain"}</h3><p class="help-text">Keep it quick: choose a name, title, and one tiny specialty bonus. You can edit this later in Settings / Save.</p><label class="form-row"><span>Captain name</span><input id="captainNameInput" maxlength="24" value="${safeDisplayText(profile.name)}" placeholder="Cadet"></label><label class="form-row"><span>Title</span><select id="captainTitleInput">${titleOptions}</select></label><div class="specialty-grid" role="radiogroup" aria-label="Captain specialty">${specialtyCards}</div><p class="help-text">Current bonus: ${captainSpecialtyBonusText(profile.specialty)}</p><div class="button-row"><button type="button" class="primary-launch-button" data-action="saveCaptainProfile">${compact ? "Save Captain Profile" : "Start as Captain"}</button></div></section>`;
}

function renderCaptainSetupScreen() {
  return `<section class="captain-setup-screen"><div class="launch-hero-card"><p class="eyebrow">First login setup</p><h2>Name Your Captain</h2><p class="subtitle">A simple identity helps your ship feel like yours. No Firebase login is required for this step.</p>${renderCaptainProfileForm()}</div></section>`;
}

function readCaptainProfileForm(scope = document) {
  const specialtyInput = scope.querySelector("input[name='captainSpecialty']:checked") || scope.querySelector("[name='captainSpecialty']:checked");
  return {
    name: scope.querySelector("#captainNameInput")?.value || DEFAULT_CAPTAIN_PROFILE.name,
    title: scope.querySelector("#captainTitleInput")?.value || DEFAULT_CAPTAIN_PROFILE.title,
    specialty: specialtyInput?.value || DEFAULT_CAPTAIN_PROFILE.specialty,
  };
}

function normalizeDeliveryQuest(quest) {
  const reward = quest.reward || { credits: quest.rewardCredits || 0, fuel: quest.rewardFuel || 0, turns: quest.rewardTurns || 0, reputation: quest.reputationReward || 0 };
  return { ...quest, reward, status: ["available", "active", "claimable", "complete"].includes(quest.status) ? quest.status : "available" };
}

function migrateDeliveryQuests(savedQuests) {
  const defaults = createDeliveryQuests();
  if (!Array.isArray(savedQuests)) return defaults.map(normalizeDeliveryQuest);
  return defaults.map((quest) => normalizeDeliveryQuest({ ...quest, ...(savedQuests.find((saved) => saved && saved.id === quest.id) || {}) }));
}

function missionBadge(label) { return `<span class="contract-badge">${label}</span>`; }
function deliveryQuestById(id) { return (game.deliveryQuests || []).find((quest) => quest.id === id); }
function isResourceDeliveryQuest(quest) { return quest && (RESOURCES.includes(quest.requiredResource) || quest.requiredResource === "Fuel"); }
function deliveryReward(quest) { return quest.reward || { credits: quest.rewardCredits || 0, fuel: quest.rewardFuel || 0, turns: quest.rewardTurns || 0, reputation: quest.reputationReward || 0 }; }

function deliveryRouteIntel(quest) {
  const target = Number(quest.targetSector);
  const known = game.visitedSectors.includes(target) || game.revealedSectors.includes(target);
  const knownRoute = findRouteToSector(game.player.currentSector, target);
  const scoutRoute = knownRoute || findExploratoryRouteToSector(game.player.currentSector, target);
  const routeStatus = knownRoute ? "route known" : scoutRoute ? "scout route visible" : known ? "partially known" : "route unknown";
  const next = scoutRoute && scoutRoute.length > 1 ? `Next suggested sector: ${scoutRoute[1]}${knownRoute ? "" : " (exploratory)"}` : "Next suggested sector: scan or travel adjacent lanes first.";
  return { known, route: scoutRoute, knownRoute, routeStatus, next };
}

function renderRouteHelp(quest) {
  const intel = deliveryRouteIntel(quest);
  const target = Number(quest.targetSector);
  return `<div class="route-help">${stat("Target Sector", target)}${stat("Target Intel", intel.known ? "known/revealed" : "unknown")}${stat("Route Status", intel.routeStatus)}<p class="help-text">${intel.next}</p><button type="button" data-plot-delivery="${quest.id}" ${intel.route ? "" : "disabled"}>${intel.knownRoute ? "Plot Route to Target" : "Scout Route to Target"}</button></div>`;
}

function renderDeliveryQuestBoard() {
  const quests = (game.deliveryQuests || []).map(normalizeDeliveryQuest);
  return `<h2>Delivery / Fetch Contracts</h2><p class="help-text">Sector 1 dispatch requires real travel: contracts cannot target your current sector and complete only at the destination.</p><div class="mission-grid">${quests.map((quest) => {
    const active = quest.status === "active" || quest.status === "claimable";
    const complete = canCompleteDeliveryQuest(quest);
    const atTarget = game.player.currentSector === quest.targetSector;
    const reward = deliveryReward(quest);
    const disabledReason = quest.status !== "available" ? "Already accepted or complete" : game.player.currentSector !== 1 ? "Accept from Sector 1" : atTarget ? "Target is current sector" : "Ready from Sector 1";
    return `<div class="mission-card contract-card ${complete ? "complete" : ""}"><div class="contract-badges">${missionBadge(quest.returnSector ? "Fetch" : "Delivery")}${complete ? missionBadge("Claimable") : ""}</div><h3>${quest.title}</h3><p>${quest.description}</p>${stat("Pickup Hub", `Sector ${quest.originSector || 1}`)}${stat("Delivery", `${quest.requiredAmount} ${quest.requiredResource}`)}${stat("Reward", formatReward(reward))}${active ? renderRouteHelp(quest) : ""}<div class="button-row"><button data-start-delivery="${quest.id}" ${quest.status === "available" && game.player.currentSector === 1 && !atTarget ? "" : "disabled"}>Accept Contract</button><button data-complete-delivery="${quest.id}" ${complete ? "" : "disabled"}>Complete / Claim</button></div><p class="help-text">Status: ${quest.status}. ${disabledReason}</p></div>`;
  }).join("")}</div>`;
}

function canCompleteDeliveryQuest(quest) {
  if (!quest || !["active", "claimable"].includes(quest.status)) return false;
  if (quest.returnSector) return Boolean(quest.visitedTarget) && game.player.currentSector === quest.returnSector;
  if (game.player.currentSector !== quest.targetSector) return false;
  if (quest.requiredResource === "Fuel") return game.player.fuel >= quest.requiredAmount;
  if (isResourceDeliveryQuest(quest)) return (game.player.cargo[quest.requiredResource] || 0) >= quest.requiredAmount;
  return true;
}

function startDeliveryQuest(id) {
  const quest = deliveryQuestById(id);
  if (!quest || quest.status !== "available") return addAndRender("That delivery quest is already active or complete.");
  if (game.player.currentSector !== 1) return addAndRender("Delivery and fetch contracts must be accepted from the Sector 1 mission hub.");
  if (game.player.currentSector === quest.targetSector) return addAndRender("Delivery targets must be away from your current sector.");
  if ((game.deliveryQuests || []).some((other) => other.id !== quest.id && other.status === "active" && other.targetSector === quest.targetSector)) return addAndRender("You already have an active contract for that target sector.");
  quest.status = "active";
  quest.acceptedAtSector = game.player.currentSector;
  addLog(`Accepted ${quest.returnSector ? "fetch" : "delivery"} contract: ${quest.title}. Target Sector ${quest.targetSector}.`);
  saveGame();
  render();
}

function completeDeliveryQuest(id) {
  const quest = deliveryQuestById(id);
  if (!canCompleteDeliveryQuest(quest)) return addAndRender("Delivery requirements are not met yet.");
  if (quest.requiredResource === "Fuel") game.player.fuel -= quest.requiredAmount;
  else if (isResourceDeliveryQuest(quest)) game.player.cargo[quest.requiredResource] -= quest.requiredAmount;
  applyReward(deliveryReward(quest));
  quest.status = "complete";
  addLog(`Completed delivery/fetch contract: ${quest.title}. Reward: ${formatReward(deliveryReward(quest))}.`);
  saveGame();
  render();
}

function updateDeliveryQuestProgress() {
  (game.deliveryQuests || []).forEach((quest) => {
    if (quest.status !== "active" || !quest.returnSector || quest.visitedTarget) return;
    if (game.player.currentSector === quest.targetSector) {
      quest.visitedTarget = true;
      addLog(`${quest.title}: target sector surveyed. Return to Sector ${quest.returnSector} to claim.`);
    }
  });
}

function plotDeliveryRoute(id) {
  const quest = deliveryQuestById(id);
  if (!quest) return addAndRender("Delivery contract not found.");
  return setWarpDestination(quest.targetSector);
}

function bountyBySector(sectorNumber) {
  const target = Number(sectorNumber);
  return Object.values(game.pirates || {}).find((pirate) => Number(pirate.sector) === target && !pirate.defeated);
}

function plotBountyRoute(sectorNumber) {
  const pirate = bountyBySector(sectorNumber);
  if (!pirate) return addAndRender("Bounty target not found or already defeated.");
  return setWarpDestination(pirate.sector, { context: "bounty", targetName: pirate.name });
}

function openBountyCombat(sectorNumber) {
  const pirate = bountyBySector(sectorNumber);
  if (!pirate || Number(pirate.sector) !== game.player.currentSector) return addAndRender("Travel to the bounty sector before opening combat.");
  return openScreen("combat");
}

function incrementTierMissionStat(tier) {
  const keys = {
    1: "basicMissionsCompleted",
    2: "standardMissionsCompleted",
    3: "advancedMissionsCompleted",
    4: "expertMissionsCompleted",
    5: "eliteMissionsCompleted",
  };
  const key = keys[normalizeMissionTier(tier)];
  game.stats[key] = (game.stats[key] || 0) + 1;
}

function defaultStats() {
  return {
    visitedSectors: [1],
    creditsEarnedFromTrade: 0,
    tradeProfit: 0,
    resourcesMined: 0,
    oreMined: 0,
    mathMissionsCompleted: 0,
    basicMissionsCompleted: 0,
    standardMissionsCompleted: 0,
    advancedMissionsCompleted: 0,
    expertMissionsCompleted: 0,
    eliteMissionsCompleted: 0,
    planetsClaimed: 0,
    anomaliesScanned: 0,
    resourcesDeposited: 0,
    planetUpgrades: 0,
    planetProductionCollected: 0,
    planetOreProduced: 0,
    planetFoodProduced: 0,
    planetTechProduced: 0,
    planetFightersProduced: 0,
    planetUpgradesPurchased: 0,
    highestPlanetProductionLevel: 1,
    highestPlanetDefenseRating: 0,
    techSold: 0,
    missionsClaimed: 0,
    resourcesSold: 0,
    piratesDefeated: 0,
    combatWins: 0,
    combatLosses: 0,
    shipsCaptured: 0,
    fightersLost: 0,
    fightersDestroyed: 0,
    fightersBought: 0,
    fightersSold: 0,
    bountiesEarned: 0,
    strongholdsCleared: 0,
    highThreatPiratesDefeated: 0,
    playerHullDamageTaken: 0,
    pirateHullDamageDealt: 0,
    reputation: 0,
    lawfulReputation: 0,
    pirateReputation: 0,
    alignmentStatus: "Independent",
    sectorsExplored: 1,
    discoveredSectorTypes: ["protected"],
    explorationDiscoveries: 0,
    anomaliesCataloged: 0,
    asteroidFieldsMined: 0,
    minedAsteroidSectors: [],
    tradeRoutesDiscovered: 0,
    discoveredTradeRoutes: [],
    tradeRoutesMapped: 0,
    pirateSectorsSurvived: 0,
    survivedPirateSectors: [],
    deadEndSectorsLogged: 0,
    discoveredDeadEnds: [],
    protectedSystemsVisited: 1,
    visitedProtectedSystems: [1],
    combatRank: "Civilian Pilot",
  };
}

function recordRecovery(message) {
  const text = String(message || "Save repaired so play can continue.");
  if (!sessionRecoveryMessages.includes(text)) sessionRecoveryMessages.unshift(text);
  sessionRecoveryMessages = sessionRecoveryMessages.slice(0, 6);
  localSaveStatus = text;
}

function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.floor(safe)));
}

function normalizeSectorNumber(value, fallback = 1) {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw < 1 || raw > MAX_SECTOR) return fallback;
  const number = Math.floor(raw);
  return sectorMap[number] ? number : fallback;
}

function normalizeResourceCargo(cargo = {}, capacity = 9999) {
  const source = safeObject(cargo);
  const normalized = { Ore: 0, Food: 0, Tech: 0, [SMUGGLED_RESOURCE]: 0 };
  [...RESOURCES, SMUGGLED_RESOURCE].forEach((resource) => {
    normalized[resource] = clampNumber(source[resource], 0, 9999, 0);
  });
  const limit = Math.max(0, Number.isFinite(Number(capacity)) ? Math.floor(Number(capacity)) : 9999);
  if (limit > 0) {
    let overflow = Object.values(normalized).reduce((total, amount) => total + amount, 0) - Math.max(limit, 9999);
    [...RESOURCES, SMUGGLED_RESOURCE].reverse().forEach((resource) => {
      if (overflow <= 0) return;
      const removed = Math.min(normalized[resource], overflow);
      normalized[resource] -= removed;
      overflow -= removed;
    });
  }
  return normalized;
}

function normalizeUpgradeLevels(upgrades = {}, ship = SHIPS.rustyComet) {
  const source = safeObject(upgrades);
  const caps = ship?.upgradeCaps || SHIPS.rustyComet.upgradeCaps;
  return Object.fromEntries(["cargoHold", "engine", "scanner", "shield", "hyperdrive"].map((key) => {
    const raw = Number(source[key]);
    const min = key === "hyperdrive" ? 0 : 1;
    const cap = caps[key] ?? (key === "hyperdrive" ? 1 : 1);
    if (key !== "hyperdrive" && Number.isFinite(raw) && raw > cap) return [key, Math.min(99, Math.floor(raw))];
    return [key, clampNumber(raw, min, cap, min)];
  }));
}

function normalizeCargoCostBasis(basis, cargo) {
  return migrateCargoCostBasis(safeObject(basis), cargo);
}

function backupCorruptLocalSave(rawSave) {
  if (typeof localStorage === "undefined" || !rawSave) return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_corruptBackup_${Date.now()}`, String(rawSave));
  } catch (error) {
    lastLocalSaveError = error?.message || "Could not create corrupt-save backup.";
  }
}

function localSaveUnavailableMessage() {
  return "Local browser save is unavailable. This session is continuing in memory, but progress may not persist after reload.";
}

function loadGame() {
  if (typeof localStorage === "undefined") {
    localStorageAvailable = false;
    localSaveStatus = "Local browser save is unavailable here; this session can still run in memory.";
    return defaultGameState();
  }
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    localStorageAvailable = false;
    lastLocalSaveError = error?.message || "localStorage could not be read.";
    recordRecovery("Local browser save could not be read. A temporary in-memory pilot was started.");
    return defaultGameState();
  }
  if (!saved) {
    localSaveStatus = "No local save found. A fresh prototype save is active.";
    return defaultGameState();
  }
  try {
    return migrateGameState(JSON.parse(saved));
  } catch (error) {
    backupCorruptLocalSave(saved);
    recordRecovery("Recovered from a corrupted local save. A fresh prototype save was started.");
    const fresh = defaultGameState();
    fresh.log.unshift("Save recovery: recovered from a corrupted local save and started fresh.");
    return fresh;
  }
}

function migrateGameState(saved = {}) {
  try {
    const fresh = defaultGameState();
    const repairs = [];
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      recordRecovery("Save could not be read safely. A fresh prototype save was started.");
      fresh.log.unshift("Save recovery: started a fresh prototype save because the saved data was not usable.");
      return fresh;
    }

    const savedPlayer = safeObject(saved.player);
    const savedUi = safeObject(saved.ui);
    const savedStats = safeObject(saved.stats);
    if (!saved.player || savedPlayer !== saved.player) repairs.push("missing player data restored");
    if (!saved.ui || savedUi !== saved.ui) repairs.push("missing screen data restored");
    if (!saved.stats || savedStats !== saved.stats) repairs.push("missing stats restored");

    const merged = { ...fresh, ...safeObject(saved) };
    merged.player = { ...fresh.player, ...savedPlayer };
    const hadCaptainProfile = Boolean(savedPlayer.captainProfile && typeof savedPlayer.captainProfile === "object");
    merged.player.captainProfile = normalizeCaptainProfile(savedPlayer.captainProfile, savedPlayer.pilotName || fresh.player.pilotName, !saved.player ? false : !hadCaptainProfile);
    merged.player.pilotName = captainDisplayName(merged.player.captainProfile);
    const originalSector = merged.player.currentSector;
    merged.player.currentSector = normalizeSectorNumber(merged.player.currentSector, 1);
    if (Number(originalSector) !== merged.player.currentSector) repairs.push(`invalid sector reset to Sector ${merged.player.currentSector}`);

    merged.player.shipId = shipIdFromName(merged.player.shipId || merged.player.shipName);
    const ship = SHIPS[merged.player.shipId] || SHIPS.rustyComet;
    if (!SHIPS[merged.player.shipId]) repairs.push("invalid ship restored to the starter ship");
    merged.player.shipId = ship.id;
    merged.player.shipName = ship.name;
    merged.player.upgrades = normalizeUpgradeLevels(savedPlayer.upgrades, ship);

    const exceedsCaps = Object.entries(merged.player.upgrades).some(([key, level]) => level > (ship.upgradeCaps[key] || level));
    merged.player.legacyUpgradeOverride = Boolean(savedPlayer.legacyUpgradeOverride || exceedsCaps);
    merged.player.legacyUpgradeNoteShown = Boolean(savedPlayer.legacyUpgradeNoteShown);

    merged.player.maxFuel = calculateFuelCapacity(ship, merged.player.upgrades);
    merged.player.maxHull = ship.maxHull + Math.max(0, (merged.player.upgrades.shield || 1) - 1) * 4;
    merged.player.maxTurns = calculateMaxTurnBank(merged.player.upgrades.engine);
    merged.player.cargoCapacity = calculateCargoCapacity(ship, merged.player.upgrades);
    merged.player.fighterCapacity = calculateFighterCapacity(ship, merged.player.upgrades);
    merged.player.cargo = normalizeResourceCargo(savedPlayer.cargo || fresh.player.cargo, merged.player.cargoCapacity);
    if (!savedPlayer.cargo || typeof savedPlayer.cargo !== "object") repairs.push("missing cargo data restored");
    merged.player.cargoCostBasis = normalizeCargoCostBasis(savedPlayer.cargoCostBasis, merged.player.cargo);
    if (!savedPlayer.cargoCostBasis || typeof savedPlayer.cargoCostBasis !== "object") repairs.push("missing cargo cost data restored");

    merged.player.credits = clampNumber(merged.player.credits, 0, 999999999, fresh.player.credits);
    merged.player.fuel = clampNumber(merged.player.fuel, 0, merged.player.maxFuel, merged.player.maxFuel);
    merged.player.hull = clampNumber(merged.player.hull, 1, merged.player.maxHull, merged.player.maxHull);
    merged.player.turns = clampNumber(merged.player.turns, 0, merged.player.maxTurns, STARTING_TURNS);
    merged.player.reputation = clampNumber(merged.player.reputation, -100, 100, 0);
    merged.player.lawfulReputation = clampNumber(merged.player.lawfulReputation, 0, 1000000, Math.max(0, merged.player.reputation));
    merged.player.pirateReputation = clampNumber(merged.player.pirateReputation, 0, 1000000, Math.max(0, -merged.player.reputation));
    merged.player.alignmentStatus = typeof merged.player.alignmentStatus === "string" ? merged.player.alignmentStatus : reputationTitle(merged.player.reputation);
    merged.player.combatRank = typeof merged.player.combatRank === "string" ? merged.player.combatRank : "Civilian Pilot";
    merged.player.fighters = clampNumber(merged.player.fighters, 0, Math.max(merged.player.fighterCapacity, clampNumber(savedPlayer.fighterCapacity, 0, 9999, merged.player.fighterCapacity)), 0);
    ["combatWins", "combatLosses", "piratesDefeated", "shipsCaptured", "fightersLost", "fightersDestroyed", "fightersBought", "fightersSold", "bountiesEarned", "strongholdsCleared", "playerHullDamageTaken", "pirateHullDamageDealt"].forEach((key) => {
      merged.player[key] = clampNumber(merged.player[key], 0, 999999999, 0);
    });
    merged.player.ownedShips = safeArray(savedPlayer.ownedShips, [ship.id]).map(shipIdFromName).filter((id) => SHIPS[id]);
    if (!merged.player.ownedShips.includes(ship.id)) merged.player.ownedShips.push(ship.id);
    if (!merged.player.ownedShips.length) merged.player.ownedShips = [ship.id];

    const fighterMigrationNote = merged.player.fighters > merged.player.fighterCapacity && savedPlayer.fighterCapacity
      ? `Migration note: preserved ${merged.player.fighters} fighters from a legacy over-cap save; current ship capacity is ${merged.player.fighterCapacity}.`
      : "";
    if (!merged.player.lastTurnRefreshDate || typeof merged.player.lastTurnRefreshDate !== "string") merged.player.lastTurnRefreshDate = todayKey();

    const savedPlanets = safeObject(saved.planets);
    merged.planets = Object.fromEntries(Object.entries(savedPlanets).map(([id, planet]) => {
      const safePlanet = safeObject(planet);
      const sectorNumber = normalizeSectorNumber(Number(String(id).replace(/\D+/g, "")) || Number(String(safePlanet.id || "").replace(/\D+/g, "")), 1);
      const sector = sectorMap[sectorNumber] || {};
      return [id, normalizePlanetState({ ...(sector.planet || {}), ...safePlanet }, sectorNumber, sector.routeRole, sector.dangerLevel)];
    }));
    merged.pirates = removeProtectedPirates(mergePirateEncounters(safeObject(saved.pirates)));
    merged.activeMissions = safeArray(saved.activeMissions).length > 0 ? safeArray(saved.activeMissions).map(rehydrateBoardMission).slice(0, 3) : fresh.activeMissions;
    merged.completedMissions = safeArray(saved.completedMissions);
    while (merged.activeMissions.length < 3) {
      const next = nextAvailableMission(merged.activeMissions, merged.completedMissions);
      if (!next) break;
      merged.activeMissions.push(createActiveMission(next.id));
    }
    merged.tutorial = { ...fresh.tutorial, ...safeObject(saved.tutorial) };
    if (!Array.isArray(merged.tutorial.completedSteps)) merged.tutorial.completedSteps = [];
    merged.tutorial.guidedStartComplete = Boolean(merged.tutorial.guidedStartComplete || merged.tutorial.finished);
    merged.tutorial.guidedStartStep = clampNumber(merged.tutorial.guidedStartStep, 0, 4, 0);
    merged.achievements = safeArray(saved.achievements);
    merged.stats = { ...fresh.stats, ...savedStats };
    Object.keys(fresh.stats).forEach((key) => {
      if (typeof fresh.stats[key] === "number") merged.stats[key] = clampNumber(merged.stats[key], 0, 999999999, fresh.stats[key]);
    });
    syncCombatStats(merged);
    merged.visitedSectors = normalizeSectorList(safeArray(saved.visitedSectors, safeArray(savedStats.visitedSectors, fresh.visitedSectors)), merged.player.currentSector);
    merged.revealedSectors = normalizeSectorList(safeArray(saved.revealedSectors, merged.visitedSectors), merged.player.currentSector);
    merged.stats.visitedSectors = normalizeSectorList(safeArray(merged.stats.visitedSectors, merged.visitedSectors), merged.player.currentSector);
    merged.log = safeArray(saved.log, fresh.log).map((entry) => String(entry)).slice(0, 12);
    if (fighterMigrationNote) merged.log.unshift(fighterMigrationNote);
    if (merged.player.legacyUpgradeOverride && !merged.player.legacyUpgradeNoteShown) {
      merged.log.unshift("Legacy save detected: over-cap upgrades were preserved for this ship instead of being clamped.");
      merged.player.legacyUpgradeNoteShown = true;
    }
    merged.selectedMissionTier = normalizeMissionTier(saved.selectedMissionTier || safeObject(saved.currentMission).tier || fresh.selectedMissionTier);
    merged.currentMission = rehydrateMission(safeObject(saved.currentMission));
    merged.missionFeedbackClass = typeof saved.missionFeedbackClass === "string" ? saved.missionFeedbackClass : "";
    merged.ui = { ...fresh.ui, ...savedUi };
    if (!["cockpit", "starbase", "shipyard", "specialMissions", "planets", "combat", "achievements", "stats", "reputation", "captainLog", "settings", "launch", "adminPanel"].includes(merged.ui.activeScreen)) repairs.push("invalid screen restored to the cockpit");
    merged.ui.activeScreen = "cockpit";
    merged.ui.mapZoom = clampMapZoom(merged.ui.mapZoom);
    merged.ui.warpDestination = sectorMap[Number(merged.ui.warpDestination)] ? Number(merged.ui.warpDestination) : null;
    merged.ui.exploratoryWarp = Boolean(merged.ui.exploratoryWarp);
    if (safeObject(savedUi.hyperdriveRecovery, null)) {
      const target = Number(savedUi.hyperdriveRecovery.target);
      merged.ui.warpDestination = sectorMap[target] ? target : merged.ui.warpDestination;
      repairs.push("hyperdrive route recovered after refresh");
    }
    merged.ui.lastSectorActionResult = normalizeSectorActionResult(savedUi.lastSectorActionResult);
    merged.deliveryQuests = migrateDeliveryQuests(safeArray(saved.deliveryQuests));
    merged.stationActivities = migrateStationActivities(safeObject(saved.stationActivities));
    merged.arrivalReport = typeof saved.arrivalReport === "string" ? saved.arrivalReport : initialArrivalReport(merged.player.currentSector);
    if (typeof saved.arrivalReport !== "string") repairs.push("arrival report refreshed");
    merged.dockingLedger = migrateDockingLedger(safeObject(saved.dockingLedger), merged.player.credits);
    if (!saved.dockingLedger || typeof saved.dockingLedger !== "object") repairs.push("docking ledger restored");
    updateScannerReveals(merged);

    if (repairs.length) {
      const summary = `Save repaired: ${[...new Set(repairs)].slice(0, 3).join("; ")}.`;
      recordRecovery(summary);
      merged.log.push(summary);
    }
    localSaveStatus = localStorageAvailable ? "Local save loaded and checked." : localSaveStatus;
    return merged;
  } catch (error) {
    recordRecovery("Save recovery started a fresh prototype save after unexpected saved data.");
    const fresh = defaultGameState();
    fresh.log.unshift("Save recovery: a fresh prototype save was started after unexpected saved data.");
    return fresh;
  }
}

function saveGame() {
  if (typeof localStorage === "undefined") {
    localStorageAvailable = false;
    localSaveStatus = localSaveUnavailableMessage();
    return false;
  }
  try {
    const saveCopy = { ...game, ui: { ...(game.ui || {}), activeScreen: "cockpit" } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveCopy));
    localStorageAvailable = true;
    localSaveStatus = "Local save updated on this device.";
    lastLocalSaveError = "";
    return true;
  } catch (error) {
    localStorageAvailable = false;
    lastLocalSaveError = error?.message || "localStorage could not be written.";
    localSaveStatus = localSaveUnavailableMessage();
    return false;
  }
}

function manualSaveNow() {
  const saved = saveGame();
  addLog(saved ? "Manual save complete." : localSaveUnavailableMessage());
  render();
  return saved;
}

function render() {
  const refreshed = refreshDailyTurns();
  const synced = syncProgressSystems();
  if (refreshed || synced) saveGame();
  // ACTIVE RENDER FLOW: renderActiveScreen() is the single current entry point.
  // Cockpit mode shows ship, tactical sector/map, and action panels.
  // Docked mode hides the cockpit shell and renders one full-screen location/system panel.
  // Legacy location renderers below are retained only when marked; do not wire new features to them.
  renderActiveScreen();
}

const SCREEN_TITLES = {
  cockpit: ["Cockpit", "Primary space-lane view with ship stats, map, and action choices."],
  starbase: ["Starbase", "Docked port services: market, fuel, repairs, and future item shop."],
  shipyard: ["Shipyard", "Compare hulls, fighter bays, upgrade caps, and trade-in cost before launch."],
  specialMissions: ["Special Missions", "Math missions, tutorial quests, board contracts, and delivery work."],
  planets: ["Planets", "Claim, upgrade, store resources, and transfer planet fighters."],
  combat: ["Combat / Pirate Intel", "NPC pirate encounters, bounty data, and safe combat controls."],
  achievements: ["Achievements", "Unlocked milestones and progress notes."],
  stats: ["Stats", "Compact career totals for exploration, trade, missions, and upgrades."],
  reputation: ["Reputation", "Alignment, combat rank, bounty record, and future reputation shop."],
  competitive: ["Competitive / Leaderboards", "Public rankings, shared activity, and display-only sector traffic."],
  captainLog: ["Captain's Log", "Newest entries first with full recent history."],
  settings: ["Settings / Save", "Local save controls and prototype safety notes."],
  captainSetup: ["Captain Setup", "Choose a quick captain identity and one tiny specialty bonus."],
  launch: ["Sector Drift", "Board your ship through classroom login or local prototype mode."],
  adminPanel: ["Admin Panel", "Teacher controls and classroom oversight tools."],
};

function screenNames() { return Object.keys(SCREEN_TITLES); }

const COCKPIT_SCREEN = "cockpit";
const LOCATION_MODE_SCREENS = ["starbase", "shipyard", "specialMissions", "planets", "combat", "achievements", "stats", "reputation", "competitive", "captainLog", "settings", "captainSetup", "adminPanel"];

function isDockedMode(screen = activeScreenName()) {
  return LOCATION_MODE_SCREENS.includes(screen);
}

function returnToShipLabel() {
  return "Exit / Return to Ship";
}

function openScreen(screenName) {
  game.ui = game.ui || {};
  if (screenName === "adminPanel" && !isTeacher()) {
    return addAndRender("Admin Panel is available only to signed-in teacher accounts.");
  }
  if (!canUseGameActions() && !["launch", "settings"].includes(screenName)) {
    game.ui.activeScreen = "launch";
    return addAndRender(authGateMessage());
  }
  const nextScreen = screenNames().includes(screenName) ? screenName : "cockpit";
  if (nextScreen === "starbase" && sectorMap[game.player.currentSector]?.type === "port" && game.ui.activeScreen !== "starbase") beginDockingSession();
  game.ui.activeScreen = nextScreen;
  updatePresenceStatus(nextScreen === "combat" ? "combat" : isDockedMode(nextScreen) ? "docked" : "online");
  render();
}

function closeScreen() {
  game.ui = game.ui || {};
  game.ui.activeScreen = COCKPIT_SCREEN;
  updatePresenceStatus("online");
  render();
}

function returnToCockpitAfterSuccessfulRoute(previousScreen = activeScreenName()) {
  if (previousScreen === COCKPIT_SCREEN) return false;
  game.ui = game.ui || {};
  game.ui.activeScreen = COCKPIT_SCREEN;
  updatePresenceStatus("online");
  return true;
}

function activeScreenName() {
  game.ui = game.ui || {};
  if (!screenNames().includes(game.ui.activeScreen)) game.ui.activeScreen = "cockpit";
  return game.ui.activeScreen;
}

function renderActiveScreen() {
  // CURRENT ACTIVE SCREENS:
  // - cockpit: renderShipPanel(), renderSectorPanel(), renderActionPanel(), renderCockpit().
  // - docked: renderDockedScreen() + renderScreenContent() for starbase, shipyard, missions,
  //   planets, combat, achievements, stats, reputation, captain log, settings, and admin.
  updateLaunchGateFromAuth();
  const screen = activeScreenName();
  const cockpit = document.getElementById("cockpitDashboard");
  if (screen !== "launch" && needsCaptainSetup() && canUseGameActions() && typeof window !== "undefined") {
    game.ui.activeScreen = "captainSetup";
    if (cockpit) cockpit.hidden = true;
    if (panels.docked) {
      panels.docked.hidden = false;
      renderDockedScreen(...SCREEN_TITLES.captainSetup, renderCaptainSetupScreen());
    }
    return;
  }
  if (screen === "launch") {
    if (cockpit) cockpit.hidden = true;
    if (panels.docked) {
      panels.docked.hidden = false;
      renderDockedScreen(...SCREEN_TITLES.launch, renderLaunchScreen());
    }
    return;
  }
  const dockedMode = isDockedMode(screen);
  if (cockpit) cockpit.hidden = dockedMode;
  if (panels.docked) panels.docked.hidden = !dockedMode;
  if (screen === COCKPIT_SCREEN) {
    renderShipPanel();
    renderSectorPanel();
    renderActionPanel();
    renderCockpit();
    return;
  }
  renderDockedScreen(...SCREEN_TITLES[screen], renderScreenContent(screen));
}

function renderCockpit() {
  const overlay = renderGuidedStartOverlay();
  if (panels.docked) {
    panels.docked.hidden = !overlay;
    panels.docked.className = "guided-start-host";
    panels.docked.innerHTML = overlay;
  }
  panels.docked?.querySelector("[data-action='guidedStartNext']")?.addEventListener("click", advanceGuidedStart);
  panels.docked?.querySelector("[data-action='guidedStartSkip']")?.addEventListener("click", completeGuidedStart);
}

function renderDockedScreen(title, subtitle, contentHtml) {
  if (!panels.docked) return;
  const screen = activeScreenName();
  const locationLabel = screen === "launch" ? "Launch Bay" : screen === "adminPanel" ? "Teacher Command Console" : screen === "combat" ? "Tactical Display" : "Docked Location Mode";
  panels.docked.className = `panel docked-screen docked-${screen}`;
  panels.docked.innerHTML = `<div class="docked-header"><div><p class="eyebrow">${locationLabel}</p><h2>${title}</h2><p class="help-text">${subtitle}</p></div>${["launch", "captainSetup"].includes(screen) ? "" : `<button type="button" class="exit-button button-exit" data-action="closeScreen">${returnToShipLabel()}</button>`}</div><div class="docked-content">${contentHtml}</div>`;
  panels.docked.querySelector("[data-action='closeScreen']")?.addEventListener("click", closeScreen);
  // Wire docked content exactly once after replacing the markup; duplicate wiring double-runs purchases.
  wireDockedButtons(panels.docked);
}

function renderScreenContent(screen) {
  const sector = sectorMap[game.player.currentSector];
  if (screen === "starbase") return sector.type === "port" ? renderStarbaseScreen(sector) : `<p class="empty-note">No port or starbase is available in Sector ${sector.number}.</p>`;
  if (screen === "shipyard") return sector.hasShipyard ? renderShipyardScreen() : `${renderActionResult()}<p class="empty-note">No shipyard is available in Sector ${sector.number}.</p>`;
  if (screen === "specialMissions") return renderSpecialMissionsScreen();
  if (screen === "planets") return renderPlanetsScreen();
  if (screen === "combat") return renderCombatScreen();
  if (screen === "achievements") return renderAchievementsContent();
  if (screen === "stats") return renderStatsPanel();
  if (screen === "reputation") return renderReputationScreen();
  if (screen === "competitive") return renderCompetitiveScreen();
  if (screen === "captainLog") return renderCaptainLogScreen();
  if (screen === "settings") return renderSettingsScreen();
  if (screen === "captainSetup") return renderCaptainSetupScreen();
  if (screen === "launch") return renderLaunchScreen();
  if (screen === "adminPanel") return renderAdminPanelScreen();
  return "";
}


function renderActionPanel() {
  if (!panels.action) return;
  const gateOpen = canUseGameActions();
  const sector = sectorMap[game.player.currentSector];
  const ownedPlanetCount = Object.values(game.planets || {}).filter((planet) => planet.owner === game.player.pilotName).length;
  const planetHere = sector.type === "planet" || Boolean(sector.homeworld);
  const pirateHere = Boolean(currentPirateEncounter());
  const actions = [
    { screen: "starbase", label: "Dock at Starbase", enabled: sector.type === "port", reason: sector.type === "port" ? `${sector.portType} available` : "No port in this sector" },
    { screen: "shipyard", label: "Enter Shipyard", enabled: Boolean(sector.hasShipyard), reason: sector.hasShipyard ? "Shipyard available" : "No shipyard here" },
    { screen: "specialMissions", label: "Open Mission Terminal", enabled: true, reason: "Mission terminal available" },
    { screen: "planets", label: "Manage Planet", enabled: planetHere || ownedPlanetCount > 0, reason: sector.homeworld ? "Protected homeworld present" : planetHere ? "Planet in sector" : ownedPlanetCount ? `${ownedPlanetCount} owned planet${ownedPlanetCount === 1 ? "" : "s"}` : "No local or owned planets" },
    { screen: "combat", label: "Engage Pirate", enabled: pirateHere || Object.values(game.pirates || {}).some((pirate) => !pirate.defeated), reason: pirateHere ? "Pirate detected" : "Known NPC bounty ledger" },
    { screen: "achievements", label: "Achievements", enabled: true, reason: `${game.achievements.length} unlocked` },
    { screen: "stats", label: "Stats", enabled: true, reason: `${(game.stats.visitedSectors || []).length} sectors · ${game.stats.missionsClaimed || 0} contracts` },
    { screen: "reputation", label: "Reputation", enabled: true, reason: `${reputationTitle(game.player.reputation)} · ${combatRankTitle()}` },
    { screen: "competitive", label: "Competitive", enabled: true, reason: cloudUiState.user ? "Leaderboards and shared activity" : "Google sign-in required" },
    { screen: "captainLog", label: "Captain's Log", enabled: true, reason: "Recent events" },
    { screen: "settings", label: "Settings / Save", enabled: true, reason: "Cloud login and local save controls" },
  ];
  if (isTeacher()) actions.push({ screen: "adminPanel", label: "Admin Panel", enabled: true, reason: "Teacher-only classroom tools" });
  panels.action.innerHTML = `${renderConnectionStatusStrip()}<h2 id="actionHeading">Cockpit Actions</h2><p class="help-text">${gateOpen ? "Choose one clear action. Disabled buttons explain why they are unavailable." : authGateMessage()}</p><div class="cockpit-availability"><p>${sector.type === "port" ? "Starbase available" : "No starbase here"}</p><p>${sector.hasShipyard ? "Shipyard available" : "No shipyard here"}</p><p>${pirateHere ? "Pirate detected" : "No pirate in sector"}</p><p>${sector.homeworld ? "Lamont Prime protected" : planetHere ? "Planet in sector" : ownedPlanetCount ? "Owned planets available" : "No planet in sector"}</p><p>Mission terminal available</p></div><div class="action-menu">${actions.map((action) => { const enabled = action.enabled && (gateOpen || action.screen === "settings"); const reason = gateOpen || action.screen === "settings" ? action.reason : "Launch required"; return `<button type="button" class="${action.screen === "adminPanel" ? "button-admin" : enabled ? "button-secondary" : "button-disabled-explained"}" data-screen="${action.screen}" title="${safeDisplayText(reason)}" ${enabled ? "" : "disabled"}><strong>${action.label}</strong><span>${safeDisplayText(reason)}</span></button>`; }).join("")}</div>${gateOpen ? renderEmergencyWarpControl() : ""}<section class="cockpit-summary"><h3>Latest Log</h3><ol class="log-list compact-log">${game.log.slice(0, 5).map((entry) => `<li>${entry}</li>`).join("")}</ol></section>`;
  panels.action.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => openScreen(button.dataset.screen)));
  panels.action.querySelector("[data-action='emergencyWarp']")?.addEventListener("click", emergencyWarp);
}

function renderShipPanel() {
  const p = game.player;
  const ship = currentShip();
  const caps = ship.upgradeCaps;
  panels.ship.innerHTML = `
    <h2 id="shipHeading">Ship Status</h2>
    <div class="stat-grid compact-stat-grid">
      ${stat("Captain", captainDisplayName(captainProfile()))}${stat("Specialty", captainProfile().specialty)}${stat("Rank", currentRank())}${stat("Ship", p.shipName)}${stat("Credits", p.credits)}${stat("Fuel", `${p.fuel}/${p.maxFuel}`)}${stat("Turns", `${p.turns}/${p.maxTurns}`)}${stat("Hull", `${p.hull}/${p.maxHull}`)}${stat("Sector", p.currentSector)}${stat("Cargo", `${cargoUsed()}/${p.cargoCapacity}`)}${stat("Fighters", `${p.fighters}/${p.fighterCapacity}`)}${stat("Hazard Resist", ship.hazardResist + Math.max(0, p.upgrades.shield - 1))}${stat("Warp", game.ui?.warpDestination ? `Sector ${game.ui.warpDestination}` : "None")}
    </div>
    <p class="help-text"><strong>Specialty Bonus:</strong> ${captainSpecialtyBonusText()}</p>
    <details class="compact-section cockpit-extra"><summary>Reputation and alignment</summary><div class="stat-grid compact-stat-grid">${stat("Reputation", `${p.reputation} · ${reputationTitle(p.reputation)}`)}${stat("Combat Rank", combatRankTitle())}${stat("Alignment", p.alignmentStatus || reputationTitle(p.reputation))}</div></details>
    <p class="help-text">${ship.description}</p>
    ${p.cargo[SMUGGLED_RESOURCE] > 0 ? `<p class="help-text"><strong>${SMUGGLED_DISPLAY_NAME}:</strong> ${p.cargo[SMUGGLED_RESOURCE]} · ${SMUGGLED_DESCRIPTION}</p>` : ""}
    ${p.legacyUpgradeOverride ? `<p class="cooldown">Legacy upgrade override active: ${upgradeReductionSummary(p.upgrades, caps)}</p>` : ""}
    ${p.turns <= 0 ? `<p class="turn-warning">Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.</p>` : ""}
    ${cargoSpaceLeft() < 0 ? `<p class="turn-warning">Cargo is over capacity. Sell, deposit, or dump cargo before buying more.</p>` : ""}
    <h3>Cargo</h3>
    <div class="cargo-grid">${RESOURCES.map((r) => `<div class="resource"><span class="label">${r}</span><span class="value">${p.cargo[r]}</span></div>`).join("")}${p.cargo[SMUGGLED_RESOURCE] > 0 ? `<div class="resource"><span class="label">${SMUGGLED_DISPLAY_NAME}</span><span class="value">${p.cargo[SMUGGLED_RESOURCE]}</span></div>` : ""}</div>
    <h3>Upgrades</h3>
    <div class="cargo-grid">
      ${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}/${caps.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}/${caps.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}/${caps.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}/${caps.shield}`)}${stat("Hyperdrive", `${p.upgrades.hyperdrive || 0}/${caps.hyperdrive || 1}`)}
    </div>`;
}

function renderSectorPanel() {
  const sector = sectorMap[game.player.currentSector];
  const cannotTravel = game.player.fuel <= 0 || game.player.turns <= 0;
  const danger = canSeeDanger(sector.number) && sector.dangerLevel > 0 ? `${HAZARD_TYPES[sector.hazardType].icon} Danger ${sector.dangerLevel}: ${HAZARD_TYPES[sector.hazardType].label}` : "Danger unknown";
  panels.sector.innerHTML = `
    <h2 id="sectorHeading">Tactical Cockpit</h2>
    ${renderConnectionStatusStrip()}
    ${renderLiveEventBox()}
    ${renderCurrentSituation(sector, danger)}
    ${renderNavigationIntel()}
    ${renderContextualHelper()}
    ${renderSectorTraffic()}
    <section class="viewer-map" aria-label="Interactive sector map">
      <div class="viewer-map-heading"><h3>Lane Map</h3><p class="help-text">Tap a node once to scan. Tap an adjacent selected node again to travel.</p></div>
      ${renderMinimap()}
    </section>
    ${renderWarpControls()}
    <details class="manual-travel fallback-controls compact-section">
      <summary>Manual travel controls</summary>
      <p class="help-text">Fallback buttons for adjacent sectors. The map above is the primary navigation control.</p>
      <div class="travel-grid compact-travel-grid">
        ${sector.adjacent.map((number) => `<button type="button" ${cannotTravel ? "disabled" : ""} data-action="travel" data-sector="${number}">${scannerTravelLabel(number)}</button>`).join("")}
      </div>
      ${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.</p>` : game.player.fuel <= 0 ? `<p class="cooldown">Fuel is empty. Complete math missions for fuel or trade when you reach a port.</p>` : `<p class="help-text">Travel costs 1 turn and 1 fuel. Sector events may occur after arrival.</p>`}
    </details>`;
  panels.sector.querySelectorAll("[data-action='travel']").forEach((button) => button.addEventListener("click", () => travelToSector(Number(button.dataset.sector))));
  wireSituationCardButtons(panels.sector);
  wireWarpControls(panels.sector);
  wirePlotSelectedRouteButtons(panels.sector);
  panels.sector.querySelector("[data-map-zoom='out']")?.addEventListener("click", () => zoomMap(-MAP_ZOOM_STEP));
  panels.sector.querySelector("[data-map-zoom='in']")?.addEventListener("click", () => zoomMap(MAP_ZOOM_STEP));
  panels.sector.querySelector("[data-map-zoom='reset']")?.addEventListener("click", resetMapView);
  wireMapSectorNodes(panels.sector);
  panels.ship.querySelector("[data-action='emergencyWarp']")?.addEventListener("click", emergencyWarp);
}

function wireMapSectorNodes(container) {
  container.querySelectorAll("[data-map-sector]").forEach((node) => {
    const number = Number(node.dataset.mapSector);
    node.addEventListener("click", () => handleMapNodeSelect(number));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleMapNodeSelect(number);
      }
      if (event.key === " ") {
        event.preventDefault();
        handleMapNodeSelect(number);
      }
    });
    node.addEventListener("focus", () => selectSector(number, true));
  });
}

function renderMinimap() {
  const visible = getVisibleSectorNumbers();
  const visibleSet = new Set(visible);
  const lanes = [];
  Object.values(sectorMap).forEach((sector) => {
    if (!visibleSet.has(sector.number)) return;
    sector.adjacent.forEach((neighbor) => {
      if (sector.number >= neighbor || !visibleSet.has(neighbor)) return;
      const strong = sector.number === game.player.currentSector || neighbor === game.player.currentSector;
      lanes.push(`<line class="map-lane ${strong ? "current-lane" : "known-lane"}" x1="${sector.coordinates.x}" y1="${sector.coordinates.y}" x2="${sectorMap[neighbor].coordinates.x}" y2="${sectorMap[neighbor].coordinates.y}" />`);
    });
  });
  const unknownStubs = renderUnknownLaneStubs(visibleSet);
  const nodes = visible.map((number) => renderMapNode(sectorMap[number])).join("");
  const zoom = clampMapZoom(game.ui?.mapZoom);
  const viewBox = mapViewBoxForZoom(zoom);
  return `<div class="map-toolbar" aria-label="Minimap zoom controls"><span class="map-zoom-label">Zoom ${Math.round(zoom * 100)}%</span><button type="button" data-map-zoom="out" ${zoom <= MIN_MAP_ZOOM ? "disabled" : ""}>Zoom -</button><button type="button" data-map-zoom="in" ${zoom >= MAX_MAP_ZOOM ? "disabled" : ""}>Zoom +</button><button type="button" data-map-zoom="reset" ${zoom === DEFAULT_MAP_ZOOM ? "disabled" : ""}>Reset View</button></div><div class="minimap" aria-label="Scanner minimap"><svg class="sector-map" viewBox="${viewBox}" role="img" aria-label="Local sector lane map"><g class="map-lanes">${lanes.join("")}${unknownStubs}</g><g class="map-nodes">${nodes}</g></svg></div>`;
}

function clampMapZoom(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_MAP_ZOOM;
  return Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, Math.round(numeric * 100) / 100));
}

function mapViewBoxForZoom(zoom = game.ui?.mapZoom || DEFAULT_MAP_ZOOM) {
  const size = 100 / clampMapZoom(zoom);
  const current = sectorMap[game.player.currentSector]?.coordinates || { x: 50, y: 50 };
  const half = size / 2;
  const min = size >= 100 ? (100 - size) / 2 : 0;
  const max = size >= 100 ? min : 100 - size;
  const x = Math.min(max, Math.max(min, current.x - half));
  const y = Math.min(max, Math.max(min, current.y - half));
  return `${x.toFixed(2)} ${y.toFixed(2)} ${size.toFixed(2)} ${size.toFixed(2)}`;
}

function zoomMap(delta) {
  game.ui = game.ui || { mapZoom: DEFAULT_MAP_ZOOM };
  game.ui.mapZoom = clampMapZoom((game.ui.mapZoom || DEFAULT_MAP_ZOOM) + delta);
  saveGame();
  renderSectorPanel();
}

function resetMapView() {
  game.ui = game.ui || {};
  game.ui.mapZoom = DEFAULT_MAP_ZOOM;
  selectedSectorNumber = game.player.currentSector;
  selectedMapClickSector = null;
  saveGame();
  renderSectorPanel();
}

function renderUnknownLaneStubs(visibleSet) {
  if (game.player.upgrades.scanner > 2) return "";
  return sectorMap[game.player.currentSector].adjacent.filter((number) => !visibleSet.has(number)).map((number) => {
    const from = sectorMap[game.player.currentSector].coordinates;
    const to = sectorMap[number].coordinates;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return `<line class="map-lane unknown-lane" x1="${from.x}" y1="${from.y}" x2="${from.x + dx * 0.28}" y2="${from.y + dy * 0.28}" />`;
  }).join("");
}

function renderMapNode(sector) {
  const visited = game.visitedSectors.includes(sector.number);
  const current = sector.number === game.player.currentSector;
  const adjacent = sectorMap[game.player.currentSector].adjacent.includes(sector.number);
  const detected = !visited && game.revealedSectors.includes(sector.number);
  const selected = selectedSectorNumber === sector.number;
  const danger = canSeeDanger(sector.number) && sector.dangerLevel > 0;
  const protectedSpace = isProtectedSpace(sector.number);
  const unknown = !visited && !detected;
  const travelReady = selected && adjacent && !current;
  const notAdjacent = selected && !adjacent && !current;
  const radius = current ? 4.2 : sector.routeRole === "crossroad" ? 3.8 : 3.3;
  const classes = ["map-node", sector.type, sector.routeRole, visited ? "visited" : "", current ? "current node-current" : "", adjacent ? "adjacent node-adjacent" : "", detected ? "detected" : "", selected ? "selected node-selected" : "", travelReady ? "node-travel-ready" : "", notAdjacent ? "node-not-adjacent" : "", danger ? "danger-known node-danger-known" : "", protectedSpace ? "node-protected" : "", unknown ? "node-unknown" : ""].filter(Boolean).join(" ");
  const tooltip = sectorTooltip(sector.number);
  return `<g class="${classes}" data-map-sector="${sector.number}" role="button" tabindex="0" aria-label="${tooltip}"><title>${tooltip}</title><circle class="map-hit-target" cx="${sector.coordinates.x}" cy="${sector.coordinates.y}" r="7.2"></circle><circle class="map-visible-node" cx="${sector.coordinates.x}" cy="${sector.coordinates.y}" r="${radius}"></circle><text x="${sector.coordinates.x}" y="${sector.coordinates.y + 1.35}">${sector.number}</text>${sector.routeRole === "deadEnd" ? `<circle class="role-marker" cx="${sector.coordinates.x + 4.5}" cy="${sector.coordinates.y - 4.5}" r="1.2"></circle>` : ""}${sector.routeRole === "crossroad" ? `<text class="role-symbol" x="${sector.coordinates.x + 5}" y="${sector.coordinates.y - 4}">✚</text>` : ""}${danger ? `<text class="danger-marker" x="${sector.coordinates.x + 4.7}" y="${sector.coordinates.y + 5.8}">!</text>` : ""}${protectedSpace ? `<text class="protected-marker" x="${sector.coordinates.x - 5}" y="${sector.coordinates.y + 5.8}">A</text>` : ""}</g>`;
}


function isProtectedSpace(sectorNumber) {
  return sectorDistance(1, Number(sectorNumber)) <= PROTECTED_SPACE_DEPTH;
}

function protectedSpaceLabel(sectorNumber) {
  return isProtectedSpace(sectorNumber) ? "Alliance Protected Space" : "Frontier Space";
}

function removeProtectedPirates(pirates = {}) {
  return Object.fromEntries(Object.entries(pirates).filter(([sectorNumber]) => !isProtectedSpace(Number(sectorNumber))));
}

function findRouteToSector(startSector, targetSector) {
  const start = Number(startSector);
  const target = Number(targetSector);
  if (!sectorMap[start] || !sectorMap[target]) return null;
  if (start === target) return [start];
  const known = new Set([...(game.visitedSectors || []), ...(game.revealedSectors || [])].map(Number));
  known.add(start);
  const queue = [[start]];
  const seen = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    for (const neighbor of sectorMap[last].adjacent) {
      if (seen.has(neighbor) || !known.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === target) return nextPath;
      seen.add(neighbor);
      queue.push(nextPath);
    }
  }
  return null;
}


function findExploratoryRouteToSector(startSector, targetSector) {
  const start = Number(startSector);
  const target = Number(targetSector);
  if (!sectorMap[start] || !sectorMap[target]) return null;
  if (start === target) return [start];
  const visible = new Set(getVisibleSectorNumbers().map(Number));
  visible.add(start);
  if (!visible.has(target)) return null;
  const queue = [[start]];
  const seen = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    for (const neighbor of sectorMap[last].adjacent) {
      if (seen.has(neighbor) || !visible.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === target) return nextPath;
      seen.add(neighbor);
      queue.push(nextPath);
    }
  }
  return null;
}

function setWarpDestination(sectorNumber, options = {}) {
  const previousScreen = activeScreenName();
  const target = Number(sectorNumber);
  if (!sectorMap[target]) return addAndRender("Warp destination must be a valid sector number.");
  const knownRoute = findRouteToSector(game.player.currentSector, target);
  const scoutRoute = knownRoute || findExploratoryRouteToSector(game.player.currentSector, target);
  if (!scoutRoute) return addAndRender(`No visible lane route to Sector ${target}. Visit or scan connecting lanes first.`);
  const exploratory = !knownRoute;
  game.ui = game.ui || {};
  game.ui.warpDestination = target;
  game.ui.exploratoryWarp = exploratory;
  const next = scoutRoute[1] || target;
  const isBountyRoute = options.context === "bounty";
  const title = isBountyRoute ? (exploratory ? "Bounty Scout Route Set" : "Bounty Route Set") : (exploratory ? "Scout Route Set" : "Route Set");
  const baseMessage = isBountyRoute
    ? `Bounty route set: Sector ${target}. Next jump: Sector ${next}.${exploratory ? " Scout route uses visible unexplored lanes one jump at a time." : ""}`
    : exploratory
      ? `Scout Route Set: Sector ${target} selected. Next hop: Sector ${next}. Exploratory autopilot may enter dangerous unexplored sectors one jump at a time.`
      : `Route Set: Sector ${target} selected. Next hop: Sector ${next}. Use Autopilot one jump at a time.`;
  const returnedToCockpit = returnToCockpitAfterSuccessfulRoute(previousScreen);
  const message = `${baseMessage}${returnedToCockpit ? " Autopilot is ready in the cockpit." : ""}`;
  const gained = [`Destination Sector ${target}`];
  if (isBountyRoute && options.targetName) gained.push(`Bounty: ${options.targetName}`);
  setSectorActionResult(title, message, { type: "neutral", gained, sector: target });
  addLog(message);
  saveGame();
  render();
}

function clearWarpDestination() {
  game.ui = game.ui || {};
  game.ui.warpDestination = null;
  game.ui.exploratoryWarp = false;
  setSectorActionResult("Route Cleared", "Autopilot destination cleared.", { type: "neutral" });
  addLog("Autopilot destination cleared.");
  saveGame();
  render();
}

function performWarpStep() {
  const target = Number(game.ui?.warpDestination);
  if (!sectorMap[target]) return addAndRender("Set a warp destination before engaging autopilot.");
  if (game.player.currentSector === target) {
    clearWarpDestination();
    return addAndRender(`Already at Sector ${target}. Autopilot standing down.`);
  }
  if (game.player.turns <= 0) return addAndRender("Autopilot stopped: out of turns.");
  if (game.player.fuel <= 0) return addAndRender("Autopilot stopped: out of fuel.");
  if (currentPirateEncounter()) return addAndRender("Autopilot stopped: pirate encounter detected in this sector.");
  const route = findRouteToSector(game.player.currentSector, target) || (game.ui?.exploratoryWarp ? findExploratoryRouteToSector(game.player.currentSector, target) : null);
  if (!route || route.length < 2) return addAndRender("Autopilot stopped: route is blocked, incomplete, or no longer visible.");
  const next = route[1];
  travelToSector(next);
  if (game.player.currentSector === target) {
    game.ui.warpDestination = null;
    game.ui.exploratoryWarp = false;
    setSectorActionResult("Autopilot Arrived", `Autopilot arrived at Sector ${target}.`, { type: "positive", sector: target });
    addLog(`Autopilot arrived at Sector ${target}.`);
  } else if (currentPirateEncounter()) {
    addLog("Autopilot paused for pirate contact. Review Combat / Pirate Intel.");
  }
  saveGame();
  render();
}


function engageHyperdrive() {
  if ((game.player.upgrades?.hyperdrive || 0) < 1) return addAndRender("Hyperdrive locked: purchase the Hyperdrive upgrade at a Shipyard first.");
  const target = Number(game.ui?.warpDestination);
  if (!sectorMap[target]) return addAndRender("Hyperdrive unavailable: plot a route first.");
  if (game.player.currentSector === target) return addAndRender(`Hyperdrive already at destination Sector ${target}.`);
  game.ui = { ...(game.ui || {}), hyperdriveRecovery: { target, startedSector: game.player.currentSector, startedAt: Date.now() } };
  saveGame();
  let jumps = 0;
  let fuelSpent = 0;
  let stopMessage = "";
  let stopTitle = "Hyperdrive Stopped";
  while (game.player.currentSector !== target) {
    if (currentPirateEncounter()) { stopMessage = `Hyperdrive interrupted in Sector ${game.player.currentSector}. Pirate contact detected.`; stopTitle = "Hyperdrive Interrupted"; break; }
    if (game.player.turns <= 0) { stopMessage = `Hyperdrive unavailable: not enough turns for the next jump.`; break; }
    if (game.player.fuel < HYPERDRIVE_FUEL_MULTIPLIER) { stopMessage = `Hyperdrive unavailable: not enough fuel for the next jump.`; break; }
    const route = findRouteToSector(game.player.currentSector, target) || (game.ui?.exploratoryWarp ? findExploratoryRouteToSector(game.player.currentSector, target) : null);
    if (!route || route.length < 2) { stopMessage = `Hyperdrive stopped in Sector ${game.player.currentSector}. Route is blocked or no longer visible.`; break; }
    const beforeSector = game.player.currentSector;
    const beforeHull = game.player.hull;
    travelToSector(route[1], { fuelCost: HYPERDRIVE_FUEL_MULTIPLIER, silentRender: true });
    game.ui.hyperdriveRecovery = { target, startedSector: beforeSector, currentSector: game.player.currentSector, jumps: jumps + 1, fuelSpent: fuelSpent + HYPERDRIVE_FUEL_MULTIPLIER, updatedAt: Date.now() };
    saveGame();
    if (game.player.currentSector === beforeSector) { stopMessage = `Hyperdrive stopped in Sector ${game.player.currentSector}. Route blocker detected.`; break; }
    jumps += 1;
    fuelSpent += HYPERDRIVE_FUEL_MULTIPLIER;
    if (currentPirateEncounter()) { stopMessage = `Hyperdrive interrupted in Sector ${game.player.currentSector}. Pirate contact detected.`; stopTitle = "Hyperdrive Interrupted"; break; }
    if (game.player.hull < beforeHull) { stopMessage = `Hyperdrive stopped in Sector ${game.player.currentSector}. Hull damage detected.`; break; }
  }
  if (game.player.currentSector === target) {
    game.ui.warpDestination = null;
    game.ui.exploratoryWarp = false;
    stopTitle = "Hyperdrive Jump Complete";
    stopMessage = `Hyperdrive jump complete: Sector ${target} reached after ${jumps} jump${jumps === 1 ? "" : "s"}. Fuel spent: ${fuelSpent}.`;
  } else if (!stopMessage) {
    stopMessage = `Hyperdrive stopped in Sector ${game.player.currentSector}.`;
  }
  if (game.ui?.hyperdriveRecovery) delete game.ui.hyperdriveRecovery;
  setSectorActionResult(stopTitle, stopMessage, { type: stopTitle.includes("Complete") ? "positive" : "neutral", gained: jumps ? [`${jumps} jump${jumps === 1 ? "" : "s"}`] : [], lost: fuelSpent ? [`${fuelSpent} fuel`] : [] });
  addLog(stopMessage);
  saveGame();
  render();
}


function situationActionButton(label, options = {}) {
  const { screen = "", action = "", mode = "", sector = "", disabled = false, primary = false, note = "" } = options;
  const attrs = ["type=\"button\""];
  if (screen) attrs.push(`data-screen="${screen}"`);
  if (action) attrs.push(`data-action="${action}"`);
  if (mode) attrs.push(`data-mode="${mode}"`);
  if (sector) attrs.push(`data-sector="${sector}"`);
  if (disabled) attrs.push("disabled");
  return `<button class="${primary ? "situation-primary" : "button-secondary"}" ${attrs.join(" ")}><strong>${label}</strong>${note ? `<span>${note}</span>` : ""}</button>`;
}

function selectedSituationSector() {
  return sectorMap[selectedSectorNumber] || sectorMap[game.player.currentSector];
}

function marketSummary(sector) {
  if (!sector?.portPrices) return "No market data available.";
  const bestBuy = RESOURCES.slice().sort((a, b) => sector.portPrices[a].buy - sector.portPrices[b].buy)[0];
  const bestSell = RESOURCES.slice().sort((a, b) => sector.portPrices[b].sell - sector.portPrices[a].sell)[0];
  return `Best buy: ${bestBuy} ${sector.portPrices[bestBuy].buy} cr. Best sell: ${bestSell} ${sector.portPrices[bestSell].sell} cr.`;
}

function planetSituationStatus(planet, sector) {
  if (!planet) return "No planet record available.";
  if (isProtectedHomeworld(planet)) return lamontPrimeStatusText();
  if (planet.owner === game.player.pilotName) return `Owned by you · production preview ${formatProduction(getPlanetProduction(planet))}.`;
  if (isProtectedSpace(sector.number)) return "Unclaimed survey world inside Alliance protected space.";
  if (sector.dangerLevel > 0) return "Unclaimed frontier world; secure the route before building.";
  return "Unclaimed planet ready for a classroom-safe colony claim from Planet Management.";
}

function missionRequirementSummary(intel) {
  if (!intel) return "No active delivery target here.";
  if (intel.missing > 0) return `Missing ${intel.missing} ${intel.quest.requiredResource}.`;
  if (intel.atCompletion) return "Ready to complete from the mission terminal.";
  return intel.quest.returnSector ? `Visit Sector ${intel.quest.targetSector}, then return to Sector ${intel.quest.returnSector}.` : `Deliver ${intel.quest.requiredAmount} ${intel.quest.requiredResource} to Sector ${intel.quest.targetSector}.`;
}

function renderSituationCard() {
  const current = sectorMap[game.player.currentSector];
  const selected = selectedSituationSector();
  const selectedCurrent = selected.number === current.number;
  const selectedVisible = getVisibleSectorNumbers().includes(selected.number);
  const selectedMissionIntel = missionTargetIntel(selected.number);
  const currentMissionIntel = missionTargetIntel(current.number);
  const pirate = currentPirateEncounter();
  let card = { type: "current", title: `Current Sector ${current.number}`, summary: "Review the local readout, then choose a useful next action.", meta: [], actions: [] };

  if (pirate) {
    const risk = estimateCombatRisk(pirate);
    card = {
      type: "pirate",
      title: `Pirate Encounter: ${pirate.name}`,
      summary: "An active NPC pirate encounter is blocking safe autopilot decisions in this sector.",
      meta: [stat("Threat", `${risk.label} · Level ${pirate.threatLevel}`), stat("Your Hull", `${game.player.hull}/${game.player.maxHull}`), stat("Your Fighters", `${game.player.fighters}/${game.player.fighterCapacity}`), stat("Patrol Zone", protectedSpaceLabel(current.number))],
      actions: [
        situationActionButton("Engage Pirate", { screen: "combat", primary: true, note: "Open combat screen" }),
        situationActionButton("Disengage Temporarily", { action: "pirateCombat", mode: "retreat", note: "Pirate still blocks travel" }),
        situationActionButton("Pay Off Pirates", { disabled: true, note: "Coming later" }),
      ],
    };
  } else if (selectedMissionIntel) {
    card = {
      type: "mission",
      title: "Mission Target",
      summary: `${selectedMissionIntel.quest.title} points to Sector ${selected.number}.`,
      meta: [stat("Target Sector", selected.number), stat("Requirement", missionRequirementSummary(selectedMissionIntel)), stat("Selected Status", selectedCurrent ? "Current sector" : selectedVisible ? "Scanned sector" : "Not visible")],
      actions: [situationActionButton("Open Mission Terminal", { screen: "specialMissions", primary: selectedMissionIntel.atCompletion, note: selectedMissionIntel.atCompletion ? "Claim route" : "Review route" })],
    };
  } else if (!selectedCurrent) {
    const adjacent = current.adjacent.includes(selected.number);
    const knownRoute = findRouteToSector(current.number, selected.number);
    const route = knownRoute || findExploratoryRouteToSector(current.number, selected.number);
    const canTravel = adjacent && game.player.fuel > 0 && game.player.turns > 0 && !currentPirateEncounter() && canUseGameActions();
    card = {
      type: "scanned",
      title: `Scanned Sector ${selected.number}`,
      summary: adjacent ? "This adjacent sector can be selected again on the map to travel." : route ? (knownRoute ? "This sector is on known lanes; plot warp to start routing." : "A cautious scout route is visible; autopilot will move one explored/visible jump at a time.") : "This sector is visible, but no complete route is known yet.",
      meta: [stat("Scan Result", selectedVisible ? titleCase(selected.type) : "Unknown"), stat("Travel", adjacent ? (canTravel ? "Tap selected map node again" : travelBlockedReason()) : route ? `${knownRoute ? "Route" : "Scout route"} via Sector ${route[1]}` : "No visible route"), stat("Patrol Zone", protectedSpaceLabel(selected.number))],
      actions: [
        adjacent ? situationActionButton("Tap Map Node to Travel", { action: "continueRoute", sector: selected.number, primary: canTravel, disabled: !canTravel, note: canTravel ? "Map confirms travel" : travelBlockedReason(selected.number) }) : situationActionButton(knownRoute ? "Set Warp Destination" : "Scout Route", { action: "plotSelectedRoute", sector: selected.number, primary: Boolean(route), disabled: !route, note: route ? (knownRoute ? "Known route" : "Exploratory route") : "Route unknown" }),
        situationActionButton("Scan Nearby", { action: "continueRoute", sector: selected.number, note: "Keep map focused" }),
      ],
    };
  } else if (current.type === "port") {
    const homeworldMeta = current.homeworld ? [stat("Protected Homeworld", `${current.homeworld.name} · Alliance protected · cannot be claimed or attacked`), stat("Beginner Safety", BEGINNER_SAFE_ZONE_COPY)] : [];
    card = {
      type: current.hasShipyard ? "shipyard port" : "port",
      title: current.homeworld ? `${LAMONT_PRIME_NAME} Safe Home Base` : "Safe Port / Starbase",
      summary: current.homeworld ? `${stationDisplayName(current)} orbits ${LAMONT_PRIME_NAME}. ${BEGINNER_SAFE_ZONE_COPY}` : `${stationDisplayName(current)} is a safe place to trade, repair, and choose missions before launching again.`,
      meta: [stat("Station Type", current.portType), stat("Patrol Zone", protectedSpaceLabel(current.number)), ...homeworldMeta, stat("Market", marketSummary(current)), stat("Shipyard", current.hasShipyard ? "Available" : "Not in this station"), stat("Mission Terminal", "Available")],
      actions: [
        situationActionButton("Dock at Starbase", { screen: "starbase", primary: true, note: "Trade and services" }),
        situationActionButton("Open Mission Terminal", { screen: "specialMissions", note: "Math and delivery" }),
        current.hasShipyard ? situationActionButton("Enter Shipyard", { screen: "shipyard", note: "Ships and fighters" }) : situationActionButton("Shipyard", { disabled: true, note: "Not here" }),
        situationActionButton("Scan Nearby", { action: "continueRoute", sector: current.number, note: "Use lane map" }),
      ],
    };
  } else if (current.type === "planet") {
    const planet = getPlanetState(current);
    card = {
      type: "planet",
      title: "Planet Detected",
      summary: `${planet.name} is a ${planet.type} world with colony management available from the Planets screen.`,
      meta: [stat("Planet", planet.name), stat("Type", planet.type), stat("Status", planetSituationStatus(planet, current)), stat("Patrol Zone", protectedSpaceLabel(current.number))],
      actions: [
        situationActionButton("Manage Planet", { screen: "planets", primary: planet.owner === game.player.pilotName, note: "Open planet screen" }),
        situationActionButton("View / Scan Planet", { action: "scanPlanet", note: "Survey details" }),
        situationActionButton("Claim Planet", { disabled: planet.owner === game.player.pilotName || isProtectedSpace(current.number), note: planet.owner === game.player.pilotName ? "Already owned" : isProtectedSpace(current.number) ? "Protected Alliance territory" : "Use Planets screen" }),
        situationActionButton("Continue Route", { action: "continueRoute", sector: current.number, note: "Return to map" }),
      ],
    };
  } else if (current.type === "asteroid") {
    const disabled = game.player.fuel <= 0 || game.player.turns <= 0 || cargoSpaceLeft() <= 0;
    card = {
      type: "hazard asteroid",
      title: current.dangerLevel > 0 ? "Asteroid / Hazard" : "Asteroid Field",
      summary: "Mine ore here only if you have fuel, turns, cargo room, and enough hull for any local hazard.",
      meta: [stat("Field", "Ore fragments"), stat("Danger", current.dangerLevel > 0 ? `${HAZARD_TYPES[current.hazardType].label} ${current.dangerLevel}` : "Low"), stat("Cargo Room", cargoSpaceLeft())],
      actions: [situationActionButton("Mine Asteroids", { action: "mine", primary: !disabled, disabled, note: disabled ? "Need fuel, turns, room" : "Use existing mining" }), situationActionButton("Continue Route", { action: "continueRoute", sector: current.number, note: "Return to map" })],
    };
  } else if (current.type === "anomaly") {
    card = {
      type: "anomaly",
      title: "Anomaly",
      summary: "A strange signal is available for a careful one-turn scan.",
      meta: [stat("Signal", "Unknown"), stat("Scanner", scannerHelpText()), stat("Patrol Zone", protectedSpaceLabel(current.number))],
      actions: [situationActionButton("Scan Anomaly", { action: "scan", primary: game.player.turns > 0, disabled: game.player.turns <= 0, note: game.player.turns > 0 ? "Use existing scan" : "Out of turns" }), situationActionButton("Continue Route", { action: "continueRoute", sector: current.number, note: "Return to map" })],
    };
  } else if (isProtectedSpace(current.number)) {
    card = {
      type: "protected",
      title: "Protected Alliance Space",
      summary: "This quiet protected sector is best used for route planning and scanning nearby lanes.",
      meta: [stat("Current Sector", current.number), stat("Status", "Protected patrol zone"), stat("Features", knownFeatures(current).join(", "))],
      actions: [situationActionButton("Scan Nearby", { action: "continueRoute", sector: current.number, primary: true, note: "Use lane map" }), situationActionButton("Open Mission Terminal", { screen: "specialMissions", note: "Check assignments" })],
    };
  } else {
    card = {
      type: "empty",
      title: "Empty Space",
      summary: currentMissionIntel ? "A mission marker is nearby, but this sector itself is quiet." : "No station, planet, anomaly, or active pirate is demanding action here.",
      meta: [stat("Current Sector", current.number), stat("Known Features", knownFeatures(current).join(", ")), stat("Patrol Zone", protectedSpaceLabel(current.number))],
      actions: [situationActionButton("Continue Route", { action: "continueRoute", sector: current.number, primary: true, note: "Use lane map" }), situationActionButton("Open Mission Terminal", { screen: "specialMissions", note: "Find goals" })],
    };
  }

  return `<section class="situation-card situation-${card.type.replace(/\s+/g, "-")}" data-situation-type="${card.type}" aria-label="Situation card"><div class="situation-card-header"><p class="eyebrow">Situation Card</p><h3>${card.title}</h3></div><p class="situation-summary">${card.summary}</p><p class="help-text">${sectorIdentityBrief(current, { force: true })}</p>${renderSectorTags(current, { force: true })}<div class="intel-grid situation-meta">${card.meta.join("")}</div>${card.actions.length ? `<div class="situation-actions">${card.actions.slice(0, 4).join("")}</div>` : `<p class="empty-note">No immediate action is required.</p>`}</section>`;
}

function focusRouteFromSituation(sectorNumber = selectedSectorNumber) {
  game.ui = game.ui || {};
  const number = Number(sectorNumber) || game.player.currentSector;
  game.ui.mapHint = number === game.player.currentSector ? "Use the lane map below to scan nearby sectors or choose your next jump." : `Sector ${number} stays selected. Use the highlighted map node for travel or route planning.`;
  saveGame();
  renderSectorPanel();
}

function wirePlotSelectedRouteButtons(scope = document) {
  if (!scope) return;
  scope.querySelectorAll("[data-action='plotSelectedRoute']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => plotSelectedRoute(Number(button.dataset.sector))); }));
}

function wireSituationCardButtons(scope = panels.sector) {
  if (!scope) return;
  scope.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => openScreen(button.dataset.screen)));
  scope.querySelectorAll("[data-action='pirateCombat']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => resolvePirateCombat(button.dataset.mode)); }));
  scope.querySelectorAll("[data-action='mine']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(mineAsteroids); }));
  scope.querySelectorAll("[data-action='scan']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(scanAnomaly); }));
  scope.querySelectorAll("[data-action='scanPlanet']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(scanPlanet); }));
  scope.querySelectorAll("[data-action='continueRoute']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); focusRouteFromSituation(button.dataset.sector); }));
}

function renderCurrentSituation(sector, danger) {
  const featureText = knownFeatures(sector).join(", ");
  return `<section class="current-situation priority-card" aria-label="Arrival report and current situation">
    ${renderArrivalReport()}
    ${renderSituationCard()}
    ${renderActionResult()}
    ${renderSectorTags(sector, { force: true })}
    <div class="current-situation-grid compact-current-readout">
      ${stat("Current Sector", `Sector ${sector.number}: ${sectorIdentityLabel(sectorIdentityType(sector))}`)}${stat("Visible Objects", featureText)}${stat("Scanner", scannerHelpText())}${stat("Threat Readout", danger)}
    </div>
  </section>`;
}

function renderWarpControls() {
  const target = Number(game.ui?.warpDestination) || "";
  const knownRoute = target ? findRouteToSector(game.player.currentSector, target) : null;
  const route = knownRoute || (game.ui?.exploratoryWarp ? findExploratoryRouteToSector(game.player.currentSector, target) : null);
  const scout = Boolean(target && route && !knownRoute);
  const routeText = target ? (route ? `Sector ${target}, ${route.length - 1} ${scout ? "scout " : ""}jump${route.length === 2 ? "" : "s"}${scout ? " · exploratory" : ""}` : `Sector ${target}, route unavailable`) : "No active destination";
  const routeDetail = target ? (route ? `${scout ? "Scout route" : "Route"}: ${route.join(" → ")}` : "No visible route plotted.") : "Plot a destination only when you need route automation.";
  const hyperdriveOwned = (game.player.upgrades?.hyperdrive || 0) >= 1;
  const hyperdriveText = hyperdriveOwned ? (target && route ? "Rapid jumps. Costs double fuel. Stops for danger." : "Plot a route first.") : "Hyperdrive locked: buy the one-time Shipyard upgrade for rapid route jumps.";
  return `<details class="warp-panel collapsible-system compact-section" ${target ? "open" : ""}>
    <summary><span>Warp / Autopilot</span><strong>${routeText}</strong></summary>
    <p class="help-text">Known-lane route travel is preferred. Autopilot advances one adjacent jump per step; scout routes may enter visible unexplored sectors, but fuel, turns, hazards, and active pirates still apply.</p>
    <label for="warpDestination">Set Warp Destination</label>
    <input id="warpDestination" type="number" min="1" max="${MAX_SECTOR}" value="${target}" placeholder="Sector number">
    <div class="button-row compact-button-row"><button type="button" data-action="plotWarp">Plot Route</button><button type="button" data-action="warpStep" ${target ? "" : "disabled"}>Engage Autopilot / Warp Step</button><button type="button" data-action="engageHyperdrive" ${hyperdriveOwned && target && route ? "" : "disabled"}>Engage Hyperdrive</button><button type="button" data-action="clearWarp" ${target ? "" : "disabled"}>Clear Destination</button></div>
    <p class="help-text">${routeDetail}</p>
    <p class="help-text"><strong>Hyperdrive:</strong> ${hyperdriveText}</p>
  </details>`;
}

function wireWarpControls(scope = document) {
  scope.querySelector("[data-action='plotWarp']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(() => setWarpDestination(scope.querySelector("#warpDestination")?.value)); });
  scope.querySelector("[data-action='warpStep']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(performWarpStep); });
  scope.querySelector("[data-action='engageHyperdrive']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(engageHyperdrive); });
  scope.querySelector("[data-action='clearWarp']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(clearWarpDestination); });
}

function renderNavigationIntel() {
  const selected = sectorMap[selectedSectorNumber] ? sectorMap[selectedSectorNumber] : sectorMap[game.player.currentSector];
  selectedSectorNumber = selected.number;
  const current = selected.number === game.player.currentSector;
  const adjacent = sectorMap[game.player.currentSector].adjacent.includes(selected.number);
  const visited = game.visitedSectors.includes(selected.number);
  const detected = game.revealedSectors.includes(selected.number);
  const visible = getVisibleSectorNumbers().includes(selected.number);
  const knownRoute = !current ? findRouteToSector(game.player.currentSector, selected.number) : [selected.number];
  const route = knownRoute || (!current ? findExploratoryRouteToSector(game.player.currentSector, selected.number) : [selected.number]);
  const status = current ? "Current sector" : adjacent ? "Adjacent · direct lane" : route ? `${knownRoute ? "Route known" : "Scout route visible"} · ${route.length - 1} jump${route.length === 2 ? "" : "s"}` : visited ? "Visited · route unknown" : detected ? "Detected · route unknown" : visible ? "Visible · route unknown" : "Unknown";
  const canTravel = adjacent && game.player.turns > 0 && game.player.fuel > 0 && !currentPirateEncounter() && canUseGameActions();
  const danger = canSeeDanger(selected.number) ? (selected.dangerLevel > 0 ? `${HAZARD_TYPES[selected.hazardType].icon} Danger ${selected.dangerLevel}: ${HAZARD_TYPES[selected.hazardType].label}` : "No danger detected") : "Danger unknown";
  const features = scannerFeatureText(selected);
  const tags = renderSectorTags(selected);
  const missionIntel = missionTargetIntel(selected.number);
  const routeStatus = current ? "Already here" : adjacent ? (canTravel ? "Direct lane available" : travelBlockedReason()) : route ? `${knownRoute ? "Route known" : "Scout route visible"}; next hop Sector ${route[1]}` : "Route unknown. Explore nearby lanes or use future probes.";
  const suggested = suggestedSectorAction(selected, { current, adjacent, route, missionIntel });
  const actionButton = !current && !adjacent && route ? `<button type="button" data-action="plotSelectedRoute" data-sector="${selected.number}">${knownRoute ? "Set Warp Destination" : "Scout Route"}</button>` : !current && !adjacent ? `<button type="button" data-action="plotSelectedRoute" data-sector="${selected.number}" disabled>Plot Route</button>` : "";
  const hint = game.ui?.mapHint ? `<p class="action-hint">${game.ui.mapHint}</p>` : "";
  return `<aside class="nav-intel main-viewer priority-card" aria-live="polite"><p class="eyebrow">Main Viewer</p><div class="viewer-title-row"><h3>Selected Sector Intel</h3>${actionButton}</div><div class="intel-grid">
    ${stat("Sector", selected.number)}${stat("Status", status)}${stat("System Type", visible ? sectorIdentityLabel(sectorIdentityType(selected)) : "Unknown")}${stat("Route Role", canSeeRouteRole(selected.number) ? titleCase(selected.routeRole) : "Scan level 2")}
    ${stat("Danger", danger)}${stat("Patrol Zone", protectedSpaceLabel(selected.number))}${selected.homeworld ? stat("Protected Homeworld", `${selected.homeworld.name} · Alliance safe zone`) : ""}${stat("Route / Travel", routeStatus)}${stat("Scanner Detail", scannerIntelDetails(selected))}${stat("Suggested Action", suggested)}
  </div>${tags}<p class="known-features"><strong>Sector brief:</strong> ${sectorIdentityBrief(selected)}</p>${selected.homeworld ? `<p class="known-features"><strong>Homeworld:</strong> ${homeworldScannerDetail(selected)}. ${BEGINNER_SAFE_ZONE_COPY}</p>` : ""}<p class="known-features"><strong>Known features:</strong> ${features}</p>${missionIntel ? renderMissionTargetIntel(missionIntel) : ""}<p class="strategic-note">${canSeeRouteRole(selected.number) ? selected.strategicNote : "Upgrade scanners to reveal route roles."}</p><p class="recommendation">${navigationRecommendation(selected.number)}</p>${hint}</aside>`;
}

function renderArrivalReport() {
  return `<section class="arrival-report"><h4>Arrival Report</h4><p>${game.arrivalReport || buildArrivalReport(game.player.currentSector)}</p></section>`;
}

function plotSelectedRoute(number = selectedSectorNumber) {
  return setWarpDestination(Number(number));
}

function missionTargetIntel(sectorNumber) {
  const quests = (game.deliveryQuests || []).filter((quest) => ["active", "claimable"].includes(quest.status) && (quest.targetSector === sectorNumber || quest.returnSector === sectorNumber));
  if (!quests.length) return null;
  const quest = quests[0];
  const atCompletion = canCompleteDeliveryQuest(quest);
  const missing = quest.requiredResource === "Fuel" ? Math.max(0, quest.requiredAmount - game.player.fuel) : isResourceDeliveryQuest(quest) ? Math.max(0, quest.requiredAmount - (game.player.cargo[quest.requiredResource] || 0)) : 0;
  return { quest, atCompletion, missing };
}

function renderMissionTargetIntel(intel) {
  const requirement = intel.missing > 0 ? `Missing ${intel.missing} ${intel.quest.requiredResource}.` : intel.atCompletion ? "Ready to complete here." : "Target marked for active contract.";
  return `<div class="mission-target-intel"><span class="badge mission-target-badge">Mission Target</span><strong>${intel.quest.title}</strong><p class="help-text">${requirement}</p></div>`;
}

function suggestedSectorAction(sector, context = {}) {
  if (context.current && sector.type === "port") return "Dock at Starbase";
  if (context.current && sector.hasShipyard) return "Open Shipyard";
  if (context.current && sector.type === "planet") return "Manage Planet";
  if (context.current && currentPirateEncounter()) return "Engage Pirate";
  if (context.missionIntel?.atCompletion) return "Open Special Missions";
  if (context.adjacent && game.player.fuel > 0 && game.player.turns > 0) return "Tap again to travel";
  if (!context.adjacent && context.route) return "Set Warp Destination";
  if (!context.adjacent) return "Plot Route";
  return navigationRecommendation(sector.number);
}

function renderEmergencyWarpControl() {
  const disabled = game.player.currentSector === 1 || game.player.fuel < 5;
  const reason = game.player.currentSector === 1 ? "Already at Sector 1." : game.player.fuel < 5 ? "Emergency warp requires 5 fuel and returns to Sector 1." : "Emergency warp requires 5 fuel and returns to Sector 1 without using turns.";
  return `<div class="emergency-warp"><button type="button" data-action="emergencyWarp" ${disabled ? "disabled" : ""}>Emergency Warp to Sector 1</button><p class="help-text">${reason}</p></div>`;
}

function handleMapNodeSelect(number) {
  if (!canUseGameActions()) return addAndRender(authGateMessage());
  if (!getVisibleSectorNumbers().includes(number)) return addAndRender("That sector is outside scanner visibility.");
  const current = sectorMap[game.player.currentSector];
  const target = Number(number);
  const wasSelected = selectedSectorNumber === target && selectedMapClickSector === target;
  selectedSectorNumber = target;
  selectedMapClickSector = target;
  if (target === game.player.currentSector) { renderSectorPanel(); return; }
  if (!current.adjacent.includes(target)) {
    game.ui = game.ui || {};
    const route = findRouteToSector(game.player.currentSector, target) || findExploratoryRouteToSector(game.player.currentSector, target);
    const exploratory = route && !findRouteToSector(game.player.currentSector, target);
    game.ui.mapHint = route ? `${exploratory ? "Scout route" : "Route known"} to Sector ${target}. Next hop: Sector ${route[1] || target}.` : `Route unknown to Sector ${target}. Explore nearby lanes or use future probes.`;
    saveGame();
    renderSectorPanel();
    return;
  }
  if (!wasSelected) {
    game.ui = game.ui || {};
    const blocker = travelBlockedReason(target);
    game.ui.mapHint = blocker === "Unavailable" ? `Tap again to travel to Sector ${target}. Danger markers do not block direct travel.` : `Travel blocked: ${blocker}.`;
    saveGame();
    renderSectorPanel();
    return;
  }
  selectedMapClickSector = null;
  travelToSector(target);
}

function selectSector(number, shouldRender = true) {
  if (!sectorMap[number]) return;
  selectedSectorNumber = number;
  if (shouldRender) renderSectorPanel();
}

function sectorTooltip(number) {
  const sector = sectorMap[number];
  const type = getVisibleSectorNumbers().includes(number) ? titleCase(sector.type) : "Unknown system";
  const danger = canSeeDanger(number) && sector.dangerLevel > 0 ? `, danger ${sector.dangerLevel}` : canSeeDanger(number) ? ", no danger detected" : ", danger unknown";
  const features = scannerFeatureText(sector);
  return `Sector ${number}: ${type}${danger}. ${features}.`;
}

function scannerFeatureText(sector) {
  if (!getVisibleSectorNumbers().includes(sector.number)) return "Upgrade scanners to reveal more";
  const visited = game.visitedSectors.includes(sector.number) || sector.number === game.player.currentSector;
  const scanner = game.player.upgrades.scanner || 1;
  if (scanner < 2 && !visited) return "Vague mass and danger returns only";
  if (scanner < 3 && !visited) return `${sectorIdentityLabel(sectorIdentityType(sector))} signature${sector.type === "port" ? ` · Port ${sector.portCode || "---"}` : ""}${sector.type === "asteroid" ? ` · ${sector.signals?.oreRichness || "ore field"}` : ""}${sector.type === "anomaly" ? " · anomaly hint" : ""}`;
  if (scanner < 4 && !visited) {
    const danger = sector.dangerLevel > 0 ? ` · threat ${sector.dangerLevel}` : " · low threat";
    const opportunity = sector.type === "planet" && sector.planet ? ` · ${sector.planet.type} world` : sector.type === "asteroid" ? ` · ${sector.signals?.oreRichness || "ore field"}` : "";
    return `${knownFeatures(sector).join(", ")}${danger}${opportunity}`;
  }
  return `${knownFeatures(sector).join(", ")} · ${titleCase(sector.routeRole)} · ${sectorSignalTags(sector).join(", ") || "No tags"}`;
}

function canSeeRouteRole(number) {
  return game.player.upgrades.scanner >= 2 || game.visitedSectors.includes(number) || number === game.player.currentSector;
}


function normalizeSectorActionResult(result = null) {
  if (!result || typeof result !== "object") return null;
  const type = ["positive", "negative", "neutral"].includes(result.type) ? result.type : "neutral";
  return {
    title: String(result.title || "Action Update").slice(0, 80),
    message: String(result.message || "").slice(0, 240),
    type,
    gained: Array.isArray(result.gained) ? result.gained.map(String).slice(0, 6) : [],
    lost: Array.isArray(result.lost) ? result.lost.map(String).slice(0, 6) : [],
    sector: sectorMap[Number(result.sector)] ? Number(result.sector) : 1,
    turn: Math.max(0, Math.floor(Number(result.turn) || 0)),
    timestamp: Math.max(0, Math.floor(Number(result.timestamp) || 0)),
  };
}

function setSectorActionResult(title, message, options = {}) {
  game.ui = game.ui || {};
  game.ui.lastSectorActionResult = normalizeSectorActionResult({
    title,
    message,
    type: options.type || "neutral",
    gained: options.gained || [],
    lost: options.lost || [],
    sector: options.sector || game.player.currentSector,
    turn: game.player.turns,
    timestamp: Date.now(),
  });
  if (!options.skipLiveEvent) {
    pushLiveEvent({ type: options.eventType || "action", title, message, tone: options.type || "neutral", sectorNumber: options.sector || game.player.currentSector });
  }
  return game.ui.lastSectorActionResult;
}

function renderActionResult() {
  const result = normalizeSectorActionResult(game.ui?.lastSectorActionResult);
  if (!result) return "";
  const lists = [
    result.gained?.length ? `<p><strong>Gained:</strong> ${result.gained.join(", ")}</p>` : "",
    result.lost?.length ? `<p><strong>Spent / Lost:</strong> ${result.lost.join(", ")}</p>` : "",
  ].filter(Boolean).join("");
  return `<section class="action-result action-result-${result.type}" aria-live="polite"><div class="action-result-heading"><span class="eyebrow">Action Result</span><strong>${result.title}</strong></div><p>${result.message}</p>${lists}<p class="help-text">Sector ${result.sector} · ${result.turn} turns remaining</p></section>`;
}

function addResultAndRender(title, message, options = {}) {
  setSectorActionResult(title, message, options);
  addLog(message);
  saveGame();
  render();
}

function travelBlockedReason(destination = null) {
  if (!canUseGameActions()) return authGateMessage();
  if (currentPirateEncounter()) return "Pirate encounter blocks travel";
  if (destination && !sectorMap[game.player.currentSector].adjacent.includes(Number(destination))) return "Destination is not adjacent";
  if (game.player.turns <= 0) return "Out of turns";
  if (game.player.fuel <= 0) return "Fuel empty";
  return "Unavailable";
}

function navigationRecommendation(number) {
  const sector = sectorMap[number];
  if (number === game.player.currentSector) return "You are here. Review adjacent lanes before moving.";
  if (!getVisibleSectorNumbers().includes(number)) return "Upgrade scanners to reveal more.";
  if (!sectorMap[game.player.currentSector].adjacent.includes(number)) return "Not directly connected from current sector.";
  if (game.player.fuel <= 0 || game.player.turns <= 0) return travelBlockedReason() === "Fuel empty" ? "Fuel is empty. Complete math missions for fuel or trade when you reach a port." : "Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.";
  if (canSeeDanger(number) && sector.dangerLevel > 0) return "Danger detected. Repair or upgrade shields before entering.";
  return "Direct jump available.";
}

function emergencyWarp() {
  if (!canUseGameActions()) return addAndRender(authGateMessage());
  if (game.player.currentSector === 1) return addAndRender("Already at Sector 1.");
  if (game.player.fuel < 5) return addAndRender("Emergency warp requires 5 fuel.");
  game.player.fuel -= 5;
  game.player.currentSector = 1;
  selectedSectorNumber = 1;
  markSectorVisited(1);
  updateScannerReveals();
  addLog("Emergency warp engaged. Returned to Sector 1 for 5 fuel.");
  setArrivalReport(1, ["Emergency warp completed for 5 fuel."]);
  updatePresenceStatus("traveling");
  saveGame();
  render();
}


function initialArrivalReport(number = 1) {
  const sector = sectorMap[number];
  if (!sector) return "Arrival telemetry unavailable.";
  const features = (sector.objects || []).filter((feature) => feature && feature !== "Empty space");
  return [`Arrived in Sector ${number}.`, `${sectorIdentityLabel(sectorIdentityType(sector))} detected.`, sectorIdentityBrief(sector, { force: true }), sectorArrivalFlavor(sector), features.length ? `Signals: ${features.join(", ")}.` : "", isProtectedSpace(number) ? (isLamontPrimeSector(number) ? `${BEGINNER_SAFE_ZONE_COPY} ${LAMONT_PRIME_NAME} is Alliance protected with restricted landing clearance.` : "Alliance protected space.") : ""].filter(Boolean).join(" ");
}

function buildArrivalReport(number = game.player.currentSector, extras = []) {
  const sector = sectorMap[number];
  if (!sector) return "Arrival telemetry unavailable.";
  const identity = sectorIdentityType(sector);
  const parts = [`Arrived in Sector ${number}.`, `${sectorIdentityLabel(identity)} detected.`, sectorIdentityBrief(sector, { force: true }), sectorArrivalFlavor(sector)];
  const features = knownFeatures(sector).filter((feature) => feature && feature !== "Empty space");
  if (features.length) parts.push(`Signals: ${features.join(", ")}.`);
  const tags = sectorSignalTags(sector).slice(0, 3);
  if (tags.length) parts.push(`Tags: ${tags.join(", ")}.`);
  if (sector.hasShipyard) parts.push("Shipyard available.");
  if (isProtectedSpace(number)) parts.push(isLamontPrimeSector(number) ? `${BEGINNER_SAFE_ZONE_COPY} ${LAMONT_PRIME_NAME} remains under overwhelming Alliance defense.` : "Alliance protected space.");
  const pirate = game.pirates?.[number];
  if (pirate && !pirate.defeated) parts.push(`Warning: pirate patrol signature detected (${pirate.name}).`);
  const missionIntel = missionTargetIntel(number);
  if (missionIntel) parts.push(missionIntel.atCompletion ? `${missionIntel.quest.title}: target reached. Open Special Missions to complete contract.` : `${missionIntel.quest.title}: mission target sector.`);
  extras.filter(Boolean).slice(-3).forEach((entry) => parts.push(entry));
  return parts.join(" ");
}

function setArrivalReport(number = game.player.currentSector, extras = []) {
  game.arrivalReport = buildArrivalReport(number, extras);
  addLog(game.arrivalReport);
  pushLiveEvent({ type: "travel", title: `Arrived in Sector ${number}`, message: game.arrivalReport, tone: "neutral", sectorNumber: number });
}

function stationDisplayName(sector) {
  const names = { 1: "Core Classroom Starbase", 3: "Crossroad Exchange", 5: "Brightline Station", 7: "Waypoint Seven", 8: "Rimward Trade Hub", 10: "Long Arc Port", 31: "Deep Lane Depot", 45: "Frontier Starbase" };
  const name = names[sector.number] || `${String(sector.portType || "Starbase").replace(/^[S|B]{3}\s+/, "")} ${sector.number}`;
  return sector.portCode ? `[${sector.portCode}] ${name}` : name;
}

function defaultStationActivities() {
  return { date: todayKey(), cargoSortingUses: 0, repairAssistUses: 0, repairDiscount: 0, lastRumor: "" };
}

function migrateStationActivities(saved = {}) {
  const base = defaultStationActivities();
  const merged = { ...base, ...(saved && typeof saved === "object" ? saved : {}) };
  if (merged.date !== todayKey()) return base;
  merged.cargoSortingUses = Math.max(0, Math.floor(Number(merged.cargoSortingUses) || 0));
  merged.repairAssistUses = Math.max(0, Math.floor(Number(merged.repairAssistUses) || 0));
  merged.repairDiscount = Math.max(0, Math.floor(Number(merged.repairDiscount) || 0));
  merged.lastRumor = typeof merged.lastRumor === "string" ? merged.lastRumor : "";
  return merged;
}

function stationActivitiesState() {
  game.stationActivities = migrateStationActivities(game.stationActivities);
  return game.stationActivities;
}

function stationActivityAnswer(id) {
  return id === "cargoSorting" ? "9" : id === "repairAssist" ? "12" : "";
}

function runStationActivity(id, answer = "") {
  const state = stationActivitiesState();
  const cleaned = normalize(answer);
  if (id === "cargoSorting") {
    if (state.cargoSortingUses >= 3) return addAndRender("Cargo Sorting Job is on cooldown for today.");
    if (cleaned !== stationActivityAnswer(id)) return addAndRender("Cargo Sorting check needs the correct crate total before payout.");
    state.cargoSortingUses += 1;
    game.player.credits += 35;
    recordDockingCredits(35, "activity");
    addLog("Cargo Sorting Job complete. Earned 35 credits for careful station work.");
  } else if (id === "repairAssist") {
    if (state.repairAssistUses >= 2) return addAndRender("Repair Bay Assist is on cooldown for today.");
    if (cleaned !== stationActivityAnswer(id)) return addAndRender("Repair Bay Assist needs the correct calibration answer.");
    state.repairAssistUses += 1;
    state.repairDiscount = Math.min(60, (state.repairDiscount || 0) + 20);
    game.player.credits += 20;
    recordDockingCredits(20, "activity");
    addLog("Repair Bay Assist complete. Earned 20 credits and a 20 credit repair discount at this starbase.");
  } else {
    return addAndRender("Station activity unavailable.");
  }
  saveGame();
  render();
}

function stationRumors(sector) {
  const scanner = game.player.upgrades.scanner || 1;
  const dangerSectors = Object.values(sectorMap).filter((item) => item.dangerLevel >= (scanner >= 4 ? 2 : 3)).map((item) => item.number);
  const planetHint = Object.values(sectorMap).find((item) => item.type === "planet" && (scanner >= 3 || item.number > sector.number));
  return [
    "A distant port is paying well for Tech; compare prices before filling the hold.",
    `Pirate traffic has increased near Sector ${dangerSectors[0] || 18}. Travel repaired and fueled.`,
    "A dead-end route may hide a stronghold, but patrols recommend better shields first.",
    `A planet near Sector ${planetHint?.number || 14} has unusual production potential.`,
    "Alliance patrols are active near protected space around the classroom core.",
    scanner >= 4 ? "High-grade scanners can identify route roles before you commit to a long lane." : "Upgrade scanners for sharper rumors and safer route planning.",
  ];
}

function readRumorBoard() {
  const sector = sectorMap[game.player.currentSector];
  if (!sector || sector.type !== "port") return addAndRender("Rumor Board is only available while docked at a starbase.");
  const cost = 5;
  if (game.player.credits < cost) return addAndRender("Rumor Board access costs 5 credits.");
  game.player.credits -= cost;
  recordDockingCredits(-cost, "service");
  const rumors = stationRumors(sector);
  const index = (game.player.currentSector + game.player.upgrades.scanner + game.visitedSectors.length + game.player.credits) % rumors.length;
  stationActivitiesState().lastRumor = rumors[index];
  addLog(`Rumor Board: ${rumors[index]}`);
  saveGame();
  render();
}

function beginDockingSession() {
  game.dockingLedger = defaultDockingLedger(game.player.credits, game.player.currentSector);
  game.dockingLedger.active = true;
}

function activeDockingLedger() {
  game.dockingLedger = migrateDockingLedger(game.dockingLedger, game.player.credits);
  if (!game.dockingLedger.active || game.dockingLedger.sectorNumber !== game.player.currentSector) {
    game.dockingLedger.active = true;
    game.dockingLedger.sectorNumber = game.player.currentSector;
    game.dockingLedger.current = game.player.credits;
  }
  return game.dockingLedger;
}

function recordDockingCredits(delta, category = "trade", tradeProfit = 0) {
  const ledger = activeDockingLedger();
  ledger.current = game.player.credits;
  if (delta > 0) ledger.earned += delta;
  if (delta < 0) ledger.spent += Math.abs(delta);
  if (category === "activity" && delta > 0) ledger.activityRewards += delta;
  if (category === "service" && delta < 0) ledger.serviceCosts += Math.abs(delta);
  if (category === "trade") ledger.tradeProfit += tradeProfit;
}

function signedCredits(value) {
  const numeric = Math.floor(Number(value) || 0);
  return `${numeric > 0 ? "+" : ""}${numeric}`;
}

function renderDockingLedger() {
  const ledger = activeDockingLedger();
  ledger.current = game.player.credits;
  const net = ledger.current - ledger.startedWith;
  const netClass = net > 0 ? "ledger-positive" : net < 0 ? "ledger-negative" : "ledger-neutral";
  return `<section class="mini-card docking-ledger ${netClass}"><h3>Docking Ledger</h3><div class="intel-grid">${stat("Started with", `${ledger.startedWith} credits`)}${stat("Current", `${ledger.current} credits`)}${stat("Net", signedCredits(net))}${stat("Earned", `+${ledger.earned}`)}${stat("Spent", `-${ledger.spent}`)}${stat("Trade P/L", signedCredits(ledger.tradeProfit))}${stat("Activity Rewards", `+${ledger.activityRewards}`)}${stat("Fuel/Repair/Services", `-${ledger.serviceCosts}`)}</div></section>`;
}

function cargoCostInfo(resource) {
  const basis = (game.player.cargoCostBasis || defaultCargoCostBasis())[resource] || { quantity: 0, totalCost: 0, known: true };
  const held = Math.max(0, Math.floor(Number(game.player.cargo[resource]) || 0));
  if (!held || !basis.known || basis.quantity <= 0) return { known: false, avg: 0, held };
  return { known: true, avg: basis.totalCost / Math.max(1, basis.quantity), held };
}

function renderTradeCostIntel(resource, price) {
  const info = cargoCostInfo(resource);
  const sellAll = info.held * (price.sell - info.avg);
  return `<p class="trade-cost-intel">Avg Cost: ${info.known ? Math.round(info.avg) : "unknown"}${info.known ? ` · Profit: ${signedCredits(Math.round(price.sell - info.avg))} each · Sell all: ${signedCredits(Math.round(sellAll))}` : ""}</p>`;
}

function ensureCargoCostBasis() {
  game.player.cargoCostBasis = { ...defaultCargoCostBasis(), ...(game.player.cargoCostBasis || {}) };
  [...RESOURCES, SMUGGLED_RESOURCE].forEach((resource) => {
    const basis = game.player.cargoCostBasis[resource] || { quantity: 0, totalCost: 0, known: true };
    basis.quantity = Math.max(0, Math.floor(Number(basis.quantity) || 0));
    basis.totalCost = Math.max(0, Number(basis.totalCost) || 0);
    basis.known = basis.known !== false;
    game.player.cargoCostBasis[resource] = basis;
  });
  return game.player.cargoCostBasis;
}

function updateCargoCostOnBuy(resource, amount, unitPrice) {
  const basis = ensureCargoCostBasis()[resource];
  if (!basis.known && basis.quantity <= 0) basis.known = true;
  if (basis.known) basis.totalCost += amount * unitPrice;
  basis.quantity += amount;
}

function updateCargoCostOnSell(resource, amount, unitPrice) {
  const basis = ensureCargoCostBasis()[resource];
  let profit = 0;
  const knownBeforeSale = basis.known;
  if (basis.known && basis.quantity > 0) {
    const avg = basis.totalCost / basis.quantity;
    profit = Math.round((unitPrice - avg) * amount);
    basis.totalCost = Math.max(0, basis.totalCost - avg * amount);
  }
  basis.quantity = Math.max(0, basis.quantity - amount);
  if (basis.quantity === 0) { basis.totalCost = 0; basis.known = true; }
  return knownBeforeSale ? profit : 0;
}

function renderStationActivities(sector) {
  const state = stationActivitiesState();
  const cargoLeft = Math.max(0, 3 - state.cargoSortingUses);
  const repairLeft = Math.max(0, 2 - state.repairAssistUses);
  return `<section class="mini-card station-activities"><p class="eyebrow">Service Counter</p><h3>Station Activities</h3><p class="help-text">Small, safe starbase jobs with daily limits. They pay tiny rewards and do not add gambling, multiplayer, or PvP.</p><div class="station-job-grid"><article class="station-job"><div class="contract-badges">${missionBadge("Station Job")}</div><h4>Cargo Sorting Job</h4><p>Manifest check: 4 Food crates + 5 Tech crates = ? crates.</p><label for="cargoSortingAnswer">Cargo answer</label><input id="cargoSortingAnswer" type="text" inputmode="numeric" placeholder="Total crates"><button type="button" data-station-activity="cargoSorting" ${cargoLeft ? "" : "disabled"}>Submit Cargo Sort</button><p class="help-text">Reward: 35 credits. Uses left today: ${cargoLeft}.</p></article><article class="station-job"><div class="contract-badges">${missionBadge("Station Job")}</div><h4>Repair Bay Assist</h4><p>Calibration check: 3 armor plates × 4 bolts = ? bolts.</p><label for="repairAssistAnswer">Repair answer</label><input id="repairAssistAnswer" type="text" inputmode="numeric" placeholder="Total bolts"><button type="button" data-station-activity="repairAssist" ${repairLeft ? "" : "disabled"}>Submit Repair Assist</button><p class="help-text">Reward: 20 credits and +20 repair discount. Uses left today: ${repairLeft}. Current discount: ${state.repairDiscount || 0} credits.</p></article></div><div class="rumor-board"><div class="contract-badges">${missionBadge("Rumor")}</div><h4>Rumor Board</h4><p class="help-text">Spend 5 credits for navigation, pirate, planet, or trade hints. Scanner level improves quality without revealing the whole route.</p><button type="button" data-action="readRumor">Read Rumor (5 credits)</button><p class="rumor-text">${state.lastRumor || "No rumor purchased yet."}</p></div></section>`;
}

function renderStarbaseScreen(sector) {
  return `${renderActionResult()}${renderDockingLedger()}<section class="location-intro starbase-intro mini-card"><p class="eyebrow">Docked at Sector ${sector.number}</p><h3>${stationDisplayName(sector)}</h3><div class="intel-grid">${stat("Station Code", sector.portCode || "---")}${stat("Station Type", sector.portType)}${stat("Services", `Trading · Fuel · Repairs · Activities · Rumors${sector.hasShipyard ? " · Shipyard next door" : ""}`)}${stat("Current Sector", sector.number)}</div><p class="help-text">${sector.flavor}</p></section><div class="screen-grid starbase-services"><section class="mini-card service-counter"><h3>Port Services</h3><p><span class="badge">${sector.portType}</span></p><p class="help-text"><strong>Port code help:</strong> ${portCodeHelpText()}</p><p class="help-text"><strong>Local market notes:</strong> ${sector.marketNote}</p><p class="help-text"><strong>Trade tip:</strong> ${sector.tradeTip}</p><div class="trade-grid">${RESOURCES.map((resource) => {
    const price = sector.portPrices[resource];
    const buyDisabled = cargoSpaceLeft() <= 0 || game.player.credits < price.buy ? "disabled" : "";
    return `<div class="mini-card"><h3>${resource} · ${price.role === "S" ? "Sells low" : "Buys high"}</h3><p>Buy ${price.buy} credits · Sell ${price.sell} credits</p>${renderTradeCostIntel(resource, price)}<div class="resource-actions"><button data-action="buy" data-resource="${resource}" data-amount="1" ${buyDisabled}>Buy 1</button><button data-action="buy" data-resource="${resource}" data-amount="5" ${buyDisabled}>Buy 5</button><button data-action="buy" data-resource="${resource}" data-amount="10" ${buyDisabled}>Buy 10</button><button data-action="fillCargo" data-resource="${resource}" ${buyDisabled}>Fill Cargo</button><button data-action="sell" data-resource="${resource}" data-amount="1">Sell 1</button><button data-action="sell" data-resource="${resource}" data-amount="5">Sell 5</button></div></div>`;
  }).join("")}</div><div class="button-row compact-button-row"><button type="button" data-action="fillBalanced" ${cargoSpaceLeft() <= 0 ? "disabled" : ""}>Fill Balanced</button></div>${renderRefuelPanel()}${renderRepairPanel(sector)}</section>${renderStationActivities(sector)}<section class="mini-card item-shop-placeholder"><h3>Item Shop: Coming Soon</h3><p><strong>Scanning Probe</strong></p><p class="help-text">Scanning Probes will allow long-range sector scans in a future update. They will be expensive, limited, and will not reveal the entire map cheaply.</p></section></div>`;
}

function renderShipyardScreen() {
  return `${renderActionResult()}<section class="shipyard-brief mini-card"><p class="eyebrow">Industrial Shipyard · Docked at Sector ${game.player.currentSector}</p><h3>Upgrade or trade your ship</h3><p class="help-text">Use this Shipyard mode to improve your active ship with credits, then compare hull purchases before you trade. Every purchase card is measured against your active ship, including locked hulls, cargo fit warnings, fighter bay warnings, upgrade caps, and trade-in pricing.</p></section>${renderShipyardCurrentShipPanel()}${renderShipyardUpgradePanel()}${renderFighterPurchasePanel()}<section class="shipyard-buy-trade"><p class="eyebrow">Buy / Trade Ships</p><h3>Shipyard Ships</h3><p class="help-text">Ship purchases only happen in this Shipyard mode. Trade-in pricing is shown on each ship card.</p><div class="ship-card-grid">${Object.values(SHIPS).map(renderShipCard).join("")}</div></section>`;
}

function renderShipyardCurrentShipPanel() {
  const ship = currentShip();
  const p = game.player;
  const caps = ship.upgradeCaps;
  return `<section class="mini-card shipyard-current-ship"><p class="eyebrow">Current Ship</p><h3>${ship.name}</h3><p class="help-text">${ship.description}</p><div class="stat-grid compact-stat-grid">${stat("Ship Name", p.shipName)}${stat("Cargo Capacity", `${cargoUsed()}/${p.cargoCapacity}`)}${stat("Fuel", `${p.fuel}/${p.maxFuel}`)}${stat("Hull", `${p.hull}/${p.maxHull}`)}${stat("Fighters", `${p.fighters}/${p.fighterCapacity}`)}${stat("Credits", p.credits)}${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}/${caps.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}/${caps.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}/${caps.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}/${caps.shield}`)}${stat("Hyperdrive", `${p.upgrades.hyperdrive || 0}/${caps.hyperdrive || 1}`)}</div></section>`;
}

function renderShipyardUpgradePanel() {
  const sector = sectorMap[game.player.currentSector];
  return `<section class="mini-card shipyard-upgrades"><p class="eyebrow">Upgrade Current Ship</p><h3>Credit upgrades for ${currentShip().name}</h3><p class="help-text">Upgrade caps come from the current ship. Purchases save immediately and report in the Action Result, Live Events feed, and Captain's Log.</p><div class="upgrade-grid shipyard-upgrade-grid">${SHIP_UPGRADE_OPTIONS.map((upgrade) => renderShipUpgradeCard(upgrade, sector)).join("")}</div></section>`;
}

function shipUpgradeLevel(key) {
  const fallback = key === "hyperdrive" ? 0 : 1;
  const level = Number(game.player.upgrades?.[key]);
  return Number.isFinite(level) ? level : fallback;
}

function shipUpgradeCost(key) {
  if (key === "hyperdrive") return HYPERDRIVE_COST;
  const level = shipUpgradeLevel(key) || 1;
  return level * 250;
}

function shipUpgradeUnavailableReason(key, sector = sectorMap[game.player.currentSector]) {
  const option = SHIP_UPGRADE_OPTIONS.find((upgrade) => upgrade.key === key);
  const label = option?.label || titleCase(String(key).replace(/([A-Z])/g, " $1"));
  const level = shipUpgradeLevel(key);
  const cap = Number(currentShip().upgradeCaps?.[key]) || (key === "hyperdrive" ? 1 : level);
  const cost = shipUpgradeCost(key);
  if (!sector?.hasShipyard) return "shipyard unavailable";
  if (level >= cap) return `${label} is already at this ship's maximum.`;
  if (game.player.credits < cost) return `Not enough credits for ${label} Level ${level + 1}.`;
  return "Ready to upgrade";
}

function shipUpgradeBenefitText(key, level = shipUpgradeLevel(key)) {
  if (key === "cargoHold") return `Cargo capacity increases by ${CARGO_HOLD_CAPACITY_BONUS}: ${calculateCargoCapacity(currentShip(), { ...game.player.upgrades, cargoHold: level })} → ${calculateCargoCapacity(currentShip(), { ...game.player.upgrades, cargoHold: level + 1 })}.`;
  if (key === "shield") return `Fighter bay increases by ${SHIELD_FIGHTER_CAPACITY_BONUS}: ${calculateFighterCapacity(currentShip(), { ...game.player.upgrades, shield: level })} → ${calculateFighterCapacity(currentShip(), { ...game.player.upgrades, shield: level + 1 })}.`;
  if (key === "engine") return `Fuel capacity improves: ${calculateFuelCapacity(currentShip(), { ...game.player.upgrades, engine: level })} → ${calculateFuelCapacity(currentShip(), { ...game.player.upgrades, engine: level + 1 })}.`;
  if (key === "hyperdrive") return level >= 1 ? "Installed: Engage Hyperdrive appears for active plotted routes." : "Unlocks Engage Hyperdrive for plotted routes. Costs double fuel and stops for danger.";
  return "Ship system improves after purchase.";
}

function renderShipUpgradeCard(upgrade, sector = sectorMap[game.player.currentSector]) {
  const level = shipUpgradeLevel(upgrade.key);
  const cap = Number(currentShip().upgradeCaps?.[upgrade.key]) || (upgrade.key === "hyperdrive" ? 1 : level);
  const cost = shipUpgradeCost(upgrade.key);
  const reason = shipUpgradeUnavailableReason(upgrade.key, sector);
  const available = reason === "Ready to upgrade";
  return `<article class="mini-card ship-upgrade-card ${level >= cap ? "maxed" : ""}"><h4>${upgrade.label}</h4><p class="progress-text">Current level ${level} / Max level ${cap}</p><p>${upgrade.description}</p><p class="help-text"><strong>Benefit:</strong> ${shipUpgradeBenefitText(upgrade.key, level)}</p><p class="cost-line">Cost: ${cost} credits</p><button data-action="upgradeShip" data-upgrade="${upgrade.key}" ${available ? "" : "disabled"}>Upgrade ${upgrade.label}</button><p class="help-text disabled-reason">${available ? `Ready: upgrades to Level ${level + 1}.` : `Unavailable: ${reason}`}</p></article>`;
}

function shipTradeInValue(ship = currentShip()) {
  if (!ship || ship.id === "rustyComet") return 0;
  return Math.max(0, Math.floor((ship.price || 0) * SHIP_TRADE_IN_RATE));
}

function netShipCost(ship) {
  return Math.max(0, (ship.price || 0) - shipTradeInValue(currentShip()));
}

function shipStatDelta(targetValue, baseValue) {
  const delta = Number(targetValue) - Number(baseValue);
  if (!Number.isFinite(delta)) return { className: "stat-delta-neutral", text: "—" };
  if (delta > 0) return { className: "stat-delta-positive", text: `+${delta}` };
  if (delta < 0) return { className: "stat-delta-negative", text: String(delta) };
  return { className: "stat-delta-neutral", text: "±0" };
}

function comparisonRow(label, targetValue, baseValue) {
  const delta = shipStatDelta(targetValue, baseValue);
  return `<div class="ship-stat-row"><span class="ship-stat-label">${label}</span><span class="ship-stat-value">${targetValue}</span><span class="ship-stat-delta ${delta.className}">(${delta.text})</span></div>`;
}

function shipRoleLabel(ship) {
  if (ship.role) return ship.role;
  if (ship.cargoCapacity >= FREIGHTER_ROLE_CARGO_THRESHOLD) return "Freighter";
  if (ship.basePower >= 35) return "Combat";
  if (ship.maxFuel >= 38 || ship.upgradeCaps.scanner >= 8) return "Explorer";
  if (ship.hazardResist >= 2) return "Hazard";
  return "Multi-role";
}

function renderShipCard(ship) {
  const activeShip = currentShip();
  const active = activeShip.id === ship.id;
  const lock = shipUnlockStatus(ship);
  const capped = capUpgradesForShip(game.player.upgrades, ship);
  const baselineCapped = capUpgradesForShip(game.player.upgrades, activeShip);
  const nextHull = ship.maxHull + Math.max(0, Math.min(game.player.upgrades.shield, ship.upgradeCaps.shield) - 1) * 4;
  const baselineHull = activeShip.maxHull + Math.max(0, Math.min(game.player.upgrades.shield, activeShip.upgradeCaps.shield) - 1) * 4;
  const nextFuel = calculateFuelCapacity(ship, capped);
  const baselineFuel = calculateFuelCapacity(activeShip, baselineCapped);
  const nextCargo = calculateCargoCapacity(ship, capped);
  const baselineCargo = calculateCargoCapacity(activeShip, baselineCapped);
  const nextFighters = calculateFighterCapacity(ship, capped);
  const baselineFighters = calculateFighterCapacity(activeShip, baselineCapped);
  const cargoBlocked = cargoUsed() > nextCargo;
  const fighterBlocked = game.player.fighters > nextFighters;
  const tradeIn = shipTradeInValue(activeShip);
  const netCost = netShipCost(ship);
  const unaffordable = game.player.credits < netCost;
  const disabledReason = active ? "Current ship" : !lock.unlocked ? lock.reason : cargoBlocked ? "Current cargo will not fit" : fighterBlocked ? "Current fighters exceed the new bay" : unaffordable ? "Not enough credits after trade-in" : "Ready for purchase";
  const status = active ? "Current Ship" : !lock.unlocked ? "Locked" : cargoBlocked ? "Cannot Fit Cargo" : fighterBlocked ? "Cannot Fit Fighters" : "Available";
  const statusClass = active ? "status-current" : !lock.unlocked ? "status-locked" : cargoBlocked || fighterBlocked || unaffordable ? "status-blocked" : "status-available";
  const blocked = active || !lock.unlocked || cargoBlocked || fighterBlocked || unaffordable;
  const coreRows = [
    comparisonRow("Hull", nextHull, baselineHull),
    comparisonRow("Fuel", nextFuel, baselineFuel),
    comparisonRow("Cargo", nextCargo, baselineCargo),
    comparisonRow("Base Power", ship.basePower, activeShip.basePower),
    comparisonRow("Fighters", nextFighters, baselineFighters),
    comparisonRow("Hazard", ship.hazardResist, activeShip.hazardResist),
  ].join("");
  const capRows = [
    comparisonRow("Cargo Hold Cap", ship.upgradeCaps.cargoHold, activeShip.upgradeCaps.cargoHold),
    comparisonRow("Engine Cap", ship.upgradeCaps.engine, activeShip.upgradeCaps.engine),
    comparisonRow("Scanner Cap", ship.upgradeCaps.scanner, activeShip.upgradeCaps.scanner),
    comparisonRow("Shield Cap", ship.upgradeCaps.shield, activeShip.upgradeCaps.shield),
    comparisonRow("Hyperdrive Cap", ship.upgradeCaps.hyperdrive || 1, activeShip.upgradeCaps.hyperdrive || 1),
  ].join("");
  return `<article class="ship-card ${lock.unlocked ? "" : "locked-ship"} ${active ? "current-ship-card" : ""}"><div class="ship-card-top"><div><h3>${ship.name}</h3><p class="ship-role-line"><span class="role-badge">${shipRoleLabel(ship)}</span></p></div><span class="status-badge ${statusClass}">${status}</span></div><p class="ship-description">${ship.description}</p><div class="ship-stat-table" aria-label="${ship.name} core stat comparison">${coreRows}</div><details class="ship-cap-details" open><summary>Upgrade cap comparison</summary><div class="ship-stat-table ship-cap-table">${capRows}</div></details><div class="ship-price-row"><span>${ship.futureLocked ? "Future locked" : `Price: ${ship.price}`}</span><span>Trade-in: ${tradeIn}</span><strong>${ship.futureLocked ? "Net: Locked" : `Net: ${netCost}`}</strong></div><p class="ship-requirement">${lock.unlocked ? "Requirements met" : lock.reason}</p><button class="${blocked ? "" : "button-primary"}" data-action="buyShip" data-ship="${ship.id}" ${blocked ? "disabled" : ""}>${active ? "Current Ship" : "Buy / Trade In"}</button><p class="help-text disabled-reason">${disabledReason}</p></article>`;
}

function renderSpecialMissionsScreen() {
  const tier = missionTierByNumber(normalizeMissionTier(game.selectedMissionTier || game.currentMission.tier || 2));
  const sector = sectorMap[game.player.currentSector];
  const hubText = game.player.currentSector === 1 ? "Sector 1 hub online: all contract boards available." : "Remote terminal: review active work, but new delivery/fetch contracts launch from Sector 1.";
  return `<section class="location-intro mission-terminal-intro mini-card"><p class="eyebrow">Station Contract Terminal</p><h3>Special Missions Terminal</h3><p class="help-text">${hubText} Delivery / fetch contracts are accepted contracts, the Bounty Board lists automatic pirate bounties, and Math Contracts are training / reward contracts. Training jobs and station jobs are grouped below.</p><div class="intel-grid">${stat("Current Station", sector.type === "port" ? stationDisplayName(sector) : `Sector ${sector.number} Relay`)}${stat("Selected Math Difficulty", tier.tierName)}${stat("Reward Preview", `${tier.rewardMultiplier}x math payout`)}${stat("Board Contracts", (game.activeMissions || []).length)}</div></section><div class="terminal-sections"><details class="terminal-section" open><summary>${missionBadge("Math")} Math Contracts — training / reward contracts</summary>${renderMathMissionContent()}</details><details class="terminal-section" open><summary>${missionBadge("Delivery")} Delivery / Fetch Contracts — accepted contracts</summary>${renderDeliveryQuestBoard()}</details><details class="terminal-section" open><summary>${missionBadge("Bounty")} Bounty Board — automatic pirate bounties</summary>${renderBountyBoardContent()}</details><details class="terminal-section"><summary>${missionBadge("Training")} Training Jobs</summary>${renderTutorialContent()}<h3>Dev Code Handling</h3><p class="help-text">If classroom testing codes are enabled, enter them in the math mission answer field and submit from this terminal.</p></details><details class="terminal-section" open><summary>${missionBadge("Station Job")} Active Contracts</summary>${renderMissionBoardContent()}${renderActiveDeliveryContracts()}</details><details class="terminal-section" open><summary>${missionBadge("Claimable")} Completed / Claimable Contracts</summary>${renderClaimableContracts()}</details></div>`;
}

function bountyRouteIntel(pirate) {
  const target = Number(pirate.sector);
  const visited = game.visitedSectors.includes(target);
  const revealed = game.revealedSectors.includes(target);
  const visible = getVisibleSectorNumbers().includes(target);
  const knownRoute = findRouteToSector(game.player.currentSector, target);
  const scoutRoute = knownRoute || findExploratoryRouteToSector(game.player.currentSector, target);
  const routeStatus = game.player.currentSector === target ? "target here" : knownRoute ? "route known" : scoutRoute ? "scout route visible" : "route unknown";
  const targetStatus = visited ? "known" : revealed ? "revealed" : visible ? "unexplored" : "unknown / unexplored";
  const next = scoutRoute && scoutRoute.length > 1 ? `Next jump: Sector ${scoutRoute[1]}${knownRoute ? "" : " (scout)"}` : "Route unknown. Explore nearby lanes first.";
  return { target, targetStatus, routeStatus, knownRoute, route: scoutRoute, next, targetHere: game.player.currentSector === target };
}

function renderBountyRouteActions(pirate) {
  const intel = bountyRouteIntel(pirate);
  if (intel.targetHere) {
    return `<p class="help-text"><strong>Target here. Open Combat.</strong></p><button type="button" data-open-bounty-combat="${intel.target}">Open Combat</button>`;
  }
  const label = intel.knownRoute ? "Plot Route" : intel.route ? "Scout Toward Target" : "Route unknown. Explore nearby lanes first.";
  return `<p class="help-text">${intel.next}</p><button type="button" data-plot-bounty="${intel.target}" ${intel.route ? "" : "disabled"}>${label}</button>`;
}

function renderBountyBoardContent() {
  const bounties = Object.values(game.pirates || {}).filter((pirate) => !pirate.defeated).slice(0, 6);
  if (!bounties.length) return `<p class="empty-note">No NPC bounty targets remain on the current board.</p>`;
  return `<p class="help-text"><strong>Bounties are automatic.</strong> Reach the sector, defeat the pirate, and the reward is paid after combat. No acceptance is required; rewards are granted through the combat system.</p><p class="help-text">Single-player NPC bounty jobs only. No multiplayer and no PvP targets.</p><div class="mission-grid">${bounties.map((pirate) => {
    const intel = bountyRouteIntel(pirate);
    return `<div class="mission-card contract-card"><div class="contract-badges">${missionBadge("Automatic Bounty")}</div><h3>${pirate.name}</h3>${stat("Sector", `Sector ${pirate.sector}`)}${stat("Threat Level", pirate.threatLevel)}${stat("Reward", `${pirate.bounty} credits, ${pirate.reputationReward} reputation`)}${stat("Route Status", intel.routeStatus)}${stat("Target Intel", intel.targetStatus)}<div class="button-row">${renderBountyRouteActions(pirate)}</div><p class="help-text">Travel to Sector ${pirate.sector} and use Combat / Pirate Intel to claim the automatic bounty.</p></div>`;
  }).join("")}</div>`;
}

function renderActiveDeliveryContracts() {
  const active = (game.deliveryQuests || []).filter((quest) => ["active", "claimable"].includes(quest.status));
  if (!active.length) return `<p class="empty-note">No active delivery/fetch contracts.</p>`;
  return `<h3>Active Delivery / Fetch Routes</h3><div class="mission-grid">${active.map((quest) => `<div class="mission-card contract-card"><div class="contract-badges">${missionBadge(quest.returnSector ? "Fetch" : "Delivery")}</div><h3>${quest.title}</h3>${renderRouteHelp(quest)}<p class="help-text">${quest.returnSector && quest.visitedTarget ? `Return to Sector ${quest.returnSector} to claim.` : `Travel to Sector ${quest.targetSector}.`}</p></div>`).join("")}</div>`;
}

function renderClaimableContracts() {
  const boardClaimable = (game.activeMissions || []).filter((mission) => missionProgress(mission) >= missionTemplateById(mission.id).target);
  const deliveryClaimable = (game.deliveryQuests || []).filter((quest) => canCompleteDeliveryQuest(quest));
  const completedDeliveries = (game.deliveryQuests || []).filter((quest) => quest.status === "complete");
  const boardHtml = boardClaimable.map((mission) => { const template = missionTemplateById(mission.id); return `<div class="mission-card complete"><div class="contract-badges">${missionBadge("Claimable")}</div><h3>${template.title}</h3><p>${template.objective}</p><p class="reward-text">Reward: ${formatReward(template.reward)}</p><button data-claim-mission="${mission.id}">Claim Reward</button></div>`; }).join("");
  const deliveryHtml = deliveryClaimable.map((quest) => `<div class="mission-card complete"><div class="contract-badges">${missionBadge("Claimable")}</div><h3>${quest.title}</h3><p class="reward-text">Reward: ${formatReward(deliveryReward(quest))}</p><button data-complete-delivery="${quest.id}">Complete / Claim</button></div>`).join("");
  const completedHtml = completedDeliveries.map((quest) => `<div class="mission-card"><div class="contract-badges">${missionBadge("Completed")}</div><h3>${quest.title}</h3><p class="help-text">Completed and paid.</p></div>`).join("");
  const html = `${boardHtml}${deliveryHtml}${completedHtml}`;
  return html ? `<div class="mission-grid">${html}</div>` : `<p class="empty-note">No claimable or completed contracts yet.</p>`;
}

function renderMathMissionContent() {
  const mission = game.currentMission;
  const done = game.missionLocked;
  const selectedTier = normalizeMissionTier(game.selectedMissionTier || mission.tier || 2);
  const options = missionTiers().map((tier) => `<option value="${tier.tier}" ${tier.tier === selectedTier ? "selected" : ""}>${tier.tierName} ${tier.rewardMultiplier}x</option>`).join("");
  return `<h2 id="mathHeading">Math Mission</h2><label class="mission-tier-picker" for="missionTier">Choose next mission difficulty</label><select id="missionTier">${options}</select><p class="help-text">Basic missions give smaller rewards; higher tiers give larger rewards.</p><p class="mission-meta">Difficulty: ${mission.tierName} · Reward: ${mission.rewardMultiplier}x · Skill: ${mission.skillTag}</p><p><strong>${mission.prompt}</strong></p><p class="help-text">Answer format: ${mission.format}</p><input id="missionAnswer" type="text" autocomplete="off" aria-label="Math mission answer"><div class="button-row"><button id="submitMission">Submit Answer</button><button id="stuckMission" ${done ? "disabled" : ""}>I'm Stuck</button>${done ? `<button id="nextMission">Next Mission</button>` : ""}</div><p class="feedback ${game.missionFeedbackClass || ""}">${game.missionFeedback}</p>`;
}

function renderMissionBoardContent() {
  return `<h2 id="missionHeading">Mission Board</h2><p class="help-text">Claim completed objectives to receive rewards and open a new contract.</p><div class="mission-grid">${game.activeMissions.map((mission) => { const template = missionTemplateById(mission.id); const progress = missionProgress(mission); const complete = progress >= template.target; return `<div class="mission-card ${complete ? "complete" : ""}"><h3>${template.title}</h3><p>${template.objective}</p><p class="progress-text">Progress: ${Math.min(progress, template.target)}/${template.target}</p><p class="reward-text">Reward: ${formatReward(template.reward)}</p><button data-claim-mission="${mission.id}" ${complete ? "" : "disabled"}>Claim Reward</button></div>`; }).join("") || `<p class="empty-note">All current single-player board missions are complete.</p>`}</div>`;
}

function renderTutorialContent() {
  const steps = tutorialSteps();
  const completed = game.tutorial.completedSteps.length;
  return `<h2 id="tutorialHeading">Tutorial Questline</h2><p class="help-text">${game.tutorial.finished ? "Tutorial complete. You are cleared for open-sector operations." : `${completed}/${steps.length} steps complete.`}</p><div class="tutorial-list">${steps.map((step) => { const done = game.tutorial.completedSteps.includes(step.id); return `<div class="tutorial-step ${done ? "complete" : "locked"}"><strong>${done ? "✓" : "○"} ${step.title}</strong><p class="reward-text">Reward: ${formatReward(step.reward)}</p></div>`; }).join("")}</div>`;
}

function renderPlanetsScreen() {
  const sector = sectorMap[game.player.currentSector];
  const local = sector.homeworld ? renderProtectedHomeworld(sector) : sector.type === "planet" ? renderPlanet(sector) : `<section class="planet-panel mini-card"><h3>No local planet</h3><p class="empty-note">No planet is present in Sector ${sector.number}. Owned planets remain listed below.</p></section>`;
  const owned = Object.values(game.planets || {}).filter((planet) => planet.owner === game.player.pilotName);
  const ownedCards = owned.map((planet) => {
    const profile = getPlanetTypeProfile(planet.type);
    return `<div class="mini-card owned-planet-card"><h3>${planet.name}</h3>${stat("Sector", planet.sectorNumber)}${stat("Planet Type", planet.type)}${stat("Production Preview", formatProduction(getPlanetProduction(planet)))}${stat("Defense Rating", getPlanetDefenseRating(planet))}<p class="help-text"><strong>Future tech potential:</strong> ${(planet.tech?.available || profile.tech).join(", ")}</p></div>`;
  }).join("");
  return `<section class="location-intro mini-card"><p class="eyebrow">Colony command</p><h3>Planet Management</h3><p class="help-text">Manage the current planet, owned colonies, production previews, upgrade tracks, fighter transfer, defense ratings, and future tech potential from one focused location.</p></section>${local}<h3>Owned Planet Summary</h3><div class="planet-grid">${ownedCards || `<p class="empty-note">No owned planets yet.</p>`}</div>`;
}

function renderCombatScreen() {
  const pirate = currentPirateEncounter();
  const risk = pirate ? estimateCombatRisk(pirate) : null;
  const current = renderPirateEncounterPanel() || `<section class="pirate-panel mini-card"><h3>No active pirate encounter</h3><p class="empty-note">No active pirate encounter is unresolved in Sector ${game.player.currentSector}. You may safely use Exit / Return to Ship.</p></section>`;
  const known = Object.values(game.pirates || {}).filter((knownPirate) => !knownPirate.defeated).map((knownPirate) => `<div class="mini-card"><h3>${knownPirate.name}</h3>${stat("Sector", knownPirate.sector)}${stat("Threat", knownPirate.threatLevel)}${stat("Bounty", knownPirate.bounty)}${stat("Protected Space", isProtectedSpace(knownPirate.sector) ? "Blocked" : "No")}</div>`).join("");
  return `<section class="location-intro combat-intro mini-card"><p class="eyebrow">Focused tactical display</p><h3>${pirate ? `${pirate.name} Contact` : "Pirate Intel"}</h3><p class="help-text">Fight, cautious attack, temporary disengage, payoff/avoidance, and boarding controls stay in this combat screen. ${pirate ? "The encounter remains unresolved until the pirate is defeated, boarded, or otherwise resolved." : "No active threat blocks returning to the cockpit."}</p><div class="intel-grid">${stat("Current Sector", game.player.currentSector)}${stat("Combat State", pirate ? "Unresolved encounter" : "Safe to return")} ${pirate ? stat("Risk Estimate", risk.label) : ""}</div></section>${current}<h3>Known NPC Pirate Ledger</h3><div class="trade-grid">${known || `<p class="empty-note">No active pirate signatures.</p>`}</div>`;
}

function renderAchievementsContent() {
  const definitions = achievementDefinitions();
  return `<div class="achievement-grid">${definitions.map((achievement) => { const unlocked = game.achievements.includes(achievement.id); return `<div class="achievement-card ${unlocked ? "unlocked" : "locked"}"><strong>${unlocked ? "✓" : "○"} ${achievement.title}</strong><p>${achievement.description}</p></div>`; }).join("")}</div>`;
}

function renderReputationScreen() {
  return `<div class="stats-grid">${stat("Reputation Score", game.player.reputation)}${stat("Alignment", reputationTitle(game.player.reputation))}${stat("Combat Rank", combatRankTitle())}${stat("Next Combat Rank", nextCombatRankProgress())}${stat("Lawful Reputation", game.player.lawfulReputation || 0)}${stat("Pirate Reputation", game.player.pirateReputation || 0)}${stat("Pirates Defeated", game.player.piratesDefeated || 0)}${stat("Bounties Earned", game.player.bountiesEarned || 0)}</div><h3>Lawful Ship Notes</h3><div class="trade-grid">${Object.values(SHIPS).filter((ship) => ship.unlock).map((ship) => `<div class="mini-card"><strong>${ship.name}</strong><p>${ship.unlock.text}</p><p>${shipUnlockStatus(ship).unlocked ? "Unlocked" : "Locked"}</p></div>`).join("")}</div><h3>Reputation Shop: Coming Soon</h3><div class="trade-grid">${["Alliance Beacon", "Patrol Clearance", "Escort Contract", "Bounty License", "Pirate Market Access"].map((item) => `<div class="mini-card locked-ship"><strong>${item}</strong><p class="help-text">Future reputation item.</p></div>`).join("")}</div>`;
}

function renderCaptainLogScreen() {
  return `<ol class="log-list">${game.log.map((entry) => `<li>${entry}</li>`).join("")}</ol>`;
}

function getCurrentSavePayload() {
  return JSON.parse(JSON.stringify({
    ...game,
    version: STORAGE_KEY,
    ui: { ...(game.ui || {}), activeScreen: "cockpit" }
  }));
}

function applyLoadedSavePayload(saveData) {
  if (!saveData || typeof saveData !== "object" || Array.isArray(saveData) || !saveData.player) {
    return { ok: false, error: "Cloud save did not look like a Sector Drift save. Local save was not changed." };
  }

  try {
    const migrated = migrateGameState(saveData);
    if (!migrated?.player || !Number.isFinite(Number(migrated.player.currentSector)) || !sectorMap[migrated.player.currentSector]) {
      return { ok: false, error: "Cloud save could not be normalized safely. Local save was not changed." };
    }
    game = migrated;
    game.ui = { ...(game.ui || {}), activeScreen: "settings" };
    selectedSectorNumber = game.player.currentSector;
    saveGame();
    addLog("Cloud backup loaded into this browser after confirmation.");
    scheduleCompetitiveProfileUpdate("cloud load", { force: true });
    saveGame();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Cloud save could not be applied safely. Local save was not changed." };
  }
}

function firebaseClient() {
  if (typeof window === "undefined") return null;
  return window.SectorDriftFirebase || null;
}

function refreshFirebaseUiState(allowSubscribe = true) {
  try {
    const client = firebaseClient();
    if (!client) {
      cloudUiState.status = "not initialized";
      cloudUiState.user = null;
      cloudUiState.role = "unknown";
      cloudUiState.roleReason = "Firebase client script has not reported ready status.";
      cloudUiState.message = "Cloud backup unavailable. Local prototype save is active.";
      return;
    }

    const status = client.getFirebaseStatus?.() || { ok: false, status: "unavailable", error: "Cloud backup status could not be checked. Local save still works." };
    const userResult = client.getCurrentFirebaseUser?.() || { ok: true, data: null };
    const roleResult = client.getCurrentUserRole?.() || { ok: true, data: "unknown" };
    cloudUiState.status = status?.status || (status?.ok ? "available" : "unavailable");
    cloudUiState.user = status?.user || userResult?.data || null;
    cloudUiState.role = status?.role || roleResult?.data || "unknown";
    cloudUiState.roleReason = status?.roleReason || roleResult?.reason || roleResult?.error || (cloudUiState.user ? "Role loaded from users/{uid}." : "Sign in to load role.");
    if (!status?.ok && status?.error) cloudUiState.message = status.error;

    if (allowSubscribe && !firebaseUnsubscribe && typeof client.onFirebaseAuthChange === "function") {
      firebaseUnsubscribe = client.onFirebaseAuthChange(({ user, role, status: authStatus } = {}) => {
        cloudUiState.user = user || null;
        cloudUiState.role = role || "unknown";
        cloudUiState.status = authStatus?.status || cloudUiState.status || "available";
        cloudUiState.roleReason = authStatus?.roleReason || (user ? "Role loaded from users/{uid}." : "Sign in to load role.");
        updateLaunchGateFromAuth();
        updatePresenceStatus(user ? "online" : "offline");
        if (user) {
          scheduleCompetitiveProfileUpdate("login", { force: true });
          publishCompetitiveEvent("captainLaunched", `${safeCompetitiveCaptainName()} launched ${game.player.shipName || currentShip().name}.`, { force: true, sectorNumber: game.player.currentSector });
        }
        subscribeToSectorTraffic();
        subscribeToCompetitiveEvents();
        if (["settings", "launch", "adminPanel"].includes(activeScreenName())) render();
      });
    }
  } catch (error) {
    cloudUiState.status = "unavailable";
    cloudUiState.user = null;
    cloudUiState.role = "unknown";
    cloudUiState.roleReason = "Firebase status check failed safely.";
    cloudUiState.message = "Cloud backup unavailable. Local prototype save is active.";
    cloudUiState.lastCloudResult = error?.message || cloudUiState.message;
  }
}

function cloudStatusLabel(allowSubscribe = true) {
  refreshFirebaseUiState(allowSubscribe);
  if (cloudUiState.status === "available") return "available";
  if (cloudUiState.status === "not initialized") return "not initialized";
  return "unavailable";
}

function safeDisplayText(value, fallback = "") {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : fallback;
  return String(text || fallback).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])).slice(0, 160);
}

function safePlainText(value, fallback = "") {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : fallback;
  return String(text || fallback).replace(/[<>]/g, "").trim().slice(0, 80);
}


function safeCompetitiveCaptainName(profile = captainProfile()) {
  const name = captainDisplayName(profile);
  return name && name !== "Cadet" ? name : "Unnamed Captain";
}

function numericStat(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function competitiveStats() {
  const s = game.stats || {};
  const sectorsExplored = Math.max(numericStat(s.sectorsExplored), (s.visitedSectors || game.visitedSectors || []).length || 0);
  const piratesDefeated = Math.max(numericStat(s.piratesDefeated), numericStat(game.player.piratesDefeated));
  const missionsCompleted = numericStat(s.mathMissionsCompleted) + numericStat(s.missionsClaimed);
  // Public leaderboard trade profit uses the career stat only. The docking ledger
  // is a local session display and can overlap with the career stat during a sale.
  const tradeProfit = numericStat(s.tradeProfit);
  const creditsEarned = numericStat(s.creditsEarnedFromTrade) + numericStat(game.player.bountiesEarned);
  const reputation = numericStat(game.player.reputation);
  const achievementsCount = Array.isArray(game.achievements) ? game.achievements.length : 0;
  const totalScore = calculateCompetitiveScore({ creditsEarned, sectorsExplored, piratesDefeated, missionsCompleted, tradeProfit, reputation, achievementsCount });
  return { totalScore, sectorsExplored, piratesDefeated, missionsCompleted, tradeProfit, creditsEarned, reputation, achievementsCount };
}

function calculateCompetitiveScore(stats = competitiveStats()) {
  return Math.floor(
    numericStat(stats.creditsEarned) / 10 +
    numericStat(stats.sectorsExplored) * 25 +
    numericStat(stats.piratesDefeated) * 100 +
    numericStat(stats.missionsCompleted) * 75 +
    numericStat(stats.tradeProfit) / 5 +
    numericStat(stats.reputation) * 20 +
    numericStat(stats.achievementsCount) * 50
  );
}

function publicProfilePayloadFromGame(status = "online") {
  const profile = captainProfile();
  return {
    uid: cloudUiState.user?.uid || "",
    captainName: safeCompetitiveCaptainName(profile),
    title: profile.title || "Captain",
    specialty: profile.specialty || "Explorer",
    shipName: game.player.shipName || currentShip().name,
    currentSector: game.player.currentSector,
    status,
    ...competitiveStats()
  };
}

function publicProfileSignature(payload) {
  const copy = { ...payload };
  delete copy.lastSeenAt;
  return JSON.stringify(copy);
}

function scheduleCompetitiveProfileUpdate(reason = "progress", options = {}) {
  const client = firebaseClient();
  if (!client?.updatePublicProfile || !cloudUiState.user || launchGate.mode === "localPrototype") return Promise.resolve({ ok: false, error: "Competitive leaderboards require Google sign-in." });
  const payload = publicProfilePayloadFromGame(options.status || "online");
  const signature = publicProfileSignature(payload);
  const now = Date.now();
  if (!options.force && signature === competitiveState.lastProfileSignature && now - competitiveState.lastProfileWriteAt < COMPETITIVE_PROFILE_WRITE_THROTTLE_MS) return Promise.resolve({ ok: true, data: { throttled: true, reason } });
  if (!options.force && now - competitiveState.lastProfileWriteAt < COMPETITIVE_PROFILE_WRITE_THROTTLE_MS) return Promise.resolve({ ok: true, data: { throttled: true, reason } });
  competitiveState.lastProfileSignature = signature;
  competitiveState.lastProfileWriteAt = now;
  return Promise.resolve(client.updatePublicProfile(payload)).catch((error) => ({ ok: false, error: error?.message || "Competitive profile update failed safely." }));
}

function publishCompetitiveEvent(eventType, message, options = {}) {
  const client = firebaseClient();
  if (!client?.createPublicEvent || !cloudUiState.user || launchGate.mode === "localPrototype") return Promise.resolve({ ok: false, error: "Competitive activity requires Google sign-in." });
  const payload = { eventType, message: friendlyCompetitiveEvent({ eventType, message, captainName: safeCompetitiveCaptainName(), sectorNumber: options.sectorNumber ?? game.player.currentSector }), captainName: safeCompetitiveCaptainName(), sectorNumber: options.sectorNumber ?? game.player.currentSector };
  const signature = JSON.stringify(payload);
  const now = Date.now();
  const recentAt = competitiveState.recentEventSignatures?.get(signature) || 0;
  if (!options.force && (competitiveState.lastEventSignature === signature || now - recentAt < COMPETITIVE_EVENT_THROTTLE_MS)) return Promise.resolve({ ok: true, data: { throttled: true } });
  competitiveState.lastEventSignature = signature;
  competitiveState.lastEventAt = now;
  competitiveState.recentEventSignatures?.set(signature, now);
  if (competitiveState.recentEventSignatures?.size > 30) {
    [...competitiveState.recentEventSignatures.entries()].sort((a, b) => a[1] - b[1]).slice(0, 10).forEach(([key]) => competitiveState.recentEventSignatures.delete(key));
  }
  return Promise.resolve(client.createPublicEvent(payload)).catch((error) => ({ ok: false, error: error?.message || "Competitive event skipped safely." }));
}

const LEADERBOARD_DEFINITIONS = [
  { key: "totalScore", label: "Overall Score" },
  { key: "sectorsExplored", label: "Sectors Explored" },
  { key: "piratesDefeated", label: "Pirates Defeated" },
  { key: "tradeProfit", label: "Trade Profit" },
  { key: "missionsCompleted", label: "Missions Completed" },
  { key: "reputation", label: "Reputation" },
  { key: "creditsEarned", label: "Credits Earned" },
];

function normalizeLeaderboardRow(row = {}, field = "totalScore") {
  const safe = safeObject(row);
  const uid = safePlainText(safe.uid || safe.id || "", "");
  return {
    uid,
    captainName: safePlainText(safe.captainName || safe.displayName, "Unnamed Captain"),
    shipName: safePlainText(safe.shipName, "Unregistered Ship"),
    specialty: safePlainText(safe.specialty, "Explorer"),
    score: numericStat(safe[field]),
    totalScore: numericStat(safe.totalScore),
    lastSeenAtMs: timestampMillis(safe.lastSeenAt || safe.updatedAt),
  };
}

function renderLeaderboardRows(rows = [], field = "totalScore") {
  const normalized = safeArray(rows).map((row) => normalizeLeaderboardRow(row, field)).filter((row) => row.captainName).sort((a, b) => (b.score - a.score) || (b.totalScore - a.totalScore) || (b.lastSeenAtMs - a.lastSeenAtMs) || a.captainName.localeCompare(b.captainName)).slice(0, 10);
  if (!normalized.length) return `<p class="empty-note">No competitive profiles yet. The first signed-in captain appears here after a safe profile sync.</p>`;
  const currentUid = cloudUiState.user?.uid || "";
  const currentName = safeCompetitiveCaptainName();
  return `<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Captain</th><th>Ship</th><th>Specialty</th><th>${safeDisplayText(LEADERBOARD_DEFINITIONS.find((board) => board.key === field)?.label || "Score")}</th></tr></thead><tbody>${normalized.map((row, index) => { const current = (currentUid && row.uid === currentUid) || row.captainName === currentName; return `<tr class="${current ? "current-player-row" : ""}"><td><span class="rank-badge">#${index + 1}</span></td><td>${safeDisplayText(row.captainName)}${current ? ` <span class="you-badge">You</span>` : ""}</td><td>${safeDisplayText(row.shipName)}</td><td>${safeDisplayText(row.specialty)}</td><td>${safeDisplayText(row.score)}</td></tr>`; }).join("")}</tbody></table>`;
}

function friendlyCompetitiveEvent(event = {}) {
  const type = safePlainText(event.eventType, "activity");
  const captain = safePlainText(event.captainName, "Unnamed Captain");
  const sector = event.sectorNumber ? ` in Sector ${numericStat(event.sectorNumber)}` : "";
  const defaults = {
    captainLaunched: `${captain} launched into Sector Drift.`,
    warpedSector: `${captain} traveled${sector}.`,
    discoveredSector: `${captain} mapped a new trade route or sector lead${sector}.`,
    defeatedPirate: `${captain} defeated a pirate raider${sector}.`,
    completedMission: `${captain} completed a mission contract${sector}.`,
    upgradedShip: `${captain} upgraded ship systems${sector}.`,
    boughtHyperdrive: `${captain} upgraded to Hyperdrive.`,
    enteredTopRank: `${captain} reached a Top 5 leaderboard rank.`,
  };
  return safePlainText(event.message, defaults[type] || `${captain} logged Sector Drift activity${sector}.`);
}

function collapseCompetitiveEvents(events = []) {
  const collapsed = [];
  const seen = new Set();
  safeArray(events).forEach((event) => {
    const safe = safeObject(event);
    const message = friendlyCompetitiveEvent(safe);
    const key = `${safePlainText(safe.uid || safe.captainName)}|${safePlainText(safe.eventType)}|${numericStat(safe.sectorNumber)}|${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    collapsed.push({ ...safe, message });
  });
  return collapsed.slice(0, COMPETITIVE_EVENT_LIMIT);
}

function renderPublicEventFeed(events = competitiveState.publicEvents) {
  const safeEvents = collapseCompetitiveEvents(events).slice(0, 20);
  if (!safeEvents.length) return `<p class="empty-note">No shared activity yet. Signed-in milestone events will appear newest first.</p>`;
  return `<ol class="competitive-feed">${safeEvents.map((event, index) => `<li class="${index === 0 ? "latest" : ""}"><strong>${safeDisplayText(event.captainName || "Unnamed Captain")}</strong><span>${safeDisplayText(event.message)}</span>${event.sectorNumber ? `<em>Sector ${safeDisplayText(event.sectorNumber)}</em>` : ""}</li>`).join("")}</ol>`;
}

function renderCompetitiveNotice() {
  if (cloudUiState.user && launchGate.mode !== "localPrototype") return "";
  return `<section class="mini-card competitive-notice"><h3>Sign-in Required</h3><p class="turn-warning">Competitive leaderboards require Google sign-in.</p><p class="help-text">Local prototype mode still works, but public rankings, shared events, and sector traffic stay disabled until sign-in.</p></section>`;
}

function renderCompetitiveScreen() {
  if (cloudUiState.user) {
    scheduleCompetitiveProfileUpdate("competitive screen");
    refreshCompetitiveData();
  }
  const stats = competitiveStats();
  const boards = LEADERBOARD_DEFINITIONS.map((board) => `<details class="compact-section leaderboard-section" ${board.key === "totalScore" ? "open" : ""}><summary>${board.label}</summary>${renderLeaderboardRows(competitiveState.leaderboards[board.key] || [], board.key)}</details>`).join("");
  return `<div class="competitive-screen"><section class="mini-card"><p class="eyebrow">Competitive Multiplayer Foundation</p><h3>Shared Universe Status</h3><p class="help-text">Public profile data is only for display and leaderboard rankings. It does not expose email, cargo, cloud saves, dev codes, or private save data.</p><div class="stats-grid">${stat("Your Score", stats.totalScore)}${stat("Sectors", stats.sectorsExplored)}${stat("Pirates", stats.piratesDefeated)}${stat("Missions", stats.missionsCompleted)}${stat("Trade Profit", stats.tradeProfit)}${stat("Presence", presenceStatusLabel())}</div><details class="compact-section"><summary>How score works</summary><p class="help-text">totalScore = creditsEarned / 10 + sectorsExplored × 25 + piratesDefeated × 100 + missionsCompleted × 75 + tradeProfit / 5 + reputation × 20 + achievementsCount × 50.</p></details></section>${renderCompetitiveNotice()}<section class="mini-card"><h3>Leaderboards</h3><p class="help-text">Rankings use safe, client-reported classroom stats. They are competitive, not cheat-proof.</p>${cloudUiState.user ? boards : `<p class="empty-note">Competitive leaderboards require Google sign-in.</p>`}</section><section class="mini-card"><h3>Shared Live Activity</h3><p class="help-text">System-generated events only. No chat, direct PvP attacks, stealing, or player-to-player trading.</p>${cloudUiState.user ? renderPublicEventFeed() : `<p class="empty-note">Competitive leaderboards require Google sign-in.</p>`}</section>${renderSectorTraffic()}</div>`;
}

function refreshCompetitiveData() {
  const client = firebaseClient();
  if (!client || !cloudUiState.user || launchGate.mode === "localPrototype") return;
  const now = Date.now();
  if (now - competitiveState.lastRefreshAt < 30000) return;
  competitiveState.lastRefreshAt = now;
  if (!competitiveState.loadingBoards && client.getPublicLeaderboard) {
    competitiveState.loadingBoards = true;
    Promise.all(LEADERBOARD_DEFINITIONS.map((board) => Promise.resolve(client.getPublicLeaderboard(board.key, 10)).then((result) => [board.key, result])))
      .then((pairs) => { pairs.forEach(([key, result]) => { if (result?.ok) competitiveState.leaderboards[key] = result.data || []; }); })
      .finally(() => { competitiveState.loadingBoards = false; if (activeScreenName() === "competitive") render(); });
  }
  if (client.getPublicEvents) {
    Promise.resolve(client.getPublicEvents(COMPETITIVE_EVENT_LIMIT)).then((result) => { if (result?.ok) competitiveState.publicEvents = result.data || []; if (activeScreenName() === "competitive") render(); }).catch(() => {});
  }
}

function subscribeToCompetitiveEvents() {
  const client = firebaseClient();
  if (!client?.onPublicEventsChange || competitiveState.eventsListening) return;
  client.onPublicEventsChange(({ ok, records = [], status } = {}) => {
    competitiveState.eventsListening = Boolean(ok);
    competitiveState.eventsStatus = status?.status || (ok ? "listening" : "unavailable");
    competitiveState.eventsMessage = ok ? "Shared activity feed listening." : (status?.error || "Competitive leaderboards require Google sign-in.");
    competitiveState.publicEvents = records.slice(0, COMPETITIVE_EVENT_LIMIT);
    if (activeScreenName() === "competitive") render();
  });
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function pushLiveEvent({ type = "info", title = "Sector Update", message = "", tone = "neutral", sectorNumber = game?.player?.currentSector } = {}) {
  liveEventPulseToken += 1;
  liveEvents.unshift({ id: `${Date.now()}-${liveEventPulseToken}`, type, title: String(title).slice(0, 80), message: String(message).slice(0, 220), tone: ["positive", "negative", "neutral"].includes(tone) ? tone : "neutral", sectorNumber: Number(sectorNumber) || game?.player?.currentSector || 1, timestamp: Date.now() });
  liveEvents = liveEvents.slice(0, LIVE_EVENT_LIMIT);
  if (panels.sector && activeScreenName() === "cockpit") renderSectorPanel();
  return liveEvents[0];
}

function renderLiveEventBox() {
  const events = liveEvents.length ? liveEvents : [{ title: "Live Events Ready", message: "Important cockpit results will appear here without replacing the Captain’s Log.", tone: "neutral", sectorNumber: game.player.currentSector }];
  const items = events.slice(0, LIVE_EVENT_LIMIT).map((event, index) => `<li class="live-event-item live-event-${safeDisplayText(event.tone)} ${index === 0 ? "latest" : ""}"><strong>${safeDisplayText(event.title)}</strong><span>${safeDisplayText(event.message)}</span><em>Sector ${safeDisplayText(event.sectorNumber)}</em></li>`).join("");
  return `<section class="live-event-box ${liveEventPulseToken ? "live-event-pulse" : ""}" data-live-event-token="${liveEventPulseToken}" aria-live="polite"><div class="live-event-header"><p class="eyebrow">Live Events</p><strong>Immediate Cockpit Feed</strong></div><ol class="live-event-list">${items}</ol></section>`;
}

function safePresenceRecord(record = {}) {
  return {
    uid: String(record.uid || record.id || ""),
    displayName: safePlainText(record.captainName || record.displayName || "Signed-in Captain", "Signed-in Captain"),
    shipName: safePlainText(record.shipName || "Unregistered Ship", "Unregistered Ship"),
    specialty: safePlainText(record.specialty || "Explorer", "Explorer"),
    status: safePlainText(record.status || "online", "online"),
    sectorNumber: Math.max(1, Math.floor(Number(record.sectorNumber) || 1)),
    updatedAtMs: timestampMillis(record.updatedAt || record.lastSeenAt),
  };
}

function currentPresencePayload(status = "online") {
  return { captainName: captainDisplayName(captainProfile()), displayName: captainDisplayName(captainProfile()), sectorNumber: game.player.currentSector, shipName: game.player.shipName || currentShip().name, specialty: captainProfile().specialty, status, prototypeVersion: STORAGE_KEY };
}

function updatePresenceStatus(status = "online", options = {}) {
  const client = firebaseClient();
  if (!client?.updatePresence || launchGate.mode === "localPrototype") {
    sectorTrafficState.status = launchGate.mode === "localPrototype" ? "local mode" : "unavailable";
    if (!options.silent) sectorTrafficState.message = "Sector traffic unavailable. Local prototype mode active.";
    return Promise.resolve({ ok: false, error: sectorTrafficState.message });
  }
  const result = client.updatePresence(currentPresencePayload(status));
  Promise.resolve(result).then((response) => {
    if (!response?.ok && !options.silent) {
      sectorTrafficState.status = cloudUiState.user ? "unavailable" : "signed out";
      sectorTrafficState.message = response?.error || "Sector traffic unavailable. Local prototype mode active.";
    }
  }).catch((error) => {
    if (!options.silent) {
      sectorTrafficState.status = "unavailable";
      sectorTrafficState.message = error?.message || "Sector traffic unavailable. Local prototype mode active.";
    }
  });
  return result;
}

function subscribeToSectorTraffic() {
  const client = firebaseClient();
  if (!client?.onPresenceChange) {
    sectorTrafficState.status = "unavailable";
    sectorTrafficState.message = "Sector traffic unavailable. Local prototype mode active.";
    sectorTrafficState.listening = false;
    return;
  }
  if (presenceUnsubscribe) return;
  presenceUnsubscribe = client.onPresenceChange(({ ok, records = [], status } = {}) => {
    sectorTrafficState.listening = Boolean(ok);
    sectorTrafficState.status = status?.status || (ok ? "listening" : "unavailable");
    sectorTrafficState.message = ok ? "Live sector traffic listening." : (status?.error || "Sector traffic unavailable. Local prototype mode active.");
    applyPresenceRecords(records);
    if (["cockpit", "settings"].includes(activeScreenName())) render();
  });
}

function applyPresenceRecords(records = []) {
  const ownUid = cloudUiState.user?.uid || "";
  const now = Date.now();
  const previous = new Map(sectorTrafficState.knownSectors);
  const next = new Map();
  const occupants = [];
  records.map(safePresenceRecord).forEach((record) => {
    if (!record.uid || record.uid === ownUid) return;
    const recent = !record.updatedAtMs || now - record.updatedAtMs <= PRESENCE_ONLINE_WINDOW_MS;
    if (!recent || record.status === "offline") return;
    next.set(record.uid, record.sectorNumber);
    if (record.sectorNumber === game.player.currentSector) occupants.push(record);
    if (sectorTrafficState.initialized) {
      const oldSector = previous.get(record.uid);
      if (oldSector !== game.player.currentSector && record.sectorNumber === game.player.currentSector) pushLiveEvent({ type: "presence", title: "Sector Traffic", message: `Captain ${record.displayName} warped into Sector ${record.sectorNumber}.`, tone: "neutral", sectorNumber: record.sectorNumber });
      if (oldSector === game.player.currentSector && record.sectorNumber !== game.player.currentSector) pushLiveEvent({ type: "presence", title: "Sector Traffic", message: `Captain ${record.displayName} left Sector ${oldSector}.`, tone: "neutral", sectorNumber: oldSector });
    }
  });
  sectorTrafficState.initialized = true;
  sectorTrafficState.knownSectors = next;
  sectorTrafficState.currentSectorOccupants = occupants.slice(0, 6);
}

function renderSectorTraffic() {
  if (launchGate.mode === "localPrototype" || sectorTrafficState.status === "unavailable" || sectorTrafficState.status === "local mode") {
    return `<section class="sector-traffic"><h3>Sector Traffic</h3><p class="empty-note">Display-only sector traffic is unavailable in local prototype mode.</p></section>`;
  }
  if (!cloudUiState.user) return `<section class="sector-traffic"><h3>Sector Traffic</h3><p class="empty-note">Sign in to see display-only nearby captains.</p></section>`;
  const occupants = sectorTrafficState.currentSectorOccupants || [];
  const list = occupants.length ? `<ul>${occupants.map((record) => `<li><strong>${safeDisplayText(record.displayName)}</strong><span>${safeDisplayText(record.shipName)} · ${safeDisplayText(record.specialty || "Explorer")}</span><em>${safeDisplayText(record.status)}</em></li>`).join("")}</ul>` : `<p class="empty-note">No other online captains in this sector.</p>`;
  return `<section class="sector-traffic"><h3>Sector Traffic</h3>${list}<p class="help-text">Display-only presence: no chat, PvP, trading, stealing, or shared combat.</p></section>`;
}

function presenceStatusLabel() {
  if (launchGate.mode === "localPrototype") return "local mode";
  if (!firebaseClient()) return "unavailable";
  if (!cloudUiState.user) return "signed out";
  return sectorTrafficState.status === "listening" ? "available" : (sectorTrafficState.status || "available");
}



function initializeLaunchGate() {
  if (!REQUIRE_FIREBASE_LOGIN) {
    launchGate.mode = "signedIn";
    launchGate.message = "Classroom sign-in is optional for this build.";
    return;
  }
  game.ui = game.ui || {};
  updateLaunchGateFromAuth();
  if (!canUseGameActions()) game.ui.activeScreen = "launch";
}

function updateLaunchGateFromAuth() {
  refreshFirebaseUiState(false);
  if (launchGate.mode === "localPrototype") return;
  const client = firebaseClient();
  if (!REQUIRE_FIREBASE_LOGIN) {
    launchGate.mode = "signedIn";
    launchGate.message = "Classroom sign-in is optional for this build.";
  } else if (!client || ["unavailable", "not initialized"].includes(cloudUiState.status)) {
    launchGate.mode = "signedOut";
    launchGate.message = cloudUiState.message || "Cloud login is unavailable right now. Local Prototype Mode can still be used for testing.";
  } else if (cloudUiState.user) {
    launchGate.mode = "signedIn";
    launchGate.message = "Signed in. Continue to Ship when ready; cloud saves load only after confirmation.";
  } else {
    launchGate.mode = "signedOut";
    launchGate.message = "Sign in with Google or choose Local Prototype Mode before launching.";
  }
}

function authGateMessage() {
  return "Sign in or choose Local Prototype Mode before launching.";
}

function canUseGameActions() {
  if (typeof window === "undefined") return true;
  if (!REQUIRE_FIREBASE_LOGIN) return true;
  return launchGate.mode === "signedIn" || launchGate.mode === "localPrototype";
}


function connectionStatusItems() {
  refreshFirebaseUiState(false);
  const recoveryActive = sessionRecoveryMessages.length > 0;
  const signedIn = Boolean(cloudUiState.user);
  const items = [];
  if (launchGate.mode === "localPrototype") items.push({ label: "Local Prototype Mode", tone: "warn", detail: "Browser-only save" });
  else if (signedIn) items.push({ label: "Signed In", tone: "good", detail: cloudUiState.user.displayName || "Google account" });
  else items.push({ label: "Offline / Retry", tone: "warn", detail: cloudUiState.message || "Local save available" });
  if (signedIn && cloudUiState.status === "available") items.push({ label: "Cloud Sync Active", tone: "good", detail: "Manual backup ready" });
  if (signedIn && launchGate.mode !== "localPrototype") items.push({ label: "Competitive Online", tone: sectorTrafficState.status === "listening" ? "good" : "neutral", detail: presenceStatusLabel() });
  if (recoveryActive) items.push({ label: "Save Recovery Active", tone: "warn", detail: sessionRecoveryMessages[0] });
  if (!signedIn && launchGate.mode !== "localPrototype") items.push({ label: "Local Save Ready", tone: localStorageAvailable ? "neutral" : "warn", detail: localSaveStatus });
  return items.slice(0, 5);
}

function renderConnectionStatusStrip() {
  const items = connectionStatusItems();
  return `<section class="connection-strip" aria-label="Connection and save status"><div class="connection-strip-title"><strong>Status</strong><span>${safeDisplayText(CLASSROOM_BUILD_LABEL)}</span></div><div class="connection-pill-row">${items.map((item) => `<span class="connection-pill connection-${item.tone}"><strong>${safeDisplayText(item.label)}</strong><em>${safeDisplayText(item.detail)}</em></span>`).join("")}</div></section>`;
}

function guidedStartCards() {
  return [
    { title: "Move with the map", body: "Click a sector once to scan it. Click an adjacent selected sector again to travel. Sector 1 is protected while you learn." },
    { title: "Dock and trade", body: "Dock at starbases to refuel, repair, buy cheap cargo, and sell cargo high. Port codes follow Food/Ore/Tech: S = sells cheap, B = buys high." },
    { title: "Use missions and routes", body: "Open Mission Terminal for jobs. Plot Route and Scout Route help you plan several jumps before spending fuel and turns." },
    { title: "Upgrade scanners", body: "Shipyard upgrades improve cargo, engines, shields, and scanners. Better scanners reveal more sector details and safer route choices." },
  ];
}

function needsGuidedStart() {
  return canUseGameActions() && !game.tutorial?.guidedStartComplete;
}

function renderGuidedStartOverlay() {
  if (!needsGuidedStart()) return "";
  const cards = guidedStartCards();
  const step = Math.min(cards.length - 1, Math.max(0, Number(game.tutorial?.guidedStartStep) || 0));
  const card = cards[step];
  return `<section class="guided-start" role="dialog" aria-label="Sector Drift quick start"><div class="guided-start-card"><p class="eyebrow">Quick Start ${step + 1}/${cards.length}</p><h3>${safeDisplayText(card.title)}</h3><p>${safeDisplayText(card.body)}</p><div class="button-row"><button type="button" class="button-secondary" data-action="guidedStartSkip">Skip Guide</button><button type="button" class="primary-launch-button" data-action="guidedStartNext">${step >= cards.length - 1 ? "Start Flying" : "Next Tip"}</button></div></div></section>`;
}

function completeGuidedStart() {
  game.tutorial = { ...(game.tutorial || {}), guidedStartComplete: true, guidedStartStep: guidedStartCards().length };
  addLog("Quick Start dismissed. You can review core tips in Mission Terminal tutorials.");
  saveGame();
  render();
}

function advanceGuidedStart() {
  game.tutorial = { ...(game.tutorial || {}) };
  const next = (Number(game.tutorial.guidedStartStep) || 0) + 1;
  if (next >= guidedStartCards().length) return completeGuidedStart();
  game.tutorial.guidedStartStep = next;
  saveGame();
  render();
}

function contextualSuggestions() {
  const sector = sectorMap[game.player.currentSector];
  const suggestions = [];
  const cargoEmpty = RESOURCES.every((resource) => (game.player.cargo[resource] || 0) === 0) && (game.player.cargo[SMUGGLED_RESOURCE] || 0) === 0;
  if (cargoEmpty) suggestions.push("Your cargo hold is empty. Dock at a starbase or mine nearby asteroids to start earning credits.");
  if (sector.type === "asteroid") suggestions.push("Try mining this asteroid field; Miner captains gain a small Ore bonus.");
  const cheapOrePort = Object.values(sectorMap).find((candidate) => candidate.type === "port" && candidate.portType?.[1] === "S" && sector.adjacent.includes(candidate.number));
  if (cheapOrePort) suggestions.push(`Nearby ${cheapOrePort.portType} station in Sector ${cheapOrePort.number} may sell Ore cheaply.`);
  const activeMission = (game.deliveryQuests || []).find((quest) => quest.status === "active" || quest.status === "claimable");
  if (activeMission) suggestions.push(`Mission active: ${activeMission.title}. Use Plot Route or Scout Route from Mission Terminal if you need the next sector.`);
  const bounty = Object.values(game.pirates || {}).find((pirate) => !pirate.defeated && pirate.sector !== game.player.currentSector);
  if (bounty && game.player.reputation >= 4) suggestions.push(`Pirate bounty available in Sector ${bounty.sector}. Open Combat / Pirate Intel to review risk first.`);
  if ((game.player.upgrades?.scanner || 1) < 2 && game.player.credits >= shipUpgradeCost("scanner")) suggestions.push("Visit a Shipyard to upgrade scanners and reveal clearer nearby sector intel.");
  if ((game.player.upgrades?.hyperdrive || 0) < 1 && game.player.credits >= HYPERDRIVE_COST) suggestions.push("You have enough credits for Hyperdrive. Buy it at a Shipyard, then use Engage Hyperdrive on plotted routes.");
  if (game.player.fuel <= 3) suggestions.push("Fuel is low. Dock at a starbase, complete missions, or avoid long routes until refueled.");
  if (sector.type === "port") suggestions.push("Dock at this starbase to buy/sell cargo, repair, refuel, and check port-code opportunities.");
  return [...new Set(suggestions)].slice(0, 3);
}

function renderContextualHelper() {
  const suggestions = contextualSuggestions();
  const items = suggestions.length ? suggestions.map((tip) => `<li>${safeDisplayText(tip)}</li>`).join("") : `<li>Choose an adjacent sector, dock at ports, or open Mission Terminal for a job.</li>`;
  return `<section class="cockpit-helper"><h3>What should I do next?</h3><ul>${items}</ul></section>`;
}

function isTeacher() {
  return Boolean(cloudUiState.user) && cloudUiState.role === "teacher";
}

function launchModeLabel() {
  if (launchGate.mode === "localPrototype") return "Local Prototype Mode";
  if (launchGate.mode === "signedIn") return "Signed-in classroom mode";
  if (launchGate.mode === "checkingAuth") return "Checking auth";
  return "Signed out";
}

function continueToShip() {
  updateLaunchGateFromAuth();
  if (!canUseGameActions()) return addAndRender(authGateMessage());
  game.ui.activeScreen = "cockpit";
  addLog(launchGate.mode === "localPrototype" ? "Local Prototype Mode launched. Progress stays in this browser." : "Classroom launch complete. Welcome aboard.");
  saveGame();
  render();
}

function enterLocalPrototypeMode() {
  if (!ALLOW_LOCAL_PROTOTYPE_MODE) return;
  launchGate.mode = "localPrototype";
  launchGate.message = "Local Prototype Mode active. Saves stay in this browser and are not tied to a school account.";
  continueToShip();
}

function renderLaunchScreen() {
  const signedIn = Boolean(cloudUiState.user);
  const account = signedIn ? `${cloudUiState.user.displayName || "Google user"} (${cloudUiState.user.email || "no email"})` : "Not signed in";
  const firebaseStatus = cloudStatusLabel(false);
  const canContinue = signedIn || launchGate.mode === "localPrototype" || !REQUIRE_FIREBASE_LOGIN;
  const signInDisabled = !firebaseClient() || firebaseStatus !== "available" || signedIn || cloudUiState.busy ? "disabled" : "";
  const continueDisabled = canContinue ? "" : "disabled";
  const role = signedIn ? (cloudUiState.role || "unknown") : "not signed in";
  return `<section class="launch-screen"><div class="launch-hero-card"><p class="eyebrow">Classroom launch gate</p><h2>Sector Drift</h2><p class="subtitle">Board your ship with a school Google account, then choose when to enter the cockpit. Cloud backups are never loaded automatically.</p><div class="launch-status-grid">${stat("Firebase status", firebaseStatus)}${stat("Launch mode", launchModeLabel())}${stat("Sign-in state", signedIn ? "signed in" : "signed out")}${stat("Account", account)}${stat("Role", role)}${stat("Role note", cloudUiState.roleReason || "Role lookup pending.")}</div><p class="help-text">${launchGate.message}</p><div class="button-row"><button type="button" data-action="firebaseSignIn" ${signInDisabled}>Sign in with Google</button><button type="button" class="primary-launch-button" data-action="continueToShip" ${continueDisabled}>Continue to Ship</button></div></div><section class="mini-card prototype-card"><h3>Local Prototype Mode</h3><p>Use only for testing. Saves stay in this browser.</p><p class="turn-warning">Local Prototype Mode saves only on this browser and is not tied to a school account.</p><button type="button" data-action="localPrototype" ${ALLOW_LOCAL_PROTOTYPE_MODE ? "" : "disabled"}>Continue Local Prototype Mode</button></section></section>`;
}

function renderCloudLoginPanel() {
  const client = firebaseClient();
  const status = cloudStatusLabel();
  const signedIn = Boolean(cloudUiState.user);
  const unavailable = !client || status !== "available" || cloudUiState.busy;
  const saveLoadDisabled = unavailable || !signedIn;
  const userText = signedIn
    ? `${cloudUiState.user.displayName || "Google user"} (${cloudUiState.user.email || "no email"})`
    : "Not signed in";
  const signInDisabled = unavailable || signedIn ? "disabled" : "";
  const signOutDisabled = unavailable || !signedIn ? "disabled" : "";
  const saveDisabled = saveLoadDisabled ? "disabled" : "";
  const loadDisabled = saveLoadDisabled ? "disabled" : "";
  const helper = !client
    ? "Cloud backup unavailable. LocalStorage play still works."
    : signedIn
      ? "Cloud backup is optional. Loading requires confirmation before replacing this browser save."
      : "Sign in first to save or load a cloud backup. Classroom play requires launch sign-in unless Local Prototype Mode is selected.";

  return `<section class="mini-card"><h3>Cloud Login / Firebase Backup</h3><p class="help-text">${helper}</p>${stat("Firebase status", status)}${stat("Sign-in status", signedIn ? "signed in" : "signed out")}${stat("Account", userText)}${stat("Role", cloudUiState.role || "unknown")}${stat("Role note", cloudUiState.roleReason || "Role lookup pending.")}<div class="button-row"><button type="button" data-action="firebaseSignIn" ${signInDisabled}>Sign in with Google</button><button type="button" data-action="firebaseSignOut" ${signOutDisabled}>Sign out</button></div><div class="button-row"><button type="button" data-action="cloudBackupSave" ${saveDisabled}>Save Cloud Backup</button><button type="button" data-action="cloudBackupLoad" ${loadDisabled}>Load Cloud Backup</button></div><p class="help-text">${cloudUiState.busy ? "Working with Firebase..." : cloudUiState.message}</p><p class="help-text"><strong>Last cloud result:</strong> ${cloudUiState.lastCloudResult}</p></section>`;
}

async function handleFirebaseSignIn() {
  const client = firebaseClient();
  if (!client) { cloudUiState.message = "Cloud backup unavailable. Local save still works."; render(); return; }
  cloudUiState.busy = true;
  cloudUiState.message = "Opening Google sign-in...";
  render();
  const result = await client.signInWithGoogle();
  cloudUiState.busy = false;
  if (result.ok) {
    cloudUiState.user = result.data?.user || null;
    cloudUiState.role = result.data?.role || "unknown";
    cloudUiState.message = "Signed in. Local save was not changed.";
    cloudUiState.lastCloudResult = "Signed in successfully; local save unchanged.";
  } else {
    cloudUiState.message = result.error || "Google sign-in failed. Local save still works.";
    cloudUiState.lastCloudResult = cloudUiState.message;
  }
  refreshFirebaseUiState();
  render();
}

async function handleFirebaseSignOut() {
  const client = firebaseClient();
  if (!client) { cloudUiState.message = "Cloud backup unavailable. Local save still works."; render(); return; }
  cloudUiState.busy = true;
  render();
  const result = await client.signOutOfFirebase();
  cloudUiState.busy = false;
  if (result.ok) {
    cloudUiState.user = null;
    cloudUiState.role = "unknown";
    cloudUiState.message = "Signed out of Firebase. Local save remains on this device.";
    cloudUiState.lastCloudResult = "Signed out; local save remains on this device.";
    launchGate.mode = "signedOut";
  } else {
    cloudUiState.message = result.error || "Sign-out failed. Local save remains unchanged.";
  }
  render();
}

// TODO: Future multiplayer must not trust client-side credits, cargo, ship ownership, combat outcomes, planet ownership, or PvP results.
// TODO: Future teacher dashboard should be role-gated by Firebase Auth and Firestore Security Rules.
// TODO: Future shared universe needs server-side validation or very careful rules.
// TODO: Future PvP must wait until teacher controls, safe zones, protected space, and restore tools exist.
// TODO: Cloud backup is not anti-cheat. It is only save portability and login readiness.
async function handleCloudBackupSave() {
  const client = firebaseClient();
  if (!client) { cloudUiState.message = "Cloud backup unavailable. Local save still works."; render(); return; }
  cloudUiState.busy = true;
  cloudUiState.message = "Saving cloud backup...";
  render();
  const result = await client.saveCloudBackup(getCurrentSavePayload(), STORAGE_KEY);
  cloudUiState.busy = false;
  if (result.ok) {
    cloudUiState.message = "Cloud backup saved successfully.";
    cloudUiState.lastCloudResult = "Saved current browser state to players/{uid}.";
    addLog("Captain’s Log: Cloud backup saved to Firebase.");
    pushLiveEvent({ type: "save", title: "Cloud Backup Saved", message: "Firebase cloud backup saved successfully.", tone: "positive" });
    saveGame();
  } else {
    cloudUiState.message = result.error || "Cloud backup failed. Local save is unchanged.";
    cloudUiState.lastCloudResult = cloudUiState.message;
    pushLiveEvent({ type: "save", title: "Cloud Backup Warning", message: cloudUiState.message, tone: "negative" });
  }
  render();
}

async function handleCloudBackupLoad() {
  const client = firebaseClient();
  if (!client) { cloudUiState.message = "Cloud backup unavailable. Local save still works."; render(); return; }
  if (!confirm("Load cloud save and replace this browser’s current local save?")) {
    cloudUiState.message = "Cloud load canceled. Local save was not changed.";
    render();
    return;
  }

  cloudUiState.busy = true;
  cloudUiState.message = "Loading cloud backup...";
  render();
  const result = await client.loadCloudBackup();
  cloudUiState.busy = false;
  if (!result.ok) {
    cloudUiState.message = result.error || "Cloud load failed. Local save was not changed.";
    render();
    return;
  }

  const applied = applyLoadedSavePayload(result.data?.saveData);
  cloudUiState.message = applied.ok ? "Cloud backup loaded successfully." : applied.error;
  cloudUiState.lastCloudResult = cloudUiState.message;
  if (applied.ok) {
    addLog("Captain’s Log: Cloud backup loaded into this browser after confirmation.");
    pushLiveEvent({ type: "save", title: "Cloud Backup Loaded", message: "Cloud save loaded into this browser after confirmation.", tone: "positive" });
    updatePresenceStatus("online");
  } else {
    pushLiveEvent({ type: "save", title: "Cloud Load Warning", message: cloudUiState.message, tone: "negative" });
  }
  render();
}

function renderSettingsScreen() {
  const recoveryNotice = sessionRecoveryMessages.length ? `<p class="turn-warning">${sessionRecoveryMessages[0]}</p>` : `<p class="help-text">No save repair was needed this session.</p>`;
  const storageNote = localStorageAvailable ? localSaveStatus : `${localSaveStatus}${lastLocalSaveError ? ` (${lastLocalSaveError})` : ""}`;
  return `<div class="screen-grid"><section class="mini-card"><h3>Captain Identity</h3><div class="stats-grid">${stat("Captain", captainDisplayName(captainProfile()))}${stat("Specialty", captainProfile().specialty)}${stat("Bonus", captainSpecialtyBonusText())}</div><details class="compact-section"><summary>Edit Captain Profile</summary>${renderCaptainProfileForm({ compact: true })}<p class="turn-warning">Specialties can be changed freely because bonuses are intentionally tiny.</p></details></section><section class="mini-card"><h3>Local Save</h3><p class="help-text">Sector Drift saves automatically to localStorage on this device. Active docked screens are not restored on load; pilots return to the cockpit.</p>${stat("Local save status", storageNote)}${stat("Local prototype mode", launchGate.mode === "localPrototype" ? "active" : "available from launch screen")}${stat("Presence", presenceStatusLabel())}${stat("Live sector traffic", sectorTrafficState.listening ? "listening" : sectorTrafficState.status || "unavailable")}${recoveryNotice}<div class="button-row"><button type="button" data-action="saveNow">Save Now</button><button type="button" data-action="normalizeSave">Repair / Normalize Save</button><button type="button" class="danger-button" data-action="resetLocal">Clear Local Save / Reset Prototype</button></div></section>${renderCloudLoginPanel()}<section class="mini-card"><h3>Export / Import</h3><p class="help-text">Manual export/import uses this browser save only. Firebase backup/load does not add multiplayer.</p><div class="button-row"><button type="button" data-action="exportSaveJson">Export Save JSON</button><button type="button" data-action="importSaveJson">Import Save JSON</button></div></section></div>`;
}

function wireDockedButtons(scope = document) {
  wireLocationButtons(scope);
  wireMathMissionControls(scope);
  wireWarpControls(scope);
  scope.querySelectorAll("[data-claim-mission]").forEach((button) => button.addEventListener("click", () => runGameAction(() => claimBoardMission(button.dataset.claimMission))));
  scope.querySelectorAll("[data-start-delivery]").forEach((button) => button.addEventListener("click", () => runGameAction(() => startDeliveryQuest(button.dataset.startDelivery))));
  scope.querySelectorAll("[data-complete-delivery]").forEach((button) => button.addEventListener("click", () => runGameAction(() => completeDeliveryQuest(button.dataset.completeDelivery))));
  scope.querySelectorAll("[data-plot-delivery]").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => plotDeliveryRoute(button.dataset.plotDelivery)); }));
  scope.querySelectorAll("[data-plot-bounty]").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => plotBountyRoute(button.dataset.plotBounty)); }));
  scope.querySelectorAll("[data-open-bounty-combat]").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => openBountyCombat(button.dataset.openBountyCombat)); }));
  scope.querySelectorAll("[data-station-activity]").forEach((button) => button.addEventListener("click", () => {
    const inputId = button.dataset.stationActivity === "cargoSorting" ? "cargoSortingAnswer" : "repairAssistAnswer";
    return runGameAction(() => runStationActivity(button.dataset.stationActivity, scope.querySelector(`#${inputId}`)?.value || ""));
  }));
  scope.querySelector("[data-action='readRumor']")?.addEventListener("click", () => runGameAction(readRumorBoard));
  scope.querySelector("[data-action='saveNow']")?.addEventListener("click", manualSaveNow);
  scope.querySelector("[data-action='saveCaptainProfile']")?.addEventListener("click", () => applyCaptainProfile(readCaptainProfileForm(scope)));
  scope.querySelector("[data-action='resetLocal']")?.addEventListener("click", () => { try { if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY); } catch (error) { lastLocalSaveError = error?.message || "localStorage reset was blocked."; } sectorMap = createSectorMap(); game = defaultGameState(); addLog("Prototype reset. Create your captain profile to launch."); saveGame(); render(); });
  scope.querySelector("[data-action='firebaseSignIn']")?.addEventListener("click", handleFirebaseSignIn);
  scope.querySelector("[data-action='firebaseSignOut']")?.addEventListener("click", handleFirebaseSignOut);
  scope.querySelector("[data-action='cloudBackupSave']")?.addEventListener("click", handleCloudBackupSave);
  scope.querySelector("[data-action='cloudBackupLoad']")?.addEventListener("click", handleCloudBackupLoad);
  scope.querySelector("[data-action='continueToShip']")?.addEventListener("click", continueToShip);
  scope.querySelector("[data-action='localPrototype']")?.addEventListener("click", enterLocalPrototypeMode);
  scope.querySelector("[data-action='normalizeSave']")?.addEventListener("click", normalizeCurrentSave);
  scope.querySelector("[data-action='exportSaveJson']")?.addEventListener("click", exportSaveJson);
  scope.querySelector("[data-action='importSaveJson']")?.addEventListener("click", importSaveJson);
  scope.querySelector("[data-action='softResetSave']")?.addEventListener("click", softResetCurrentBrowserSave);
  scope.querySelector("[data-action='fullResetSave']")?.addEventListener("click", fullResetCurrentBrowserSave);
  scope.querySelector("[data-action='refreshRole']")?.addEventListener("click", refreshRoleAndAuthStatus);
  scope.querySelector("[data-action='showUid']")?.addEventListener("click", showFirebaseUid);
  scope.querySelector("[data-action='viewAccount']")?.addEventListener("click", viewCurrentAccountRecord);
  scope.querySelectorAll("[data-admin-grant]").forEach((button) => button.addEventListener("click", () => adminGrant(button.dataset.adminGrant)));
}


function normalizeCurrentSave() {
  const beforeScreen = activeScreenName();
  game = migrateGameState(getCurrentSavePayload());
  game.ui = { ...(game.ui || {}), activeScreen: beforeScreen === "launch" ? "launch" : beforeScreen };
  selectedSectorNumber = game.player.currentSector;
  saveGame();
  addLog("Teacher tool: current browser save repaired and normalized.");
  render();
}

function exportSaveJson() {
  const text = JSON.stringify(getCurrentSavePayload(), null, 2);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => addAndRender("Save JSON copied to clipboard."), () => addAndRender("Save JSON ready, but clipboard copy was blocked."));
    return;
  }
  if (typeof window !== "undefined") window.prompt("Copy Sector Drift save JSON:", text);
}

function importSaveJson() {
  if (typeof window === "undefined") return;
  const text = window.prompt("Paste Sector Drift save JSON. This replaces the browser save after validation:");
  if (!text) return addAndRender("Import canceled. Local save was not changed.");
  try {
    const parsed = JSON.parse(text);
    const applied = applyLoadedSavePayload(parsed);
    addAndRender(applied.ok ? "Imported save JSON into this browser." : applied.error);
  } catch (error) {
    addAndRender("Import failed: JSON could not be parsed. Local save was not changed.");
  }
}

function softResetCurrentBrowserSave() {
  if (typeof window !== "undefined" && !confirm("Soft reset this browser save? This starts a new pilot locally but keeps the app available.")) return;
  game = defaultGameState();
  game.ui.activeScreen = isTeacher() ? "adminPanel" : "cockpit";
  selectedSectorNumber = game.player.currentSector;
  addLog("Teacher tool: soft reset created a fresh local pilot save.");
  saveGame();
  render();
}

function fullResetCurrentBrowserSave() {
  if (typeof window !== "undefined" && !confirm("Full reset this browser save? localStorage will be cleared and a fresh save created.")) return;
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY); } catch (error) { lastLocalSaveError = error?.message || "localStorage reset was blocked."; }
  sectorMap = createSectorMap();
  game = defaultGameState();
  game.ui.activeScreen = isTeacher() ? "adminPanel" : "cockpit";
  selectedSectorNumber = game.player.currentSector;
  addLog("Teacher tool: full reset cleared localStorage and rebuilt a fresh save.");
  saveGame();
  render();
}

async function refreshRoleAndAuthStatus() {
  const client = firebaseClient();
  if (client?.ensureUserProfile && cloudUiState.user) {
    const result = await client.ensureUserProfile();
    cloudUiState.role = result.data?.role || cloudUiState.role || "unknown";
    cloudUiState.roleReason = result.ok ? "Role refreshed from users/{uid}." : (result.error || "Role refresh failed.");
  }
  refreshFirebaseUiState();
  updateLaunchGateFromAuth();
  render();
}

function showFirebaseUid() {
  addAndRender(cloudUiState.user?.uid ? `Firebase UID: ${cloudUiState.user.uid}` : "No signed-in Firebase UID is available.");
}

function viewCurrentAccountRecord() {
  const user = cloudUiState.user;
  const detail = user ? `users/${user.uid} · ${user.email || "no email"} · role ${cloudUiState.role || "unknown"}` : "No signed-in account record is available.";
  addAndRender(detail);
}

function adminGrant(type) {
  if (!isTeacher()) return addAndRender("Admin gameplay tools are available only to teacher accounts.");
  if (type === "credits") game.player.credits += 500;
  if (type === "fuel") game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + 10);
  if (type === "turns") game.player.turns = Math.min(game.player.maxTurns, game.player.turns + 25);
  if (type === "hull") game.player.hull = game.player.maxHull;
  if (type === "fighters") game.player.fighters = game.player.fighterCapacity;
  if (type === "resources") RESOURCES.forEach((resource) => { game.player.cargo[resource] = Math.min(game.player.cargoCapacity, (game.player.cargo[resource] || 0) + 3); });
  addLog(`Teacher tool: applied ${type} to current browser save.`);
  saveGame();
  render();
}

function placeholderButton(label) {
  return `<button type="button" disabled>${label} · Coming soon</button>`;
}

function renderAdminPanelScreen() {
  if (!isTeacher()) return `<section class="mini-card"><h3>Teacher access required</h3><p class="help-text">Admin Panel is available only to signed-in accounts whose users/{uid}.role is teacher.</p></section>`;
  const user = cloudUiState.user || {};
  const diagnostics = [
    stat("Firebase status", cloudStatusLabel(false)), stat("Current screen", activeScreenName()), stat("Launch mode", launchModeLabel()), stat("Signed-in user", user.email || user.displayName || "unknown"), stat("Role", cloudUiState.role || "unknown"), stat("Current sector", game.player.currentSector), stat("Credits", game.player.credits), stat("Fuel", `${game.player.fuel}/${game.player.maxFuel}`), stat("Turns", `${game.player.turns}/${game.player.maxTurns}`), stat("Hull", `${game.player.hull}/${game.player.maxHull}`), stat("Fighters", `${game.player.fighters}/${game.player.fighterCapacity}`), stat("Visited sectors", (game.visitedSectors || []).length), stat("Owned planets", Object.values(game.planets || {}).filter((planet) => planet.owner === game.player.pilotName).length), stat("Active missions", (game.activeMissions || []).length), stat("Pirates remaining", Object.values(game.pirates || {}).filter((pirate) => !pirate.defeated).length), stat("Cloud backup status", cloudUiState.lastCloudResult)
  ].join("");
  return `<div class="admin-panel-grid"><section class="mini-card admin-card"><h3>Teacher Identity</h3>${stat("Account", user.email || user.displayName || "unknown")}${stat("Role", cloudUiState.role)}${stat("UID", user.uid || "unknown")}<p class="reward-text">Teacher access confirmed.</p></section><section class="mini-card admin-card"><h3>Cloud Save / Recovery Tools</h3><div class="button-row"><button type="button" data-action="cloudBackupSave">Save Current Browser State to Cloud</button><button type="button" data-action="cloudBackupLoad">Load Cloud Save to Browser</button><button type="button" data-action="normalizeSave">Repair / Normalize Current Save</button><button type="button" data-action="exportSaveJson">Export Save JSON</button><button type="button" data-action="importSaveJson">Import Save JSON</button><button type="button" data-action="softResetSave">Soft Reset Current Browser Save</button><button type="button" class="danger-button" data-action="fullResetSave">Full Reset Current Browser Save</button></div></section><section class="mini-card admin-card"><h3>Classroom / Account Tools</h3><div class="button-row"><button type="button" data-action="viewAccount">View Current Account Record</button><button type="button" data-action="refreshRole">Refresh Role / Auth Status</button><button type="button" data-action="showUid">Show Firebase UID</button>${placeholderButton("Open Student / Teacher Help")}${placeholderButton("List Future Classroom Features")}</div></section><section class="mini-card admin-card"><h3>Admin Gameplay Tools</h3><div class="button-row"><button type="button" data-admin-grant="credits">Give Credits</button><button type="button" data-admin-grant="fuel">Give Fuel</button><button type="button" data-admin-grant="turns">Give Turns</button><button type="button" data-admin-grant="hull">Repair Hull</button><button type="button" data-admin-grant="fighters">Fill Fighters</button><button type="button" data-admin-grant="resources">Add Test Resources</button>${["Reveal Current Sector", "Reveal All Sectors", "Clear Current Pirate", "Clear Warp Destination", "Return to Sector 1", "Add Smuggled Inventory", "Remove Smuggled Inventory"].map(placeholderButton).join("")}</div></section><section class="mini-card admin-card"><h3>Classroom Controls Placeholder</h3><p class="help-text">Future multiplayer/classroom tools - not active yet</p><div class="button-row">${["Student Roster", "Reset Student Save", "Restore Student Save", "Freeze PvP", "Enable / Disable Combat", "Enable / Disable Smuggled Inventory Events", "Enable / Disable Local Prototype Mode", "Start New Season", "End Current Season"].map(placeholderButton).join("")}</div></section><section class="mini-card admin-card diagnostics-card"><h3>Diagnostics</h3><div class="stats-grid">${diagnostics}</div><div class="button-row">${placeholderButton("Copy Diagnostics")}</div></section></div>`;
}

// LEGACY RENDERERS:
// renderLocationPanel(), renderPort(), renderShipyardPanel(), renderAsteroid(), and renderAnomaly()
// are older location-panel paths from the pre-docked-screen UI. The active cockpit flow now uses
// renderSituationCard() for asteroid/anomaly actions, renderStarbaseScreen() for ports, and
// renderShipyardScreen() for shipyards. These are retained temporarily as unsafe-to-remove
// fallback/reference renderers because their helpers still share active button wiring and services.
function renderLocationPanel() {
  const sector = sectorMap[game.player.currentSector];
  let html = `<h2 id="locationHeading">Location Actions</h2>`;
  if (sector.type === "port") html += renderPort(sector);
  if (sector.type === "planet") html += renderPlanet(sector);
  if (sector.type === "asteroid") html += renderAsteroid();
  if (sector.type === "anomaly") html += renderAnomaly();
  if (sector.type === "empty") html += `<p class="empty-note">This sector is quiet. Use the map, complete a mission, or review upgrades.</p>`;
  html += renderPirateEncounterPanel();
  panels.location.innerHTML = html;
  wireLocationButtons();
}

// LEGACY RENDERER: older port panel; active ports use renderStarbaseScreen().
function renderPort(sector) {
  return `<p><span class="badge">${sector.portType}</span>${sector.hasShipyard ? ` <span class="badge soft-badge">Shipyard</span>` : ""}</p><p class="help-text">${sector.marketNote}</p><p class="help-text"><strong>Trade tip:</strong> ${sector.tradeTip}</p><div class="trade-grid">${RESOURCES.map((resource) => {
    const price = sector.portPrices[resource];
    const buyDisabled = cargoSpaceLeft() <= 0 ? "disabled" : "";
    return `<div class="mini-card"><h3>${resource} · ${price.role === "S" ? "Sells low" : "Buys high"}</h3><p>Buy ${price.buy} credits · Sell ${price.sell} credits</p>${renderTradeCostIntel(resource, price)}<div class="resource-actions">
      <button data-action="buy" data-resource="${resource}" data-amount="1" ${buyDisabled}>Buy 1</button><button data-action="buy" data-resource="${resource}" data-amount="5" ${buyDisabled}>Buy 5</button>
      <button data-action="sell" data-resource="${resource}" data-amount="1">Sell 1</button><button data-action="sell" data-resource="${resource}" data-amount="5">Sell 5</button>
    </div></div>`;
  }).join("")}</div>${renderRefuelPanel()}${renderRepairPanel(sector)}${sector.hasShipyard ? renderShipyardPanel() : ""}`;
}

function renderRefuelPanel() {
  const missing = Math.max(0, game.player.maxFuel - game.player.fuel);
  const fuelButton = (label, amount) => {
    const units = amount === "full" ? missing : Math.min(Number(amount), missing);
    const cost = units * FUEL_COST_PER_UNIT;
    const disabled = units <= 0 || game.player.credits < cost ? "disabled" : "";
    return `<button data-action="refuel" data-amount="${amount}" ${disabled}>${label}${units > 0 ? ` (${cost} credits)` : ""}</button>`;
  };
  return `<h3>Refuel Service</h3><div class="mini-card">${stat("Fuel", `${game.player.fuel}/${game.player.maxFuel}`)}${stat("Fuel Price", `${FUEL_COST_PER_UNIT} credits each`)}<div class="button-row">${fuelButton("Buy 5 fuel", 5)}${fuelButton("Buy 10 fuel", 10)}${fuelButton("Fill tank", "full")}</div>${missing <= 0 ? `<p class="help-text">Fuel tank is already full.</p>` : ""}</div>`;
}

function renderRepairPanel(sector) {
  const baseCost = repairCost(sector);
  const discount = Math.min(baseCost, stationActivitiesState().repairDiscount || 0);
  const engineerDiscount = captainSpecialtyKey() === "Engineer" ? Math.floor(baseCost * 0.05) : 0;
  const cost = Math.max(0, baseCost - discount - engineerDiscount);
  return `<h3>Repair Service</h3><div class="mini-card">${stat("Hull", `${game.player.hull}/${game.player.maxHull}`)}${stat("Full Repair", `${cost} credits`)}${discount ? stat("Assist Discount", `${discount} credits`) : ""}<button data-action="repair" ${baseCost <= 0 || game.player.credits < cost ? "disabled" : ""}>Repair Hull</button></div>`;
}

// LEGACY RENDERER: older embedded shipyard; active shipyards use renderShipyardScreen().
function renderShipyardPanel() {
  return `<details class="compact-section shipyard-section" open><summary>Shipyard Services</summary>${renderFighterPurchasePanel()}<h3>Shipyard Ships</h3><div class="trade-grid">${Object.values(SHIPS).map((ship) => {
    const owned = game.player.ownedShips.includes(ship.id);
    const active = currentShip().id === ship.id;
    const lock = shipUnlockStatus(ship);
    const capped = capUpgradesForShip(game.player.upgrades, ship);
    const cargoBlocked = cargoUsed() > calculateCargoCapacity(ship, capped);
    const blocked = !owned && (!lock.unlocked || game.player.credits < ship.price || cargoBlocked);
    const requirement = lock.unlocked ? (owned ? "Owned" : "Available") : lock.reason;
    return `<div class="mini-card ${lock.unlocked ? "" : "locked-ship"}"><h3>${ship.name}</h3><p>${ship.description}</p>${stat("Price", owned ? "Owned" : ship.futureLocked ? "Future locked" : ship.price)}${stat("Unlock", requirement)}${stat("Cargo", calculateCargoCapacity(ship, capped))}${stat("Fuel", calculateFuelCapacity(ship, capped))}${stat("Hull", ship.maxHull + Math.max(0, Math.min(game.player.upgrades.shield, ship.upgradeCaps.shield) - 1) * 4)}${stat("Base Power", ship.basePower)}${stat("Fighter Bay", ship.fighterCapacity)}<button data-action="buyShip" data-ship="${ship.id}" ${active || blocked ? "disabled" : ""}>${active ? "Current Ship" : owned ? "Switch Ship" : lock.unlocked ? "Buy Ship" : "Locked"}</button>${cargoBlocked ? `<p class="cooldown">Current cargo will not fit.</p>` : ""}</div>`;
  }).join("")}</div></details>`;
}

function renderFighterPurchasePanel() {
  const capacity = game.player.fighterCapacity;
  const space = Math.max(0, capacity - game.player.fighters);
  const maxAffordable = Math.min(space, Math.floor(game.player.credits / FIGHTER_COST));
  const canSell = game.player.fighters > 0;
  const buyReason = space <= 0 ? "Fighter bay full" : game.player.credits < FIGHTER_COST ? "Not enough credits" : "Ready";
  const sellReason = canSell ? "Ready" : "No fighters to sell";
  return `<div class="fighter-yard mini-card"><h3>Fighter Bay</h3>${stat("Fighters", `${game.player.fighters}/${capacity}`)}${stat("Cost", `${FIGHTER_COST} credits each`)}${stat("Resale", `${FIGHTER_SELL_VALUE} credits each`)}${stat("Buy Status", buyReason)}${stat("Sell Status", sellReason)}<div class="button-row"><button data-action="buyFighters" data-amount="1" ${maxAffordable < 1 ? "disabled" : ""}>Buy 1 Fighter</button><button data-action="buyFighters" data-amount="10" ${maxAffordable < 1 ? "disabled" : ""}>Buy 10 Fighters</button><button data-action="buyFighters" data-amount="50" ${maxAffordable < 1 ? "disabled" : ""}>Buy 50 Fighters</button><button data-action="buyFighters" data-amount="max" ${maxAffordable < 1 ? "disabled" : ""}>Fill Fighter Bay</button><button data-action="sellFighters" data-amount="1" ${!canSell ? "disabled" : ""}>Sell 1 Fighter</button><button data-action="sellFighters" data-amount="10" ${!canSell ? "disabled" : ""}>Sell 10 Fighters</button><button data-action="sellFighters" data-amount="50" ${!canSell ? "disabled" : ""}>Sell 50 Fighters</button><button data-action="sellFighters" data-amount="all" ${!canSell ? "disabled" : ""}>Sell All Fighters</button></div><p class="help-text">Fighters do not use Ore/Food/Tech cargo space.</p></div>`;
}


function boardingChanceCategory(pirate) {
  if (!pirate) return "Unavailable";
  if (!canBoardPirate(pirate)) return "Unavailable";
  const chance = Math.max(0.18, Math.min(0.9, 0.45 + game.player.fighters * 0.01 + (game.player.upgrades.scanner || 1) * 0.04 + currentShip().basePower * 0.01 + (currentShip().boardingBonus || 0) * 0.04 - pirate.fighters * 0.04 - pirate.threatLevel * 0.07));
  if (chance >= 0.78) return "Strong";
  if (chance >= 0.62) return "Good";
  if (chance >= 0.46) return "Fair";
  if (chance >= 0.3) return "Risky";
  return "Poor";
}

function renderPirateEncounterPanel() {
  const pirate = currentPirateEncounter();
  if (!pirate) return "";
  const risk = estimateCombatRisk(pirate);
  const boardingReady = canBoardPirate(pirate);
  const outmatched = risk.score < 0.72;
  return `<section class="pirate-panel"><h3>Pirate Encounter</h3><p><span class="threat-badge threat-${pirate.threatLevel}">${pirate.name}</span></p><div class="intel-grid">${stat("Threat Level", pirate.threatLevel)}${stat("Pirate Fighters", pirate.fighters)}${stat("Pirate Hull", `${pirate.hull}/${pirate.maxHull}`)}${stat("Pirate Base Power", pirate.basePower)}${stat("Bounty", `${pirate.bounty} credits`)}${stat("Reputation Reward", `+${pirate.reputationReward}`)}${stat("Scanner Estimate", risk.label)}${stat("Boarding Chance", boardingChanceCategory(pirate))}${pirate.isStronghold ? stat("Stronghold", "Yes") : ""}${stat("Your Power", risk.playerPower)}</div>${outmatched ? `<p class="turn-warning">Warning: your ship is badly outmatched. Disengaging is available, but the pirate remains active and travel stays blocked until combat is resolved.</p>` : ""}${game.player.fighters <= 0 && currentShip().basePower < pirate.basePower ? `<p class="turn-warning">Your ship is lightly armed. Buy fighters at a shipyard before challenging strong pirates.</p>` : ""}<div class="button-row"><button class="combat-button" data-action="pirateCombat" data-mode="engage">Engage Pirates</button><button data-action="pirateCombat" data-mode="cautious">Cautious Attack</button><button data-action="pirateCombat" data-mode="retreat">Disengage Temporarily</button>${boardingReady ? `<button class="boarding-button" data-action="boardPirate">Board Pirate Ship</button>` : ""}</div><p class="help-text">NPC pirate combat only. Disengaging backs off this round; the pirate remains active in the sector and travel is still blocked until combat is resolved. Real player targeting and player ship capture are not active.</p></section>`;
}

function currentPirateEncounter() {
  const pirate = game.pirates?.[game.player.currentSector];
  if (!pirate || pirate.defeated) return null;
  return pirate;
}

function buyFighters(amountValue) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector?.hasShipyard) return addAndRender("Fighters can only be purchased at shipyards.");
  const space = Math.max(0, game.player.fighterCapacity - game.player.fighters);
  if (space <= 0) return addAndRender("Fighter bay is already full.");
  let amount = amountValue === "max" ? Math.floor(game.player.credits / FIGHTER_COST) : Number(amountValue);
  amount = Math.max(0, Math.min(space, Math.floor(amount)));
  const cost = amount * FIGHTER_COST;
  if (amount <= 0 || game.player.credits < cost) return addAndRender("Not enough credits to buy fighters.");
  game.player.credits -= cost;
  game.player.fighters += amount;
  game.player.fightersBought = (game.player.fightersBought || 0) + amount;
  syncCombatStats(game);
  addLog(`Bought ${amount} fighter${amount === 1 ? "" : "s"} for ${cost} credits.`);
  saveGame();
  render();
}

function sellFighters(amountValue) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector?.hasShipyard) return addAndRender("Fighters can only be sold at shipyards.");
  const requested = amountValue === "all" ? game.player.fighters : Math.max(0, Math.floor(Number(amountValue) || 0));
  const amount = Math.min(game.player.fighters, requested);
  if (amount <= 0) return addAndRender("No fighters available to sell.");
  const proceeds = amount * FIGHTER_SELL_VALUE;
  game.player.fighters -= amount;
  game.player.credits += proceeds;
  game.player.fightersSold = (game.player.fightersSold || 0) + amount;
  syncCombatStats(game);
  addLog(`Sold ${amount} fighter${amount === 1 ? "" : "s"} for ${proceeds} credits.`);
  saveGame();
  render();
}

function renderPlanetCargoDepositRow(resource, planet) {
  const amount = Math.max(0, Math.floor(Number(game.player.cargo?.[resource]) || 0));
  const disabled = planet.owner !== game.player.pilotName || amount <= 0 ? "disabled" : "";
  const status = planet.owner !== game.player.pilotName ? "Cannot deposit cargo here." : amount <= 0 ? "None aboard" : `${amount} aboard`;
  return `<div class="mini-card planet-cargo-row"><h4>${resource}</h4>${stat("Ship", amount)}${stat("Planet", planet.stored[resource] || 0)}<p class="help-text">${status}</p><div class="button-row"><button data-action="deposit" data-resource="${resource}" data-amount="1" ${disabled}>Deposit 1</button><button data-action="deposit" data-resource="${resource}" data-amount="10" ${disabled}>Deposit 10</button><button data-action="deposit" data-resource="${resource}" data-amount="max" ${disabled}>Deposit All</button></div></div>`;
}

function renderProtectedHomeworld(sector) {
  const homeworld = normalizePlanetState(sector.homeworld || createLamontPrimeState(), LAMONT_PRIME_SECTOR, "core", 0);
  return `<section class="planet-panel protected-homeworld-panel"><h3>${homeworld.name}</h3><p><span class="planet-type-badge">Protected Homeworld</span> <span class="defense-badge">Defense Rating: ${getPlanetDefenseRating(homeworld)}</span></p><p class="help-text">${lamontPrimeSafetyText()}</p><div class="planet-grid">${stat("Owner", "Alliance Protected")}${stat("Claim Status", "Locked for normal players")}${stat("Attack Status", "Disabled in Sector 1")}${stat("Landing", "Restricted classroom clearance")}</div><p class="help-text"><strong>Why it cannot be claimed:</strong> ${homeworld.name} is a civilian/tutorial safe zone. Alliance charter protection prevents player claims, attacks, and hostile actions here.</p><button data-action="claim" disabled>Claim Planet</button></section>`;
}

function renderPlanet(sector) {
  const planet = normalizePlanetState(getPlanetState(sector), sector.number, sector.routeRole, sector.dangerLevel);
  const profile = getPlanetTypeProfile(planet.type);
  const preview = getPlanetProduction(planet);
  const capStats = PLANET_UPGRADE_TRACKS.map((track) => stat(planetUpgradeLabel(track), `${planet.upgrades[track]}/${planet.upgradeCaps[track]}`)).join("");
  const techList = (planet.tech.available || profile.tech).map((tech) => `<li>${tech}</li>`).join("");
  if (isProtectedHomeworld(planet)) return renderProtectedHomeworld({ ...sector, homeworld: planet });
  if (!planet.owner) {
    const protectedClaim = isProtectedSpace(sector.number);
    const claimDisabled = protectedClaim ? "disabled" : "";
    const claimReason = protectedClaim ? "Protected Alliance territory. Planet claiming is restricted in this sector." : "Frontier world available for a classroom-safe colony claim.";
    return `<section class="planet-panel"><h3>${planet.name}</h3><p><span class="planet-type-badge">${planet.type}</span></p><p class="help-text">${planet.typeDescription}</p><div class="production-preview"><strong>Production Strengths:</strong> ${profile.profile.strengths}<br><strong>Current preview:</strong> ${formatProduction(preview)}</div><details class="compact-section"><summary>Scanner upgrade cap preview</summary><div class="planet-grid">${capStats}</div></details><details class="compact-section future-tech"><summary>Future Tech Potential</summary><p class="help-text">Descriptive scaffolding only; functional tech trees arrive in a later update.</p><ul>${techList}</ul></details><p class="help-text">${claimReason}</p><button data-action="claim" ${claimDisabled}>Claim Planet</button></section>`;
  }
  return `<section class="planet-panel"><h3>${planet.name}</h3><p><span class="planet-type-badge">${planet.type}</span> <span class="defense-badge">Defense Rating: ${getPlanetDefenseRating(planet)}</span></p><p class="help-text">${planet.typeDescription}</p>
  <div class="planet-grid">${stat("Owner", planet.owner)}${stat("Stored Ore", planet.stored.Ore)}${stat("Stored Food", planet.stored.Food)}${stat("Stored Tech", planet.stored.Tech)}${stat("Stored Fighters", planet.stored.Fighters)}</div>
  <div class="production-preview"><strong>Current Collection:</strong> ${formatProduction(preview)}</div>
  <h3>Planet Upgrade Tracks</h3><div class="planet-grid">${capStats}</div>
  <div class="planet-upgrade-grid">${PLANET_UPGRADE_TRACKS.map((track) => renderPlanetUpgradeCard(planet, track)).join("")}</div>
  <h3>Planet Logistics</h3><p class="help-text">Transfer cargo from ship storage into this managed planet without changing trade prices or cost basis.</p><div class="planet-grid">${RESOURCES.map((resource) => renderPlanetCargoDepositRow(resource, planet)).join("")}</div><div class="button-row"><button data-action="collectProduction">Collect Planet Production</button></div>
  ${renderPlanetFighterTransfer(planet)}
  <details class="compact-section future-tech"><summary>Future Tech Potential</summary><p class="help-text">Descriptive scaffolding only; functional tech trees arrive in a later update.</p><ul>${techList}</ul></details>
  <p class="cooldown">${productionStatusText()}</p></section>`;
}

function renderPlanetUpgradeCard(planet, track) {
  const label = planetUpgradeLabel(track);
  const level = planet.upgrades[track];
  const cap = planet.upgradeCaps[track];
  const capped = level >= cap;
  const cost = capped ? {} : getPlanetUpgradeCost(planet, track);
  const missing = capped ? {} : getPlanetUpgradeMissing(planet, track);
  const canAfford = !capped && Object.keys(missing).length === 0;
  return `<div class="planet-upgrade-card ${capped ? "maxed" : ""}"><h4>Upgrade ${label}</h4><p class="progress-text">Level ${level}/${cap} ${capped ? `<span class="max-badge">MAX</span>` : ""}</p><p>${planetUpgradeBenefit(planet, track)}</p>${capped ? `<p class="reward-text">This track is at its ${planet.type} cap.</p>` : `<p class="cost-line">Cost: ${formatResourceAmounts(cost)}</p>${canAfford ? `<p class="reward-text">Resources ready on planet.</p>` : `<p class="missing-line">Missing: ${formatResourceAmounts(missing)}</p>`}<button data-action="upgradePlanet" data-track="${track}" ${canAfford ? "" : "disabled"}>Upgrade ${label}</button>`}</div>`;
}

function renderPlanetFighterTransfer(planet) {
  if (typeof game.player.fighterCapacity !== "number") return "";
  const shipSpace = Math.max(0, game.player.fighterCapacity - game.player.fighters);
  const canLoad = planet.owner === game.player.pilotName && planet.stored.Fighters > 0 && shipSpace > 0;
  const canUnload = planet.owner === game.player.pilotName && game.player.fighters > 0;
  return `<div class="fighter-transfer mini-card"><h3>Fighter Transfer</h3>${stat("Ship Fighters", `${game.player.fighters}/${game.player.fighterCapacity}`)}${stat("Planet Fighters", planet.stored.Fighters)}<p class="help-text">Planet Fighters do not use cargo space. Transfers respect ship fighter capacity.</p><div class="button-row"><button data-action="loadPlanetFighters" data-amount="1" ${canLoad ? "" : "disabled"}>Load 1 Fighter to Ship</button><button data-action="loadPlanetFighters" data-amount="10" ${canLoad ? "" : "disabled"}>Load 10 Fighters to Ship</button><button data-action="loadPlanetFighters" data-amount="max" ${canLoad ? "" : "disabled"}>Load Max Fighters to Ship</button><button data-action="unloadPlanetFighters" data-amount="1" ${canUnload ? "" : "disabled"}>Deposit 1 Fighter</button><button data-action="unloadPlanetFighters" data-amount="10" ${canUnload ? "" : "disabled"}>Deposit 10 Fighters</button><button data-action="unloadPlanetFighters" data-amount="max" ${canUnload ? "" : "disabled"}>Deposit All Fighters</button></div></div>`;
}

// LEGACY RENDERER: older asteroid markup; active mining is reached from renderSituationCard().
function renderAsteroid() {
  const disabled = game.player.fuel <= 0 || game.player.turns <= 0 || cargoSpaceLeft() <= 0;
  const sector = sectorMap[game.player.currentSector];
  return `<h3>Asteroid Field</h3><p>Spend 1 turn and 1 fuel to mine Ore. Scanner upgrades improve results.${sector.dangerLevel > 0 ? " Dangerous sectors may damage hull after mining." : ""}</p><button data-action="mine" ${disabled ? "disabled" : ""}>Mine Asteroids</button>${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.</p>` : game.player.fuel <= 0 ? `<p class="cooldown">Fuel is empty.</p>` : cargoSpaceLeft() <= 0 ? `<p class="cooldown">Cargo is full.</p>` : ""}`;
}

// LEGACY RENDERER: older anomaly markup; active scans are reached from renderSituationCard().
function renderAnomaly() {
  return `<h3>Mysterious Anomaly</h3><p>Spend 1 turn to scan carefully. Better scanners improve your chance of helpful discoveries.</p><button data-action="scan" ${game.player.turns <= 0 ? "disabled" : ""}>Scan Anomaly</button>${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.</p>` : ""}`;
}

function pulseActionButton(button, className = "action-pulse") {
  if (!button || !button.classList) return;
  button.classList.remove(className);
  void button.offsetWidth;
  button.classList.add(className);
  if (typeof window !== "undefined") window.setTimeout(() => button.classList?.remove(className), 420);
}

function runGameAction(callback) {
  if (!canUseGameActions()) return addAndRender(authGateMessage());
  return callback();
}

function wireLocationButtons(scope = panels.location) {
  if (!scope) return;
  scope.querySelectorAll("[data-action='buy']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => buyResource(button.dataset.resource, Number(button.dataset.amount))); }));
  scope.querySelectorAll("[data-action='fillCargo']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => fillCargoWithResource(button.dataset.resource)); }));
  scope.querySelector("[data-action='fillBalanced']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(fillBalancedCargo); });
  wirePlotSelectedRouteButtons(scope);
  scope.querySelectorAll("[data-action='sell']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => sellResource(button.dataset.resource, Number(button.dataset.amount))); }));
  scope.querySelector("[data-action='claim']")?.addEventListener("click", () => runGameAction(claimPlanet));
  scope.querySelectorAll("[data-action='deposit']").forEach((button) => button.addEventListener("click", () => runGameAction(() => depositToPlanet(button.dataset.resource, button.dataset.amount || 1))));
  scope.querySelectorAll("[data-action='upgradePlanet']").forEach((button) => button.addEventListener("click", () => runGameAction(() => upgradePlanet(button.dataset.track || "production"))));
  scope.querySelector("[data-action='collectProduction']")?.addEventListener("click", () => runGameAction(collectPlanetProduction));
  scope.querySelectorAll("[data-action='loadPlanetFighters']").forEach((button) => button.addEventListener("click", () => runGameAction(() => transferPlanetFighters("load", button.dataset.amount))));
  scope.querySelectorAll("[data-action='unloadPlanetFighters']").forEach((button) => button.addEventListener("click", () => runGameAction(() => transferPlanetFighters("unload", button.dataset.amount))));
  scope.querySelector("[data-action='mine']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(mineAsteroids); });
  scope.querySelector("[data-action='scan']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(scanAnomaly); });
  scope.querySelector("[data-action='repair']")?.addEventListener("click", () => runGameAction(repairHull));
  scope.querySelectorAll("[data-action='refuel']").forEach((button) => button.addEventListener("click", () => runGameAction(() => buyFuel(button.dataset.amount))));
  scope.querySelectorAll("[data-action='buyShip']").forEach((button) => button.addEventListener("click", () => runGameAction(() => buyShip(button.dataset.ship))));
  scope.querySelectorAll("[data-action='upgradeShip']").forEach((button) => button.addEventListener("click", () => runGameAction(() => upgradeShip(button.dataset.upgrade))));
  scope.querySelectorAll("[data-action='buyFighters']").forEach((button) => button.addEventListener("click", () => runGameAction(() => buyFighters(button.dataset.amount))));
  scope.querySelectorAll("[data-action='sellFighters']").forEach((button) => button.addEventListener("click", () => runGameAction(() => sellFighters(button.dataset.amount))));
  scope.querySelectorAll("[data-action='pirateCombat']").forEach((button) => button.addEventListener("click", () => { pulseActionButton(button); runGameAction(() => resolvePirateCombat(button.dataset.mode)); }));
  scope.querySelector("[data-action='boardPirate']")?.addEventListener("click", (event) => { pulseActionButton(event.currentTarget); runGameAction(boardPirateShip); });
}

function wireMathMissionControls(scope = document) {
  scope.querySelector("#missionTier")?.addEventListener("change", (event) => {
    game.selectedMissionTier = normalizeMissionTier(event.target.value);
    saveGame();
  });
  scope.querySelector("#submitMission")?.addEventListener("click", () => runGameAction(submitMissionAnswer));
  scope.querySelector("#stuckMission")?.addEventListener("click", () => {
    const mission = game.currentMission;
    game.missionFeedback = mission.hint;
    game.missionFeedbackClass = "warn";
    saveGame();
    render();
  });
  scope.querySelector("#nextMission")?.addEventListener("click", () => {
    game.currentMission = generateMission(game.selectedMissionTier);
    game.missionAttempts = 0;
    game.missionLocked = false;
    game.missionFeedback = "Solve the mission for credits, fuel, turns, or cargo.";
    game.missionFeedbackClass = "";
    saveGame();
    render();
  });
}

function renderMathMission() {
  if (!panels.math) return;
  panels.math.innerHTML = renderMathMissionContent();
  wireMathMissionControls(panels.math);
}

function renderMissionPanel() {
  panels.mission.innerHTML = `<h2 id="missionHeading">Mission Board</h2><p class="help-text">Claim completed objectives to receive rewards and open a new contract.</p><div class="mission-grid">${game.activeMissions.map((mission) => {
    const template = missionTemplateById(mission.id);
    const progress = missionProgress(mission);
    const complete = progress >= template.target;
    return `<div class="mission-card ${complete ? "complete" : ""}"><h3>${template.title}</h3><p>${template.objective}</p><p class="progress-text">Progress: ${Math.min(progress, template.target)}/${template.target}</p><p class="reward-text">Reward: ${formatReward(template.reward)}</p><button data-claim-mission="${mission.id}" ${complete ? "" : "disabled"}>Claim Reward</button></div>`;
  }).join("") || `<p class="empty-note">All current single-player board missions are complete.</p>`}</div>`;
  panels.mission.querySelectorAll("[data-claim-mission]").forEach((button) => button.addEventListener("click", () => runGameAction(() => claimBoardMission(button.dataset.claimMission))));
}

function renderTutorialPanel() {
  const steps = tutorialSteps();
  const completed = game.tutorial.completedSteps.length;
  panels.tutorial.innerHTML = `<h2 id="tutorialHeading">Tutorial Questline</h2><p class="help-text">${game.tutorial.finished ? "Tutorial complete. You are cleared for open-sector operations." : `${completed}/${steps.length} steps complete.`}</p>
    <details class="compact-section" ${game.tutorial.finished ? "" : "open"}><summary>Training Steps</summary><div class="tutorial-list">${steps.map((step) => {
      const done = game.tutorial.completedSteps.includes(step.id);
      return `<div class="tutorial-step ${done ? "complete" : "locked"}"><strong>${done ? "✓" : "○"} ${step.title}</strong><p class="reward-text">Reward: ${formatReward(step.reward)}</p></div>`;
    }).join("")}</div></details>`;
}

function renderUpgradePanel() {
  if (!panels.upgrade) return;
  panels.upgrade.innerHTML = `<h2 id="upgradeHeading">Ship Upgrades</h2><p class="help-text">Dock at a Shipyard to purchase current-ship upgrades.</p><div class="upgrade-grid">${SHIP_UPGRADE_OPTIONS.map((upgrade) => renderShipUpgradeCard(upgrade)).join("")}</div>`;
  panels.upgrade.querySelectorAll("[data-upgrade]").forEach((button) => button.addEventListener("click", () => upgradeShip(button.dataset.upgrade)));
}

function renderAchievementsPanel() {
  const definitions = achievementDefinitions();
  panels.achievements.innerHTML = `<h2 id="achievementsHeading">Achievements</h2><details class="compact-section"><summary>Show achievement progress</summary><div class="achievement-grid">${definitions.map((achievement) => {
    const unlocked = game.achievements.includes(achievement.id);
    return `<div class="achievement-card ${unlocked ? "unlocked" : "locked"}"><strong>${unlocked ? "✓" : "○"} ${achievement.title}</strong><p>${achievement.description}</p></div>`;
  }).join("")}</div></details>`;
}

function renderStatsPanel() {
  const s = game.stats || {};
  const cargoMoved = RESOURCES.reduce((total, resource) => total + (game.player.cargo[resource] || 0), 0) + (s.resourcesSold || 0) + (s.resourcesDeposited || 0);
  const upgradesPurchased = Object.values(game.player.upgrades || {}).reduce((total, level) => total + Math.max(0, (level || 1) - 1), 0) + (s.planetUpgrades || 0);
  const missionsCompleted = (s.mathMissionsCompleted || 0) + (s.missionsClaimed || 0);
  return `<section class="mini-card stats-intro"><p class="eyebrow">Active Stats Screen</p><h3>Career Stats</h3><p class="help-text">Lightweight classroom-friendly totals pulled from the current save. This is now an active docked screen, not the old orphaned stats panel.</p></section><div class="screen-grid stats-screen-grid"><section class="mini-card"><h3>Progress</h3><div class="stats-grid">${stat("Sectors Explored", (s.visitedSectors || game.visitedSectors || []).length)}${stat("Reputation", game.player.reputation)}${stat("Rank", currentRank())}${stat("Combat Rank", combatRankTitle())}${stat("Missions Completed", missionsCompleted)}${stat("Math Missions", s.mathMissionsCompleted || 0)}${stat("Board Missions", s.missionsClaimed || 0)}</div></section><section class="mini-card"><h3>Trade and Cargo</h3><div class="stats-grid">${stat("Credits Earned", (s.creditsEarnedFromTrade || 0) + (game.player.bountiesEarned || 0))}${stat("Trades Completed", s.resourcesSold || 0)}${stat("Cargo Moved", cargoMoved)}${stat("Resources Sold", s.resourcesSold || 0)}${stat("Resources Deposited", s.resourcesDeposited || 0)}</div></section><section class="mini-card"><h3>Exploration and Combat</h3><div class="stats-grid">${stat("Mining Total", s.resourcesMined || 0)}${stat("Ore Mined", s.oreMined || 0)}${stat("Asteroid Fields Mined", s.asteroidFieldsMined || 0)}${stat("Anomaly Scans", s.anomaliesScanned || 0)}${stat("Anomalies Cataloged", s.anomaliesCataloged || 0)}${stat("Trade Routes Mapped", s.tradeRoutesMapped || s.tradeRoutesDiscovered || 0)}${stat("Protected Systems", s.protectedSystemsVisited || 0)}${stat("Pirate Sectors Survived", s.pirateSectorsSurvived || 0)}${stat("Dead Ends Logged", s.deadEndSectorsLogged || 0)}${stat("Pirates Defeated", game.player.piratesDefeated || 0)}${stat("Bounties Earned", game.player.bountiesEarned || 0)}</div></section><section class="mini-card"><h3>Growth</h3><div class="stats-grid">${stat("Planets Claimed", s.planetsClaimed || 0)}${stat("Ship Upgrades Purchased", upgradesPurchased)}${stat("Planet Upgrades", s.planetUpgrades || 0)}${stat("Fighters Bought", game.player.fightersBought || 0)}${stat("Ships Captured", game.player.shipsCaptured || 0)}</div></section></div>`;
}

function renderLogPanel() {
  panels.log.innerHTML = `<h2 id="logHeading">Recent Captain's Log</h2><ol class="log-list compact-log">${game.log.map((entry) => `<li>${entry}</li>`).join("")}</ol>`;
}

function travelToSector(number, options = {}) {
  const fuelCost = Math.max(1, Math.floor(Number(options.fuelCost) || 1));
  const current = sectorMap[game.player.currentSector];
  if (!current.adjacent.includes(number)) return addAndRender("That sector is not adjacent from here. Select an adjacent node or plot a known route.");
  if (currentPirateEncounter()) return addAndRender("Pirate encounter blocks travel. Defeat, board, or disengage temporarily before making another combat decision; travel stays blocked until the pirate is resolved.");
  if (game.player.fuel < fuelCost) return addAndRender(fuelCost > 1 ? "Hyperdrive unavailable: not enough fuel for the next jump." : "Fuel is empty. Complete math missions for fuel or trade when you reach a port.");
  if (!spendTurn("travel")) return;
  game.player.fuel -= fuelCost;
  game.player.currentSector = number;
  selectedSectorNumber = number;
  updatePresenceStatus("traveling");
  selectedMapClickSector = null;
  game.ui = game.ui || {};
  game.ui.mapHint = "";
  const wasFirstVisit = !(game.visitedSectors || []).includes(number);
  markSectorVisited(number);
  const logStart = game.log.length;
  const discoveryMessages = recordSectorDiscovery(number, wasFirstVisit);
  updateDeliveryQuestProgress();
  addLog(`Traveled to Sector ${number}.`);
  completeTutorialStep("travel");
  resolveSectorDanger(number);
  updateScannerReveals();
  maybeTravelEvent();
  const extras = [...discoveryMessages, ...game.log.slice(0, Math.max(0, game.log.length - logStart)).reverse().filter((entry) => !entry.startsWith("Traveled to Sector") && !discoveryMessages.includes(entry))];
  setArrivalReport(number, extras);
  updatePresenceStatus("online");
  scheduleCompetitiveProfileUpdate("travel", { force: wasFirstVisit });
  publishCompetitiveEvent("warpedSector", `${safeCompetitiveCaptainName()} traveled to Sector ${number}.`, { sectorNumber: number });
  if (wasFirstVisit) publishCompetitiveEvent("discoveredSector", `${safeCompetitiveCaptainName()} mapped a new route in Sector ${number}.`, { sectorNumber: number });
  saveGame();
  if (!options.silentRender) render();
}

function buyResource(resource, amount) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector?.portPrices?.[resource]) return addAndRender(`No ${resource} market is available here.`);
  const requested = Math.max(1, Math.floor(Number(amount) || 1));
  const unitPrice = sector.portPrices[resource].buy;
  const affordable = Math.floor(game.player.credits / unitPrice);
  const actual = Math.min(requested, affordable, cargoSpaceLeft());
  if (actual <= 0) return addAndRender(cargoSpaceLeft() <= 0 ? "Cargo hold is full. Sell or deposit cargo before buying." : `Not enough credits to buy ${resource}.`);
  const price = unitPrice * actual;
  game.player.credits -= price;
  game.player.cargo[resource] += actual;
  updateCargoCostOnBuy(resource, actual, unitPrice);
  recordDockingCredits(-price, "trade", 0);
  const message = actual === requested ? `Bought ${actual} ${resource} for ${price} credits.` : `Bought ${actual} of ${requested} requested ${resource} for ${price} credits; cargo space or credits stopped the rest.`;
  setSectorActionResult("Cargo Purchased", message, { type: "positive", gained: [`+${actual} ${resource}`], lost: [`-${price} credits`] });
  addLog(message);
  completeTutorialStep("buy");
  saveGame();
  render();
}

function fillCargoWithResource(resource) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector?.portPrices?.[resource]) return addAndRender(`No ${resource} market is available here.`);
  const unitPrice = sector.portPrices[resource].buy;
  const amount = Math.min(cargoSpaceLeft(), Math.floor(game.player.credits / unitPrice));
  if (amount <= 0) return addAndRender(cargoSpaceLeft() <= 0 ? "Cargo hold is already full." : `Not enough credits to buy ${resource}.`);
  const price = amount * unitPrice;
  game.player.credits -= price;
  game.player.cargo[resource] += amount;
  updateCargoCostOnBuy(resource, amount, unitPrice);
  recordDockingCredits(-price, "trade", 0);
  const message = `Filled cargo with ${amount} ${resource} for ${price} credits.`;
  setSectorActionResult("Cargo Filled", message, { type: "positive", gained: [`+${amount} ${resource}`], lost: [`-${price} credits`] });
  addLog(message);
  completeTutorialStep("buy");
  saveGame();
  render();
}

function fillBalancedCargo() {
  const sector = sectorMap[game.player.currentSector];
  if (!sector?.portPrices) return addAndRender("No market is available here.");
  const purchased = { Ore: 0, Food: 0, Tech: 0 };
  let spent = 0;
  while (cargoSpaceLeft() > 0) {
    const options = RESOURCES.filter((resource) => sector.portPrices[resource]?.buy <= game.player.credits)
      .sort((a, b) => (purchased[a] - purchased[b]) || (sector.portPrices[a].buy - sector.portPrices[b].buy));
    if (!options.length) break;
    const resource = options[0];
    const unitPrice = sector.portPrices[resource].buy;
    game.player.credits -= unitPrice;
    game.player.cargo[resource] += 1;
    purchased[resource] += 1;
    spent += unitPrice;
    updateCargoCostOnBuy(resource, 1, unitPrice);
  }
  if (spent <= 0) return addAndRender(cargoSpaceLeft() <= 0 ? "Cargo hold is already full." : "Not enough credits to buy a balanced load.");
  recordDockingCredits(-spent, "trade", 0);
  const gained = RESOURCES.filter((resource) => purchased[resource] > 0).map((resource) => `+${purchased[resource]} ${resource}`);
  const message = `Balanced load purchased: ${gained.join(", ")} for ${spent} credits.`;
  setSectorActionResult("Balanced Load Purchased", message, { type: "positive", gained, lost: [`-${spent} credits`] });
  addLog(message);
  completeTutorialStep("buy");
  saveGame();
  render();
}

function sellResource(resource, amount) {
  if (game.player.cargo[resource] < amount) return addAndRender(`Not enough ${resource} to sell ${amount}.`);
  const unitSellPrice = sectorMap[game.player.currentSector].portPrices[resource].sell;
  const basePrice = unitSellPrice * amount;
  const traderBonus = captainSpecialtyKey() === "Trader" ? Math.floor(basePrice * 0.02) : 0;
  const price = basePrice + traderBonus;
  const tradeProfit = updateCargoCostOnSell(resource, amount, unitSellPrice) + traderBonus;
  game.player.cargo[resource] -= amount;
  game.player.credits += price;
  recordDockingCredits(price, "trade", tradeProfit);
  game.stats.creditsEarnedFromTrade += price;
  game.stats.tradeProfit = (game.stats.tradeProfit || 0) + Math.max(0, tradeProfit);
  game.stats.resourcesSold += amount;
  scheduleCompetitiveProfileUpdate("trade profit", { force: true });
  if (resource === "Tech") game.stats.techSold += amount;
  setSectorActionResult("Cargo Sold", `Sold ${amount} ${resource} for ${price} credits${traderBonus ? ` including ${traderBonus} Trader bonus` : ""}.`, { type: "positive", gained: [`+${price} credits`], lost: [`-${amount} ${resource}`] });
  addLog(`Sold ${amount} ${resource} for ${price} credits${traderBonus ? ` with Trader specialty bonus` : ""}.`);
  completeTutorialStep("sell");
  saveGame();
  render();
}

function claimPlanet() {
  const sector = sectorMap[game.player.currentSector];
  if (sector?.homeworld) return addAndRender(`${LAMONT_PRIME_NAME} cannot be claimed or attacked. ${BEGINNER_SAFE_ZONE_COPY}`);
  if (!sector || sector.type !== "planet") return addAndRender("No claimable planet is available in this sector.");
  const planet = normalizePlanetState(getPlanetState(sector), sector.number, sector.routeRole, sector.dangerLevel);
  if (planet.owner) return addAndRender(planet.owner === game.player.pilotName ? `${planet.name} is already owned by you.` : `${planet.name} is already owned by ${planet.owner}.`);
  if (isProtectedSpace(sector.number)) return addAndRender("Protected Alliance territory. Planet claiming is restricted in this sector. Hostile actions are disabled here.");
  planet.owner = game.player.pilotName;
  game.planets[planet.id] = planet;
  game.stats.planetsClaimed += 1;
  setSectorActionResult("Planet Claimed", `Claimed ${planet.type} planet ${planet.name}.`, { type: "positive", gained: [planet.name] });
  addLog(`Claimed ${planet.type} planet ${planet.name}.`);
  completeTutorialStep("claim");
  saveGame();
  render();
}

function depositToPlanet(resource, amountValue = 1) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector || sector.type !== "planet") return addAndRender("No owned planet in this sector.");
  if (!RESOURCES.includes(resource)) return addAndRender("Planet storage unavailable.");
  const planet = normalizePlanetState(getPlanetState(sector), sector.number, sector.routeRole, sector.dangerLevel);
  if (!planet || !planet.stored || planet.owner !== game.player.pilotName) return addAndRender(planet?.owner ? "Cannot deposit cargo here." : "No owned planet in this sector.");
  const aboard = Math.max(0, Math.floor(Number(game.player.cargo?.[resource]) || 0));
  if (aboard <= 0) return addAndRender(`No ${resource} aboard.`);
  const requested = amountValue === "max" ? aboard : Math.max(1, Math.floor(Number(amountValue) || 1));
  const amount = Math.min(aboard, requested);
  if (amount <= 0) return addAndRender(`No ${resource} aboard.`);
  game.player.cargo[resource] -= amount;
  planet.stored[resource] = (planet.stored[resource] || 0) + amount;
  game.planets[planet.id] = planet;
  game.stats.resourcesDeposited += amount;
  const message = `Deposited ${amount} ${resource} to ${planet.name}.`;
  setSectorActionResult("Cargo Deposited", message, { type: "positive", gained: [`+${amount} ${resource} on ${planet.name}`], lost: [`-${amount} ${resource} from ship`], sector: sector.number });
  addLog(message);
  completeTutorialStep("deposit");
  saveGame();
  render();
}

function upgradePlanet(track = "production") {
  const sector = sectorMap[game.player.currentSector];
  const planet = normalizePlanetState(getPlanetState(sector), sector.number, sector.routeRole, sector.dangerLevel);
  if (!planet.owner || planet.owner !== game.player.pilotName) return addAndRender("Only your owned planets can be upgraded.");
  if (!PLANET_UPGRADE_TRACKS.includes(track)) return addAndRender("Unknown planet upgrade track.");
  const label = planetUpgradeLabel(track);
  if (planet.upgrades[track] >= planet.upgradeCaps[track]) return addAndRender(`${label} is already at the ${planet.type} cap.`);
  const missing = getPlanetUpgradeMissing(planet, track);
  if (Object.keys(missing).length > 0) return addAndRender(`${planet.name} needs ${formatResourceAmounts(missing)} more to upgrade ${label}.`);
  const cost = getPlanetUpgradeCost(planet, track);
  Object.entries(cost).forEach(([resource, amount]) => { planet.stored[resource] -= amount; });
  planet.upgrades[track] += 1;
  if (track === "production") planet.productionLevel = planet.upgrades.production;
  game.planets[planet.id] = normalizePlanetState(planet, sector.number, sector.routeRole, sector.dangerLevel);
  game.stats.planetUpgrades += 1;
  game.stats.planetUpgradesPurchased = (game.stats.planetUpgradesPurchased || 0) + 1;
  game.stats.highestPlanetProductionLevel = Math.max(game.stats.highestPlanetProductionLevel || 1, game.planets[planet.id].upgrades.production);
  game.stats.highestPlanetDefenseRating = Math.max(game.stats.highestPlanetDefenseRating || 0, getPlanetDefenseRating(game.planets[planet.id]));
  addLog(`Upgraded ${planet.name} ${label} to level ${planet.upgrades[track]}. New production preview: ${formatProduction(getPlanetProduction(game.planets[planet.id]))}.`);
  completeTutorialStep("upgradePlanet");
  saveGame();
  render();
}

function collectPlanetProduction() {
  const now = Date.now();
  if (now - game.lastProductionAt < PRODUCTION_COOLDOWN_MS) return addAndRender("Planet production is still cooling down.");
  const owned = Object.values(game.planets).map((planet) => normalizePlanetState(planet)).filter((planet) => planet.owner === game.player.pilotName);
  if (owned.length === 0) return addAndRender("Claim a planet before collecting production.");
  const totals = { Ore: 0, Food: 0, Tech: 0, Fighters: 0 };
  owned.forEach((planet) => {
    const production = getPlanetProduction(planet);
    PLANET_PRODUCTION_RESOURCES.forEach((resource) => {
      planet.stored[resource] += production[resource];
      totals[resource] += production[resource];
    });
    game.planets[planet.id] = planet;
    game.stats.highestPlanetDefenseRating = Math.max(game.stats.highestPlanetDefenseRating || 0, getPlanetDefenseRating(planet));
  });
  game.lastProductionAt = now;
  game.stats.planetProductionCollected = (game.stats.planetProductionCollected || 0) + owned.length;
  game.stats.planetOreProduced = (game.stats.planetOreProduced || 0) + totals.Ore;
  game.stats.planetFoodProduced = (game.stats.planetFoodProduced || 0) + totals.Food;
  game.stats.planetTechProduced = (game.stats.planetTechProduced || 0) + totals.Tech;
  game.stats.planetFightersProduced = (game.stats.planetFightersProduced || 0) + totals.Fighters;
  const message = owned.length === 1
    ? `Collected production from ${owned[0].name}: ${formatProduction(totals)}.`
    : `Collected planet production: ${formatProduction(totals)} from ${owned.length} planets.`;
  addLog(message);
  completeTutorialStep("collectProduction");
  saveGame();
  render();
}

function transferPlanetFighters(direction, amountValue) {
  const sector = sectorMap[game.player.currentSector];
  const planet = normalizePlanetState(getPlanetState(sector), sector.number, sector.routeRole, sector.dangerLevel);
  if (planet.owner !== game.player.pilotName) return addAndRender("Only owned planets can transfer Fighters.");
  const shipSpace = Math.max(0, game.player.fighterCapacity - game.player.fighters);
  const max = direction === "load" ? Math.min(planet.stored.Fighters, shipSpace) : game.player.fighters;
  const requested = amountValue === "max" ? max : Math.floor(Number(amountValue) || 0);
  const amount = Math.max(0, Math.min(max, requested));
  if (amount <= 0) return addAndRender(direction === "load" ? "No ship fighter capacity or planet Fighters available." : "No ship Fighters available to unload.");
  if (direction === "load") {
    planet.stored.Fighters -= amount;
    game.player.fighters += amount;
    addLog(`Loaded ${amount} Fighter${amount === 1 ? "" : "s"} from ${planet.name} to ship.`);
  } else {
    game.player.fighters -= amount;
    planet.stored.Fighters += amount;
    addLog(`Unloaded ${amount} Fighter${amount === 1 ? "" : "s"} from ship to ${planet.name}.`);
  }
  game.planets[planet.id] = planet;
  saveGame();
  render();
}

function scanPlanet() {
  const sector = sectorMap[game.player.currentSector];
  if (!sector || sector.type !== "planet") return addAndRender("No planet is available to scan in this sector.");
  const planet = getPlanetState(sector);
  const message = `Planet Scan Complete: ${planet.name} is a ${planet.type} world. ${planetSituationStatus(planet, sector)}`;
  setSectorActionResult("Planet Scan Complete", message, { type: "neutral", gained: [`${planet.type} intel`], sector: sector.number });
  addLog(message);
  saveGame();
  render();
}

function mineAsteroids() {
  if (cargoSpaceLeft() <= 0) return addAndRender("Cargo Hold Full: Mining laser cut ore loose, but there was no cargo space.");
  const beforeHull = game.player.hull;
  if (!spendTurn("mine")) return;
  game.player.fuel -= 1;
  const minerBonus = captainSpecialtyKey() === "Miner" ? 1 : 0;
  const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * (3 + game.player.upgrades.scanner)) + minerBonus);
  game.player.cargo.Ore += amount;
  game.stats.resourcesMined += amount;
  game.stats.oreMined += amount;
  game.stats.minedAsteroidSectors = Array.isArray(game.stats.minedAsteroidSectors) ? game.stats.minedAsteroidSectors : [];
  if (!game.stats.minedAsteroidSectors.includes(game.player.currentSector)) {
    game.stats.minedAsteroidSectors.push(game.player.currentSector);
    game.stats.asteroidFieldsMined = game.stats.minedAsteroidSectors.length;
  }
  addLog(`Mined ${amount} Ore from the asteroid field.`);
  completeTutorialStep("mine");
  resolveSectorDanger(game.player.currentSector);
  const hullLost = Math.max(0, beforeHull - game.player.hull);
  const specialtyNote = minerBonus ? " Miner specialty added +1 Ore." : "";
  const message = `Mining Complete: +${amount} Ore, -1 turn, -1 fuel${hullLost ? `, -${hullLost} hull` : ""}.${specialtyNote}`;
  setSectorActionResult("Mining Complete", message, { type: amount > 0 ? "positive" : "neutral", gained: amount > 0 ? [`+${amount} Ore`] : [], lost: [`-1 turn`, `-1 fuel`, ...(hullLost ? [`-${hullLost} hull`] : [])] });
  addLog(message);
  saveGame();
  render();
}

function scanAnomaly() {
  const before = { fuel: game.player.fuel, credits: game.player.credits, tech: game.player.cargo.Tech, hull: game.player.hull };
  if (!spendTurn("scan")) return;
  const scanner = game.player.upgrades.scanner;
  const explorerBonus = captainSpecialtyKey() === "Explorer" ? 0.02 : 0;
  const roll = Math.random() + scanner * 0.05 + explorerBonus;
  const discoveries = [];
  game.stats.anomaliesScanned += 1;
  completeTutorialStep("scan");
  if (roll < 0.16) {
    game.player.fuel = Math.max(0, game.player.fuel - 1);
    discoveries.push("Scanner interference drained fuel.");
    addLog("Anomaly scan drained 1 fuel, but the ship is fine.");
  } else if (roll < 0.38) {
    discoveries.push("No useful salvage; signal patterns became clearer.");
    addLog("Anomaly message: Patterns become clearer when you slow down.");
  } else if (roll < 0.62) {
    const fuel = 2 + Math.floor(Math.random() * 4);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    discoveries.push(`Energy plume released ${game.player.fuel - before.fuel} fuel.`);
    addLog(`Anomaly released ${fuel} fuel.`);
  } else if (roll < 0.84) {
    const credits = 40 + Math.floor(Math.random() * 81);
    game.player.credits += credits;
    discoveries.push(`Data sold for ${credits} credits.`);
    addLog(`Anomaly data sold for ${credits} credits.`);
  } else {
    const tech = Math.min(cargoSpaceLeft(), 1 + Math.floor(scanner / 2));
    if (tech > 0) game.player.cargo.Tech += tech;
    discoveries.push(tech > 0 ? `Recovered ${tech} Tech.` : "Tech signature found, but cargo was full.");
    addLog(tech > 0 ? `Anomaly yielded ${tech} Tech.` : "Anomaly found Tech, but cargo was full.");
  }
  resolveSectorDanger(game.player.currentSector);
  const gained = [];
  const lost = ["-1 turn"];
  const fuelDelta = game.player.fuel - before.fuel;
  const creditDelta = game.player.credits - before.credits;
  const techDelta = game.player.cargo.Tech - before.tech;
  const hullLost = Math.max(0, before.hull - game.player.hull);
  if (fuelDelta > 0) gained.push(`+${fuelDelta} fuel`);
  if (creditDelta > 0) gained.push(`+${creditDelta} credits`);
  if (techDelta > 0) gained.push(`+${techDelta} Tech`);
  if (fuelDelta < 0) lost.push(`${fuelDelta} fuel`);
  if (hullLost) lost.push(`-${hullLost} hull`);
  const message = `Anomaly Scan Complete: ${[...gained, ...lost].join(", ") || "No useful change"}. ${discoveries.join(" ")}`;
  setSectorActionResult("Anomaly Scan Complete", message, { type: gained.length ? "positive" : fuelDelta < 0 || hullLost ? "negative" : "neutral", gained, lost });
  addLog(message);
  saveGame();
  render();
}

function buyFuel(amount) {
  const missing = Math.max(0, game.player.maxFuel - game.player.fuel);
  if (missing <= 0) return addAndRender("Fuel tank is already full.");
  const requested = amount === "full" ? missing : Number(amount);
  const units = Math.max(0, Math.min(missing, Math.floor(requested)));
  const cost = units * FUEL_COST_PER_UNIT;
  if (units <= 0) return addAndRender("Choose a valid fuel amount.");
  if (game.player.credits < cost) return addAndRender("Not enough credits to refuel.");
  game.player.credits -= cost;
  recordDockingCredits(-cost, "service");
  game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + units);
  addLog(`Refueled ${units} fuel for ${cost} credits.`);
  saveGame();
  render();
}

function repairHull() {
  const sector = sectorMap[game.player.currentSector];
  const baseCost = repairCost(sector);
  const discount = Math.min(baseCost, stationActivitiesState().repairDiscount || 0);
  const engineerDiscount = captainSpecialtyKey() === "Engineer" ? Math.floor(baseCost * 0.05) : 0;
  const cost = Math.max(0, baseCost - discount - engineerDiscount);
  if (baseCost <= 0) return addAndRender("Hull is already fully repaired.");
  if (game.player.credits < cost) return addAndRender("Not enough credits for full repairs.");
  game.player.credits -= cost;
  recordDockingCredits(-cost, "service");
  stationActivitiesState().repairDiscount = Math.max(0, (stationActivitiesState().repairDiscount || 0) - discount);
  game.player.hull = game.player.maxHull;
  addLog(`Repair service restored hull for ${cost} credits${discount ? ` after a ${discount} credit repair bay discount` : ""}${engineerDiscount ? ` and a ${engineerDiscount} credit Engineer specialty discount` : ""}.`);
  saveGame();
  render();
}

function buyShip(shipId) {
  const ship = SHIPS[shipId];
  if (!ship) return;
  const active = currentShip().id === ship.id;
  const lock = shipUnlockStatus(ship);
  if (active) return addAndRender(`${ship.name} is already your active ship.`);
  if (!lock.unlocked) return addAndRender(`${ship.name} is locked: ${lock.reason}`);
  const oldShip = currentShip();
  const cappedUpgrades = capUpgradesForShip(game.player.upgrades, ship);
  const nextCapacity = calculateCargoCapacity(ship, cappedUpgrades);
  const nextFighterCapacity = calculateFighterCapacity(ship, cappedUpgrades);
  if (cargoUsed() > nextCapacity) return addAndRender(`${ship.name} cannot hold your current cargo. Sell, deposit, or dump cargo before changing ships.`);
  if (game.player.fighters > nextFighterCapacity) return addAndRender(`${ship.name} cannot hold your current fighters. Sell or offload fighters before changing ships.`);
  const tradeIn = shipTradeInValue(oldShip);
  const netCost = Math.max(0, ship.price - tradeIn);
  if (game.player.credits < netCost) return addAndRender(`Not enough credits to buy ${ship.name} after trade-in.`);
  game.player.credits -= netCost;
  game.player.ownedShips = [ship.id];
  game.player.shipId = ship.id;
  game.player.shipName = ship.name;
  game.player.upgrades = cappedUpgrades;
  game.player.legacyUpgradeOverride = false;
  game.player.maxFuel = calculateFuelCapacity(ship, game.player.upgrades);
  game.player.maxHull = ship.maxHull + Math.max(0, game.player.upgrades.shield - 1) * 4;
  game.player.cargoCapacity = nextCapacity;
  game.player.fighterCapacity = nextFighterCapacity;
  game.player.maxTurns = calculateMaxTurnBank(game.player.upgrades.engine);
  game.player.fuel = Math.min(game.player.fuel, game.player.maxFuel);
  game.player.hull = Math.min(game.player.hull, game.player.maxHull);
  game.player.turns = Math.min(game.player.turns, game.player.maxTurns);
  addLog(`Traded in ${oldShip.name} for ${tradeIn} credits and purchased ${ship.name}.`);
  scheduleCompetitiveProfileUpdate("ship upgraded", { force: true });
  publishCompetitiveEvent("upgradedShip", `${safeCompetitiveCaptainName()} upgraded to ${ship.name}.`, { sectorNumber: game.player.currentSector });
  updateScannerReveals();
  saveGame();
  render();
}

function submitMissionAnswer() {
  const input = document.getElementById("missionAnswer").value.trim();
  if (applyDevCode(input)) return;
  if (handleDevCode(input)) return;
  if (game.missionLocked) {
    game.missionFeedback = "Mission is locked. Use Next Mission to continue.";
    game.missionFeedbackClass = "locked";
    saveGame();
    renderMathMission();
    return;
  }
  const mission = game.currentMission;
  if (mission.check(input)) {
    awardMissionReward();
    game.stats.mathMissionsCompleted += 1;
    incrementTierMissionStat(mission.tier);
    scheduleCompetitiveProfileUpdate("mission complete", { force: true });
    publishCompetitiveEvent("completedMission", `${safeCompetitiveCaptainName()} completed a ${mission.tierName || "math"} mission.`, { sectorNumber: game.player.currentSector });
    completeTutorialStep("math");
    game.missionLocked = true;
    game.missionFeedbackClass = "correct";
  } else {
    game.missionAttempts += 1;
    if (game.missionAttempts === 1) {
      game.missionFeedback = mission.hint;
      game.missionFeedbackClass = "warn";
    } else {
      game.missionLocked = true;
      game.missionFeedback = mission.explanation;
      game.missionFeedbackClass = "locked";
      addLog("Mission locked after two attempts. Review the explanation and try the next one.");
    }
  }
  saveGame();
  render();
}

function handleDevCode(input) {
  const code = String(input).trim();
  if (code === "9999") {
    const message = "Dev credits granted: +30,000 credits.";
    game.player.credits += 30000;
    game.missionFeedback = message;
    game.missionFeedbackClass = "correct";
    setSectorActionResult("Dev Credits Granted", message, { type: "positive", gained: ["+30,000 credits"], eventType: "dev-code" });
    addLog(message);
    saveGame();
    render();
    return true;
  }
  if (code === "6767") {
    const message = "Dev cargo loaded: balanced Ore/Food/Tech added at no cost.";
    const remainingSpace = Math.max(0, cargoSpaceLeft());
    const added = RESOURCES.reduce((totals, resource) => { totals[resource] = 0; return totals; }, {});
    for (let index = 0; index < remainingSpace; index += 1) {
      const resource = RESOURCES[index % RESOURCES.length];
      added[resource] += 1;
    }
    RESOURCES.forEach((resource) => {
      if (added[resource] <= 0) return;
      game.player.cargo[resource] += added[resource];
      updateCargoCostOnBuy(resource, added[resource], 0);
    });
    game.missionFeedback = message;
    game.missionFeedbackClass = "correct";
    setSectorActionResult("Dev Cargo Loaded", message, { type: "positive", gained: RESOURCES.filter((resource) => added[resource] > 0).map((resource) => `+${added[resource]} ${resource}`), eventType: "dev-code" });
    addLog(message);
    saveGame();
    render();
    return true;
  }
  return false;
}

function missionTiers() {
  return [
    { tier: 1, tierName: "Basic", rewardMultiplier: 1, reward: { credits: [40, 70], fuel: [3, 5], turns: [8, 15], resources: [1, 2] }, skillTag: "Basic Practice" },
    { tier: 2, tierName: "Standard", rewardMultiplier: 2, reward: { credits: [80, 140], fuel: [6, 10], turns: [16, 30], resources: [2, 4] }, skillTag: "Algebra Foundations" },
    { tier: 3, tierName: "Advanced", rewardMultiplier: 4, reward: { credits: [160, 280], fuel: [10, 18], turns: [35, 60], resources: [4, 7] }, skillTag: "Algebra Reasoning" },
    { tier: 4, tierName: "Expert", rewardMultiplier: 7, reward: { credits: [300, 500], fuel: [18, 30], turns: [70, 110], resources: [7, 10] }, skillTag: "Algebra 2" },
    { tier: 5, tierName: "Elite", rewardMultiplier: 10, reward: { credits: [500, 800], fuel: [30, 45], turns: [120, 180], resources: [10, 15] }, skillTag: "Algebra 2 Mastery" },
  ];
}

function missionTierByNumber(tier) {
  return missionTiers().find((entry) => entry.tier === Number(tier)) || missionTiers()[1];
}

function normalizeMissionTier(tier) {
  return missionTierByNumber(tier).tier;
}

function withTier(mission) {
  const tier = missionTierByNumber(mission.tier);
  return {
    ...mission,
    tier: tier.tier,
    tierName: tier.tierName,
    rewardMultiplier: tier.rewardMultiplier,
    skillTag: mission.skillTag || tier.skillTag,
  };
}

function missionBank() {
  return [
    { id: "basic-multiply-1", tier: 1, prompt: "Calculate: 7 × 8", format: "Enter a number.", answers: ["56"], hint: "Use multiplication facts or add eight groups of seven.", explanation: "7 × 8 = 56.", skillTag: "Multiplication" },
    { id: "basic-add-1", tier: 1, prompt: "Calculate: 12 + 9", format: "Enter a number.", answers: ["21"], hint: "Add 10, then subtract 1.", explanation: "12 + 9 = 21.", skillTag: "Integer Arithmetic" },
    { id: "basic-one-step-1", tier: 1, prompt: "Solve for x: x + 5 = 13", format: "Enter a number.", answers: ["8"], hint: "Undo adding 5 by subtracting 5 from both sides.", explanation: "x + 5 = 13 → x = 8.", skillTag: "One-Step Equations" },
    { id: "basic-one-step-2", tier: 1, prompt: "Solve for x: 3x = 21", format: "Enter a number.", answers: ["7"], hint: "Undo multiplying by 3 by dividing both sides by 3.", explanation: "3x = 21 → x = 7.", skillTag: "One-Step Equations" },
    { id: "basic-evaluate-1", tier: 1, prompt: "Evaluate: 2(6) + 1", format: "Enter a number.", answers: ["13"], hint: "Multiply first, then add.", explanation: "2(6) + 1 = 12 + 1 = 13.", skillTag: "Expression Evaluation" },
    { id: "basic-integers-1", tier: 1, prompt: "Calculate: -4 + 11", format: "Enter a number.", answers: ["7"], hint: "Move 11 spaces right from -4.", explanation: "-4 + 11 = 7.", skillTag: "Integer Arithmetic" },
    { id: "basic-subtract-1", tier: 1, prompt: "Calculate: 30 - 17", format: "Enter a number.", answers: ["13"], hint: "Subtract 10, then subtract 7 more.", explanation: "30 - 17 = 13.", skillTag: "Integer Arithmetic" },
    { id: "basic-evaluate-2", tier: 1, prompt: "Evaluate when x = 4: x + 9", format: "Enter a number.", answers: ["13"], hint: "Replace x with the given value.", explanation: "When x = 4, x + 9 = 13.", skillTag: "Expression Evaluation" },

    { id: "linear-1", tier: 2, prompt: "Solve for x: 3x + 7 = 22", format: "Enter a number.", answers: ["5"], hint: "Subtract 7 first, then divide by 3.", explanation: "3x + 7 = 22 → 3x = 15 → x = 5.", skillTag: "Two-Step Equations" },
    { id: "function-1", tier: 2, prompt: "Evaluate f(4) if f(x) = 2x² - 3", format: "Enter a number.", answers: ["29"], hint: "Replace x with 4 before using the exponent.", explanation: "2(4²) - 3 = 32 - 3 = 29.", skillTag: "Function Evaluation" },
    { id: "slope-1", tier: 2, prompt: "Find the slope through (2, 5) and (6, 13).", format: "Enter slope as an integer or fraction.", answers: ["2", "2/1"], hint: "Use change in y divided by change in x.", explanation: "(13 - 5) / (6 - 2) = 8 / 4 = 2.", skillTag: "Slope" },
    { id: "exponent-1", tier: 2, prompt: "Simplify: x³ · x⁴", format: "Enter simplified power form using ^, such as x^n.", answers: ["x^7", "x7"], hint: "When multiplying powers with the same base, add exponents.", explanation: "x³ · x⁴ = x^(3+4) = x^7.", skillTag: "Exponent Rules" },
    { id: "standard-factor-1", tier: 2, prompt: "Factor: x² - 25", format: "Enter factored form using parentheses.", answers: ["(x-5)(x+5)", "(x+5)(x-5)"], hint: "This is a difference of squares.", explanation: "x² - 25 = x² - 5² = (x - 5)(x + 5).", skillTag: "Factoring" },
    { id: "standard-linear-2", tier: 2, prompt: "Solve for x: 2x - 9 = 15", format: "Enter a number.", answers: ["12"], hint: "Add 9 first, then divide by 2.", explanation: "2x - 9 = 15 → 2x = 24 → x = 12.", skillTag: "Two-Step Equations" },
    { id: "standard-function-2", tier: 2, prompt: "If h(x)=x²+2x, find h(3).", format: "Enter a number.", answers: ["15"], hint: "Substitute the input everywhere x appears.", explanation: "h(3)=3²+2(3)=9+6=15.", skillTag: "Function Evaluation" },
    { id: "standard-slope-2", tier: 2, prompt: "Find the slope through (1, 2) and (5, 10).", format: "Enter slope as an integer or fraction.", answers: ["2", "2/1"], hint: "Divide vertical change by horizontal change.", explanation: "(10 - 2) / (5 - 1) = 8 / 4 = 2.", skillTag: "Slope" },

    { id: "factor-1", tier: 3, prompt: "Factor: x² + 5x + 6", format: "Enter factored form using parentheses.", answers: ["(x+2)(x+3)", "(x+3)(x+2)"], hint: "Find two numbers that multiply to 6 and add to 5.", explanation: "2 and 3 multiply to 6 and add to 5, so the factors are (x+2)(x+3).", skillTag: "Factoring Trinomials" },
    { id: "domain-1", tier: 3, prompt: "For g(x)=1/(x-6), what value is not in the domain?", format: "Enter the excluded x-value.", answers: ["6"], hint: "The denominator cannot equal 0.", explanation: "x - 6 cannot be 0, so x cannot be 6.", skillTag: "Domain Restrictions" },
    { id: "advanced-quadratic-1", tier: 3, prompt: "Solve: x² - 9 = 0", format: "Enter both solutions separated by commas.", answers: ["-3,3", "3,-3"], hint: "Factor as a difference of squares, then set each factor to 0.", explanation: "x² - 9 = (x - 3)(x + 3), so x = 3 or x = -3.", skillTag: "Quadratics" },
    { id: "advanced-asymptote-1", tier: 3, prompt: "For y=2/(x+4), give the vertical asymptote x-value.", format: "Enter the vertical asymptote x-value.", answers: ["-4"], hint: "Set the denominator equal to 0.", explanation: "x + 4 = 0, so the vertical asymptote is x = -4.", skillTag: "Rational Functions" },
    { id: "advanced-rational-1", tier: 3, prompt: "Simplify: (x²+3x)/(x)", format: "Enter a simplified expression.", answers: ["x+3"], hint: "Factor the numerator before canceling the common factor.", explanation: "(x²+3x)/x = x(x+3)/x = x+3, with x ≠ 0.", skillTag: "Rational Expressions" },
    { id: "advanced-factor-2", tier: 3, prompt: "Factor: x² - x - 12", format: "Enter factored form using parentheses.", answers: ["(x-4)(x+3)", "(x+3)(x-4)"], hint: "Find two numbers that multiply to -12 and add to -1.", explanation: "-4 and 3 multiply to -12 and add to -1.", skillTag: "Factoring Trinomials" },
    { id: "advanced-system-1", tier: 3, prompt: "If x+y=10 and x-y=2, find x.", format: "Enter a number.", answers: ["6"], hint: "Add the equations to eliminate y.", explanation: "Adding gives 2x = 12, so x = 6.", skillTag: "Systems Reasoning" },
    { id: "advanced-vertex-1", tier: 3, prompt: "For y=(x-2)²+5, give the vertex.", format: "Enter an ordered pair.", answers: ["(2,5)", "2,5"], hint: "Use vertex form y=(x-h)²+k.", explanation: "The vertex is (h, k), which is (2, 5).", skillTag: "Quadratic Features" },

    { id: "expert-rational-1", tier: 4, prompt: "Solve: 1/x = 1/5", format: "Enter a number.", answers: ["5"], hint: "Cross multiply, while remembering x cannot be 0.", explanation: "1/x = 1/5 → 5 = x, and x = 5 is allowed.", skillTag: "Rational Equations" },
    { id: "expert-restrictions-1", tier: 4, prompt: "List restrictions for 3/((x-2)(x+1)).", format: "Enter all restrictions separated by commas.", answers: ["2,-1", "-1,2", "x=2,x=-1", "x=-1,x=2"], hint: "Each factor in the denominator cannot equal 0.", explanation: "x - 2 = 0 gives 2, and x + 1 = 0 gives -1.", skillTag: "Excluded Values" },
    { id: "expert-log-expand-1", tier: 4, prompt: "Expand: log(ab)", format: "Enter an expanded logarithmic expression.", answers: ["log(a)+log(b)", "loga+logb"], hint: "A product inside one log becomes a sum of logs.", explanation: "log(ab) = log(a) + log(b).", skillTag: "Log Rules" },
    { id: "expert-log-condense-1", tier: 4, prompt: "Condense: log(x) + log(4)", format: "Enter one condensed logarithm.", answers: ["log(4x)", "log(4*x)", "log(x*4)", "log(x4)"], hint: "A sum of logs becomes a log of a product.", explanation: "log(x) + log(4) = log(4x).", skillTag: "Log Rules" },
    { id: "expert-rewrite-1", tier: 4, prompt: "Rewrite 2³ = 8 in logarithmic form.", format: "Enter the equation in log form.", answers: ["log_2(8)=3", "log2(8)=3", "log_2 8=3"], hint: "The base of the exponent becomes the base of the logarithm.", explanation: "2³ = 8 rewrites as log base 2 of 8 equals 3.", skillTag: "Exponential/Log Rewrites" },
    { id: "expert-factor-1", tier: 4, prompt: "Factor: 2x² + 7x + 3", format: "Enter factored form using parentheses.", answers: ["(2x+1)(x+3)", "(x+3)(2x+1)"], hint: "Use grouping or the ac method.", explanation: "2x² + 7x + 3 factors as (2x + 1)(x + 3).", skillTag: "Harder Factoring" },

    { id: "elite-log-solve-1", tier: 5, prompt: "Solve: log₂(x) = 5", format: "Enter a number.", answers: ["32"], hint: "Rewrite the logarithmic equation as an exponential equation.", explanation: "log₂(x)=5 means 2⁵=x, so x=32.", skillTag: "Logarithmic Equations" },
    { id: "elite-rational-1", tier: 5, prompt: "Solve: 2/(x-1) = 4, with exclusions checked.", format: "Enter a number.", answers: ["1.5", "3/2"], hint: "First note the excluded value, then multiply both sides by the denominator.", explanation: "x cannot be 1. 2 = 4(x - 1), so 6 = 4x and x = 3/2.", skillTag: "Rational Equations" },
    { id: "elite-log-expand-1", tier: 5, prompt: "Expand: log(x²y/3)", format: "Enter an expanded logarithmic expression.", answers: ["2log(x)+log(y)-log(3)", "2logx+logy-log3"], hint: "Use power, product, and quotient log rules.", explanation: "log(x²y/3)=log(x²)+log(y)-log(3)=2log(x)+log(y)-log(3).", skillTag: "Log Rules" },
    { id: "elite-exponential-1", tier: 5, prompt: "Solve: 3^x = 81", format: "Enter a number.", answers: ["4"], hint: "Rewrite the right side as a power with the same base.", explanation: "81 = 3⁴, so x = 4.", skillTag: "Exponential Equations" },
  ].map(withTier);
}

function rehydrateMission(savedMission) {
  const bank = missionBank();
  const base = savedMission?.id ? bank.find((mission) => mission.id === savedMission.id) : null;
  return attachMissionChecker(base || bank[Math.floor(Math.random() * bank.length)]);
}

function generateMission(tier = 2) {
  const selectedTier = normalizeMissionTier(tier);
  const tierMissions = missionBank().filter((mission) => mission.tier === selectedTier);
  const missions = tierMissions.length > 0 ? tierMissions : missionBank().filter((mission) => mission.tier === 2);
  return attachMissionChecker(missions[Math.floor(Math.random() * missions.length)]);
}

function attachMissionChecker(base) {
  return { ...base, check: (answer) => base.answers.some((valid) => normalize(answer) === normalize(valid)) };
}

function applyDevCode(input) {
  if (normalize(input) === "8888") {
    const ship = currentShip();
    const message = "Combat readiness maximized: fighters, hull, and fuel restored.";
    game.player.fighterCapacity = calculateFighterCapacity(ship, game.player.upgrades);
    game.player.maxHull = ship.maxHull + Math.max(0, (game.player.upgrades.shield || 1) - 1) * 4;
    game.player.maxFuel = calculateFuelCapacity(ship, game.player.upgrades);
    game.player.fighters = game.player.fighterCapacity;
    game.player.hull = game.player.maxHull;
    game.player.fuel = game.player.maxFuel;
    game.missionFeedback = message;
    game.missionFeedbackClass = "correct";
    setSectorActionResult("Combat Readiness Maximized", message, { type: "positive", gained: ["fighters restored", "hull repaired", "fuel filled"], eventType: "dev-code" });
    addLog(message);
    saveGame();
    render();
    return true;
  }
  return false;
}

function awardMissionReward() {
  const mission = game.currentMission || missionTierByNumber(game.selectedMissionTier);
  const tier = missionTierByNumber(mission.tier);
  const reward = tier.reward;
  const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
  const credits = randomInt(reward.credits[0], reward.credits[1]);
  const requestedFuel = randomInt(reward.fuel[0], reward.fuel[1]);
  const requestedTurns = randomInt(reward.turns[0], reward.turns[1]);
  const requestedResources = randomInt(reward.resources[0], reward.resources[1]);
  const fuelAwarded = Math.max(0, Math.min(requestedFuel, game.player.maxFuel - game.player.fuel));
  const turnAwarded = Math.max(0, Math.min(requestedTurns, game.player.maxTurns - game.player.turns));
  const resourceAwarded = Math.max(0, Math.min(requestedResources, cargoSpaceLeft()));
  const fuelOverflow = requestedFuel - fuelAwarded;
  const turnOverflow = requestedTurns - turnAwarded;
  const resourceOverflow = requestedResources - resourceAwarded;
  const substituteCredits = fuelOverflow * 4 + resourceOverflow * 18;
  const substituteTurns = Math.min(Math.max(0, game.player.maxTurns - game.player.turns - turnAwarded), Math.floor(resourceOverflow / 2));
  const totalCredits = credits + substituteCredits;

  game.player.credits += totalCredits;
  game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuelAwarded);
  game.player.turns = Math.min(game.player.maxTurns, game.player.turns + turnAwarded + substituteTurns);
  if (resourceAwarded > 0) game.player.cargo[resource] += resourceAwarded;

  const parts = [`${totalCredits} credits`];
  if (fuelAwarded > 0) parts.push(`${fuelAwarded} fuel`);
  if (turnAwarded + substituteTurns > 0) parts.push(`${turnAwarded + substituteTurns} turn${turnAwarded + substituteTurns === 1 ? "" : "s"}`);
  if (resourceAwarded > 0) parts.push(`${resourceAwarded} ${resource}`);
  if (fuelOverflow > 0) parts.push(`${fuelOverflow} fuel converted to credits`);
  if (resourceOverflow > 0) parts.push(`${resourceOverflow} cargo overflow converted`);
  if (turnOverflow > 0) parts.push(`${turnOverflow} turn${turnOverflow === 1 ? "" : "s"} capped by bank`);

  game.missionFeedback = `Correct (${tier.tierName} ${tier.rewardMultiplier}x). Awarded ${parts.join(", ")}.`;
  addLog(`Correct ${tier.tierName} mission answer. Awarded ${parts.join(", ")}.`);
}

function upgradeShip(key) {
  const option = SHIP_UPGRADE_OPTIONS.find((upgrade) => upgrade.key === key);
  if (!option) return addAndRender("Unknown ship upgrade selected.");
  const sector = sectorMap[game.player.currentSector];
  const level = shipUpgradeLevel(key);
  const cap = Number(currentShip().upgradeCaps?.[key]) || (key === "hyperdrive" ? 1 : level);
  const cost = shipUpgradeCost(key);
  if (!sector?.hasShipyard) return addAndRender(`${option.label} upgrades require an available shipyard.`);
  if (level >= cap) return addAndRender(`${option.label} is already at this ship's maximum.`);
  if (game.player.credits < cost) return addAndRender(`Not enough credits for ${option.label} Level ${level + 1}.`);

  game.player.credits -= cost;
  game.player.upgrades[key] = level + 1;
  if (key === "cargoHold") game.player.cargoCapacity = calculateCargoCapacity(currentShip(), game.player.upgrades);
  if (key === "engine") {
    game.player.maxFuel = calculateFuelCapacity(currentShip(), game.player.upgrades);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + 2);
    game.player.maxTurns = calculateMaxTurnBank(game.player.upgrades.engine);
  }
  if (key === "scanner") updateScannerReveals();
  if (key === "shield") {
    game.player.maxHull = currentShip().maxHull + Math.max(0, game.player.upgrades.shield - 1) * 4;
    game.player.fighterCapacity = calculateFighterCapacity(currentShip(), game.player.upgrades);
    game.player.hull = Math.min(game.player.maxHull, game.player.hull + 4);
  }
  const message = `${option.label} upgraded to Level ${game.player.upgrades[key]}. ${option.success}`;
  setSectorActionResult("Ship Upgrade Purchased", message, { type: "positive", gained: [`${option.label} Level ${game.player.upgrades[key]}`], lost: [`${cost} credits`], eventType: "ship-upgrade" });
  addLog(message);
  scheduleCompetitiveProfileUpdate("ship upgrade", { force: key === "hyperdrive" });
  publishCompetitiveEvent(key === "hyperdrive" ? "boughtHyperdrive" : "upgradedShip", key === "hyperdrive" ? `${safeCompetitiveCaptainName()} upgraded to Hyperdrive.` : `${safeCompetitiveCaptainName()} upgraded ${option.label}.`, { sectorNumber: game.player.currentSector });
  saveGame();
  render();
}

function addLog(message) {
  game.log.unshift(message);
  game.log = game.log.slice(0, 12);
}

function missionTemplates() {
  return [
    { id: "visit-3", title: "Courier Route", objective: "Visit 3 unique sectors.", metric: "visitedSectors", target: 3, reward: { credits: 100, fuel: 3 } },
    { id: "mine-5", title: "Starter Mining Order", objective: "Mine 5 total Ore.", metric: "oreMined", target: 5, reward: { credits: 120, turns: 2 } },
    { id: "math-3", title: "Navigation Homework", objective: "Complete 3 math missions.", metric: "mathMissionsCompleted", target: 3, reward: { fuel: 5, credits: 80 } },
    { id: "trade-200", title: "Trade Ledger", objective: "Earn 200 credits from selling resources.", metric: "creditsEarnedFromTrade", target: 200, reward: { turns: 3, credits: 150 } },
    { id: "scan-2", title: "Signal Survey", objective: "Scan 2 anomalies.", metric: "anomaliesScanned", target: 2, reward: { Tech: 2, fuel: 3 } },
    { id: "claim-1", title: "Homestead Charter", objective: "Claim 1 planet.", metric: "planetsClaimed", target: 1, reward: { credits: 160, Food: 2 } },
    { id: "deposit-10", title: "Colony Supply Run", objective: "Deposit 10 resources on planets.", metric: "resourcesDeposited", target: 10, reward: { fuel: 5, turns: 2 } },
    { id: "planet-upgrade-1", title: "Builder Contract", objective: "Upgrade a planet.", metric: "planetUpgrades", target: 1, reward: { credits: 200, Tech: 1 } },
    { id: "planet-track-1", title: "Track Specialist", objective: "Upgrade any planet track.", metric: "planetUpgradesPurchased", target: 1, reward: { credits: 220, Tech: 1 } },
    { id: "planet-production-3", title: "Production Charter", objective: "Reach planet Production level 3.", metric: "highestPlanetProductionLevel", target: 3, reward: { credits: 260, Ore: 2 } },
    { id: "planet-fighters-10", title: "Colony Flight Deck", objective: "Produce 10 Fighters from planets.", metric: "planetFightersProduced", target: 10, reward: { credits: 300, fighters: 2 } },
    { id: "planet-storage-50", title: "Colony Warehouse", objective: "Store 50 total resources on planets.", metric: "planetStoredResources", target: 50, reward: { credits: 280, Food: 2 } },
    { id: "planet-defense-25", title: "Shield Survey", objective: "Reach Defense Rating 25 on any planet.", metric: "highestPlanetDefenseRating", target: 25, reward: { credits: 320, Tech: 2 } },
    { id: "sell-tech-5", title: "Circuit Broker", objective: "Sell 5 Tech.", metric: "techSold", target: 5, reward: { credits: 180, fuel: 3 } },
    { id: "credits-1000", title: "Four-Digit Ledger", objective: "Reach 1000 credits.", metric: "credits", target: 1000, reward: { turns: 4, fuel: 4 } },
    { id: "pirates-1", title: "Bounty Basics", objective: "Defeat 1 NPC pirate.", metric: "piratesDefeated", target: 1, reward: { credits: 220, reputation: 3 } },
    { id: "pirates-3", title: "Pirate Sweep", objective: "Defeat 3 NPC pirates.", metric: "piratesDefeated", target: 3, reward: { credits: 420, fuel: 4, reputation: 5 } },
    { id: "combat-wins-2", title: "Lane Security", objective: "Win 2 NPC pirate combats.", metric: "combatWins", target: 2, reward: { credits: 360, fighters: 4, reputation: 5 } },
    { id: "boarding-1", title: "Boarding Drill", objective: "Board and secure 1 NPC pirate ship.", metric: "shipsCaptured", target: 1, reward: { credits: 300, fighters: 3, reputation: 4 } },
    { id: "rep-25", title: "Trusted Defender", objective: "Reach 25 reputation.", metric: "reputation", target: 25, reward: { credits: 450, fuel: 6 } },
    { id: "rep-50", title: "Marshal Track", objective: "Reach 50 reputation.", metric: "reputation", target: 50, reward: { credits: 700, turns: 5, reputation: 4 } },
    { id: "fighters-bought-10", title: "Fighter Quartermaster", objective: "Purchase 10 fighters.", metric: "fightersBought", target: 10, reward: { credits: 150, fighters: 2 } },
    { id: "stronghold-1", title: "Stronghold Breaker", objective: "Clear a pirate stronghold sector.", metric: "strongholdsCleared", target: 1, reward: { credits: 900, fuel: 8, turns: 5, reputation: 8 } },
    { id: "threat-3", title: "Threat Level Three", objective: "Defeat a threat level 3+ pirate.", metric: "highThreatPiratesDefeated", target: 1, reward: { credits: 500, fighters: 5, reputation: 5 } },
  ];
}

function createActiveMission(id) { return { id, readyLogged: false }; }
function missionTemplateById(id) { return missionTemplates().find((mission) => mission.id === id) || missionTemplates()[0]; }
function rehydrateBoardMission(mission) { return { id: mission.id, readyLogged: Boolean(mission.readyLogged) }; }
function nextAvailableMission(active = game.activeMissions, completed = game.completedMissions) {
  const used = new Set([...active.map((mission) => mission.id), ...completed]);
  return missionTemplates().find((mission) => !used.has(mission.id));
}

function missionProgress(mission) {
  const template = missionTemplateById(mission.id);
  if (template.metric === "visitedSectors") return game.stats.visitedSectors.length;
  if (template.metric === "credits") return game.player.credits;
  if (template.metric === "reputation") return game.player.reputation || 0;
  if (template.metric === "fightersBought") return game.player.fightersBought || game.stats.fightersBought || 0;
  if (template.metric === "strongholdsCleared") return game.player.strongholdsCleared || game.stats.strongholdsCleared || 0;
  if (template.metric === "highThreatPiratesDefeated") return game.stats.highThreatPiratesDefeated || 0;
  if (template.metric === "planetStoredResources") return Object.values(game.planets || {}).reduce((sum, planet) => {
    const normalized = normalizePlanetState(planet);
    return sum + PLANET_PRODUCTION_RESOURCES.reduce((resourceSum, resource) => resourceSum + (normalized.stored[resource] || 0), 0);
  }, 0);
  return game.stats[template.metric] || 0;
}

function syncProgressSystems() {
  let changed = false;
  const ship = currentShip();
  const nextMaxTurns = calculateMaxTurns(game.player.upgrades.engine);
  const nextMaxFuel = calculateFuelCapacity(ship, game.player.upgrades);
  const nextCargo = calculateCargoCapacity(ship, game.player.upgrades);
  const nextFighterCapacity = calculateFighterCapacity(ship, game.player.upgrades);
  const nextMaxHull = ship.maxHull + Math.max(0, game.player.upgrades.shield - 1) * 4;
  if (game.player.maxTurns !== nextMaxTurns) { game.player.maxTurns = nextMaxTurns; changed = true; }
  if (game.player.maxFuel !== nextMaxFuel) { game.player.maxFuel = nextMaxFuel; changed = true; }
  if (game.player.cargoCapacity !== nextCargo) { game.player.cargoCapacity = nextCargo; changed = true; }
  if (game.player.fighterCapacity !== nextFighterCapacity) { game.player.fighterCapacity = nextFighterCapacity; changed = true; }
  if (game.player.maxHull !== nextMaxHull) { game.player.maxHull = nextMaxHull; changed = true; }
  if (game.player.turns > game.player.maxTurns) { game.player.turns = game.player.maxTurns; changed = true; }
  if (game.player.fuel > game.player.maxFuel) { game.player.fuel = game.player.maxFuel; changed = true; }
  if (game.player.hull > game.player.maxHull) { game.player.hull = game.player.maxHull; changed = true; }
  if (JSON.stringify(game.stats.visitedSectors) !== JSON.stringify(normalizeSectorList(game.stats.visitedSectors, game.player.currentSector))) {
    game.stats.visitedSectors = normalizeSectorList(game.stats.visitedSectors, game.player.currentSector);
    changed = true;
  }
  syncCombatStats(game);
  game.activeMissions.forEach((mission) => {
    const template = missionTemplateById(mission.id);
    if (!mission.readyLogged && missionProgress(mission) >= template.target) {
      mission.readyLogged = true;
      addLog(`Mission complete: ${template.title}. Claim the reward from the Mission Board.`);
      changed = true;
    }
  });
  if (updateAchievements()) changed = true;
  return changed;
}

function claimBoardMission(id) {
  const index = game.activeMissions.findIndex((mission) => mission.id === id);
  if (index === -1) return;
  const mission = game.activeMissions[index];
  const template = missionTemplateById(mission.id);
  if (missionProgress(mission) < template.target) return;
  applyReward(template.reward);
  game.completedMissions.push(template.id);
  game.stats.missionsClaimed += 1;
  game.activeMissions.splice(index, 1);
  const replacement = nextAvailableMission();
  if (replacement) game.activeMissions.push(createActiveMission(replacement.id));
  addLog(`Claimed mission reward for ${template.title}: ${formatReward(template.reward)}.`);
  scheduleCompetitiveProfileUpdate("board mission complete", { force: true });
  publishCompetitiveEvent("completedMission", `${safeCompetitiveCaptainName()} completed ${template.title}.`, { sectorNumber: game.player.currentSector });
  saveGame();
  render();
}

function tutorialSteps() {
  return [
    { id: "math", title: "Complete your first math mission.", reward: { credits: 50 } },
    { id: "buy", title: "Buy any resource at a port.", reward: { fuel: 2 } },
    { id: "travel", title: "Travel to another sector.", reward: { turns: 2 } },
    { id: "sell", title: "Sell any resource.", reward: { credits: 50 } },
    { id: "mine", title: "Mine an asteroid field.", reward: { fuel: 2 } },
    { id: "scan", title: "Scan an anomaly.", reward: { turns: 2 } },
    { id: "claim", title: "Claim a planet.", reward: { credits: 50 } },
    { id: "deposit", title: "Deposit resources on your planet.", reward: { fuel: 2 } },
    { id: "upgradePlanet", title: "Upgrade your planet.", reward: { turns: 2 } },
    { id: "collectProduction", title: "Collect planet production.", reward: { credits: 50 } },
  ];
}

function completeTutorialStep(id) {
  if (game.tutorial.completedSteps.includes(id)) return;
  const step = tutorialSteps().find((item) => item.id === id);
  if (!step) return;
  game.tutorial.completedSteps.push(id);
  applyReward(step.reward);
  addLog(`Tutorial step complete: ${step.title} Reward: ${formatReward(step.reward)}.`);
  if (game.tutorial.completedSteps.length === tutorialSteps().length && !game.tutorial.finished) {
    game.tutorial.finished = true;
    addLog("Tutorial complete. You are cleared for open-sector operations.");
  }
}

function achievementDefinitions() {
  return [
    { id: "first-profit", title: "First Profit", description: "Earn credits from selling resources.", check: () => game.stats.creditsEarnedFromTrade > 0 },
    { id: "first-jump", title: "First Jump", description: "Travel for the first time.", check: () => game.stats.visitedSectors.length > 1 },
    { id: "first-planet", title: "First Planet", description: "Claim a planet.", check: () => game.stats.planetsClaimed >= 1 },
    { id: "prospector", title: "Prospector", description: "Mine at least 10 Ore total.", check: () => game.stats.oreMined >= 10 },
    { id: "anomaly-whisperer", title: "Anomaly Whisperer", description: "Scan 5 anomalies.", check: () => game.stats.anomaliesScanned >= 5 },
    { id: "mission-runner", title: "Mission Runner", description: "Complete 5 math missions.", check: () => game.stats.mathMissionsCompleted >= 5 },
    { id: "cargo-goblin", title: "Cargo Goblin", description: `Reach cargo capacity ${CARGO_GOBLIN_CAPACITY_THRESHOLD} or higher.`, check: () => game.player.cargoCapacity >= CARGO_GOBLIN_CAPACITY_THRESHOLD },
    { id: "planet-builder", title: "Planet Builder", description: "Upgrade any planet to level 3.", check: () => Object.values(game.planets).some((planet) => normalizePlanetState(planet).upgrades.production >= 3) },
    { id: "credit-climber", title: "Credit Climber", description: "Reach 2000 credits.", check: () => game.player.credits >= 2000 },
    { id: "sector-scout", title: "Sector Scout", description: "Visit 15 unique sectors.", check: () => game.stats.visitedSectors.length >= 15 },
    { id: "first-bounty", title: "First Bounty", description: "Defeat your first NPC pirate.", check: () => game.player.piratesDefeated >= 1 },
    { id: "fighter-screen", title: "Fighter Screen", description: `Own ${FIGHTER_SCREEN_THRESHOLD} fighters.`, check: () => game.player.fighters >= FIGHTER_SCREEN_THRESHOLD },
    { id: "pirate-sweeper", title: "Pirate Sweeper", description: "Defeat 5 NPC pirates.", check: () => game.player.piratesDefeated >= 5 },
    { id: "boarding-party", title: "Boarding Party", description: "Successfully board an NPC pirate.", check: () => game.player.shipsCaptured >= 1 },
    { id: "marshal-material", title: "Marshal Material", description: "Reach reputation 40.", check: () => game.player.reputation >= 40 },
    { id: "star-marshal-achievement", title: "Star Marshal", description: "Reach reputation 75.", check: () => game.player.reputation >= 75 },
    { id: "dead-end-cleaner", title: "Dead-End Cleaner", description: "Defeat a pirate in a dead-end sector.", check: () => Object.values(game.pirates || {}).some((pirate) => pirate.defeated && sectorMap[pirate.sector]?.routeRole === "deadEnd") },
  ];
}

function updateAchievements() {
  let changed = false;
  achievementDefinitions().forEach((achievement) => {
    if (!game.achievements.includes(achievement.id) && achievement.check()) {
      game.achievements.push(achievement.id);
      addLog(`Achievement unlocked: ${achievement.title}.`);
      changed = true;
    }
  });
  return changed;
}

function currentRank() {
  const s = game.stats;
  if (s.missionsClaimed >= 10) return "Drift Captain";
  if (s.oreMined >= 25) return "Void Prospector";
  if (s.planetsClaimed >= 1) return "Planet Founder";
  if (game.player.credits >= 1000) return "Trade Runner";
  if (s.visitedSectors.length >= 5) return "Courier";
  return "Cadet";
}


function getPlayerCombatPower() {
  const ship = currentShip();
  const hullRatio = Math.max(0.25, game.player.hull / Math.max(1, game.player.maxHull));
  const shield = Math.max(0, (game.player.upgrades.shield || 1) - 1) * 2.5;
  const scanner = Math.max(0, (game.player.upgrades.scanner || 1) - 1) * 0.8;
  const marshalBonus = captainSpecialtyKey() === "Marshal" ? 2 : 0;
  return Math.round((ship.basePower + game.player.fighters * 1.15 + shield + scanner + marshalBonus) * hullRatio);
}

function getPirateCombatPower(pirate) {
  const hullRatio = Math.max(0.2, pirate.hull / Math.max(1, pirate.maxHull));
  return Math.round((pirate.basePower + pirate.fighters * 1.05 + pirate.threatLevel * 4) * hullRatio);
}

function estimateCombatRisk(pirate) {
  const playerPower = getPlayerCombatPower();
  const piratePower = getPirateCombatPower(pirate);
  const score = playerPower / Math.max(1, piratePower);
  const scanner = game.player.upgrades.scanner || 1;
  let label = "Dangerous";
  if (score >= 1.8) label = "Safe";
  else if (score >= 1.35) label = "Favorable";
  else if (score >= 0.95) label = "Even";
  else if (score >= 0.65) label = "Dangerous";
  else label = "Outmatched";
  if (scanner <= 1) label += " (rough scan)";
  else if (scanner >= 4) label += ` (${playerPower} vs ${piratePower})`;
  return { score, label, playerPower, piratePower };
}

function resolvePirateCombat(mode = "engage") {
  const pirate = currentPirateEncounter();
  if (!pirate) return addAndRender("No active NPC pirate encounter in this sector.");
  if (mode === "retreat") {
    const baseMessage = `${pirate.name} remains active in the sector. Travel is still blocked until combat is resolved.`;
    if (Math.random() < RETREAT_DAMAGE_RISK && pirate.fighters > game.player.fighters + 10) {
      applyCombatDamage(0, 2, "retreat");
      setSectorActionResult("Disengaged Temporarily", `Backed off this round; evasive maneuvers cost 2 hull. ${baseMessage}`, { type: "negative", lost: ["-2 hull"] });
      addLog(`Disengaged temporarily from ${pirate.name}; evasive maneuvers cost 2 hull. Pirate remains active and travel is still blocked.`);
    } else {
      setSectorActionResult("Disengaged Temporarily", `Backed off this round. ${baseMessage}`, { type: "neutral" });
      addLog(`Disengaged temporarily from ${pirate.name}. Pirate remains active and travel is still blocked.`);
    }
    saveGame();
    render();
    return;
  }
  const cautious = mode === "cautious";
  const playerPower = getPlayerCombatPower() * (cautious ? 0.82 : 1);
  const piratePower = getPirateCombatPower(pirate);
  const variance = 1 + ((Math.random() * 2 - 1) * COMBAT_RANDOMNESS);
  const ratio = (playerPower * variance) / Math.max(1, piratePower);
  if (ratio >= (cautious ? 1.22 : 1.0)) {
    const fighterLoss = Math.min(game.player.fighters, Math.ceil(Math.min(MAX_FIGHTER_LOSS_RATE, 0.12 + piratePower / Math.max(80, playerPower * 5)) * Math.max(1, game.player.fighters)));
    const hullDamage = cautious ? Math.max(0, Math.ceil(pirate.threatLevel / 3) - 1) : Math.max(0, Math.ceil(pirate.threatLevel / 2) - Math.floor((game.player.upgrades.shield || 1) / 3));
    const damageReport = applyCombatDamage(fighterLoss, hullDamage, "victory");
    defeatPirate(pirate, "defeated", { fightersLost: damageReport.fightersLost, hullDamage: damageReport.hullDamage });
    addLog(`Victory: ${pirate.name} was defeated. Bounty paid and reputation improved.`);
  } else if (ratio >= (cautious ? 0.58 : 0.66)) {
    const pirateFighterLoss = Math.max(2, Math.ceil((game.player.fighters * (cautious ? 0.22 : 0.34)) + currentShip().basePower / 3));
    const pirateHullLoss = Math.max(3, Math.ceil((playerPower / Math.max(6, pirate.threatLevel * 2)) * (cautious ? 0.45 : 0.65)));
    const pirateDamageReport = applyPirateCombatDamage(pirate, pirateFighterLoss, pirateHullLoss);
    const fighterLoss = Math.min(game.player.fighters, Math.ceil(Math.max(1, piratePower / 12) * (cautious ? 0.65 : 1)));
    const hullDamage = cautious ? Math.max(0, Math.ceil(pirate.threatLevel / 3) - 1) : Math.max(1, Math.ceil(pirate.threatLevel / 2));
    const damageReport = applyCombatDamage(fighterLoss, hullDamage, "skirmish");
    addLog(`Skirmish report: ${pirate.name} lost ${pirateDamageReport.fightersDestroyed} fighters and ${pirateDamageReport.hullDamageDealt} hull; you lost ${damageReport.fightersLost} fighters and took ${damageReport.hullDamage} hull damage.`);
  } else {
    loseCombatToPirates(pirate, cautious);
  }
  saveGame();
  render();
}


function applyBoundedLoss(currentValue, requestedLoss) {
  const current = Math.max(0, Math.floor(Number(currentValue) || 0));
  const requested = Math.max(0, Math.floor(Number(requestedLoss) || 0));
  const actualLoss = Math.min(current, requested);
  return { nextValue: Math.max(0, current - actualLoss), actualLoss };
}

function applyPirateCombatDamage(pirate, fighterLoss, hullLoss) {
  const fighterReport = applyBoundedLoss(pirate.fighters, fighterLoss);
  pirate.fighters = fighterReport.nextValue;
  const hullReport = applyBoundedLoss(pirate.hull, hullLoss);
  pirate.hull = hullReport.nextValue;
  game.player.fightersDestroyed = (game.player.fightersDestroyed || 0) + fighterReport.actualLoss;
  game.player.pirateHullDamageDealt = (game.player.pirateHullDamageDealt || 0) + hullReport.actualLoss;
  syncCombatStats(game);
  return { fightersDestroyed: fighterReport.actualLoss, hullDamageDealt: hullReport.actualLoss };
}

function applyCombatDamage(fighterLoss, hullDamage, context = "combat") {
  const requestedFighterLoss = Math.max(0, Math.floor(Number(fighterLoss) || 0));
  const fighterReport = applyBoundedLoss(game.player.fighters, requestedFighterLoss);
  game.player.fighters = fighterReport.nextValue;
  const spillover = Math.max(0, requestedFighterLoss - fighterReport.actualLoss);
  const shieldReduction = Math.floor((game.player.upgrades.shield || 1) / 2);
  const requestedHullDamage = Math.max(0, Math.floor(Number(hullDamage) || 0) + spillover - shieldReduction);
  const hullReport = applyBoundedLoss(game.player.hull, requestedHullDamage);
  game.player.hull = hullReport.nextValue;
  game.player.fightersLost = (game.player.fightersLost || 0) + fighterReport.actualLoss;
  game.player.playerHullDamageTaken = (game.player.playerHullDamageTaken || 0) + hullReport.actualLoss;
  syncCombatStats(game);
  if (fighterReport.actualLoss > 0 || hullReport.actualLoss > 0) addLog(`Combat damage (${context}): lost ${fighterReport.actualLoss} fighter${fighterReport.actualLoss === 1 ? "" : "s"}${hullReport.actualLoss ? ` and ${hullReport.actualLoss} hull` : ""}.`);
  if (game.player.hull <= 0) escapePodReset();
  return { fightersLost: fighterReport.actualLoss, hullDamage: hullReport.actualLoss };
}

function addReputation(amount = 0) {
  const delta = Math.floor(Number(amount) || 0);
  if (!delta) return 0;
  game.player.reputation = Math.max(-100, Math.min(100, (game.player.reputation || 0) + delta));
  if (delta > 0) game.player.lawfulReputation = (game.player.lawfulReputation || 0) + delta;
  if (delta < 0) game.player.pirateReputation = (game.player.pirateReputation || 0) + Math.abs(delta);
  refreshCombatIdentity(game.player);
  syncCombatStats(game);
  return delta;
}

function grantPirateSalvage(pirate) {
  const salvage = [];
  const blocked = [];
  const resource = RESOURCES[(pirate.sector + pirate.threatLevel) % RESOURCES.length];
  const desiredCargo = Math.max(1, Math.min(3, Math.ceil((pirate.threatLevel || 1) / 2)));
  const cargoAmount = Math.min(cargoSpaceLeft(), desiredCargo);
  if (cargoAmount > 0) {
    game.player.cargo[resource] += cargoAmount;
    updateCargoCostOnBuy(resource, cargoAmount, 0);
    salvage.push(`+${cargoAmount} ${resource}`);
  } else if (desiredCargo > 0) {
    blocked.push(`${desiredCargo} ${resource} left behind: cargo full`);
  }
  const fighterRoom = Math.max(0, game.player.fighterCapacity - game.player.fighters);
  const fighterAmount = Math.min(fighterRoom, pirate.threatLevel >= 3 ? 1 : 0);
  if (fighterAmount > 0) {
    game.player.fighters += fighterAmount;
    salvage.push(`+${fighterAmount} Fighter`);
  } else if (pirate.threatLevel >= 3 && fighterRoom <= 0) {
    blocked.push("1 Fighter left behind: fighter bay full");
  }
  return { salvage, blocked };
}

function defeatPirate(pirate, verb = "defeated", report = {}) {
  const bounty = Math.max(0, Math.floor(pirate.bounty || 0));
  const reputationGain = Math.round((pirate.reputationReward || 0) * PIRATE_REPUTATION_MULTIPLIER);
  const requestedEnemyDestroyed = Math.max(0, Math.floor(typeof report.pirateFightersLost === "number" ? report.pirateFightersLost : pirate.fighters || 0));
  const fighterReport = applyBoundedLoss(pirate.fighters, requestedEnemyDestroyed);
  const requestedHullDamage = Math.max(0, Math.floor(typeof report.pirateHullDamageDealt === "number" ? report.pirateHullDamageDealt : pirate.hull || 0));
  const hullReport = applyBoundedLoss(pirate.hull, requestedHullDamage);
  pirate.defeated = true;
  pirate.fighters = 0;
  pirate.hull = 0;
  const strongholdBonus = pirate.isStronghold ? Math.round(bounty * 0.35) : 0;
  const totalBounty = bounty + strongholdBonus;
  const marshalReputationBonus = captainSpecialtyKey() === "Marshal" ? 1 : 0;
  const totalReputation = reputationGain + (pirate.isStronghold ? 8 : 0) + marshalReputationBonus;
  pirate.cleared = Boolean(pirate.isStronghold);
  game.player.credits += totalBounty;
  game.player.bountiesEarned = (game.player.bountiesEarned || 0) + totalBounty;
  if (pirate.isStronghold) game.player.strongholdsCleared = (game.player.strongholdsCleared || 0) + 1;
  if (pirate.threatLevel >= 3) game.stats.highThreatPiratesDefeated = (game.stats.highThreatPiratesDefeated || 0) + 1;
  addReputation(totalReputation);
  game.player.piratesDefeated += 1;
  game.player.combatWins += 1;
  game.player.fightersDestroyed = (game.player.fightersDestroyed || 0) + fighterReport.actualLoss;
  game.player.pirateHullDamageDealt = (game.player.pirateHullDamageDealt || 0) + hullReport.actualLoss;
  const salvageReport = grantPirateSalvage(pirate);
  syncCombatStats(game);
  const lost = report.fightersLost ?? 0;
  const hull = report.hullDamage ?? 0;
  const gained = [`+${totalBounty} credits`, `+${totalReputation} reputation`, ...salvageReport.salvage];
  const losses = [...(lost ? [`-${lost} fighter${lost === 1 ? "" : "s"}`] : []), ...(hull ? [`-${hull} hull`] : [])];
  const salvageText = salvageReport.salvage.length ? ` Salvage recovered: ${salvageReport.salvage.join(", ")}.` : " No salvage recovered.";
  const blockedText = salvageReport.blocked.length ? ` ${salvageReport.blocked.join("; ")}.` : "";
  const message = `Pirates Defeated: ${pirate.name} ${verb}. +${totalBounty} credits, +${totalReputation} reputation.${salvageText}${blockedText}${lost || hull ? ` Combat losses: ${losses.join(", ")}.` : ""}`;
  setSectorActionResult("Pirates Defeated", message, { type: "positive", gained, lost: losses, sector: pirate.sector });
  addLog(`Combat report: ${verb} ${pirate.name}. Lost ${lost} fighter${lost === 1 ? "" : "s"}, destroyed ${fighterReport.actualLoss} pirate fighter${fighterReport.actualLoss === 1 ? "" : "s"}, took ${hull} hull damage, earned ${totalBounty} credits and +${totalReputation} reputation.`);
  addLog(message);
  if (pirate.isStronghold) addLog(`Stronghold cleared in Sector ${pirate.sector}. Trade lanes are safer.`);
  scheduleCompetitiveProfileUpdate("pirate defeated", { force: true });
  publishCompetitiveEvent("defeatedPirate", `${safeCompetitiveCaptainName()} defeated a pirate raider in Sector ${pirate.sector}.`, { sectorNumber: pirate.sector });
}

function loseCombatToPirates(pirate, cautious = false) {
  const fighterLoss = Math.min(game.player.fighters, Math.ceil((pirate.fighters * (cautious ? 0.24 : 0.38)) + pirate.threatLevel));
  const hullDamage = Math.max(2, Math.ceil((pirate.basePower + pirate.threatLevel * 3) / (cautious ? 6 : 4)) - Math.floor((game.player.upgrades.shield || 1) / 2));
  const damageReport = applyCombatDamage(fighterLoss, hullDamage, "loss");
  game.player.combatLosses += 1;
  syncCombatStats(game);
  const message = `Combat Defeat: ${pirate.name} routed your attack. Lost ${damageReport.fightersLost} fighters and took ${damageReport.hullDamage} hull damage. Repair, buy fighters, or disengage temporarily before making another combat decision.`;
  setSectorActionResult("Combat Defeat", message, { type: "negative", lost: [`-${damageReport.fightersLost} fighters`, `-${damageReport.hullDamage} hull`] });
  addLog(message);
}

function canBoardPirate(pirate = currentPirateEncounter()) {
  if (!pirate || pirate.defeated || !pirate.npcOnly) return false;
  return pirate.hull <= BOARDING_HULL_THRESHOLD && pirate.fighters <= BOARDING_MAX_PIRATE_FIGHTERS && game.player.hull > BOARDING_HULL_THRESHOLD && (game.player.fighters >= 1 || currentShip().basePower >= 18);
}

function salvageBoardingCargo() {
  const options = ["Ore", "Food", "Tech"];
  const resource = options[(game.player.currentSector + game.player.shipsCaptured) % options.length];
  const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor((game.player.upgrades.scanner || 1) / 2));
  if (amount > 0) {
    game.player.cargo[resource] += amount;
    addLog(`Boarding salvage: secured ${amount} ${resource}.`);
  }
}

function salvageBoardingFighters(pirate) {
  const room = Math.max(0, game.player.fighterCapacity - game.player.fighters);
  const amount = Math.min(room, Math.max(0, Math.floor(pirate.threatLevel / 2)));
  if (amount > 0) {
    game.player.fighters += amount;
    addLog(`Boarding salvage: repaired ${amount} captured fighter${amount === 1 ? "" : "s"}.`);
  }
}

function boardPirateShip() {
  const pirate = currentPirateEncounter();
  if (!canBoardPirate(pirate)) return addAndRender("Boarding is not available until this NPC pirate ship is disabled and its fighters are nearly gone.");
  const chance = Math.max(0.18, Math.min(0.9, 0.45 + game.player.fighters * 0.01 + (game.player.upgrades.scanner || 1) * 0.04 + currentShip().basePower * 0.01 + (currentShip().boardingBonus || 0) * 0.04 - pirate.fighters * 0.04 - pirate.threatLevel * 0.07));
  if (Math.random() <= chance) {
    const bonus = 80 + pirate.threatLevel * 45;
    game.player.credits += bonus;
    game.player.bountiesEarned = (game.player.bountiesEarned || 0) + bonus;
    addReputation(Math.ceil(pirate.reputationReward / 2));
    game.player.shipsCaptured += 1;
    salvageBoardingCargo();
    salvageBoardingFighters(pirate);
    defeatPirate(pirate, "boarded and secured");
    addLog(`Boarding success: recovered ${bonus} bonus credits and classroom-safe salvage from the NPC pirate ship.`);
  } else {
    const fighterLoss = Math.min(game.player.fighters, Math.max(1, pirate.threatLevel));
    const hullDamage = Math.max(2, pirate.threatLevel + 1);
    applyCombatDamage(fighterLoss, hullDamage, "boarding attempt");
    if (Math.random() < 0.25) {
      pirate.defeated = true;
      pirate.fighters = 0;
      pirate.hull = 0;
      addLog(`${pirate.name} escaped disabled after the failed boarding attempt. No bounty was paid.`);
    } else {
      addLog(`Boarding failed: ${pirate.name} remains disabled but dangerous.`);
    }
  }
  syncCombatStats(game);
  saveGame();
  render();
}

function reputationTitle(reputation = game.player.reputation || 0) {
  if (reputation <= -75) return "Dread Pirate";
  if (reputation <= -40) return "Raider";
  if (reputation <= -10) return "Outlaw";
  if (reputation <= 9) return "Independent";
  if (reputation <= 39) return "Deputy Pilot";
  if (reputation <= 74) return "Sector Defender";
  return "Star Marshal";
}

function combatRankThresholds() {
  return [
    { title: "Civilian Pilot", reputation: 0, pirates: 0, any: true },
    { title: "Patrol Volunteer", reputation: 10, pirates: 2, any: true },
    { title: "Deputy Pilot", reputation: 25, pirates: 5 },
    { title: "Lane Guard", reputation: 40, pirates: 8 },
    { title: "Sector Defender", reputation: 60, pirates: 12 },
    { title: "Marshal", reputation: 75, pirates: 18 },
    { title: "Star Marshal", reputation: 90, pirates: 25 },
  ];
}

function combatRankQualifies(player, rank) {
  const reputation = Math.max(0, Math.floor(player?.reputation || 0));
  const pirates = Math.max(0, Math.floor(player?.piratesDefeated || 0));
  return rank.any ? reputation >= rank.reputation || pirates >= rank.pirates : reputation >= rank.reputation && pirates >= rank.pirates;
}

function combatRankTitle(player = game.player) {
  return combatRankThresholds().reduce((current, rank) => (combatRankQualifies(player, rank) ? rank.title : current), "Civilian Pilot");
}

function nextCombatRankProgress(player = game.player) {
  const next = combatRankThresholds().find((rank) => !combatRankQualifies(player, rank));
  if (!next) return "Max rank";
  const reputation = Math.max(0, Math.floor(player?.reputation || 0));
  const pirates = Math.max(0, Math.floor(player?.piratesDefeated || 0));
  if (next.any) return `${Math.max(reputation, pirates)}/${next.reputation} reputation or ${pirates}/${next.pirates} pirates to ${next.title}`;
  return `${reputation}/${next.reputation} reputation and ${pirates}/${next.pirates} pirates to ${next.title}`;
}

function combatRankMeets(requiredRank, player = game.player) {
  if (!requiredRank) return true;
  const ranks = combatRankThresholds().map((rank) => rank.title);
  return ranks.indexOf(combatRankTitle(player)) >= ranks.indexOf(requiredRank);
}

function refreshCombatIdentity(player = game.player) {
  player.alignmentStatus = reputationTitle(player.reputation || 0);
  player.combatRank = combatRankTitle(player);
  return player;
}


function shipUnlockStatus(ship) {
  const unlock = ship.unlock;
  if (!unlock) return { unlocked: true, reason: "Available" };
  if (unlock.future || ship.futureLocked) return { unlocked: false, reason: unlock.text };
  if (unlock.reputation && (game.player.reputation || 0) < unlock.reputation && !combatRankMeets(unlock.combatRank)) return { unlocked: false, reason: unlock.text };
  if (unlock.rank && currentRank() !== unlock.rank && game.player.credits < (unlock.credits || Infinity)) return { unlocked: false, reason: unlock.text };
  if (unlock.scanner && (game.player.upgrades.scanner || 1) < unlock.scanner && (game.stats.visitedSectors?.length || 0) < (unlock.visitedSectors || Infinity)) return { unlocked: false, reason: unlock.text };
  return { unlocked: true, reason: "Available" };
}

function syncCombatStats(targetGame = game) {
  if (!targetGame.stats) targetGame.stats = defaultStats();
  refreshCombatIdentity(targetGame.player);
  targetGame.stats.piratesDefeated = targetGame.player.piratesDefeated || 0;
  targetGame.stats.combatWins = targetGame.player.combatWins || 0;
  targetGame.stats.combatLosses = targetGame.player.combatLosses || 0;
  targetGame.stats.shipsCaptured = targetGame.player.shipsCaptured || 0;
  targetGame.stats.fightersLost = targetGame.player.fightersLost || 0;
  targetGame.stats.fightersDestroyed = targetGame.player.fightersDestroyed || 0;
  targetGame.stats.fightersBought = targetGame.player.fightersBought || 0;
  targetGame.stats.fightersSold = targetGame.player.fightersSold || 0;
  targetGame.stats.bountiesEarned = targetGame.player.bountiesEarned || 0;
  targetGame.stats.strongholdsCleared = targetGame.player.strongholdsCleared || 0;
  targetGame.stats.highThreatPiratesDefeated = targetGame.stats.highThreatPiratesDefeated || 0;
  targetGame.stats.playerHullDamageTaken = targetGame.player.playerHullDamageTaken || 0;
  targetGame.stats.pirateHullDamageDealt = targetGame.player.pirateHullDamageDealt || 0;
  targetGame.stats.reputation = targetGame.player.reputation || 0;
  targetGame.stats.lawfulReputation = targetGame.player.lawfulReputation || 0;
  targetGame.stats.pirateReputation = targetGame.player.pirateReputation || 0;
  targetGame.stats.alignmentStatus = targetGame.player.alignmentStatus || reputationTitle(targetGame.player.reputation || 0);
  targetGame.stats.combatRank = targetGame.player.combatRank || combatRankTitle(targetGame.player);
}

// Future PvP TODO only: a Firebase multiplayer version must add a teacher PvP toggle, safe zones,
// no PvP near Sector 1, server-side validation, teacher restore/reset tools, reputation loss for
// attacking lawful players, reputation gain for defeating pirates/outlaws, low-hull-only boarding,
// defeated-player ejection to Sector 1, owned-planet preservation, active ship/cargo/cash loss rules,
// and emergency replacement ships. No real player targeting, ship capture, or multiplayer combat exists here.


function maybeAlliancePatrolEvent() {
  const protectedSpace = isProtectedSpace(game.player.currentSector);
  const chance = protectedSpace ? 0.42 : 0.06;
  if (Math.random() > chance) return false;
  if (protectedSpace) addLog("Alliance patrol beacons sweep the lane. Pirates rarely risk this close to Sector 1.");
  return resolveAllianceSearch(protectedSpace);
}

function resolveAllianceSearch(protectedSpace = isProtectedSpace(game.player.currentSector)) {
  const smuggled = Math.max(0, game.player.cargo?.[SMUGGLED_RESOURCE] || 0);
  if (smuggled <= 0) {
    addLog("Alliance patrol completed a quick scan and moved on.");
    return false;
  }
  const confiscated = Math.min(smuggled, protectedSpace ? Math.ceil(smuggled / 2) : 1);
  game.player.cargo[SMUGGLED_RESOURCE] = Math.max(0, smuggled - confiscated);
  const fine = Math.min(game.player.credits, confiscated * 20);
  game.player.credits -= fine;
  addReputation(-Math.min(3, confiscated));
  addLog("Alliance inspectors confiscated unregistered cargo.");
  return true;
}

function maybeTravelEvent() {
  maybeAlliancePatrolEvent();
  if (Math.random() >= 0.3) return;
  const scanner = game.player.upgrades.scanner;
  const positiveBias = Math.min(0.2, (scanner - 1) * 0.04);
  const eventPool = ["cargo", "merchant", "solar", "delay", "storm", "probe", "rumor"];
  let event = eventPool[Math.floor(Math.random() * eventPool.length)];
  if (event === "delay" && Math.random() < positiveBias) event = eventPool[Math.floor(Math.random() * 3)];
  if (event === "cargo") {
    const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * 3));
    if (amount > 0) game.player.cargo[resource] += amount;
    addLog(amount > 0 ? `Sector event: Found drifting cargo containing ${amount} ${resource}.` : "Sector event: Found drifting cargo, but the hold was full.");
  } else if (event === "merchant") {
    const credits = 30 + Math.floor(Math.random() * 51);
    game.player.credits += credits;
    addLog(`Sector event: A helpful merchant paid ${credits} credits for updated lane notes.`);
  } else if (event === "solar") {
    const fuel = 1 + Math.floor(Math.random() * 3);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    addLog(`Sector event: A solar current restored ${fuel} fuel.`);
  } else if (event === "delay") {
    if (game.player.turns > 0) game.player.turns -= 1;
    addLog("Sector event: Navigation delay cost 1 extra turn while the ship recalibrated.");
  } else if (event === "storm") {
    addLog("Sector event: Static storm made the scanner describe every star as 'extra sparkly' for a moment.");
  } else if (event === "probe") {
    addLog("Sector event: An abandoned probe repeated a clue: patient captains compare port types before selling.");
  } else {
    const resource = RESOURCES[(game.player.currentSector + scanner) % RESOURCES.length];
    addLog(`Sector event: Port rumor says ${resource} prices may be worth checking in nearby lanes.`);
  }
}

function spendTurn(action) {
  if (!canUseGameActions()) {
    addAndRender(authGateMessage());
    return false;
  }
  if (game.player.turns <= 0) {
    addAndRender("Out of turns. Complete math missions for bonus turns or wait for the next daily turn grant.");
    return false;
  }
  if ((action === "travel" || action === "mine") && game.player.fuel <= 0) {
    addAndRender("Fuel is empty. Complete math missions for fuel or trade when you reach a port.");
    return false;
  }
  game.player.turns -= 1;
  return true;
}

function resolveSectorDanger(number = game.player.currentSector) {
  const sector = sectorMap[number];
  if (!sector || sector.dangerLevel <= 0) return false;
  const hazard = HAZARD_TYPES[sector.hazardType];
  const resist = currentShip().hazardResist + Math.max(0, game.player.upgrades.shield - 1) + (captainSpecialtyKey() === "Engineer" ? 1 : 0);
  const severity = Math.max(0, sector.dangerLevel - resist);
  if (severity <= 0) {
    addLog(`Hazard avoided in Sector ${number}: ${hazard.label}; ${hazard.note}.`);
    return false;
  }
  const hullLoss = severity * hazard.hull;
  const fuelLoss = severity * hazard.fuel;
  game.player.hull = Math.max(0, game.player.hull - hullLoss);
  game.player.fuel = Math.max(0, game.player.fuel - fuelLoss);
  addLog(`Hazard in Sector ${number}: ${hazard.label} cost ${hullLoss} hull${fuelLoss ? ` and ${fuelLoss} fuel` : ""}.`);
  if (game.player.hull <= 0) escapePodReset();
  return true;
}

function escapePodReset() {
  const starter = SHIPS.rustyComet;
  game.player.shipId = starter.id;
  game.player.shipName = starter.name;
  game.player.ownedShips = Array.from(new Set([...(game.player.ownedShips || []), starter.id]));
  game.player.currentSector = 1;
  game.player.hull = starter.maxHull;
  game.player.maxHull = starter.maxHull;
  game.player.fuel = Math.max(5, Math.min(game.player.maxFuel || starter.maxFuel, starter.maxFuel));
  markSectorVisited(1);
  addLog("Escape pod returned you to Sector 1. Cargo and credits were preserved for classroom continuity.");
}

function applyReward(reward) {
  if (reward.credits) game.player.credits += reward.credits;
  if (reward.fuel) game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + reward.fuel);
  if (reward.turns) game.player.turns = Math.min(game.player.maxTurns, game.player.turns + reward.turns);
  if (reward.reputation) addReputation(reward.reputation);
  if (reward.fighters) game.player.fighters = Math.min(game.player.fighterCapacity, game.player.fighters + reward.fighters);
  RESOURCES.forEach((resource) => {
    if (!reward[resource]) return;
    const amount = Math.min(cargoSpaceLeft(), reward[resource]);
    if (amount > 0) game.player.cargo[resource] += amount;
  });
}

function formatReward(reward) {
  const parts = [];
  if (reward.credits) parts.push(`${reward.credits} credits`);
  if (reward.fuel) parts.push(`${reward.fuel} fuel`);
  if (reward.turns) parts.push(`${reward.turns} turns`);
  if (reward.reputation) parts.push(`${reward.reputation} reputation`);
  if (reward.fighters) parts.push(`${reward.fighters} fighters`);
  RESOURCES.forEach((resource) => { if (reward[resource]) parts.push(`${reward[resource]} ${resource}`); });
  return parts.join(", ");
}

function refreshDailyTurns() {
  const today = todayKey();
  game.player.maxTurns = calculateMaxTurnBank(game.player.upgrades.engine);
  if (game.player.lastTurnRefreshDate !== today) {
    const grant = calculateDailyTurnGrant(game.player.upgrades.engine);
    const before = game.player.turns;
    game.player.turns = Math.min(game.player.maxTurns, game.player.turns + grant);
    game.player.lastTurnRefreshDate = today;
    const added = game.player.turns - before;
    addLog(`Daily turn grant added: +${added} turns${added < grant ? ` (${grant - added} over bank limit)` : ""}.`);
    return true;
  }
  return false;
}

function shipIdFromName(value) {
  if (SHIPS[value]) return value;
  const normalized = normalize(value || "");
  return Object.values(SHIPS).find((ship) => normalize(ship.name) === normalized || (ship.aliases || []).some((alias) => normalize(alias) === normalized))?.id || SHIPS.rustyComet.id;
}

function normalizeSectorList(list, requiredSector = 1) {
  const values = Array.isArray(list) ? list : [requiredSector];
  const normalized = Array.from(new Set(values.map(Number).filter((number) => sectorMap[number]))).sort((a, b) => a - b);
  if (!normalized.includes(requiredSector) && sectorMap[requiredSector]) normalized.push(requiredSector);
  return normalized.sort((a, b) => a - b);
}

function getVisibleSectorNumbers() {
  const scanner = game.player.upgrades?.scanner || 1;
  const localRange = scanner >= 5 ? 3 : scanner >= 2 ? 2 : 1;
  const visible = new Set(sectorsWithinJumps(game.player.currentSector, localRange));
  const memoryRange = scanner >= 4 ? 4 : scanner >= 2 ? 3 : 2;
  [...(game.visitedSectors || []), ...(game.revealedSectors || [])].forEach((number) => {
    if (number === game.player.currentSector || sectorDistance(game.player.currentSector, number) <= memoryRange) visible.add(number);
  });
  return normalizeSectorList(Array.from(visible), game.player.currentSector);
}

function sectorsWithinJumps(origin, jumps) {
  const seen = new Set([origin]);
  let frontier = [origin];
  for (let step = 0; step < jumps; step += 1) {
    frontier = frontier.flatMap((number) => sectorMap[number]?.adjacent || []).filter((number) => {
      if (seen.has(number)) return false;
      seen.add(number);
      return true;
    });
  }
  return Array.from(seen).sort((a, b) => a - b);
}

function sectorDistance(a, b) {
  if (a === b) return 0;
  const visited = new Set([a]);
  let frontier = [a];
  for (let distance = 1; distance <= MAX_SECTOR; distance += 1) {
    const next = [];
    frontier.forEach((number) => {
      (sectorMap[number]?.adjacent || []).forEach((neighbor) => {
        if (neighbor === b) next.push(neighbor);
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
        }
      });
    });
    if (next.includes(b)) return distance;
    frontier = next;
  }
  return Infinity;
}

function updateScannerReveals(targetGame = game) {
  const scanner = targetGame.player.upgrades?.scanner || 1;
  const revealRange = scanner >= 5 ? 3 : scanner >= 2 ? 2 : 1;
  const revealed = new Set(normalizeSectorList(targetGame.revealedSectors || [], targetGame.player.currentSector));
  sectorsWithinJumps(targetGame.player.currentSector, revealRange).forEach((number) => revealed.add(number));
  (targetGame.visitedSectors || []).forEach((number) => revealed.add(number));
  targetGame.revealedSectors = normalizeSectorList(Array.from(revealed), targetGame.player.currentSector);
}

function markSectorVisited(number) {
  game.visitedSectors = normalizeSectorList([...(game.visitedSectors || []), number], number);
  game.revealedSectors = normalizeSectorList([...(game.revealedSectors || []), number], number);
  game.stats.visitedSectors = normalizeSectorList([...(game.stats.visitedSectors || []), number], number);
  game.stats.sectorsExplored = (game.stats.visitedSectors || []).length;
}

function recordSectorDiscovery(number, wasFirstVisit = false) {
  if (!wasFirstVisit) return [];
  const sector = sectorMap[number];
  if (!sector) return [];
  const messages = [];
  const reward = 12 + Math.min(28, sector.dangerLevel * 4 + (sector.routeRole === "deadEnd" ? 6 : 0));
  game.stats.discoveredSectorTypes = Array.isArray(game.stats.discoveredSectorTypes) ? game.stats.discoveredSectorTypes : [];
  game.stats.discoveredTradeRoutes = Array.isArray(game.stats.discoveredTradeRoutes) ? game.stats.discoveredTradeRoutes : [];
  game.stats.visitedProtectedSystems = Array.isArray(game.stats.visitedProtectedSystems) ? game.stats.visitedProtectedSystems : [];
  const identity = sectorIdentityType(sector);
  if (!game.stats.discoveredSectorTypes.includes(identity)) {
    game.stats.discoveredSectorTypes.push(identity);
    messages.push(`New sector type logged: ${sectorIdentityLabel(identity)}.`);
  }
  if ((identity === "tradeCorridor" || sector.routeRole === "crossroad") && !game.stats.discoveredTradeRoutes.includes(number)) {
    game.stats.discoveredTradeRoutes.push(number);
    game.stats.tradeRoutesDiscovered = game.stats.discoveredTradeRoutes.length;
    game.stats.tradeRoutesMapped = game.stats.discoveredTradeRoutes.length;
    messages.push(sector.routeRole === "crossroad" ? "Trade lane mapped. Crossroad logged." : "Trade lane mapped.");
  }
  game.stats.discoveredDeadEnds = Array.isArray(game.stats.discoveredDeadEnds) ? game.stats.discoveredDeadEnds : [];
  if (sector.routeRole === "deadEnd" && !game.stats.discoveredDeadEnds.includes(number)) {
    game.stats.discoveredDeadEnds.push(number);
    game.stats.deadEndSectorsLogged = game.stats.discoveredDeadEnds.length;
    messages.push("Dead-end sector logged.");
  }
  if (identity === "nebula") messages.push("Nebula corridor added to charts.");
  if (sector.type === "asteroid") messages.push("New asteroid field charted.");
  if (sector.type === "anomaly") {
    game.stats.anomaliesCataloged = (game.stats.anomaliesCataloged || 0) + 1;
    messages.push(`${sector.signals?.anomalyInstability || "Unusual"} anomaly signature cataloged.`);
  }
  if (sector.type === "planet") messages.push("Planetary opportunity registered.");
  if (sector.homeworld) messages.push(`${LAMONT_PRIME_NAME} protected homeworld logged.`);
  if (sector.pirateActivity || game.pirates?.[number]) {
    game.stats.survivedPirateSectors = Array.isArray(game.stats.survivedPirateSectors) ? game.stats.survivedPirateSectors : [];
    if (!game.stats.survivedPirateSectors.includes(number)) game.stats.survivedPirateSectors.push(number);
    game.stats.pirateSectorsSurvived = game.stats.survivedPirateSectors.length;
    messages.push("Pirate signal survived and logged.");
  }
  if (isProtectedSpace(number) && !game.stats.visitedProtectedSystems.includes(number)) {
    game.stats.visitedProtectedSystems.push(number);
    game.stats.protectedSystemsVisited = game.stats.visitedProtectedSystems.length;
    messages.push("Protected zone entered.");
  }
  if (!messages.length && (sector.signals?.salvage || sector.dangerLevel > 0)) messages.push(`${sectorIdentityLabel(identity)} survey note added.`);
  if (messages.length) {
    game.player.credits += reward;
    game.stats.explorationDiscoveries = (game.stats.explorationDiscoveries || 0) + 1;
    game.stats.creditsEarnedFromTrade = game.stats.creditsEarnedFromTrade || 0;
    const summary = `${messages[0]} +${reward} exploration credits.`;
    addLog(summary);
    setSectorActionResult("Discovery Logged", summary, { type: "positive", gained: [`+${reward} credits`, "chart update"], sector: number });
    return messages.map((message, index) => index === 0 ? `${message} +${reward} credits.` : message);
  }
  return [];
}

function scannerTravelLabel(number) {
  const sector = sectorMap[number];
  const visible = getVisibleSectorNumbers().includes(number);
  if (!visible) return `Travel to ${number} · Unknown sector`;
  const danger = canSeeDanger(number) && sector.dangerLevel > 0 ? ` · ${HAZARD_TYPES[sector.hazardType].icon}${sector.dangerLevel}` : "";
  return `Travel to ${number} · ${titleCase(sector.type)}${danger}`;
}

function knownFeatures(sector) {
  if (getVisibleSectorNumbers().includes(sector.number)) return sector.objects;
  return ["unrevealed scanner return"];
}

function canSeeDanger(number) {
  if (game.visitedSectors.includes(number) || number === game.player.currentSector) return true;
  const scanner = game.player.upgrades.scanner;
  const distance = sectorDistance(game.player.currentSector, number);
  if (scanner >= 5) return distance <= 3;
  if (scanner >= 4) return distance <= 2;
  if (scanner >= 3) return distance <= 1;
  return false;
}

function scannerHelpText() {
  const scanner = game.player.upgrades.scanner;
  if (scanner <= 1) return "Level 1 shows your current sector, adjacent systems, and nearby visited lanes.";
  if (scanner === 2) return "Level 2 shows lanes up to 2 jumps away and connects visible systems.";
  if (scanner === 3) return "Level 3 identifies system types and major features for visible sectors, with danger on adjacent routes.";
  if (scanner === 4) return "Level 4 adds route roles and danger details within 2 jumps.";
  return `Level ${scanner} sharpens local route clarity without automatically revealing the entire sector map.`;
}

function capUpgradesForShip(upgrades, ship) {
  return Object.fromEntries(Object.entries(upgrades).map(([key, level]) => [key, Math.min(level, ship.upgradeCaps[key] || level)]));
}

function upgradeReductionSummary(upgrades, caps) {
  const over = Object.entries(upgrades).filter(([key, level]) => level > (caps[key] || level));
  if (over.length === 0) return "no upgrades exceed current caps";
  return over.map(([key, level]) => `${titleCase(key.replace(/([A-Z])/g, " $1"))} ${level}/${caps[key]}`).join(", ");
}

function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function calculateCargoCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.cargoCapacity + Math.max(0, (upgrades.cargoHold || 1) - 1) * CARGO_HOLD_CAPACITY_BONUS; }
function calculateFuelCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.maxFuel + Math.max(0, (upgrades.engine || 1) - 1) * 4; }
function calculateFighterCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.fighterCapacity + Math.max(0, (upgrades.shield || 1) - 1) * SHIELD_FIGHTER_CAPACITY_BONUS; }
function calculateMaxTurnBank(engineLevel) { return BASE_MAX_TURN_BANK + Math.max(0, engineLevel - 1) * ENGINE_TURN_BANK_BONUS; }
function calculateDailyTurnGrant(engineLevel) { return DAILY_TURN_GRANT + Math.max(0, engineLevel - 1) * ENGINE_DAILY_TURN_BONUS; }
function calculateMaxTurns(engineLevel) { return calculateMaxTurnBank(engineLevel); }
function repairCost(sector = sectorMap[game.player.currentSector]) {
  if (!sector?.repairService) return 0;
  const missing = Math.max(0, game.player.maxHull - game.player.hull);
  return missing <= 0 ? 0 : sector.repairService.baseFee + missing * sector.repairService.perHull;
}
function currentShip() { return SHIPS[game.player.shipId] || SHIPS.rustyComet; }
function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
function getPlanetState(sector) { return normalizePlanetState(game.planets[sector.planet.id] || JSON.parse(JSON.stringify(sector.planet)), sector.number, sector.routeRole, sector.dangerLevel); }
function productionStatusText() {
  if (!game.lastProductionAt) return "Production is ready. Cooldown starts after collection.";
  const remaining = PRODUCTION_COOLDOWN_MS - (Date.now() - game.lastProductionAt);
  if (remaining <= 0) return "Production is ready to collect.";
  return `Production cooldown: ${Math.ceil(remaining / 60000)} minute(s) remaining.`;
}
function cargoUsed() { return RESOURCES.reduce((sum, resource) => sum + (game.player.cargo[resource] || 0), 0) + Math.max(0, game.player.cargo?.[SMUGGLED_RESOURCE] || 0); }
function cargoSpaceLeft() { return game.player.cargoCapacity - cargoUsed(); }
function stat(label, value) { return `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`; }
function titleCase(text) { return String(text).replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, "").replace(/\*+/g, ""); }
function addAndRender(message) { setSectorActionResult("Action Blocked", message, { type: "negative" }); addLog(message); saveGame(); render(); }

// Future multiplayer: teacher dashboard actions such as class reset, roster summaries,
// progress review, and mission support would connect here in a later server-backed version.
