const STORAGE_KEY = "sectorDriftSaveV1";
const PRODUCTION_COOLDOWN_MS = 10 * 60 * 1000;
const RESOURCES = ["Ore", "Food", "Tech"];
const MAX_SECTOR = 50;
const HAZARD_TYPES = ["debris field", "unstable anomaly", "radiation pocket", "plasma storm", "minefield wreckage", "pirate wreck zone"];

const SHIPS = {
  rustyComet: {
    shipId: "rustyComet",
    name: "Rusty Comet",
    description: "Starter ship: cheap, balanced, and reliable, but limited once deep-space routes get dangerous.",
    basePrice: 0,
    maxHull: 70,
    baseFuelCapacity: 20,
    baseCargoCapacity: 20,
    hazardResistance: 0,
    upgradeCaps: { cargoHold: 3, engine: 3, scanner: 2, shield: 2 },
  },
  sparrowScout: {
    shipId: "sparrowScout",
    name: "Sparrow Scout",
    description: "Fast explorer with excellent scanners and engines, but a small cargo frame.",
    basePrice: 1200,
    maxHull: 82,
    baseFuelCapacity: 26,
    baseCargoCapacity: 16,
    hazardResistance: 1,
    upgradeCaps: { cargoHold: 2, engine: 5, scanner: 5, shield: 3 },
  },
  muleHauler: {
    shipId: "muleHauler",
    name: "Mule Hauler",
    description: "Bulk trader with huge holds and steady armor, best for profitable port-to-port routes.",
    basePrice: 1800,
    maxHull: 100,
    baseFuelCapacity: 22,
    baseCargoCapacity: 35,
    hazardResistance: 1,
    upgradeCaps: { cargoHold: 5, engine: 3, scanner: 2, shield: 4 },
  },
  rockhogMiner: {
    shipId: "rockhogMiner",
    name: "Rockhog Miner",
    description: "Rugged asteroid worker with strong hull plating and useful cargo space.",
    basePrice: 2400,
    maxHull: 125,
    baseFuelCapacity: 24,
    baseCargoCapacity: 30,
    hazardResistance: 2,
    upgradeCaps: { cargoHold: 4, engine: 3, scanner: 3, shield: 4 },
  },
  frontierSkiff: {
    shipId: "frontierSkiff",
    name: "Frontier Skiff",
    description: "Expensive all-rounder tuned for risky routes without making specialist ships obsolete.",
    basePrice: 3600,
    maxHull: 115,
    baseFuelCapacity: 30,
    baseCargoCapacity: 28,
    hazardResistance: 3,
    upgradeCaps: { cargoHold: 4, engine: 5, scanner: 5, shield: 5 },
  },
};

let sectorMap = createSectorMap();
let game = loadGame();

const panels = {};

document.addEventListener("DOMContentLoaded", () => {
  panels.ship = document.getElementById("shipPanel");
  panels.map = document.getElementById("mapPanel");
  panels.sector = document.getElementById("sectorPanel");
  panels.location = document.getElementById("locationPanel");
  panels.math = document.getElementById("mathPanel");
  panels.upgrade = document.getElementById("upgradePanel");
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

  render();
});

function createSectorMap() {
  // Future multiplayer: load shared sector map from a database here.
  const typeCycle = ["empty", "port", "planet", "asteroid", "anomaly", "empty", "planet", "port", "asteroid", "empty"];
  const planetNames = ["Emberfall", "Quiet Vesta", "Blue Rook", "Juniper Moon", "Cinder Vale", "New Lumen", "Frost Harbor", "Copperleaf", "Aster Well", "Kindle Rest"];
  const sectors = {};

  for (let number = 1; number <= MAX_SECTOR; number += 1) {
    const adjacent = new Set();
    if (number > 1) adjacent.add(number - 1);
    if (number < MAX_SECTOR) adjacent.add(number + 1);

    const jumpA = ((number * 7) % MAX_SECTOR) + 1;
    const jumpB = ((number * 13 + 5) % MAX_SECTOR) + 1;
    if (jumpA !== number) adjacent.add(jumpA);
    if (number % 5 === 0 && jumpB !== number) adjacent.add(jumpB);

    let type = typeCycle[(number * 3 + 1) % typeCycle.length];
    if (number === 1) type = "port";
    const dangerLevel = createDangerLevel(number, type);
    const hazardType = dangerLevel > 0 ? HAZARD_TYPES[stableNumber(number, 6, 5) % HAZARD_TYPES.length] : null;

    sectors[number] = {
      number,
      adjacent: Array.from(adjacent).sort((a, b) => a - b),
      type,
      dangerLevel,
      hazardType,
      coordinates: createSectorCoordinates(number),
      flavor: getSectorFlavor(type, number),
      objects: getSectorObjects(type, number, hazardType),
    };

    if (type === "port") Object.assign(sectors[number], createPortEconomy(number));
    if (type === "planet") sectors[number].planet = {
      id: `planet-${number}`,
      name: planetNames[number % planetNames.length],
      owner: null,
      productionLevel: 1,
      stored: { Ore: 0, Food: 0, Tech: 0 },
    };
  }

  Object.values(sectors).forEach((sector) => {
    sector.adjacent.forEach((neighbor) => sectors[neighbor].adjacent = Array.from(new Set([...sectors[neighbor].adjacent, sector.number])).sort((a, b) => a - b));
  });

  return sectors;
}

function createSectorCoordinates(number) {
  const angle = number * 2.399963;
  const radius = 36 + number * 7;
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius),
  };
}

function createDangerLevel(number, type) {
  if (number === 1 || type === "port") return 0;
  const roll = stableNumber(number, 100, 11);
  const typeBonus = { empty: 0, planet: 0, asteroid: 10, anomaly: 18 }[type] || 0;
  const score = roll + typeBonus;
  if (score >= 94) return 3;
  if (score >= 75) return 2;
  if (score >= 48) return 1;
  return 0;
}

function createPortEconomy(number) {
  const portTypes = ["Mining Port", "Agri Port", "Tech Port", "Frontier Port", "Core Port"];
  const portType = number === 1 ? "Core Port" : portTypes[(number * 17 + Math.floor(number / 10) * 11) % portTypes.length];
  const local = 0.92 + stableNumber(number, 17, 7) / 100;
  const demand = 0.9 + stableNumber(number, 21, 13) / 100;
  const spread = portType === "Frontier Port" ? 0.72 + stableNumber(number, 42, 19) / 100 : 1;
  const profiles = {
    "Mining Port": {
      marketNote: "Ore surplus · Food and Tech demand high",
      tradeTip: "This port sells Ore cheaply. Food and Tech sell well here.",
      buy: { Ore: 8, Food: 14, Tech: 42 },
      sell: { Ore: 5, Food: 18, Tech: 54 },
    },
    "Agri Port": {
      marketNote: "Food surplus · Ore contracts open",
      tradeTip: "This port sells Food cheaply. Ore and Tech sell well here.",
      buy: { Ore: 16, Food: 6, Tech: 43 },
      sell: { Ore: 21, Food: 4, Tech: 55 },
    },
    "Tech Port": {
      marketNote: "Tech surplus · Ore shortage",
      tradeTip: "This port sells Tech cheaply. Ore and Food sell well here.",
      buy: { Ore: 24, Food: 16, Tech: 27 },
      sell: { Ore: 34, Food: 22, Tech: 18 },
    },
    "Frontier Port": {
      marketNote: "Unstable frontier prices · high opportunity",
      tradeTip: "Frontier markets swing wider. Compare prices before loading your hold.",
      buy: { Ore: 10, Food: 8, Tech: 34 },
      sell: { Ore: 25, Food: 19, Tech: 58 },
    },
    "Core Port": {
      marketNote: "Balanced core market · safe repairs",
      tradeTip: "Core prices are steady and safer, but profits are smaller than specialty routes.",
      buy: { Ore: 13, Food: 10, Tech: 34 },
      sell: { Ore: 11, Food: 8, Tech: 28 },
    },
  };
  const profile = profiles[portType];
  const portPrices = {};
  RESOURCES.forEach((resource) => {
    const buy = Math.max(3, Math.round(profile.buy[resource] * local * spread));
    const sell = Math.max(2, Math.round(profile.sell[resource] * demand * spread));
    // The port always sells to the player for more than it pays at the same dock,
    // while specialty differences between ports still create profitable routes.
    portPrices[resource] = { buy, sell: Math.min(sell, buy - 1) };
  });
  return {
    portType,
    marketNote: profile.marketNote,
    tradeTip: profile.tradeTip,
    portPrices,
    hasShipyard: number === 1 || portType === "Tech Port" || (portType !== "Core Port" && stableNumber(number, 10, 23) >= 7),
    repairService: portType !== "Frontier Port" || stableNumber(number, 10, 29) >= 4,
  };
}

function getSectorFlavor(type, number) {
  const text = {
    empty: "Quiet stars drift beyond the cockpit glass. This is a safe place to plan your next move.",
    port: "Docking lights blink while merchants post stable trade prices for patient captains.",
    planet: "A survey beacon marks a planet with room for patient builders.",
    asteroid: "Slow-moving rocks sparkle with ore. Mining here is careful work, not a race.",
    anomaly: "A soft signal bends the scanner display. It could reward careful scanning.",
  };
  return `${text[type]} Sector registry code: SD-${String(number).padStart(2, "0")}.`;
}

function getSectorObjects(type, number, hazardType) {
  const objects = {
    empty: ["navigation buoy", "distant starlight"],
    port: ["spaceport", "fuel broker", "cargo market"],
    planet: ["survey planet", "claim beacon"],
    asteroid: ["asteroid field", "ore fragments"],
    anomaly: ["scanner anomaly", "unknown signal"],
  }[type];
  const result = [...objects];
  if (type === "port" && createPortEconomy(number).hasShipyard) result.push("shipyard");
  if (hazardType) result.push(hazardType);
  return result;
}

function defaultGameState() {
  const starter = SHIPS.rustyComet;
  return migrateGameState({
    player: {
      pilotName: "Cadet",
      shipId: starter.shipId,
      shipName: starter.name,
      credits: 500,
      fuel: starter.baseFuelCapacity,
      maxFuel: starter.baseFuelCapacity,
      cargoCapacity: starter.baseCargoCapacity,
      currentSector: 1,
      hull: starter.maxHull,
      maxHull: starter.maxHull,
      cargo: { Ore: 0, Food: 0, Tech: 0 },
      upgrades: { cargoHold: 1, engine: 1, scanner: 1, shield: 1 },
      ownedShips: [starter.shipId],
    },
    planets: {},
    visitedSectors: [1],
    revealedSectors: [1],
    log: ["Welcome to Sector Drift. Start at Sector 1 and move at your own pace."],
    currentMission: generateMission(),
    missionAttempts: 0,
    missionLocked: false,
    missionFeedback: "Solve the mission for credits, fuel, or cargo.",
    lastProductionAt: 0,
  });
}

function loadGame() {
  // Future multiplayer: load player profile from a database here.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultGameState();
  try {
    const parsed = JSON.parse(saved);
    return migrateGameState({ ...defaultGameState(), ...parsed, currentMission: rehydrateMission(parsed.currentMission) });
  } catch (error) {
    return defaultGameState();
  }
}

function migrateGameState(state) {
  const player = state.player || {};
  const shipId = player.shipId && SHIPS[player.shipId] ? player.shipId : shipIdFromName(player.shipName);
  const ship = SHIPS[shipId];
  const upgrades = { cargoHold: 1, engine: 1, scanner: 1, shield: 1, ...(player.upgrades || {}) };
  Object.keys(upgrades).forEach((key) => upgrades[key] = Math.min(Math.max(1, Number(upgrades[key]) || 1), ship.upgradeCaps[key]));
  state.player = {
    pilotName: "Cadet",
    credits: 500,
    fuel: ship.baseFuelCapacity,
    currentSector: 1,
    cargo: { Ore: 0, Food: 0, Tech: 0 },
    ...player,
    shipId,
    shipName: ship.name,
    upgrades,
    ownedShips: Array.from(new Set([...(player.ownedShips || []), shipId])),
  };
  state.player.cargo = { Ore: 0, Food: 0, Tech: 0, ...(player.cargo || {}) };
  state.player.cargoCapacity = calculateCargoCapacity(ship, upgrades);
  state.player.maxFuel = calculateFuelCapacity(ship, upgrades);
  state.player.maxHull = ship.maxHull;
  state.player.hull = Math.min(state.player.maxHull, Math.max(1, Number(player.hull) || state.player.maxHull));
  state.player.currentSector = sectorMap[state.player.currentSector] ? state.player.currentSector : 1;
  state.planets ||= {};
  state.visitedSectors = normalizeSectorList(state.visitedSectors, state.player.currentSector);
  state.revealedSectors = normalizeSectorList(state.revealedSectors, state.player.currentSector);
  state.log = Array.isArray(state.log) ? state.log.slice(0, 8) : [];
  state.currentMission = rehydrateMission(state.currentMission);
  updateScannerReveals(state);
  return state;
}

function shipIdFromName(shipName) {
  return Object.values(SHIPS).find((ship) => ship.name === shipName)?.shipId || "rustyComet";
}

function normalizeSectorList(list, currentSector) {
  return Array.from(new Set([...(Array.isArray(list) ? list : []), 1, currentSector].map(Number).filter((number) => sectorMap[number]))).sort((a, b) => a - b);
}

function saveGame() {
  // Future multiplayer: save player profile to a database here.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function render() {
  renderShipPanel();
  renderMapPanel();
  renderSectorPanel();
  renderLocationPanel();
  renderMathMission();
  renderUpgradePanel();
  renderLogPanel();
}

function renderShipPanel() {
  const p = game.player;
  const ship = currentShip();
  panels.ship.innerHTML = `
    <h2 id="shipHeading">Ship Status</h2>
    <div class="stat-grid">
      ${stat("Pilot", p.pilotName)}${stat("Ship", p.shipName)}${stat("Credits", p.credits)}${stat("Fuel", `${p.fuel}/${p.maxFuel}`)}${stat("Hull", `${p.hull}/${p.maxHull}`)}${stat("Sector", p.currentSector)}${stat("Cargo Space", `${cargoUsed()}/${p.cargoCapacity}`)}${stat("Hazard Resist", `+${ship.hazardResistance}`)}
    </div>
    <p class="help-text">${ship.description}</p>
    <h3>Cargo</h3>
    <div class="cargo-grid">${RESOURCES.map((r) => `<div class="resource"><span class="label">${r}</span><span class="value">${p.cargo[r]}</span></div>`).join("")}</div>
    <h3>Upgrades</h3>
    <div class="cargo-grid">
      ${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}/${ship.upgradeCaps.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}/${ship.upgradeCaps.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}/${ship.upgradeCaps.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}/${ship.upgradeCaps.shield}`)}
    </div>`;
}

function renderMapPanel() {
  const visible = getVisibleSectorNumbers();
  const current = sectorMap[game.player.currentSector];
  const view = visible.map((number) => sectorMap[number]);
  const xs = view.map((sector) => sector.coordinates.x);
  const ys = view.map((sector) => sector.coordinates.y);
  const minX = Math.min(...xs, current.coordinates.x) - 70;
  const minY = Math.min(...ys, current.coordinates.y) - 70;
  const width = Math.max(220, Math.max(...xs, current.coordinates.x) - minX + 70);
  const height = Math.max(180, Math.max(...ys, current.coordinates.y) - minY + 70);
  const links = [];
  view.forEach((sector) => sector.adjacent.forEach((neighbor) => {
    if (visible.includes(neighbor) && sector.number < neighbor) links.push([sector, sectorMap[neighbor]]);
  }));
  panels.map.innerHTML = `<h2 id="mapHeading">Local Minimap</h2>
    <svg class="minimap" role="img" aria-label="Local sector map" viewBox="${minX} ${minY} ${width} ${height}">
      ${links.map(([a, b]) => `<line class="map-link" x1="${a.coordinates.x}" y1="${a.coordinates.y}" x2="${b.coordinates.x}" y2="${b.coordinates.y}"></line>`).join("")}
      ${view.map((sector) => renderMapNode(sector)).join("")}
    </svg>
    <div class="map-legend"><span><i class="dot current"></i>Current</span><span><i class="dot visited"></i>Visited</span><span><i class="dot detected"></i>Detected</span></div>
    <p class="help-text">Scanner ${game.player.upgrades.scanner}: ${scannerHelpText()}</p>`;
}

function renderMapNode(sector) {
  const current = sector.number === game.player.currentSector;
  const visited = game.visitedSectors.includes(sector.number);
  const detectedClass = current ? "current" : visited ? "visited" : "detected";
  const danger = canSeeDanger(sector.number) && sector.dangerLevel > 0 ? `<text class="map-danger" x="${sector.coordinates.x}" y="${sector.coordinates.y + 29}">D${sector.dangerLevel}</text>` : "";
  return `<g class="map-node ${detectedClass}">
    <circle cx="${sector.coordinates.x}" cy="${sector.coordinates.y}" r="${current ? 15 : 11}"></circle>
    <text x="${sector.coordinates.x}" y="${sector.coordinates.y + 4}">${sector.number}</text>
    ${danger}
  </g>`;
}

function renderSectorPanel() {
  const sector = sectorMap[game.player.currentSector];
  const noFuel = game.player.fuel <= 0;
  panels.sector.innerHTML = `
    <h2 id="sectorHeading">Current Sector</h2>
    <span class="badge">Sector ${sector.number}: ${titleCase(sector.type)}</span>
    ${sector.dangerLevel > 0 ? `<span class="danger-badge">Danger ${sector.dangerLevel}: ${titleCase(sector.hazardType)}</span>` : `<span class="safe-badge">Danger 0: Safe</span>`}
    <p class="flavor">${sector.flavor}</p>
    <p><strong>Visible objects:</strong> ${sector.objects.join(", ")}</p>
    <h3>Adjacent Sectors</h3>
    <div class="travel-grid">
      ${sector.adjacent.map((number) => `<button type="button" ${noFuel ? "disabled" : ""} data-action="travel" data-sector="${number}">${scannerTravelLabel(number)}</button>`).join("")}
    </div>
    ${noFuel ? `<p class="cooldown">Fuel is empty. Complete math missions for fuel or trade when you reach a port.</p>` : `<p class="help-text">Travel costs 1 fuel. Scanner upgrades reveal farther sectors, hazards, and shipyards.</p>`}`;
  panels.sector.querySelectorAll("[data-action='travel']").forEach((button) => button.addEventListener("click", () => travelToSector(Number(button.dataset.sector))));
}

function renderLocationPanel() {
  const sector = sectorMap[game.player.currentSector];
  let html = `<h2 id="locationHeading">Location Actions</h2>`;
  if (sector.type === "port") html += renderPort(sector);
  if (sector.type === "planet") html += renderPlanet(sector);
  if (sector.type === "asteroid") html += renderAsteroid();
  if (sector.type === "anomaly") html += renderAnomaly();
  if (sector.type === "empty") html += `<p class="empty-note">This sector is quiet. Use the map, complete a mission, or review upgrades.</p>`;
  panels.location.innerHTML = html;
  wireLocationButtons();
}

function renderPort(sector) {
  return `<div class="port-summary">
      <span class="badge">${sector.portType}</span>${sector.hasShipyard ? `<span class="shipyard-tag">Shipyard Available</span>` : ""}
      <p><strong>Market note:</strong> ${sector.marketNote}</p><p class="help-text">${sector.tradeTip}</p>
    </div>
    <div class="trade-grid">${RESOURCES.map((resource) => {
    const price = sector.portPrices[resource];
    return `<div class="mini-card"><h3>${resource}</h3><p>Buy ${price.buy} credits · Sell ${price.sell} credits</p><div class="resource-actions">
      <button data-action="buy" data-resource="${resource}" data-amount="1">Buy 1</button><button data-action="buy" data-resource="${resource}" data-amount="5">Buy 5</button>
      <button data-action="sell" data-resource="${resource}" data-amount="1">Sell 1</button><button data-action="sell" data-resource="${resource}" data-amount="5">Sell 5</button>
    </div></div>`;
  }).join("")}</div>${renderRepairPanel(sector)}${sector.hasShipyard ? renderShipyard() : ""}`;
}

function renderRepairPanel(sector) {
  if (!sector.repairService && !sector.hasShipyard) return `<p class="cooldown">No repair crew is available at this frontier dock.</p>`;
  const missing = game.player.maxHull - game.player.hull;
  const cost = repairCost();
  return `<div class="mini-card service-card"><h3>Repair Service</h3><p>Hull: ${game.player.hull}/${game.player.maxHull}</p><p>Repair cost: ${cost} credits</p><button data-action="repair" ${missing <= 0 || game.player.credits < cost ? "disabled" : ""}>Repair Hull</button></div>`;
}

function renderShipyard() {
  return `<div class="shipyard-panel"><h3>Shipyard</h3><p class="help-text">Buying a ship preserves planets, missions, visited sectors, cargo, and progress. Upgrades above the new ship caps are safely reduced.</p>
    <div class="ship-grid">${Object.values(SHIPS).map((ship) => renderShipCard(ship)).join("")}</div></div>`;
}

function renderShipCard(ship) {
  const owned = game.player.ownedShips.includes(ship.shipId);
  const current = game.player.shipId === ship.shipId;
  const affordable = game.player.credits >= ship.basePrice;
  return `<div class="mini-card ship-card ${current ? "current-ship" : ""}"><h3>${ship.name}</h3><p>${ship.description}</p>
    <div class="stat-grid compact">${stat("Price", ship.basePrice === 0 ? "Starter" : ship.basePrice)}${stat("Hull", ship.maxHull)}${stat("Fuel", ship.baseFuelCapacity)}${stat("Cargo", ship.baseCargoCapacity)}${stat("Resist", `+${ship.hazardResistance}`)}${stat("Caps", `C${ship.upgradeCaps.cargoHold} E${ship.upgradeCaps.engine} S${ship.upgradeCaps.scanner} Sh${ship.upgradeCaps.shield}`)}</div>
    <button data-action="buyShip" data-ship="${ship.shipId}" ${current || owned || !affordable ? "disabled" : ""}>${current ? "Current Ship" : owned ? "Owned" : affordable ? `Buy for ${ship.basePrice}` : `Need ${ship.basePrice}`}</button></div>`;
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
  return `<h3>Asteroid Field</h3><p>Spend 1 fuel to mine Ore. Scanner upgrades improve results; sturdy ships make hazardous fields less scary.</p><button data-action="mine" ${game.player.fuel <= 0 || cargoSpaceLeft() <= 0 ? "disabled" : ""}>Mine Asteroids</button>`;
}

function renderAnomaly() {
  return `<h3>Mysterious Anomaly</h3><p>Scan carefully. Better scanners improve your chance of helpful discoveries.</p><button data-action="scan">Scan Anomaly</button>`;
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
}

function renderMathMission() {
  const mission = game.currentMission;
  const done = game.missionLocked;
  panels.math.innerHTML = `<h2 id="mathHeading">Math Mission</h2><p><strong>${mission.prompt}</strong></p><p class="help-text">Answer format: ${mission.format}</p>
    <input id="missionAnswer" type="text" autocomplete="off" ${done ? "disabled" : ""} aria-label="Math mission answer">
    <div class="button-row"><button id="submitMission" ${done ? "disabled" : ""}>Submit Answer</button><button id="stuckMission" ${done ? "disabled" : ""}>I'm Stuck</button>${done ? `<button id="nextMission">Next Mission</button>` : ""}</div>
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
    game.missionFeedback = "Solve the mission for credits, fuel, or cargo.";
    game.missionFeedbackClass = "";
    saveGame();
    render();
  });
}

function renderUpgradePanel() {
  const ship = currentShip();
  const upgrades = [
    ["cargoHold", "Cargo Hold", "+10 cargo capacity each level"],
    ["engine", "Engine", "+2 fuel capacity each level and better fuel mission rewards"],
    ["scanner", "Scanner", "Reveals farther sectors, hazards, and improves scans"],
    ["shield", "Shield", "Reduces sector hazard risk and hull damage"],
  ];
  panels.upgrade.innerHTML = `<h2 id="upgradeHeading">Ship Upgrades</h2><div class="upgrade-grid">${upgrades.map(([key, name, desc]) => {
    const level = game.player.upgrades[key];
    const cap = ship.upgradeCaps[key];
    const cost = level * 250;
    const maxed = level >= cap;
    return `<div class="mini-card"><h3>${name}</h3><p>Level ${level}/${cap} ${maxed ? `<strong class="max-tag">MAX</strong>` : ""}</p><p class="help-text">${desc}</p><button data-upgrade="${key}" ${maxed || game.player.credits < cost ? "disabled" : ""}>${maxed ? "MAX" : `Upgrade for ${cost}`}</button></div>`;
  }).join("")}</div>`;
  panels.upgrade.querySelectorAll("[data-upgrade]").forEach((button) => button.addEventListener("click", () => upgradeShip(button.dataset.upgrade)));
}

function renderLogPanel() {
  panels.log.innerHTML = `<h2 id="logHeading">Ship Log</h2><ol class="log-list">${game.log.map((entry) => `<li>${entry}</li>`).join("")}</ol>`;
}

function addLog(message) {
  game.log = [message, ...(game.log || [])].slice(0, 8);
}

function travelToSector(number) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector.adjacent.includes(number) || game.player.fuel <= 0) return;
  game.player.fuel -= 1;
  game.player.currentSector = number;
  markSectorVisited(number);
  addLog(`Traveled to Sector ${number}.`);
  resolveSectorDanger(sectorMap[number]);
  updateScannerReveals(game);
  saveGame();
  render();
}

function resolveSectorDanger(sector) {
  if (sector.dangerLevel <= 0) return;
  const shield = game.player.upgrades.shield;
  const scanner = game.player.upgrades.scanner;
  const ship = currentShip();
  const mitigation = shield * 7 + scanner * 2 + ship.hazardResistance * 6;
  const risk = Math.max(6, sector.dangerLevel * 24 - mitigation);
  const roll = Math.random() * 100;
  if (roll > risk) return addLog(`Hazard avoided in Sector ${sector.number}: scanner and shields guided you through the ${sector.hazardType}.`);
  const damageRoll = Math.random();
  const baseDamage = sector.dangerLevel * 8 + Math.floor(Math.random() * (sector.dangerLevel * 8 + 4));
  const damage = Math.max(3, baseDamage - shield * 3 - ship.hazardResistance * 2);
  if (damageRoll < 0.12 + sector.dangerLevel * 0.05 && game.player.hull - damage <= 0) return escapePodReset(sector);
  game.player.hull -= damage;
  if (game.player.hull <= 0) return escapePodReset(sector);
  const severity = damage >= 26 ? "heavy" : damage >= 14 ? "moderate" : "minor";
  addLog(`${titleCase(sector.hazardType)} caused ${severity} hull damage (${damage}). Hull now ${game.player.hull}/${game.player.maxHull}.`);
}

function escapePodReset(sector) {
  const cargoLoss = Math.ceil(cargoUsed() * 0.35);
  let remainingLoss = cargoLoss;
  RESOURCES.forEach((resource) => {
    const lost = Math.min(game.player.cargo[resource], remainingLoss);
    game.player.cargo[resource] -= lost;
    remainingLoss -= lost;
  });
  const penalty = Math.min(game.player.credits, 150 + sector.dangerLevel * 50);
  game.player.credits -= penalty;
  game.player.currentSector = 1;
  game.player.hull = game.player.maxHull;
  markSectorVisited(1);
  addLog(`CATASTROPHIC FAILURE! The ${sector.hazardType} destroyed your ship in Sector ${sector.number}. Escape pod returned you to Sector 1. Lost ${cargoLoss} cargo and ${penalty} credits.`);
}

function buyResource(resource, amount) {
  const price = sectorMap[game.player.currentSector].portPrices[resource].buy * amount;
  if (game.player.credits < price) return addAndRender(`Not enough credits to buy ${amount} ${resource}.`);
  if (cargoSpaceLeft() < amount) return addAndRender(`Not enough cargo space for ${amount} ${resource}.`);
  game.player.credits -= price;
  game.player.cargo[resource] += amount;
  // Future multiplayer: update trading activity in a shared database here.
  addLog(`Bought ${amount} ${resource} for ${price} credits.`);
  saveGame();
  render();
}

function sellResource(resource, amount) {
  if (game.player.cargo[resource] < amount) return addAndRender(`Not enough ${resource} to sell ${amount}.`);
  const price = sectorMap[game.player.currentSector].portPrices[resource].sell * amount;
  game.player.cargo[resource] -= amount;
  game.player.credits += price;
  // Future multiplayer: update trading activity in a shared database here.
  addLog(`Sold ${amount} ${resource} for ${price} credits.`);
  saveGame();
  render();
}

function repairHull() {
  const cost = repairCost();
  if (game.player.hull >= game.player.maxHull) return addAndRender("Hull is already fully repaired.");
  if (game.player.credits < cost) return addAndRender("Not enough credits for hull repairs.");
  game.player.credits -= cost;
  game.player.hull = game.player.maxHull;
  addLog(`Repair crew restored hull to full strength for ${cost} credits.`);
  saveGame();
  render();
}

function buyShip(shipId) {
  const ship = SHIPS[shipId];
  if (!ship || game.player.ownedShips.includes(shipId) || game.player.credits < ship.basePrice) return;
  game.player.credits -= ship.basePrice;
  game.player.ownedShips.push(shipId);
  game.player.shipId = shipId;
  game.player.shipName = ship.name;
  game.player.upgrades = capUpgradesForShip(game.player.upgrades, ship);
  game.player.cargoCapacity = calculateCargoCapacity(ship, game.player.upgrades);
  game.player.maxFuel = calculateFuelCapacity(ship, game.player.upgrades);
  game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + Math.floor(ship.baseFuelCapacity / 2));
  game.player.maxHull = ship.maxHull;
  game.player.hull = ship.maxHull;
  trimCargoToCapacity();
  updateScannerReveals(game);
  addLog(`Purchased and launched the ${ship.name}. Upgrade caps and hull stats updated.`);
  saveGame();
  render();
}

function claimPlanet() {
  const sector = sectorMap[game.player.currentSector];
  const planet = getPlanetState(sector);
  if (planet.owner) return;
  planet.owner = game.player.pilotName;
  game.planets[planet.id] = planet;
  // Future multiplayer: update planet ownership in a shared database here.
  addLog(`Claimed planet ${planet.name}.`);
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
  addLog(`Deposited 1 ${resource} on ${planet.name}.`);
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
  addLog(`Upgraded ${planet.name} to production level ${planet.productionLevel}.`);
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
  saveGame();
  render();
}

function mineAsteroids() {
  if (game.player.fuel <= 0 || cargoSpaceLeft() <= 0) return;
  game.player.fuel -= 1;
  const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * (3 + game.player.upgrades.scanner)));
  game.player.cargo.Ore += amount;
  addLog(`Mined ${amount} Ore from the asteroid field.`);
  resolveSectorDanger(sectorMap[game.player.currentSector]);
  saveGame();
  render();
}

function scanAnomaly() {
  const scanner = game.player.upgrades.scanner;
  const roll = Math.random() + scanner * 0.06;
  if (roll < 0.14) {
    game.player.fuel = Math.max(0, game.player.fuel - 1);
    addLog("Anomaly scan drained 1 fuel, but the ship is fine.");
  } else if (roll < 0.35) {
    addLog("Anomaly message: Patterns become clearer when you slow down.");
  } else if (roll < 0.6) {
    const fuel = 2 + Math.floor(Math.random() * 4);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    addLog(`Anomaly released ${fuel} fuel.`);
  } else if (roll < 0.84) {
    const credits = 40 + Math.floor(Math.random() * 81);
    game.player.credits += credits;
    addLog(`Anomaly data sold for ${credits} credits.`);
  } else {
    const tech = Math.min(cargoSpaceLeft(), 1 + Math.floor(scanner / 2));
    game.player.cargo.Tech += tech;
    addLog(tech > 0 ? `Anomaly yielded ${tech} Tech.` : "Anomaly found Tech, but cargo was full.");
  }
  resolveSectorDanger(sectorMap[game.player.currentSector]);
  saveGame();
  render();
}

function submitMissionAnswer() {
  const input = document.getElementById("missionAnswer").value.trim();
  const mission = game.currentMission;
  if (mission.check(input)) {
    awardMissionReward();
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

function awardMissionReward() {
  const roll = Math.random();
  if (roll < 0.45) {
    const credits = 50 + Math.floor(Math.random() * 71);
    game.player.credits += credits;
    game.missionFeedback = `Correct. Awarded ${credits} credits.`;
    addLog(`Correct mission answer. Awarded ${credits} credits.`);
  } else if (roll < 0.8) {
    const fuel = 2 + Math.floor(Math.random() * 4) + Math.floor(game.player.upgrades.engine / 3);
    game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + fuel);
    game.missionFeedback = `Correct. Awarded ${fuel} fuel.`;
    addLog(`Correct mission answer. Awarded ${fuel} fuel.`);
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
  const ship = currentShip();
  if (game.player.upgrades[key] >= ship.upgradeCaps[key]) return;
  const cost = game.player.upgrades[key] * 250;
  if (game.player.credits < cost) return;
  game.player.credits -= cost;
  game.player.upgrades[key] += 1;
  game.player.cargoCapacity = calculateCargoCapacity(ship, game.player.upgrades);
  game.player.maxFuel = calculateFuelCapacity(ship, game.player.upgrades);
  if (key === "engine") game.player.fuel = Math.min(game.player.maxFuel, game.player.fuel + 2);
  if (key === "scanner") updateScannerReveals(game);
  addLog(`Upgraded ${titleCase(key.replace(/([A-Z])/g, " $1"))} to level ${game.player.upgrades[key]}.`);
  saveGame();
  render();
}

function getVisibleSectorNumbers() {
  const distance = game.player.upgrades.scanner >= 2 ? 2 : 1;
  const visible = new Set([game.player.currentSector, ...game.visitedSectors]);
  sectorsWithinJumps(game.player.currentSector, distance).forEach((number) => visible.add(number));
  return Array.from(visible).filter((number) => game.revealedSectors.includes(number) || sectorDistance(game.player.currentSector, number) <= distance || game.visitedSectors.includes(number)).sort((a, b) => a - b);
}

function sectorsWithinJumps(start, maxDistance) {
  const seen = new Set([start]);
  const queue = [{ number: start, distance: 0 }];
  while (queue.length) {
    const item = queue.shift();
    if (item.distance >= maxDistance) continue;
    sectorMap[item.number].adjacent.forEach((neighbor) => {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push({ number: neighbor, distance: item.distance + 1 });
      }
    });
  }
  return Array.from(seen);
}

function sectorDistance(start, target) {
  if (start === target) return 0;
  const seen = new Set([start]);
  const queue = [{ number: start, distance: 0 }];
  while (queue.length) {
    const item = queue.shift();
    for (const neighbor of sectorMap[item.number].adjacent) {
      if (neighbor === target) return item.distance + 1;
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push({ number: neighbor, distance: item.distance + 1 });
      }
    }
  }
  return Infinity;
}

function updateScannerReveals(state) {
  const distance = state.player.upgrades.scanner >= 2 ? 2 : 1;
  state.revealedSectors = normalizeSectorList([...(state.revealedSectors || []), ...sectorsWithinJumps(state.player.currentSector, distance)], state.player.currentSector);
}

function markSectorVisited(number) {
  game.visitedSectors = normalizeSectorList([...(game.visitedSectors || []), number], number);
  game.revealedSectors = normalizeSectorList([...(game.revealedSectors || []), number], number);
}

function scannerTravelLabel(number) {
  const sector = sectorMap[number];
  const scanner = game.player.upgrades.scanner;
  const parts = [`Sector ${number}`];
  if (scanner >= 1) parts.push(titleCase(sector.type));
  else parts.push("Unknown");
  if (scanner >= 3 && sector.dangerLevel > 0) parts.push(`Danger ${sector.dangerLevel}`);
  if (scanner >= 3) {
    const features = knownFeatures(sector);
    if (features) parts.push(features);
  }
  if (scanner >= 4 && sector.hazardType) parts.push(titleCase(sector.hazardType));
  return parts.join(" - ");
}

function knownFeatures(sector) {
  const features = [];
  if (sector.type === "port") features.push(sector.hasShipyard ? "Shipyard" : "Port");
  if (sector.type === "planet") features.push("Planet");
  if (sector.type === "asteroid") features.push("Asteroid Field");
  if (sector.type === "anomaly") features.push("Anomaly");
  if (sector.hazardType) features.push("Hazard");
  return features.join(", ");
}

function canSeeDanger(number) {
  const distance = sectorDistance(game.player.currentSector, number);
  return game.player.upgrades.scanner >= 4 && distance <= 2 || game.player.upgrades.scanner >= 3 && distance <= 1 || game.visitedSectors.includes(number);
}

function scannerHelpText() {
  const scanner = game.player.upgrades.scanner;
  if (scanner >= 5) return "deep scanner clarity, two-jump danger readings, and stronger event outcomes.";
  if (scanner >= 4) return "two-jump danger readings and clearer hazard warnings.";
  if (scanner >= 3) return "adjacent danger, hazards, ports, planets, anomalies, asteroid fields, and shipyards.";
  if (scanner >= 2) return "sectors up to two jumps away with basic sector types.";
  return "current and adjacent sectors with basic type readings.";
}

function capUpgradesForShip(upgrades, ship) {
  const capped = { ...upgrades };
  Object.keys(ship.upgradeCaps).forEach((key) => capped[key] = Math.min(capped[key] || 1, ship.upgradeCaps[key]));
  return capped;
}

function calculateCargoCapacity(ship, upgrades) { return ship.baseCargoCapacity + (upgrades.cargoHold - 1) * 10; }
function calculateFuelCapacity(ship, upgrades) { return ship.baseFuelCapacity + (upgrades.engine - 1) * 2; }
function repairCost() { return Math.ceil((game.player.maxHull - game.player.hull) * 4); }
function currentShip() { return SHIPS[game.player.shipId] || SHIPS.rustyComet; }

function trimCargoToCapacity() {
  while (cargoUsed() > game.player.cargoCapacity) {
    const resource = RESOURCES.find((name) => game.player.cargo[name] > 0);
    if (!resource) break;
    game.player.cargo[resource] -= 1;
  }
}

function getPlanetState(sector) {
  return game.planets[sector.planet.id] || JSON.parse(JSON.stringify(sector.planet));
}

function productionStatusText() {
  if (!game.lastProductionAt) return "Production is ready. Cooldown starts after collection.";
  const remaining = PRODUCTION_COOLDOWN_MS - (Date.now() - game.lastProductionAt);
  if (remaining <= 0) return "Production is ready to collect.";
  return `Production cooldown: ${Math.ceil(remaining / 60000)} minute(s) remaining.`;
}

function stableNumber(seed, modulo, salt = 0) {
  return Math.abs((seed * 9301 + salt * 49297 + 233280) % 233280) % modulo;
}

function cargoUsed() { return RESOURCES.reduce((sum, resource) => sum + game.player.cargo[resource], 0); }
function cargoSpaceLeft() { return game.player.cargoCapacity - cargoUsed(); }
function stat(label, value) { return `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`; }
function titleCase(text) { return text.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, "").replace(/\*+/g, ""); }
function addAndRender(message) { addLog(message); saveGame(); render(); }

// Future multiplayer: teacher dashboard actions such as class reset, roster summaries,
// progress review, and mission support would connect here in a later server-backed version.
