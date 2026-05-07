const STORAGE_KEY = "sectorDriftSaveV1";
const PRODUCTION_COOLDOWN_MS = 10 * 60 * 1000;
const BASE_MAX_TURNS = 40;
const FIGHTER_COST = 15;
const BOARDING_HULL_THRESHOLD = 5;
const BOARDING_MAX_PIRATE_FIGHTERS = 3;
const PIRATE_REPUTATION_MULTIPLIER = 1;
const COMBAT_RANDOMNESS = 0.14;
const RETREAT_DAMAGE_RISK = 0.08;
const MAX_FIGHTER_LOSS_RATE = 0.65;
const ESCAPE_POD_CASH_PENALTY = 0;
const PIRATE_MIN_SECTORS_FROM_START = 3;
const RESOURCES = ["Ore", "Food", "Tech"];
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
    cargoCapacity: 20,
    maxFuel: 20,
    maxHull: 30,
    basePower: 8,
    fighterCapacity: 25,
    boardingBonus: 0,
    captureResistance: 1,
    hazardResist: 0,
    upgradeCaps: { cargoHold: 5, engine: 5, scanner: 5, shield: 5 },
  },
  nebulaSkiff: {
    id: "nebulaSkiff",
    name: "Nebula Skiff",
    aliases: ["Sparrow Scout"],
    description: "A light courier with efficient engines, a sharper scanner, and nimble fighter control.",
    price: 1300,
    cargoCapacity: 18,
    maxFuel: 30,
    maxHull: 24,
    basePower: 12,
    fighterCapacity: 35,
    boardingBonus: 1,
    captureResistance: 1,
    hazardResist: 1,
    upgradeCaps: { cargoHold: 4, engine: 7, scanner: 7, shield: 4 },
  },
  atlasHauler: {
    id: "atlasHauler",
    name: "Atlas Hauler",
    aliases: ["Mule Hauler"],
    description: "A heavy trader built for big cargo jobs, sturdy repairs, and a roomy fighter bay.",
    price: 2200,
    cargoCapacity: 36,
    maxFuel: 24,
    maxHull: 44,
    basePower: 10,
    fighterCapacity: 60,
    boardingBonus: 0,
    captureResistance: 2,
    hazardResist: 1,
    upgradeCaps: { cargoHold: 8, engine: 4, scanner: 4, shield: 6 },
  },
  rockhogMiner: {
    id: "rockhogMiner",
    name: "Rockhog Miner",
    description: "A mining workhorse with reinforced plating and steady defensive systems.",
    price: 3000,
    cargoCapacity: 30,
    maxFuel: 28,
    maxHull: 48,
    basePower: 14,
    fighterCapacity: 50,
    boardingBonus: 1,
    captureResistance: 2,
    hazardResist: 2,
    upgradeCaps: { cargoHold: 7, engine: 5, scanner: 5, shield: 7 },
  },
  horizonRunner: {
    id: "horizonRunner",
    name: "Horizon Runner",
    aliases: ["Frontier Skiff"],
    description: "An advanced explorer with long range, strong hazard systems, and serious frontier defense power.",
    price: 3800,
    cargoCapacity: 28,
    maxFuel: 38,
    maxHull: 36,
    basePower: 20,
    fighterCapacity: 80,
    boardingBonus: 2,
    captureResistance: 2,
    hazardResist: 2,
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 7 },
  },
  patrolCutter: {
    id: "patrolCutter",
    name: "Patrol Cutter",
    description: "An early lawful combat ship for captains helping secure local lanes.",
    price: 2600,
    cargoCapacity: 24,
    maxFuel: 30,
    maxHull: 42,
    basePower: 24,
    fighterCapacity: 70,
    boardingBonus: 2,
    captureResistance: 3,
    hazardResist: 1,
    unlock: { reputation: 10, combatRank: "Patrol Volunteer", text: "Requires reputation 10+ or Patrol Volunteer rank" },
    upgradeCaps: { cargoHold: 5, engine: 6, scanner: 6, shield: 7 },
  },
  marshalCorvette: {
    id: "marshalCorvette",
    name: "Marshal Corvette",
    description: "A strong anti-pirate ship with durable shields and a broad fighter deck.",
    price: 6200,
    cargoCapacity: 30,
    maxFuel: 34,
    maxHull: 58,
    basePower: 38,
    fighterCapacity: 120,
    boardingBonus: 3,
    captureResistance: 4,
    hazardResist: 2,
    unlock: { reputation: 40, combatRank: "Lane Guard", text: "Requires reputation 40+ or Lane Guard rank" },
    upgradeCaps: { cargoHold: 6, engine: 7, scanner: 7, shield: 8 },
  },
  starWardenFrigate: {
    id: "starWardenFrigate",
    name: "Star Warden Frigate",
    description: "A high-end lawful ship for Star Marshals who protect deep routes.",
    price: 10500,
    cargoCapacity: 34,
    maxFuel: 40,
    maxHull: 72,
    basePower: 55,
    fighterCapacity: 180,
    boardingBonus: 4,
    captureResistance: 5,
    hazardResist: 3,
    unlock: { reputation: 75, combatRank: "Marshal", text: "Requires reputation 75+ or Marshal rank" },
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 9 },
  },
  deepRouteFreighter: {
    id: "deepRouteFreighter",
    name: "Deep Route Freighter",
    description: "An advanced neutral cargo ship for experienced trade captains.",
    price: 7200,
    cargoCapacity: 58,
    maxFuel: 32,
    maxHull: 54,
    basePower: 18,
    fighterCapacity: 90,
    boardingBonus: 0,
    captureResistance: 3,
    hazardResist: 2,
    unlock: { rank: "Trade Runner", credits: 1000, text: "Requires Trade Runner rank or 1000 credits" },
    upgradeCaps: { cargoHold: 9, engine: 5, scanner: 5, shield: 7 },
  },
  surveyorSloop: {
    id: "surveyorSloop",
    name: "Surveyor Sloop",
    description: "A neutral exploration ship with excellent scanner growth and safe route tools.",
    price: 4800,
    cargoCapacity: 22,
    maxFuel: 42,
    maxHull: 34,
    basePower: 16,
    fighterCapacity: 55,
    boardingBonus: 2,
    captureResistance: 2,
    hazardResist: 2,
    unlock: { scanner: 4, visitedSectors: 12, text: "Requires scanner level 4 or 12 visited sectors" },
    upgradeCaps: { cargoHold: 5, engine: 8, scanner: 9, shield: 6 },
  },
  blackfinRaider: {
    id: "blackfinRaider",
    name: "Blackfin Raider",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 20,
    maxFuel: 34,
    maxHull: 38,
    basePower: 28,
    fighterCapacity: 85,
    boardingBonus: 4,
    captureResistance: 2,
    hazardResist: 1,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 5, engine: 7, scanner: 6, shield: 6 },
  },
  corsairPike: {
    id: "corsairPike",
    name: "Corsair Pike",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 24,
    maxFuel: 38,
    maxHull: 48,
    basePower: 40,
    fighterCapacity: 130,
    boardingBonus: 5,
    captureResistance: 3,
    hazardResist: 2,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 5, engine: 8, scanner: 7, shield: 7 },
  },
  dreadhookFrigate: {
    id: "dreadhookFrigate",
    name: "Dreadhook Frigate",
    description: "Future pirate ship data. Requires pirate reputation; PvP/pirate systems are not active yet.",
    price: 0,
    cargoCapacity: 32,
    maxFuel: 42,
    maxHull: 68,
    basePower: 58,
    fighterCapacity: 190,
    boardingBonus: 6,
    captureResistance: 5,
    hazardResist: 3,
    futureLocked: true,
    unlock: { future: true, text: "Requires pirate reputation. PvP/pirate systems not active yet." },
    upgradeCaps: { cargoHold: 6, engine: 8, scanner: 8, shield: 9 },
  },
};

let sectorMap = createSectorMap();
let game = loadGame();
let selectedSectorNumber = game.player.currentSector;

const panels = {};

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    panels.ship = document.getElementById("shipPanel");
    panels.sector = document.getElementById("sectorPanel");
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

    refreshDailyTurns();
    updateAchievements();
    saveGame();
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

    if (economy) Object.assign(sector, economy);
    if ([1, 5, 8, 45].includes(number)) sector.hasShipyard = true;
    if ([1, 5, 8, 45].includes(number)) sector.portType = number === 1 ? "Core Port" : number === 45 ? "Frontier Starbase" : "Major Station";
    if (type === "planet") sector.planet = {
      id: `planet-${number}`,
      name: planetNames[number % planetNames.length],
      owner: null,
      productionLevel: 1,
      stored: { Ore: 0, Food: 0, Tech: 0 },
    };
  }

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

function createPortEconomy(number) {
  const portTypes = [
    { name: "Mining Port", note: "Ore is abundant; food and tech imports are welcome.", tip: "Buy Ore here and compare food prices at agri lanes.", multipliers: { Ore: [0.72, 0.82], Food: [1.08, 1.28], Tech: [1.06, 1.22] } },
    { name: "Agri Port", note: "Hydroponics domes keep Food affordable.", tip: "Food is usually a bargain here; miners often pay more.", multipliers: { Ore: [1.08, 1.22], Food: [0.72, 0.84], Tech: [1.05, 1.2] } },
    { name: "Tech Port", note: "Fabricators make Tech cheaper than frontier markets.", tip: "Tech can sell well at frontier outposts.", multipliers: { Ore: [1.04, 1.18], Food: [1.05, 1.18], Tech: [0.72, 0.84] } },
    { name: "Frontier Port", note: "Risky lanes raise import prices across the board.", tip: "Bring cargo from specialized ports for better margins.", multipliers: { Ore: [1.2, 1.38], Food: [1.16, 1.34], Tech: [1.25, 1.5] } },
    { name: "Core Port", note: "Stable classrooms, stable ledgers, modest margins.", tip: "Use this as a safe refuel and repair stop.", multipliers: { Ore: [0.95, 1.05], Food: [0.95, 1.05], Tech: [0.95, 1.05] } },
  ];
  const port = portTypes[stableNumber(number, 41) % portTypes.length];
  const base = {
    Ore: { buy: 14 + (number % 6), sell: 9 + (number % 5) },
    Food: { buy: 10 + ((number * 2) % 5), sell: 6 + (number % 4) },
    Tech: { buy: 34 + ((number * 3) % 12), sell: 22 + (number % 9) },
  };
  const portPrices = Object.fromEntries(RESOURCES.map((resource) => {
    const [buyMultiplier, sellMultiplier] = port.multipliers[resource];
    const buy = Math.max(1, Math.round(base[resource].buy * buyMultiplier));
    const sell = Math.max(1, Math.round(base[resource].sell * sellMultiplier));
    return [resource, { buy: Math.max(buy, sell + 1), sell }];
  }));
  return {
    portType: port.name,
    marketNote: port.note,
    tradeTip: port.tip,
    portPrices,
    hasShipyard: number === 1 || stableNumber(number, 53) % 4 === 0,
    repairService: { baseFee: 20 + (stableNumber(number, 67) % 18), perHull: 4 + (stableNumber(number, 71) % 4) },
  };
}

function stableNumber(number, salt = 0) {
  const raw = Math.sin((number + 1) * 9301 + salt * 49297) * 233280;
  return Math.abs(Math.floor(raw));
}

function getSectorFlavor(type, number) {
  const text = {
    empty: "Quiet stars drift beyond the cockpit glass. This is a safe place to plan your next move.",
    port: "Docking lights blink in calm patterns while merchants post classroom-safe trade prices.",
    planet: "A survey beacon marks a planet with room for patient builders.",
    asteroid: "Slow-moving rocks sparkle with ore. Mining here is careful work, not a race.",
    anomaly: "A soft signal bends the scanner display. It looks strange, but not dangerous.",
  };
  return `${text[type]} Sector registry code: SD-${String(number).padStart(2, "0")}.`;
}

function getSectorObjects(type, number, hazardType) {
  const base = {
    empty: ["navigation buoy", "distant starlight"],
    port: ["spaceport", "fuel broker", "cargo market"],
    planet: ["survey planet", "claim beacon"],
    asteroid: ["asteroid field", "ore fragments"],
    anomaly: ["scanner anomaly", "unknown signal"],
  }[type] || [];
  const objects = [...base];
  if (type === "port" && createPortEconomy(number).hasShipyard) objects.push("shipyard");
  if (hazardType) objects.push(HAZARD_TYPES[hazardType].label.toLowerCase());
  return objects;
}


function pirateBlueprints() {
  return {
    13: { name: "Scrap Raider", threatLevel: 1, fighters: 10, hull: 18, basePower: 8, bounty: 160, reputationReward: 6 },
    14: { name: "Lane Shark", threatLevel: 2, fighters: 16, hull: 24, basePower: 12, bounty: 230, reputationReward: 9 },
    19: { name: "Black Flag Cutter", threatLevel: 3, fighters: 26, hull: 34, basePower: 18, bounty: 340, reputationReward: 13 },
    23: { name: "Nebula Corsair", threatLevel: 3, fighters: 34, hull: 38, basePower: 22, bounty: 430, reputationReward: 16 },
    32: { name: "Dead-End Warlord", threatLevel: 4, fighters: 48, hull: 50, basePower: 30, bounty: 650, reputationReward: 22 },
    37: { name: "Nebula Corsair", threatLevel: 4, fighters: 58, hull: 58, basePower: 34, bounty: 780, reputationReward: 26 },
    41: { name: "Black Flag Cutter", threatLevel: 4, fighters: 62, hull: 62, basePower: 38, bounty: 860, reputationReward: 28 },
    48: { name: "Dead-End Warlord", threatLevel: 5, fighters: 82, hull: 78, basePower: 48, bounty: 1200, reputationReward: 36 },
  };
}

function createPirateEncounters() {
  return Object.fromEntries(Object.entries(pirateBlueprints()).map(([sectorNumber, blueprint]) => {
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
      shipId: starter.id,
      shipName: starter.name,
      credits: 500,
      fuel: starter.maxFuel,
      maxFuel: starter.maxFuel,
      turns: BASE_MAX_TURNS,
      maxTurns: BASE_MAX_TURNS,
      lastTurnRefreshDate: today,
      cargoCapacity: starter.cargoCapacity,
      currentSector: 1,
      hull: starter.maxHull,
      maxHull: starter.maxHull,
      cargo: { Ore: 0, Food: 0, Tech: 0 },
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
      playerHullDamageTaken: 0,
      pirateHullDamageDealt: 0,
      upgrades: { cargoHold: 1, engine: 1, scanner: 1, shield: 1 },
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
    tutorial: { completedSteps: [], finished: false },
    achievements: [],
    stats: defaultStats(),
    log: ["Welcome to Sector Drift. Start at Sector 1 and move at your own pace."],
    currentMission: generateMission(),
    missionAttempts: 0,
    missionLocked: false,
    missionFeedback: "Solve the mission for credits, fuel, turns, or cargo.",
    missionFeedbackClass: "",
    ui: { mapZoom: DEFAULT_MAP_ZOOM },
    lastProductionAt: 0,
  };
}

function defaultStats() {
  return {
    visitedSectors: [1],
    creditsEarnedFromTrade: 0,
    resourcesMined: 0,
    oreMined: 0,
    mathMissionsCompleted: 0,
    planetsClaimed: 0,
    anomaliesScanned: 0,
    resourcesDeposited: 0,
    planetUpgrades: 0,
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
    playerHullDamageTaken: 0,
    pirateHullDamageDealt: 0,
    reputation: 0,
    alignmentStatus: "Independent",
    combatRank: "Civilian Pilot",
  };
}

function loadGame() {
  if (typeof localStorage === "undefined") return defaultGameState();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultGameState();
  try {
    return migrateGameState(JSON.parse(saved));
  } catch (error) {
    return defaultGameState();
  }
}

function migrateGameState(saved = {}) {
  const fresh = defaultGameState();
  const merged = { ...fresh, ...saved };
  merged.player = { ...fresh.player, ...(saved.player || {}) };
  merged.player.shipId = shipIdFromName(merged.player.shipId || merged.player.shipName);
  const ship = SHIPS[merged.player.shipId] || SHIPS.rustyComet;
  merged.player.shipId = ship.id;
  merged.player.shipName = ship.name;
  merged.player.cargo = { ...fresh.player.cargo, ...(saved.player?.cargo || {}) };
  merged.player.upgrades = { ...fresh.player.upgrades, ...(saved.player?.upgrades || {}) };
  merged.player.reputation = clampReputation(typeof merged.player.reputation === "number" ? merged.player.reputation : 0);
  merged.player.lawfulReputation = Math.max(0, Math.floor(typeof merged.player.lawfulReputation === "number" ? merged.player.lawfulReputation : Math.max(0, merged.player.reputation)));
  merged.player.pirateReputation = Math.max(0, Math.floor(typeof merged.player.pirateReputation === "number" ? merged.player.pirateReputation : Math.max(0, -merged.player.reputation)));
  merged.player.fighters = Math.max(0, Math.floor(typeof merged.player.fighters === "number" ? merged.player.fighters : 0));
  merged.player.combatWins = Math.max(0, Math.floor(typeof merged.player.combatWins === "number" ? merged.player.combatWins : 0));
  merged.player.combatLosses = Math.max(0, Math.floor(typeof merged.player.combatLosses === "number" ? merged.player.combatLosses : 0));
  merged.player.piratesDefeated = Math.max(0, Math.floor(typeof merged.player.piratesDefeated === "number" ? merged.player.piratesDefeated : 0));
  merged.player.shipsCaptured = Math.max(0, Math.floor(typeof merged.player.shipsCaptured === "number" ? merged.player.shipsCaptured : 0));
  merged.player.fightersLost = Math.max(0, Math.floor(typeof merged.player.fightersLost === "number" ? merged.player.fightersLost : 0));
  merged.player.fightersDestroyed = Math.max(0, Math.floor(typeof merged.player.fightersDestroyed === "number" ? merged.player.fightersDestroyed : 0));
  merged.player.fightersBought = Math.max(0, Math.floor(typeof merged.player.fightersBought === "number" ? merged.player.fightersBought : 0));
  merged.player.playerHullDamageTaken = Math.max(0, Math.floor(typeof merged.player.playerHullDamageTaken === "number" ? merged.player.playerHullDamageTaken : 0));
  merged.player.pirateHullDamageDealt = Math.max(0, Math.floor(typeof merged.player.pirateHullDamageDealt === "number" ? merged.player.pirateHullDamageDealt : 0));
  merged.player.ownedShips = Array.isArray(saved.player?.ownedShips) ? saved.player.ownedShips.map(shipIdFromName).filter((id) => SHIPS[id]) : [ship.id];
  if (!merged.player.ownedShips.includes(ship.id)) merged.player.ownedShips.push(ship.id);

  const exceedsCaps = Object.entries(merged.player.upgrades).some(([key, level]) => level > (ship.upgradeCaps[key] || level));
  merged.player.legacyUpgradeOverride = Boolean(saved.player?.legacyUpgradeOverride || exceedsCaps);
  merged.player.legacyUpgradeNoteShown = Boolean(saved.player?.legacyUpgradeNoteShown);

  merged.player.maxFuel = calculateFuelCapacity(ship, merged.player.upgrades);
  merged.player.maxHull = ship.maxHull + Math.max(0, (merged.player.upgrades.shield || 1) - 1) * 4;
  merged.player.maxTurns = calculateMaxTurns(merged.player.upgrades.engine);
  merged.player.cargoCapacity = calculateCargoCapacity(ship, merged.player.upgrades);
  merged.player.fighterCapacity = calculateFighterCapacity(ship, merged.player.upgrades);
  merged.player.fuel = Math.max(0, Math.min(typeof merged.player.fuel === "number" ? merged.player.fuel : merged.player.maxFuel, merged.player.maxFuel));
  merged.player.hull = Math.max(1, Math.min(typeof merged.player.hull === "number" ? merged.player.hull : merged.player.maxHull, merged.player.maxHull));
  merged.player.turns = Math.max(0, Math.min(typeof merged.player.turns === "number" ? merged.player.turns : merged.player.maxTurns, merged.player.maxTurns));
  merged.player.fighters = Math.min(merged.player.fighters, merged.player.fighterCapacity);
  if (!merged.player.lastTurnRefreshDate) merged.player.lastTurnRefreshDate = todayKey();
  if (!sectorMap[merged.player.currentSector]) merged.player.currentSector = 1;

  merged.planets = saved.planets || {};
  merged.pirates = mergePirateEncounters(saved.pirates);
  merged.activeMissions = Array.isArray(saved.activeMissions) && saved.activeMissions.length > 0 ? saved.activeMissions.map(rehydrateBoardMission).slice(0, 3) : fresh.activeMissions;
  merged.completedMissions = Array.isArray(saved.completedMissions) ? saved.completedMissions : [];
  while (merged.activeMissions.length < 3) {
    const next = nextAvailableMission(merged.activeMissions, merged.completedMissions);
    if (!next) break;
    merged.activeMissions.push(createActiveMission(next.id));
  }
  merged.tutorial = { ...fresh.tutorial, ...(saved.tutorial || {}) };
  if (!Array.isArray(merged.tutorial.completedSteps)) merged.tutorial.completedSteps = [];
  merged.achievements = Array.isArray(saved.achievements) ? saved.achievements : [];
  merged.stats = { ...fresh.stats, ...(saved.stats || {}) };
  refreshCombatIdentity(merged);
  syncCombatStats(merged);
  merged.visitedSectors = normalizeSectorList(saved.visitedSectors || saved.stats?.visitedSectors || fresh.visitedSectors, merged.player.currentSector);
  merged.revealedSectors = normalizeSectorList(saved.revealedSectors || merged.visitedSectors, merged.player.currentSector);
  merged.stats.visitedSectors = normalizeSectorList(merged.stats.visitedSectors || merged.visitedSectors, merged.player.currentSector);
  merged.log = Array.isArray(saved.log) ? saved.log.slice(0, 12) : fresh.log;
  if (merged.player.legacyUpgradeOverride && !merged.player.legacyUpgradeNoteShown) {
    merged.log.unshift("Legacy save detected: over-cap upgrades were preserved for this ship instead of being clamped.");
    merged.player.legacyUpgradeNoteShown = true;
  }
  merged.currentMission = rehydrateMission(saved.currentMission);
  merged.missionFeedbackClass = saved.missionFeedbackClass || "";
  merged.ui = { ...fresh.ui, ...(saved.ui || {}) };
  merged.ui.mapZoom = clampMapZoom(merged.ui.mapZoom);
  updateScannerReveals(merged);
  return merged;
}

function saveGame() {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function render() {
  const refreshed = refreshDailyTurns();
  const synced = syncProgressSystems();
  if (refreshed || synced) saveGame();
  renderShipPanel();
  renderSectorPanel();
  renderLocationPanel();
  renderMathMission();
  renderMissionPanel();
  renderTutorialPanel();
  renderUpgradePanel();
  renderAchievementsPanel();
  renderStatsPanel();
  renderLogPanel();
}

function renderShipPanel() {
  const p = game.player;
  const ship = currentShip();
  const caps = ship.upgradeCaps;
  panels.ship.innerHTML = `
    <h2 id="shipHeading">Ship Status</h2>
    <div class="stat-grid">
      ${stat("Pilot", p.pilotName)}${stat("Rank", currentRank())}${stat("Reputation", `${p.reputation} · ${reputationTitle(p.reputation)}`)}${stat("Combat Rank", combatRankTitle())}${stat("Next Combat Rank", nextCombatRankProgress())}${stat("Ship", p.shipName)}${stat("Credits", p.credits)}${stat("Fuel", `${p.fuel}/${p.maxFuel}`)}${stat("Turns", `${p.turns}/${p.maxTurns} bank`)}${stat("Hull", `${p.hull}/${p.maxHull}`)}${stat("Sector", p.currentSector)}${stat("Cargo Space", `${cargoUsed()}/${p.cargoCapacity}`)}${stat("Base Power", ship.basePower)}${stat("Fighters", `${p.fighters}/${p.fighterCapacity}`)}${stat("Hazard Resist", ship.hazardResist + Math.max(0, p.upgrades.shield - 1))}
    </div>
    <p class="help-text">${ship.description}</p>
    ${renderEmergencyWarpControl()}
    ${p.legacyUpgradeOverride ? `<p class="cooldown">Legacy upgrade override active: ${upgradeReductionSummary(p.upgrades, caps)}</p>` : ""}
    ${p.turns <= 0 ? `<p class="turn-warning">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : ""}
    ${cargoSpaceLeft() < 0 ? `<p class="turn-warning">Cargo is over capacity. Sell, deposit, or dump cargo before buying more.</p>` : ""}
    <h3>Cargo</h3>
    <div class="cargo-grid">${RESOURCES.map((r) => `<div class="resource"><span class="label">${r}</span><span class="value">${p.cargo[r]}</span></div>`).join("")}</div>
    <h3>Upgrades</h3>
    <div class="cargo-grid">
      ${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}/${caps.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}/${caps.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}/${caps.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}/${caps.shield}`)}
    </div>`;
}

function renderSectorPanel() {
  const sector = sectorMap[game.player.currentSector];
  const cannotTravel = game.player.fuel <= 0 || game.player.turns <= 0;
  const danger = canSeeDanger(sector.number) && sector.dangerLevel > 0 ? `${HAZARD_TYPES[sector.hazardType].icon} Danger ${sector.dangerLevel}: ${HAZARD_TYPES[sector.hazardType].label}` : "Danger unknown until scanned or visited";
  panels.sector.innerHTML = `
    <h2 id="sectorHeading">Current Sector</h2>
    <span class="badge">Sector ${sector.number}: ${titleCase(sector.type)}</span>
    <p class="flavor">${sector.flavor}</p>
    <p><strong>Visible objects:</strong> ${knownFeatures(sector).join(", ")}</p>
    <p class="strategic-note">${sector.strategicNote}</p>
    <p class="help-text"><strong>Scanner:</strong> ${scannerHelpText()} ${danger}. Use map nodes to travel or inspect systems. Zoom in if nodes are hard to click.</p>
    ${renderMinimap()}
    ${renderNavigationIntel()}
    <h3>Adjacent Sectors</h3>
    <div class="travel-grid">
      ${sector.adjacent.map((number) => `<button type="button" ${cannotTravel ? "disabled" : ""} data-action="travel" data-sector="${number}">${scannerTravelLabel(number)}</button>`).join("")}
    </div>
    ${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : game.player.fuel <= 0 ? `<p class="cooldown">Fuel is empty. Complete math missions for fuel or trade when you reach a port.</p>` : `<p class="help-text">Travel costs 1 turn and 1 fuel. A sector event may occur after arrival.</p>`}`;
  panels.sector.querySelectorAll("[data-action='travel']").forEach((button) => button.addEventListener("click", () => travelToSector(Number(button.dataset.sector))));
  panels.sector.querySelector("[data-map-zoom='out']")?.addEventListener("click", () => zoomMap(-MAP_ZOOM_STEP));
  panels.sector.querySelector("[data-map-zoom='in']")?.addEventListener("click", () => zoomMap(MAP_ZOOM_STEP));
  panels.sector.querySelector("[data-map-zoom='reset']")?.addEventListener("click", resetMapView);
  panels.sector.querySelectorAll("[data-map-sector]").forEach((node) => {
    const number = Number(node.dataset.mapSector);
    node.addEventListener("click", () => handleMapNodeSelect(number));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleMapNodeSelect(number);
      }
    });
    node.addEventListener("focus", () => selectSector(number, true));
  });
  panels.ship.querySelector("[data-action='emergencyWarp']")?.addEventListener("click", emergencyWarp);
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
  const radius = current ? 4.2 : sector.routeRole === "crossroad" ? 3.8 : 3.3;
  const classes = ["map-node", sector.type, sector.routeRole, visited ? "visited" : "", current ? "current" : "", adjacent ? "adjacent" : "", detected ? "detected" : "", selected ? "selected" : "", danger ? "danger-known" : ""].filter(Boolean).join(" ");
  const tooltip = sectorTooltip(sector.number);
  return `<g class="${classes}" data-map-sector="${sector.number}" role="button" tabindex="0" aria-label="${tooltip}"><title>${tooltip}</title><circle class="map-hit-target" cx="${sector.coordinates.x}" cy="${sector.coordinates.y}" r="7.2"></circle><circle class="map-visible-node" cx="${sector.coordinates.x}" cy="${sector.coordinates.y}" r="${radius}"></circle><text x="${sector.coordinates.x}" y="${sector.coordinates.y + 1.35}">${sector.number}</text>${sector.routeRole === "deadEnd" ? `<circle class="role-marker" cx="${sector.coordinates.x + 4.5}" cy="${sector.coordinates.y - 4.5}" r="1.2"></circle>` : ""}${sector.routeRole === "crossroad" ? `<text class="role-symbol" x="${sector.coordinates.x + 5}" y="${sector.coordinates.y - 4}">✚</text>` : ""}${danger ? `<text class="danger-marker" x="${sector.coordinates.x + 4.7}" y="${sector.coordinates.y + 5.8}">!</text>` : ""}</g>`;
}

function renderNavigationIntel() {
  const selected = sectorMap[selectedSectorNumber] ? sectorMap[selectedSectorNumber] : sectorMap[game.player.currentSector];
  selectedSectorNumber = selected.number;
  const current = selected.number === game.player.currentSector;
  const adjacent = sectorMap[game.player.currentSector].adjacent.includes(selected.number);
  const visited = game.visitedSectors.includes(selected.number);
  const detected = game.revealedSectors.includes(selected.number);
  const visible = getVisibleSectorNumbers().includes(selected.number);
  const status = current ? "Current sector" : adjacent ? "Adjacent" : visited ? "Visited" : detected ? "Detected" : visible ? "Visible" : "Unknown";
  const canTravel = adjacent && game.player.turns > 0 && game.player.fuel > 0;
  const danger = canSeeDanger(selected.number) ? (selected.dangerLevel > 0 ? `${HAZARD_TYPES[selected.hazardType].icon} Danger ${selected.dangerLevel}: ${HAZARD_TYPES[selected.hazardType].label}` : "No danger detected") : "Danger unknown";
  const features = scannerFeatureText(selected);
  return `<aside class="nav-intel" aria-live="polite"><h3>Navigation Intel</h3><div class="intel-grid">
    ${stat("Sector", selected.number)}${stat("Status", status)}${stat("System Type", visible ? titleCase(selected.type) : "Unknown")}${stat("Route Role", canSeeRouteRole(selected.number) ? titleCase(selected.routeRole) : "Scan level 4")}
    ${stat("Danger", danger)}${stat("Travel", adjacent ? (canTravel ? "Available · 1 fuel / 1 turn" : travelBlockedReason()) : current ? "Already here" : "Not directly connected")}
  </div><p><strong>Known features:</strong> ${features}</p><p class="strategic-note">${canSeeRouteRole(selected.number) ? selected.strategicNote : "Upgrade scanners to reveal route roles such as tunnels, dead ends, and crossroads."}</p><p class="recommendation">${navigationRecommendation(selected.number)}</p></aside>`;
}

function renderEmergencyWarpControl() {
  const disabled = game.player.currentSector === 1 || game.player.fuel < 5;
  const reason = game.player.currentSector === 1 ? "Already at Sector 1." : game.player.fuel < 5 ? "Emergency warp requires 5 fuel and returns to Sector 1." : "Emergency warp requires 5 fuel and returns to Sector 1 without using turns.";
  return `<div class="emergency-warp"><button type="button" data-action="emergencyWarp" ${disabled ? "disabled" : ""}>Emergency Warp to Sector 1</button><p class="help-text">${reason}</p></div>`;
}

function handleMapNodeSelect(number) {
  selectSector(number, true);
  const current = sectorMap[game.player.currentSector];
  if (number === game.player.currentSector) return;
  if (current.adjacent.includes(number)) travelToSector(number);
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
  if (game.player.upgrades.scanner < 3 && !game.visitedSectors.includes(sector.number) && sector.number !== game.player.currentSector) return "Major features require scanner level 3 or a visit";
  return knownFeatures(sector).join(", ");
}

function canSeeRouteRole(number) {
  return game.player.upgrades.scanner >= 4 || game.visitedSectors.includes(number) || number === game.player.currentSector;
}

function travelBlockedReason() {
  if (game.player.turns <= 0) return "Out of turns";
  if (game.player.fuel <= 0) return "Fuel empty";
  return "Unavailable";
}

function navigationRecommendation(number) {
  const sector = sectorMap[number];
  if (number === game.player.currentSector) return "You are here. Review adjacent lanes before moving.";
  if (!getVisibleSectorNumbers().includes(number)) return "Upgrade scanners to reveal more.";
  if (!sectorMap[game.player.currentSector].adjacent.includes(number)) return "Not directly connected from current sector.";
  if (game.player.fuel <= 0 || game.player.turns <= 0) return travelBlockedReason() === "Fuel empty" ? "Fuel is empty. Complete math missions for fuel or trade when you reach a port." : "Out of turns. Complete missions for bonus turns or return tomorrow.";
  if (canSeeDanger(number) && sector.dangerLevel > 0) return "Danger detected. Repair or upgrade shields before entering.";
  return "Direct jump available.";
}

function emergencyWarp() {
  if (game.player.currentSector === 1) return addAndRender("Already at Sector 1.");
  if (game.player.fuel < 5) return addAndRender("Emergency warp requires 5 fuel.");
  game.player.fuel -= 5;
  game.player.currentSector = 1;
  selectedSectorNumber = 1;
  markSectorVisited(1);
  updateScannerReveals();
  addLog("Emergency warp engaged. Returned to Sector 1 for 5 fuel.");
  saveGame();
  render();
}

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

function renderPort(sector) {
  return `<p><span class="badge">${sector.portType}</span>${sector.hasShipyard ? ` <span class="badge soft-badge">Shipyard</span>` : ""}</p><p class="help-text">${sector.marketNote}</p><p class="help-text"><strong>Trade tip:</strong> ${sector.tradeTip}</p><div class="trade-grid">${RESOURCES.map((resource) => {
    const price = sector.portPrices[resource];
    const buyDisabled = cargoSpaceLeft() <= 0 ? "disabled" : "";
    return `<div class="mini-card"><h3>${resource}</h3><p>Buy ${price.buy} credits · Sell ${price.sell} credits</p><div class="resource-actions">
      <button data-action="buy" data-resource="${resource}" data-amount="1" ${buyDisabled}>Buy 1</button><button data-action="buy" data-resource="${resource}" data-amount="5" ${buyDisabled}>Buy 5</button>
      <button data-action="sell" data-resource="${resource}" data-amount="1">Sell 1</button><button data-action="sell" data-resource="${resource}" data-amount="5">Sell 5</button>
    </div></div>`;
  }).join("")}</div>${renderRepairPanel(sector)}${sector.hasShipyard ? renderShipyardPanel() : ""}`;
}

function renderRepairPanel(sector) {
  const cost = repairCost(sector);
  return `<h3>Repair Service</h3><div class="mini-card">${stat("Hull", `${game.player.hull}/${game.player.maxHull}`)}${stat("Full Repair", `${cost} credits`)}<button data-action="repair" ${cost <= 0 || game.player.credits < cost ? "disabled" : ""}>Repair Hull</button></div>`;
}

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
  return `<div class="fighter-yard mini-card"><h3>Fighter Bay</h3>${stat("Fighters", `${game.player.fighters}/${capacity}`)}${stat("Cost", `${FIGHTER_COST} credits each`)}<div class="button-row"><button data-action="buyFighters" data-amount="1" ${maxAffordable < 1 ? "disabled" : ""}>Buy 1 Fighter</button><button data-action="buyFighters" data-amount="10" ${maxAffordable < 1 ? "disabled" : ""}>Buy 10 Fighters</button><button data-action="buyFighters" data-amount="max" ${maxAffordable < 1 ? "disabled" : ""}>Buy Max Affordable</button></div><p class="help-text">Fighters do not use Ore/Food/Tech cargo space.</p></div>`;
}


function renderPirateEncounterPanel() {
  const pirate = currentPirateEncounter();
  if (!pirate) return "";
  const risk = estimateCombatRisk(pirate);
  const intel = pirateIntelStats(pirate, risk);
  const boardingReady = canBoardPirate(pirate);
  const outmatched = risk.score < 0.72;
  return `<section class="pirate-panel"><h3>Pirate Encounter</h3><p><span class="threat-badge threat-${pirate.threatLevel}">${pirate.name}</span></p><div class="intel-grid">${intel.map(([label, value]) => stat(label, value)).join("")}</div>${outmatched ? `<p class="turn-warning">Warning: your ship is badly outmatched. Retreat is available and combat is optional.</p>` : ""}${game.player.fighters <= 0 && currentShip().basePower < pirate.basePower ? `<p class="turn-warning">Your ship is lightly armed. Buy fighters at a shipyard before challenging strong pirates.</p>` : ""}<div class="button-row"><button class="combat-button" data-action="pirateCombat" data-mode="engage">Engage Pirates</button><button data-action="pirateCombat" data-mode="cautious">Cautious Attack</button><button data-action="pirateCombat" data-mode="retreat">Retreat / Avoid for now</button>${boardingReady ? `<button class="boarding-button" data-action="boardPirate">Board Pirate Ship</button>` : ""}</div><p class="help-text">NPC pirate combat only. Real player targeting and player ship capture are not active.</p></section>`;
}

function pirateIntelStats(pirate, risk = estimateCombatRisk(pirate)) {
  const scanner = game.player.upgrades.scanner || 1;
  const stats = [["Threat Level", scanner <= 1 ? "Unknown" : risk.threatBand], ["Threat Estimate", risk.label]];
  if (scanner >= 2) stats.push(["Bounty", `${pirate.bounty} credits`], ["Reputation Reward", `+${pirate.reputationReward}`]);
  if (scanner >= 3) stats.push(["Pirate Fighters", pirate.fighters], ["Pirate Hull", `${pirate.hull}/${pirate.maxHull}`], ["Pirate Base Power", pirate.basePower]);
  if (scanner >= 4) stats.push(["Likely Outcome", risk.outcome], ["Your Power", risk.playerPower]);
  return stats;
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

function renderPlanet(sector) {
  const planet = getPlanetState(sector);
  if (!planet.owner) return `<h3>${planet.name}</h3><p>This planet is unowned and ready for a peaceful classroom colony.</p><button data-action="claim">Claim Planet</button>`;
  return `<h3>${planet.name}</h3><div class="planet-grid">
    ${stat("Owner", planet.owner)}${stat("Production", `Level ${planet.productionLevel}`)}${stat("Stored Ore", planet.stored.Ore)}${stat("Stored Food", planet.stored.Food)}${stat("Stored Tech", planet.stored.Tech)}
  </div><div class="button-row">
    ${RESOURCES.map((resource) => `<button data-action="deposit" data-resource="${resource}">Deposit ${resource}</button>`).join("")}
    <button data-action="upgradePlanet">Upgrade Production</button><button data-action="collectProduction">Collect Planet Production</button>
  </div><p class="cooldown">${productionStatusText()}</p>`;
}

function renderAsteroid() {
  const disabled = game.player.fuel <= 0 || game.player.turns <= 0 || cargoSpaceLeft() <= 0;
  const sector = sectorMap[game.player.currentSector];
  return `<h3>Asteroid Field</h3><p>Spend 1 turn and 1 fuel to mine Ore. Scanner upgrades improve results.${sector.dangerLevel > 0 ? " Dangerous sectors may damage hull after mining." : ""}</p><button data-action="mine" ${disabled ? "disabled" : ""}>Mine Asteroids</button>${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : game.player.fuel <= 0 ? `<p class="cooldown">Fuel is empty.</p>` : cargoSpaceLeft() <= 0 ? `<p class="cooldown">Cargo is full.</p>` : ""}`;
}

function renderAnomaly() {
  return `<h3>Mysterious Anomaly</h3><p>Spend 1 turn to scan carefully. Better scanners improve your chance of helpful discoveries.</p><button data-action="scan" ${game.player.turns <= 0 ? "disabled" : ""}>Scan Anomaly</button>${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : ""}`;
}

function wireLocationButtons() {
  panels.location.querySelectorAll("[data-action='buy']").forEach((button) => button.addEventListener("click", () => buyResource(button.dataset.resource, Number(button.dataset.amount))));
  panels.location.querySelectorAll("[data-action='sell']").forEach((button) => button.addEventListener("click", () => sellResource(button.dataset.resource, Number(button.dataset.amount))));
  panels.location.querySelector("[data-action='claim']")?.addEventListener("click", claimPlanet);
  panels.location.querySelectorAll("[data-action='deposit']").forEach((button) => button.addEventListener("click", () => depositToPlanet(button.dataset.resource)));
  panels.location.querySelector("[data-action='upgradePlanet']")?.addEventListener("click", upgradePlanet);
  panels.location.querySelector("[data-action='collectProduction']")?.addEventListener("click", collectPlanetProduction);
  panels.location.querySelector("[data-action='mine']")?.addEventListener("click", mineAsteroids);
  panels.location.querySelector("[data-action='scan']")?.addEventListener("click", scanAnomaly);
  panels.location.querySelector("[data-action='repair']")?.addEventListener("click", repairHull);
  panels.location.querySelectorAll("[data-action='buyShip']").forEach((button) => button.addEventListener("click", () => buyShip(button.dataset.ship)));
  panels.location.querySelectorAll("[data-action='buyFighters']").forEach((button) => button.addEventListener("click", () => buyFighters(button.dataset.amount)));
  panels.location.querySelectorAll("[data-action='pirateCombat']").forEach((button) => button.addEventListener("click", () => resolvePirateCombat(button.dataset.mode)));
  panels.location.querySelector("[data-action='boardPirate']")?.addEventListener("click", boardPirateShip);
}

function renderMathMission() {
  const mission = game.currentMission;
  const done = game.missionLocked;
  panels.math.innerHTML = `<h2 id="mathHeading">Math Mission</h2><p><strong>${mission.prompt}</strong></p><p class="help-text">Answer format: ${mission.format}</p>
    <input id="missionAnswer" type="text" autocomplete="off" aria-label="Math mission answer">
    <div class="button-row"><button id="submitMission">Submit Answer</button><button id="stuckMission" ${done ? "disabled" : ""}>I'm Stuck</button>${done ? `<button id="nextMission">Next Mission</button>` : ""}</div>
    <p class="feedback ${game.missionFeedbackClass || ""}">${game.missionFeedback}</p>`;
  document.getElementById("submitMission")?.addEventListener("click", submitMissionAnswer);
  document.getElementById("stuckMission")?.addEventListener("click", () => {
    game.missionFeedback = mission.hint;
    game.missionFeedbackClass = "warn";
    saveGame();
    renderMathMission();
  });
  document.getElementById("nextMission")?.addEventListener("click", () => {
    game.currentMission = generateMission();
    game.missionAttempts = 0;
    game.missionLocked = false;
    game.missionFeedback = "Solve the mission for credits, fuel, turns, or cargo.";
    game.missionFeedbackClass = "";
    saveGame();
    render();
  });
}

function renderMissionPanel() {
  panels.mission.innerHTML = `<h2 id="missionHeading">Mission Board</h2><p class="help-text">Claim completed objectives to receive rewards and open a new contract.</p><div class="mission-grid">${game.activeMissions.map((mission) => {
    const template = missionTemplateById(mission.id);
    const progress = missionProgress(mission);
    const complete = progress >= template.target;
    return `<div class="mission-card ${complete ? "complete" : ""}"><h3>${template.title}</h3><p>${template.objective}</p><p class="progress-text">Progress: ${Math.min(progress, template.target)}/${template.target}</p><p class="reward-text">Reward: ${formatReward(template.reward)}</p><button data-claim-mission="${mission.id}" ${complete ? "" : "disabled"}>Claim Reward</button></div>`;
  }).join("") || `<p class="empty-note">All current single-player board missions are complete.</p>`}</div>`;
  panels.mission.querySelectorAll("[data-claim-mission]").forEach((button) => button.addEventListener("click", () => claimBoardMission(button.dataset.claimMission)));
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
  const upgrades = [
    { key: "cargoHold", label: "Cargo Hold", description: "Increase cargo capacity by 10." },
    { key: "engine", label: "Engine", description: "Increase daily turns and max fuel." },
    { key: "scanner", label: "Scanner", description: "Improve mining, anomaly scans, and sector reveals." },
    { key: "shield", label: "Shield", description: "Reduce hazard damage and improve hull." },
  ];
  const caps = currentShip().upgradeCaps;
  panels.upgrade.innerHTML = `<h2 id="upgradeHeading">Ship Upgrades</h2><div class="upgrade-grid">${upgrades.map((upgrade) => {
    const level = game.player.upgrades[upgrade.key];
    const cost = level * 250;
    const capped = level >= caps[upgrade.key];
    return `<div class="mini-card"><h3>${upgrade.label}</h3><p>${upgrade.description}</p><p>Level ${level}/${caps[upgrade.key]} · Cost ${cost} credits</p><button data-upgrade="${upgrade.key}" ${game.player.credits < cost || capped ? "disabled" : ""}>Upgrade</button></div>`;
  }).join("")}</div>`;
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
  const s = game.stats;
  panels.stats.innerHTML = `<h2 id="statsHeading">Career Stats</h2><details class="compact-section"><summary>Show career stats</summary><div class="stats-grid">
    ${stat("Rank", currentRank())}${stat("Reputation", game.player.reputation)}${stat("Alignment", reputationTitle(game.player.reputation))}${stat("Combat Rank", combatRankTitle())}${stat("Next Combat Rank", nextCombatRankProgress())}${stat("Pirates Defeated", game.player.piratesDefeated)}${stat("Combat Wins", game.player.combatWins)}${stat("Combat Losses", game.player.combatLosses)}${stat("Ships Captured", game.player.shipsCaptured)}${stat("Fighters Lost", game.player.fightersLost || 0)}${stat("Fighters Destroyed", game.player.fightersDestroyed || 0)}${stat("Hull Damage Taken", game.player.playerHullDamageTaken || 0)}${stat("Pirate Hull Damaged", game.player.pirateHullDamageDealt || 0)}${stat("Fighters Bought", game.player.fightersBought || 0)}${stat("Visited Sectors", s.visitedSectors.length)}${stat("Trade Credits", s.creditsEarnedFromTrade)}${stat("Resources Mined", s.resourcesMined)}${stat("Ore Mined", s.oreMined)}${stat("Math Missions", s.mathMissionsCompleted)}${stat("Basic Missions", s.basicMissionsCompleted || 0)}${stat("Standard Missions", s.standardMissionsCompleted || 0)}${stat("Advanced Missions", s.advancedMissionsCompleted || 0)}${stat("Expert Missions", s.expertMissionsCompleted || 0)}${stat("Elite Missions", s.eliteMissionsCompleted || 0)}${stat("Planets Claimed", s.planetsClaimed)}${stat("Anomalies Scanned", s.anomaliesScanned)}${stat("Resources Deposited", s.resourcesDeposited)}${stat("Planet Upgrades", s.planetUpgrades)}${stat("Tech Sold", s.techSold)}${stat("Board Missions", s.missionsClaimed)}${stat("Resources Sold", s.resourcesSold)}
  </div></details>`;
}

function renderLogPanel() {
  panels.log.innerHTML = `<h2 id="logHeading">Recent Captain's Log</h2><ol class="log-list compact-log">${game.log.map((entry) => `<li>${entry}</li>`).join("")}</ol>`;
}

function travelToSector(number) {
  const current = sectorMap[game.player.currentSector];
  if (!current.adjacent.includes(number)) return addAndRender("That sector is not adjacent from here.");
  if (!spendTurn("travel")) return;
  game.player.fuel -= 1;
  game.player.currentSector = number;
  selectedSectorNumber = number;
  markSectorVisited(number);
  addLog(`Traveled to Sector ${number}.`);
  completeTutorialStep("travel");
  resolveSectorDanger(number);
  updateScannerReveals();
  maybeTravelEvent();
  saveGame();
  render();
}

function buyResource(resource, amount) {
  const price = sectorMap[game.player.currentSector].portPrices[resource].buy * amount;
  if (game.player.credits < price) return addAndRender(`Not enough credits to buy ${amount} ${resource}.`);
  if (cargoSpaceLeft() < amount) return addAndRender(`Not enough cargo space for ${amount} ${resource}.`);
  game.player.credits -= price;
  game.player.cargo[resource] += amount;
  addLog(`Bought ${amount} ${resource} for ${price} credits.`);
  completeTutorialStep("buy");
  saveGame();
  render();
}

function sellResource(resource, amount) {
  if (game.player.cargo[resource] < amount) return addAndRender(`Not enough ${resource} to sell ${amount}.`);
  const price = sectorMap[game.player.currentSector].portPrices[resource].sell * amount;
  game.player.cargo[resource] -= amount;
  game.player.credits += price;
  game.stats.creditsEarnedFromTrade += price;
  game.stats.resourcesSold += amount;
  if (resource === "Tech") game.stats.techSold += amount;
  addLog(`Sold ${amount} ${resource} for ${price} credits.`);
  completeTutorialStep("sell");
  saveGame();
  render();
}

function claimPlanet() {
  const sector = sectorMap[game.player.currentSector];
  const planet = getPlanetState(sector);
  if (planet.owner) return;
  planet.owner = game.player.pilotName;
  game.planets[planet.id] = planet;
  game.stats.planetsClaimed += 1;
  addLog(`Claimed planet ${planet.name}.`);
  completeTutorialStep("claim");
  saveGame();
  render();
}

function depositToPlanet(resource) {
  const sector = sectorMap[game.player.currentSector];
  const planet = getPlanetState(sector);
  if (!planet.owner || game.player.cargo[resource] <= 0) return addAndRender(`No ${resource} available to deposit.`);
  game.player.cargo[resource] -= 1;
  planet.stored[resource] += 1;
  game.planets[planet.id] = planet;
  game.stats.resourcesDeposited += 1;
  addLog(`Deposited 1 ${resource} on ${planet.name}.`);
  completeTutorialStep("deposit");
  saveGame();
  render();
}

function upgradePlanet() {
  const planet = getPlanetState(sectorMap[game.player.currentSector]);
  if (planet.stored.Ore < 10 || planet.stored.Food < 10 || planet.stored.Tech < 5) return addAndRender("Planet needs 10 Ore, 10 Food, and 5 Tech stored to upgrade.");
  planet.stored.Ore -= 10;
  planet.stored.Food -= 10;
  planet.stored.Tech -= 5;
  planet.productionLevel += 1;
  game.planets[planet.id] = planet;
  game.stats.planetUpgrades += 1;
  addLog(`Upgraded ${planet.name} to production level ${planet.productionLevel}.`);
  completeTutorialStep("upgradePlanet");
  saveGame();
  render();
}

function collectPlanetProduction() {
  const now = Date.now();
  if (now - game.lastProductionAt < PRODUCTION_COOLDOWN_MS) return addAndRender("Planet production is still cooling down.");
  const owned = Object.values(game.planets).filter((planet) => planet.owner === game.player.pilotName);
  if (owned.length === 0) return addAndRender("Claim a planet before collecting production.");
  owned.forEach((planet) => {
    planet.stored.Ore += planet.productionLevel;
    planet.stored.Food += planet.productionLevel;
    planet.stored.Tech += Math.floor(planet.productionLevel / 2);
  });
  game.lastProductionAt = now;
  addLog(`Collected production from ${owned.length} owned planet${owned.length === 1 ? "" : "s"}.`);
  completeTutorialStep("collectProduction");
  saveGame();
  render();
}

function mineAsteroids() {
  if (cargoSpaceLeft() <= 0) return addAndRender("Cargo is full. Sell or deposit resources before mining.");
  if (!spendTurn("mine")) return;
  game.player.fuel -= 1;
  const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * (3 + game.player.upgrades.scanner)));
  game.player.cargo.Ore += amount;
  game.stats.resourcesMined += amount;
  game.stats.oreMined += amount;
  addLog(`Mined ${amount} Ore from the asteroid field.`);
  completeTutorialStep("mine");
  resolveSectorDanger(game.player.currentSector);
  saveGame();
  render();
}

function scanAnomaly() {
  if (!spendTurn("scan")) return;
  const scanner = game.player.upgrades.scanner;
  const roll = Math.random() + scanner * 0.05;
  game.stats.anomaliesScanned += 1;
  completeTutorialStep("scan");
  if (roll < 0.16) {
    game.player.fuel = Math.max(0, game.player.fuel - 1);
    addLog("Anomaly scan drained 1 fuel, but the ship is fine.");
  } else if (roll < 0.38) {
    addLog("Anomaly message: Patterns become clearer when you slow down.");
  } else if (roll < 0.62) {
    const fuel = 2 + Math.floor(Math.random() * 4);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    addLog(`Anomaly released ${fuel} fuel.`);
  } else if (roll < 0.84) {
    const credits = 40 + Math.floor(Math.random() * 81);
    game.player.credits += credits;
    addLog(`Anomaly data sold for ${credits} credits.`);
  } else {
    const tech = Math.min(cargoSpaceLeft(), 1 + Math.floor(scanner / 2));
    if (tech > 0) game.player.cargo.Tech += tech;
    addLog(tech > 0 ? `Anomaly yielded ${tech} Tech.` : "Anomaly found Tech, but cargo was full.");
  }
  resolveSectorDanger(game.player.currentSector);
  saveGame();
  render();
}

function repairHull() {
  const sector = sectorMap[game.player.currentSector];
  const cost = repairCost(sector);
  if (cost <= 0) return addAndRender("Hull is already fully repaired.");
  if (game.player.credits < cost) return addAndRender("Not enough credits for full repairs.");
  game.player.credits -= cost;
  game.player.hull = game.player.maxHull;
  addLog(`Repair service restored hull for ${cost} credits.`);
  saveGame();
  render();
}

function buyShip(shipId) {
  const ship = SHIPS[shipId];
  if (!ship) return;
  const owned = game.player.ownedShips.includes(ship.id);
  const lock = shipUnlockStatus(ship);
  if (!owned && !lock.unlocked) return addAndRender(`${ship.name} is locked: ${lock.reason}`);
  const cappedUpgrades = capUpgradesForShip(game.player.upgrades, ship);
  const nextCapacity = calculateCargoCapacity(ship, cappedUpgrades);
  if (cargoUsed() > nextCapacity) return addAndRender(`${ship.name} cannot hold your current cargo. Sell, deposit, or dump cargo before changing ships.`);
  if (!owned && game.player.credits < ship.price) return addAndRender(`Not enough credits to buy ${ship.name}.`);
  if (!owned) {
    game.player.credits -= ship.price;
    game.player.ownedShips.push(ship.id);
  }
  game.player.shipId = ship.id;
  game.player.shipName = ship.name;
  game.player.upgrades = cappedUpgrades;
  game.player.legacyUpgradeOverride = false;
  game.player.maxFuel = calculateFuelCapacity(ship, game.player.upgrades);
  game.player.maxHull = ship.maxHull + Math.max(0, game.player.upgrades.shield - 1) * 4;
  game.player.cargoCapacity = nextCapacity;
  game.player.fighterCapacity = calculateFighterCapacity(ship, game.player.upgrades);
  game.player.fighters = Math.min(game.player.fighters, game.player.fighterCapacity);
  game.player.maxTurns = calculateMaxTurns(game.player.upgrades.engine);
  game.player.fuel = Math.min(game.player.fuel, game.player.maxFuel);
  game.player.hull = Math.min(game.player.hull, game.player.maxHull);
  game.player.turns = Math.min(game.player.turns, game.player.maxTurns);
  addLog(`${owned ? "Switched to" : "Purchased"} ${ship.name}.`);
  updateScannerReveals();
  saveGame();
  render();
}

function submitMissionAnswer() {
  const input = document.getElementById("missionAnswer").value.trim();
  if (handleDevCode(input)) return;
  if (game.missionLocked) {
    game.missionFeedback = "Mission is locked. Use Next Mission to continue.";
    game.missionFeedbackClass = "locked";
    saveGame();
    renderMathMission();
    return;
  }
  const mission = game.currentMission;
  if (applyDevCode(input)) return;
  if (mission.check(input)) {
    awardMissionReward();
    game.stats.mathMissionsCompleted += 1;
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
    game.player.turns = game.player.maxTurns;
    game.player.fuel = game.player.maxFuel;
    game.player.credits += 2000;
    game.player.hull = game.player.maxHull;
    game.missionFeedback = "Dev code accepted. Testing resources granted.";
    game.missionFeedbackClass = "correct";
    addLog("Dev code 9999 applied: turns, fuel, credits, and hull restored for testing.");
    saveGame();
    render();
    return true;
  }
  if (code === "6767") {
    const added = { Ore: 10, Food: 10, Tech: 10 };
    RESOURCES.forEach((resource) => { game.player.cargo[resource] += added[resource]; });
    let overflow = Math.max(0, cargoUsed() - game.player.cargoCapacity);
    let jettisoned = 0;
    let newlyAddedJettisoned = 0;
    RESOURCES.forEach((resource) => {
      if (overflow <= 0) return;
      const removed = Math.min(game.player.cargo[resource], added[resource], overflow);
      game.player.cargo[resource] -= removed;
      overflow -= removed;
      jettisoned += removed;
      newlyAddedJettisoned += removed;
    });
    RESOURCES.forEach((resource) => {
      if (overflow <= 0) return;
      const removed = Math.min(game.player.cargo[resource], overflow);
      game.player.cargo[resource] -= removed;
      overflow -= removed;
      jettisoned += removed;
    });
    const kept = Math.max(0, 30 - newlyAddedJettisoned);
    game.missionFeedback = jettisoned > 0 ? "Dev code accepted. Added test resources; overflow was jettisoned." : "Dev code accepted. Added 10 of each resource.";
    game.missionFeedbackClass = "correct";
    addLog(`Dev code 6767 applied: added test resources. Kept ${kept} unit${kept === 1 ? "" : "s"}; cargo overflow jettisoned ${jettisoned} unit${jettisoned === 1 ? "" : "s"}.`);
    saveGame();
    render();
    return true;
  }
  if (code === "8888") {
    game.player.fighterCapacity = calculateFighterCapacity(currentShip(), game.player.upgrades);
    game.player.fighters = game.player.fighterCapacity;
    game.player.hull = game.player.maxHull;
    game.player.credits += 1000;
    game.missionFeedback = "Dev code accepted. Combat test systems loaded.";
    game.missionFeedbackClass = "correct";
    addLog("Dev code 8888 applied: fighters filled, hull restored, and 1000 credits added.");
    saveGame();
    render();
    return true;
  }
  return false;
}

function missionBank() {
  return [
    { id: "linear-1", prompt: "Solve for x: 3x + 7 = 22", format: "number", answers: ["5"], hint: "Subtract 7 first, then divide by 3.", explanation: "3x + 7 = 22 → 3x = 15 → x = 5." },
    { id: "function-1", prompt: "Evaluate f(4) if f(x) = 2x² - 3", format: "number", answers: ["29"], hint: "Replace x with 4 before using the exponent.", explanation: "2(4²) - 3 = 32 - 3 = 29." },
    { id: "domain-1", prompt: "For g(x)=1/(x-6), what value is not in the domain?", format: "number", answers: ["6"], hint: "The denominator cannot equal 0.", explanation: "x - 6 cannot be 0, so x cannot be 6." },
    { id: "factor-1", prompt: "Factor: x² + 5x + 6", format: "type factors like (x+2)(x+3)", answers: ["(x+2)(x+3)", "(x+3)(x+2)"], hint: "Find two numbers that multiply to 6 and add to 5.", explanation: "2 and 3 multiply to 6 and add to 5, so the factors are (x+2)(x+3)." },
    { id: "slope-1", prompt: "Find the slope through (2, 5) and (6, 13).", format: "number", answers: ["2"], hint: "Use change in y divided by change in x.", explanation: "(13 - 5) / (6 - 2) = 8 / 4 = 2." },
    { id: "exponent-1", prompt: "Simplify: x³ · x⁴", format: "power form like x^7", answers: ["x^7", "x7"], hint: "When multiplying powers with the same base, add exponents.", explanation: "x³ · x⁴ = x^(3+4) = x^7." },
  ];
}

function rehydrateMission(savedMission) {
  const bank = missionBank();
  const base = savedMission?.id ? bank.find((mission) => mission.id === savedMission.id) : null;
  return attachMissionChecker(base || bank[Math.floor(Math.random() * bank.length)]);
}

function generateMission() {
  const missions = missionBank();
  return attachMissionChecker(missions[Math.floor(Math.random() * missions.length)]);
}

function attachMissionChecker(base) {
  return { ...base, check: (answer) => base.answers.some((valid) => normalize(answer) === normalize(valid)) };
}

function applyDevCode(input) {
  if (normalize(input) === "8888") {
    game.player.fighterCapacity = calculateFighterCapacity(currentShip(), game.player.upgrades);
    game.player.fighters = game.player.fighterCapacity;
    game.player.hull = game.player.maxHull;
    game.player.credits += 1000;
    game.missionFeedback = "Combat testing systems loaded.";
    game.missionFeedbackClass = "correct";
    addLog("Dev code 8888 applied: combat testing systems loaded.");
    saveGame();
    render();
    return true;
  }
  if (normalize(input) === "9999") {
    game.player.credits += 1000;
    game.player.fuel = game.player.maxFuel;
    game.player.turns = game.player.maxTurns;
    addLog("Dev code 9999 applied: credits, fuel, and turns restored.");
    saveGame();
    render();
    return true;
  }
  if (normalize(input) === "6767") {
    game.player.upgrades.scanner = Math.min(currentShip().upgradeCaps.scanner, Math.max(game.player.upgrades.scanner, 4));
    updateScannerReveals();
    addLog("Dev code 6767 applied: scanner test mode enabled.");
    saveGame();
    render();
    return true;
  }
  return false;
}

function awardMissionReward() {
  const roll = Math.random();
  if (roll < 0.34) {
    const credits = 50 + Math.floor(Math.random() * 71);
    game.player.credits += credits;
    game.missionFeedback = `Correct. Awarded ${credits} credits.`;
    addLog(`Correct mission answer. Awarded ${credits} credits.`);
  } else if (roll < 0.62) {
    const fuel = 2 + Math.floor(Math.random() * 4) + Math.floor(game.player.upgrades.engine / 3);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    game.missionFeedback = `Correct. Awarded ${fuel} fuel.`;
    addLog(`Correct mission answer. Awarded ${fuel} fuel.`);
  } else if (roll < 0.82) {
    const turns = 1 + Math.floor(Math.random() * 3);
    game.player.turns = Math.min(game.player.maxTurns, game.player.turns + turns);
    game.missionFeedback = `Correct. Awarded ${turns} bonus turn${turns === 1 ? "" : "s"}.`;
    addLog(`Correct mission answer. Awarded ${turns} bonus turn${turns === 1 ? "" : "s"}.`);
  } else {
    const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * 3));
    if (amount > 0) game.player.cargo[resource] += amount;
    game.missionFeedback = amount > 0 ? `Correct. Awarded ${amount} ${resource}.` : "Correct. Cargo is full, so you received 60 credits instead.";
    if (amount === 0) game.player.credits += 60;
    addLog(amount > 0 ? `Correct mission answer. Awarded ${amount} ${resource}.` : "Correct mission answer. Cargo full, awarded 60 credits.");
  }
}

function upgradeShip(key) {
  const caps = currentShip().upgradeCaps;
  if (game.player.upgrades[key] >= caps[key]) return addAndRender(`${titleCase(key.replace(/([A-Z])/g, " $1"))} is at this ship's cap.`);
  const cost = game.player.upgrades[key] * 250;
  if (game.player.credits < cost) return;
  game.player.credits -= cost;
  game.player.upgrades[key] += 1;
  if (key === "cargoHold") game.player.cargoCapacity = calculateCargoCapacity(currentShip(), game.player.upgrades);
  if (key === "engine") {
    game.player.maxFuel = calculateFuelCapacity(currentShip(), game.player.upgrades);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + 2);
    game.player.maxTurns = calculateMaxTurns(game.player.upgrades.engine);
  }
  if (key === "scanner") updateScannerReveals();
  if (key === "shield") {
    game.player.maxHull = currentShip().maxHull + Math.max(0, game.player.upgrades.shield - 1) * 4;
    game.player.hull = Math.min(game.player.maxHull, game.player.hull + 4);
  }
  addLog(`Upgraded ${titleCase(key.replace(/([A-Z])/g, " $1"))} to level ${game.player.upgrades[key]}.`);
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
    { id: "sell-tech-5", title: "Circuit Broker", objective: "Sell 5 Tech.", metric: "techSold", target: 5, reward: { credits: 180, fuel: 3 } },
    { id: "credits-1000", title: "Four-Digit Ledger", objective: "Reach 1000 credits.", metric: "credits", target: 1000, reward: { turns: 4, fuel: 4 } },
    { id: "pirate-1", title: "Local Bounty", objective: "Defeat 1 NPC pirate.", metric: "piratesDefeated", target: 1, reward: { credits: 220, reputation: 3 } },
    { id: "pirate-3", title: "Lane Security Sweep", objective: "Defeat 3 NPC pirates.", metric: "piratesDefeated", target: 3, reward: { credits: 500, turns: 3, reputation: 5 } },
    { id: "combat-wins-2", title: "Combat Drill", objective: "Win 2 NPC combats.", metric: "combatWins", target: 2, reward: { fighters: 6, fuel: 3 } },
    { id: "board-pirate-1", title: "Boarding Practice", objective: "Board 1 NPC pirate ship.", metric: "shipsCaptured", target: 1, reward: { credits: 350, reputation: 4 } },
    { id: "rep-25", title: "Deputy Commission", objective: "Reach reputation 25.", metric: "reputation", target: 25, reward: { credits: 400, turns: 2 } },
    { id: "fighters-10", title: "Ready the Bay", objective: "Buy 10 fighters.", metric: "fightersBought", target: 10, reward: { credits: 120, fuel: 2 } },
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
  if (game.player.fighters > game.player.fighterCapacity) { game.player.fighters = game.player.fighterCapacity; changed = true; }
  if (game.player.maxHull !== nextMaxHull) { game.player.maxHull = nextMaxHull; changed = true; }
  if (game.player.turns > game.player.maxTurns) { game.player.turns = game.player.maxTurns; changed = true; }
  if (game.player.fuel > game.player.maxFuel) { game.player.fuel = game.player.maxFuel; changed = true; }
  if (game.player.hull > game.player.maxHull) { game.player.hull = game.player.maxHull; changed = true; }
  if (JSON.stringify(game.stats.visitedSectors) !== JSON.stringify(normalizeSectorList(game.stats.visitedSectors, game.player.currentSector))) {
    game.stats.visitedSectors = normalizeSectorList(game.stats.visitedSectors, game.player.currentSector);
    changed = true;
  }
  game.activeMissions.forEach((mission) => {
    const template = missionTemplateById(mission.id);
    if (!mission.readyLogged && missionProgress(mission) >= template.target) {
      mission.readyLogged = true;
      addLog(`Mission complete: ${template.title}. Claim the reward from the Mission Board.`);
      changed = true;
    }
  });
  refreshCombatIdentity(game);
  syncCombatStats(game);
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
    { id: "cargo-goblin", title: "Cargo Goblin", description: "Reach cargo capacity 40 or higher.", check: () => game.player.cargoCapacity >= 40 },
    { id: "planet-builder", title: "Planet Builder", description: "Upgrade any planet to level 3.", check: () => Object.values(game.planets).some((planet) => planet.productionLevel >= 3) },
    { id: "credit-climber", title: "Credit Climber", description: "Reach 2000 credits.", check: () => game.player.credits >= 2000 },
    { id: "sector-scout", title: "Sector Scout", description: "Visit 15 unique sectors.", check: () => game.stats.visitedSectors.length >= 15 },
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
  return Math.round((ship.basePower + game.player.fighters * 1.15 + shield + scanner) * hullRatio);
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
  let threatBand = "severe";
  if (pirate.threatLevel <= 2 && score >= 0.85) threatBand = "low";
  else if (pirate.threatLevel <= 3 || score >= 0.72) threatBand = "moderate";
  let outcome = "Outmatched";
  if (score >= 1.35) outcome = "You have the advantage";
  else if (score >= 0.95) outcome = "Even fight";
  else if (score >= 0.68) outcome = "Dangerous";
  let label = "Threat estimate: unclear.";
  if (scanner === 2) label = `Threat estimate: ${threatBand}.`;
  else if (scanner === 3) label = `Threat estimate: ${threatBand}; enemy profile partially resolved.`;
  else if (scanner >= 4) label = `${outcome}.`;
  return { score, label, threatBand, outcome, playerPower, piratePower };
}

function resolvePirateCombat(mode = "engage") {
  const pirate = currentPirateEncounter();
  if (!pirate) return addAndRender("No active NPC pirate encounter in this sector.");
  if (mode === "retreat") {
    if (Math.random() < RETREAT_DAMAGE_RISK && pirate.fighters > game.player.fighters + 10) {
      applyCombatDamage(0, 2, "retreat");
      addLog(`Retreated from ${pirate.name}; evasive maneuvers cost 2 hull.`);
    } else {
      addLog(`Retreated from ${pirate.name}. You can return when ready.`);
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
    defeatPirate(pirate, "routed", { ...damageReport, pirateFightersLost: pirate.fighters });
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
  return {
    nextValue: Math.max(0, current - actualLoss),
    actualLoss,
  };
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
  game.player.credits += bounty;
  addReputation(reputationGain);
  game.player.piratesDefeated += 1;
  game.player.combatWins += 1;
  game.player.fightersDestroyed = (game.player.fightersDestroyed || 0) + fighterReport.actualLoss;
  game.player.pirateHullDamageDealt = (game.player.pirateHullDamageDealt || 0) + hullReport.actualLoss;
  syncCombatStats(game);
  const lost = report.fightersLost ?? 0;
  const hull = report.hullDamage ?? 0;
  addLog(`Combat report: ${verb} ${pirate.name}. Lost ${lost} fighter${lost === 1 ? "" : "s"}, destroyed ${fighterReport.actualLoss} pirate fighter${fighterReport.actualLoss === 1 ? "" : "s"}, took ${hull} hull damage, earned ${bounty} credits and +${reputationGain} reputation.`);
}

function loseCombatToPirates(pirate, cautious = false) {
  const fighterLoss = Math.min(game.player.fighters, Math.ceil((pirate.fighters * (cautious ? 0.24 : 0.38)) + pirate.threatLevel));
  const hullDamage = Math.max(2, Math.ceil((pirate.basePower + pirate.threatLevel * 3) / (cautious ? 6 : 4)) - Math.floor((game.player.upgrades.shield || 1) / 2));
  applyCombatDamage(fighterLoss, hullDamage, "loss");
  game.player.combatLosses += 1;
  syncCombatStats(game);
  addLog(`Defeat: ${pirate.name} routed your attack. Repair, buy fighters, or retreat to safer lanes.`);
}

function canBoardPirate(pirate = currentPirateEncounter()) {
  if (!pirate || pirate.defeated || !pirate.npcOnly) return false;
  return pirate.hull <= BOARDING_HULL_THRESHOLD && pirate.fighters <= BOARDING_MAX_PIRATE_FIGHTERS && game.player.hull > BOARDING_HULL_THRESHOLD && (game.player.fighters >= 1 || currentShip().basePower >= 18);
}

function boardPirateShip() {
  const pirate = currentPirateEncounter();
  if (!canBoardPirate(pirate)) return addAndRender("Boarding is not available until this NPC pirate ship is disabled and its fighters are nearly gone.");
  const chance = Math.max(0.18, Math.min(0.9, 0.45 + game.player.fighters * 0.01 + (game.player.upgrades.scanner || 1) * 0.04 + currentShip().basePower * 0.01 + (currentShip().boardingBonus || 0) * 0.04 - pirate.fighters * 0.04 - pirate.threatLevel * 0.07));
  if (Math.random() <= chance) {
    const bonus = 80 + pirate.threatLevel * 45;
    game.player.credits += bonus;
    addReputation(Math.ceil(pirate.reputationReward / 2));
    game.player.shipsCaptured += 1;
    defeatPirate(pirate, "boarded and secured", { fightersLost: 0, hullDamage: 0, pirateFightersLost: pirate.fighters });
    addLog(`Boarding success: recovered ${bonus} bonus credits, bonus reputation, salvage notes, and a captured pirate tech note for future systems.`);
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

function clampReputation(value) {
  return Math.max(-100, Math.min(100, Math.round(Number(value) || 0)));
}

function addReputation(amount) {
  const change = Math.round(Number(amount) || 0);
  game.player.reputation = clampReputation((game.player.reputation || 0) + change);
  if (change > 0) game.player.lawfulReputation = (game.player.lawfulReputation || 0) + change;
  if (change < 0) game.player.pirateReputation = (game.player.pirateReputation || 0) + Math.abs(change);
  refreshCombatIdentity(game);
  return change;
}

function combatRankTitle(player = game.player) {
  const rep = player.reputation || 0;
  const defeated = player.piratesDefeated || 0;
  const wins = player.combatWins || 0;
  const captured = player.shipsCaptured || 0;
  if (rep >= 90 && defeated >= 25) return "Star Marshal";
  if (rep >= 75 && defeated >= 18) return "Marshal";
  if (rep >= 60 && defeated >= 12) return "Sector Defender";
  if (rep >= 40 && defeated >= 8) return "Lane Guard";
  if (rep >= 25 && defeated >= 5) return "Deputy Pilot";
  if (rep >= 10 || defeated >= 2 || wins >= 2 || captured >= 1) return "Patrol Volunteer";
  return "Civilian Pilot";
}

function nextCombatRankProgress(player = game.player) {
  const rep = player.reputation || 0;
  const defeated = player.piratesDefeated || 0;
  const ranks = [
    { name: "Patrol Volunteer", text: "10 reputation or 2 pirates defeated", met: rep >= 10 || defeated >= 2 },
    { name: "Deputy Pilot", text: "25 reputation and 5 pirates defeated", met: rep >= 25 && defeated >= 5 },
    { name: "Lane Guard", text: "40 reputation and 8 pirates defeated", met: rep >= 40 && defeated >= 8 },
    { name: "Sector Defender", text: "60 reputation and 12 pirates defeated", met: rep >= 60 && defeated >= 12 },
    { name: "Marshal", text: "75 reputation and 18 pirates defeated", met: rep >= 75 && defeated >= 18 },
    { name: "Star Marshal", text: "90 reputation and 25 pirates defeated", met: rep >= 90 && defeated >= 25 },
  ];
  const next = ranks.find((rank) => !rank.met);
  return next ? `${next.name}: ${next.text}` : "All lawful ranks unlocked";
}

function refreshCombatIdentity(targetGame = game) {
  targetGame.player.reputation = clampReputation(targetGame.player.reputation || 0);
  targetGame.player.alignmentStatus = reputationTitle(targetGame.player.reputation);
  targetGame.player.combatRank = combatRankTitle(targetGame.player);
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

function combatRankMeets(requiredRank) {
  if (!requiredRank) return false;
  const ranks = ["Civilian Pilot", "Patrol Volunteer", "Deputy Pilot", "Lane Guard", "Sector Defender", "Marshal", "Star Marshal"];
  return ranks.indexOf(combatRankTitle()) >= ranks.indexOf(requiredRank);
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
  targetGame.stats.piratesDefeated = targetGame.player.piratesDefeated || 0;
  targetGame.stats.combatWins = targetGame.player.combatWins || 0;
  targetGame.stats.combatLosses = targetGame.player.combatLosses || 0;
  targetGame.stats.shipsCaptured = targetGame.player.shipsCaptured || 0;
  targetGame.stats.fightersLost = targetGame.player.fightersLost || 0;
  targetGame.stats.fightersDestroyed = targetGame.player.fightersDestroyed || 0;
  targetGame.stats.fightersBought = targetGame.player.fightersBought || 0;
  targetGame.stats.playerHullDamageTaken = targetGame.player.playerHullDamageTaken || 0;
  targetGame.stats.pirateHullDamageDealt = targetGame.player.pirateHullDamageDealt || 0;
  targetGame.stats.reputation = targetGame.player.reputation || 0;
  targetGame.stats.alignmentStatus = targetGame.player.alignmentStatus || reputationTitle(targetGame.player.reputation || 0);
  targetGame.stats.combatRank = targetGame.player.combatRank || combatRankTitle(targetGame.player);
}

// Future PvP TODO only — do not build until Firebase multiplayer and teacher controls exist.
// Requirements for that future system: teacher PvP on/off toggle; safe zones with no PvP;
// no PvP near Sector 1; reputation loss for attacking lawful players; reputation gain for
// defeating pirates/outlaws; boarding/capture only below 5 hull; defeated players eject to
// Sector 1; defeated players keep owned planets; defeated players lose active ship/cargo and
// most carried cash; emergency replacement ship assigned; teacher reset/restore tools. No
// real player targeting, player ship capture, Firebase, or multiplayer combat is implemented
// in this NPC-only version.

function maybeTravelEvent() {
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
  if (game.player.turns <= 0) {
    addAndRender("Out of turns. Complete missions for bonus turns or return tomorrow.");
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
  const resist = currentShip().hazardResist + Math.max(0, game.player.upgrades.shield - 1);
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
  if (reward.fighters) {
    const amount = Math.min(Math.max(0, game.player.fighterCapacity - game.player.fighters), reward.fighters);
    game.player.fighters += amount;
  }
  RESOURCES.forEach((resource) => {
    if (!reward[resource]) return;
    const amount = Math.min(cargoSpaceLeft(), reward[resource]);
    if (amount > 0) game.player.cargo[resource] += amount;
  });
  syncCombatStats(game);
}

function formatReward(reward) {
  const parts = [];
  if (reward.credits) parts.push(`${reward.credits} credits`);
  if (reward.fuel) parts.push(`${reward.fuel} fuel`);
  if (reward.turns) parts.push(`${reward.turns} turns`);
  if (reward.fighters) parts.push(`${reward.fighters} fighters if bay space allows`);
  if (reward.reputation) parts.push(`+${reward.reputation} reputation`);
  RESOURCES.forEach((resource) => { if (reward[resource]) parts.push(`${reward[resource]} ${resource}`); });
  return parts.join(", ");
}

function refreshDailyTurns() {
  const today = todayKey();
  game.player.maxTurns = calculateMaxTurns(game.player.upgrades.engine);
  if (game.player.lastTurnRefreshDate !== today) {
    game.player.turns = game.player.maxTurns;
    game.player.lastTurnRefreshDate = today;
    addLog(`Daily turns refreshed to ${game.player.maxTurns}.`);
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

function calculateCargoCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.cargoCapacity + Math.max(0, (upgrades.cargoHold || 1) - 1) * 10; }
function calculateFuelCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.maxFuel + Math.max(0, (upgrades.engine || 1) - 1) * 4; }
function calculateFighterCapacity(ship = currentShip(), upgrades = game.player.upgrades) { return ship.fighterCapacity + Math.max(0, (upgrades.shield || 1) - 1) * 5; }
function calculateMaxTurns(engineLevel) { return BASE_MAX_TURNS + Math.max(0, engineLevel - 1) * 3; }
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
function getPlanetState(sector) { return game.planets[sector.planet.id] || JSON.parse(JSON.stringify(sector.planet)); }
function productionStatusText() {
  if (!game.lastProductionAt) return "Production is ready. Cooldown starts after collection.";
  const remaining = PRODUCTION_COOLDOWN_MS - (Date.now() - game.lastProductionAt);
  if (remaining <= 0) return "Production is ready to collect.";
  return `Production cooldown: ${Math.ceil(remaining / 60000)} minute(s) remaining.`;
}
function cargoUsed() { return RESOURCES.reduce((sum, resource) => sum + (game.player.cargo[resource] || 0), 0); }
function cargoSpaceLeft() { return game.player.cargoCapacity - cargoUsed(); }
function stat(label, value) { return `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`; }
function titleCase(text) { return String(text).replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, "").replace(/\*+/g, ""); }
function addAndRender(message) { addLog(message); saveGame(); render(); }

// Future multiplayer: teacher dashboard actions such as class reset, roster summaries,
// progress review, and mission support would connect here in a later server-backed version.


if (typeof globalThis !== "undefined" && globalThis.__SECTOR_DRIFT_ENABLE_TEST_HOOKS__ === true) {
  globalThis.sectorDriftTestHooks = {
    SHIPS,
    createPirateEncounters,
    defaultGameState,
    migrateGameState,
    missionTemplates,
    nextAvailableMission,
    reputationTitle,
    combatRankTitle,
    shipUnlockStatus,
    canBoardPirate,
    getPlayerCombatPower,
    getPirateCombatPower,
    estimateCombatRisk,
    pirateIntelStats,
    applyBoundedLoss,
    applyCombatDamage,
    applyPirateCombatDamage,
    setGameForTest(nextGame) {
      game = nextGame;
      selectedSectorNumber = game.player.currentSector;
      return game;
    },
    getGameForTest() {
      return game;
    },
    addReputation,
    defeatPirate,
    buyShip,
    buyFighters,
    handleDevCode,
    resolvePirateCombat,
    emergencyWarp,
    cargoUsed,
    createActiveMission,
  };
}
