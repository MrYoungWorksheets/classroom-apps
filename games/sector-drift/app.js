const STORAGE_KEY = "sectorDriftSaveV1";
const PRODUCTION_COOLDOWN_MS = 10 * 60 * 1000;
const BASE_MAX_TURNS = 40;
const RESOURCES = ["Ore", "Food", "Tech"];
const PORT_TYPES = ["Mining Port", "Agri Port", "Tech Port", "Frontier Port", "Core Port"];

let sectorMap = createSectorMap();
let game = loadGame();

const panels = {};

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

function createSectorMap() {
  // Future multiplayer: load shared sector map from a database here.
  const typeCycle = ["empty", "port", "planet", "asteroid", "anomaly", "empty", "planet", "port", "asteroid", "empty"];
  const planetNames = ["Emberfall", "Quiet Vesta", "Blue Rook", "Juniper Moon", "Cinder Vale", "New Lumen", "Frost Harbor", "Copperleaf", "Aster Well", "Kindle Rest"];
  const sectors = {};

  for (let number = 1; number <= 50; number += 1) {
    const adjacent = new Set();
    if (number > 1) adjacent.add(number - 1);
    if (number < 50) adjacent.add(number + 1);

    const jumpA = ((number * 7) % 50) + 1;
    const jumpB = ((number * 13 + 5) % 50) + 1;
    if (jumpA !== number) adjacent.add(jumpA);
    if (number % 5 === 0 && jumpB !== number) adjacent.add(jumpB);

    let type = typeCycle[(number * 3 + 1) % typeCycle.length];
    if (number === 1) type = "port";

    sectors[number] = {
      number,
      adjacent: Array.from(adjacent).sort((a, b) => a - b),
      type,
      flavor: getSectorFlavor(type, number),
      objects: getSectorObjects(type),
    };

    if (type === "port") {
      sectors[number].portType = PORT_TYPES[(number * 11 + 3) % PORT_TYPES.length];
      sectors[number].portPrices = createPortPrices(number, sectors[number].portType);
    }
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

function createPortPrices(number, portType) {
  const base = {
    Ore: { buy: 14 + (number % 6), sell: 9 + (number % 5) },
    Food: { buy: 10 + ((number * 2) % 5), sell: 6 + (number % 4) },
    Tech: { buy: 34 + ((number * 3) % 12), sell: 22 + (number % 9) },
  };
  const multipliers = {
    "Mining Port": { Ore: [0.75, 0.85], Food: [1.05, 1.25], Tech: [1.05, 1.2] },
    "Agri Port": { Ore: [1.05, 1.2], Food: [0.75, 0.85], Tech: [1.05, 1.2] },
    "Tech Port": { Ore: [1.05, 1.2], Food: [1.05, 1.2], Tech: [0.75, 0.85] },
    "Frontier Port": { Ore: [1.2, 1.35], Food: [0.85, 1.35], Tech: [1.25, 1.45] },
    "Core Port": { Ore: [1, 1], Food: [1, 1], Tech: [1, 1] },
  }[portType];
  return Object.fromEntries(RESOURCES.map((resource) => {
    const [buyMultiplier, sellMultiplier] = multipliers[resource];
    const buy = Math.max(1, Math.round(base[resource].buy * buyMultiplier));
    const sell = Math.max(1, Math.round(base[resource].sell * sellMultiplier));
    return [resource, { buy, sell }];
  }));
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

function getSectorObjects(type) {
  return {
    empty: ["navigation buoy", "distant starlight"],
    port: ["spaceport", "fuel broker", "cargo market"],
    planet: ["survey planet", "claim beacon"],
    asteroid: ["asteroid field", "ore fragments"],
    anomaly: ["scanner anomaly", "unknown signal"],
  }[type];
}

function defaultGameState() {
  const today = todayKey();
  const state = {
    player: {
      pilotName: "Cadet",
      shipName: "Rusty Comet",
      credits: 500,
      fuel: 20,
      turns: BASE_MAX_TURNS,
      maxTurns: BASE_MAX_TURNS,
      lastTurnRefreshDate: today,
      cargoCapacity: 20,
      currentSector: 1,
      cargo: { Ore: 0, Food: 0, Tech: 0 },
      upgrades: { cargoHold: 1, engine: 1, scanner: 1, shield: 1 },
    },
    planets: {},
    activeMissions: [],
    completedMissions: [],
    tutorial: { completedSteps: [], finished: false },
    achievements: [],
    stats: defaultStats(),
    log: ["Welcome to Sector Drift. Start at Sector 1 and move at your own pace."],
    currentMission: generateMission(),
    missionAttempts: 0,
    missionLocked: false,
    missionFeedback: "Solve the mission for credits, fuel, turns, or cargo.",
    lastProductionAt: 0,
  };
  state.activeMissions = missionTemplates().slice(0, 3).map((mission) => createActiveMission(mission.id));
  return state;
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
  };
}

function loadGame() {
  // Future multiplayer: load player profile from a database here.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultGameState();
  try {
    const parsed = JSON.parse(saved);
    return migrateGameState(parsed);
  } catch (error) {
    return defaultGameState();
  }
}

function migrateGameState(saved) {
  const fresh = defaultGameState();
  const merged = { ...fresh, ...saved };
  merged.player = { ...fresh.player, ...(saved.player || {}) };
  merged.player.cargo = { ...fresh.player.cargo, ...(saved.player?.cargo || {}) };
  merged.player.upgrades = { ...fresh.player.upgrades, ...(saved.player?.upgrades || {}) };
  merged.stats = { ...fresh.stats, ...(saved.stats || {}) };
  if (!Array.isArray(merged.stats.visitedSectors)) merged.stats.visitedSectors = [merged.player.currentSector || 1];
  if (!merged.stats.visitedSectors.includes(merged.player.currentSector)) merged.stats.visitedSectors.push(merged.player.currentSector);
  merged.player.maxTurns = calculateMaxTurns(merged.player.upgrades.engine);
  if (typeof merged.player.turns !== "number") merged.player.turns = merged.player.maxTurns;
  if (!merged.player.lastTurnRefreshDate) merged.player.lastTurnRefreshDate = todayKey();
  merged.player.turns = Math.min(merged.player.turns, merged.player.maxTurns);
  merged.planets = saved.planets || {};
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
  merged.log = Array.isArray(saved.log) ? saved.log.slice(0, 12) : fresh.log;
  merged.currentMission = rehydrateMission(saved.currentMission);
  return merged;
}

function saveGame() {
  // Future multiplayer: save player profile to a database here.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
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
  panels.ship.innerHTML = `
    <h2 id="shipHeading">Ship Status</h2>
    <div class="stat-grid">
      ${stat("Pilot", p.pilotName)}${stat("Rank", currentRank())}${stat("Ship", p.shipName)}${stat("Credits", p.credits)}${stat("Fuel", p.fuel)}${stat("Turns", `${p.turns}/${p.maxTurns}`)}${stat("Sector", p.currentSector)}${stat("Cargo Space", `${cargoUsed()}/${p.cargoCapacity}`)}
    </div>
    ${p.turns <= 0 ? `<p class="turn-warning">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : ""}
    <h3>Cargo</h3>
    <div class="cargo-grid">${RESOURCES.map((r) => `<div class="resource"><span class="label">${r}</span><span class="value">${p.cargo[r]}</span></div>`).join("")}</div>
    <h3>Upgrades</h3>
    <div class="cargo-grid">
      ${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}`)}
    </div>`;
}

function renderSectorPanel() {
  const sector = sectorMap[game.player.currentSector];
  const cannotTravel = game.player.fuel <= 0 || game.player.turns <= 0;
  panels.sector.innerHTML = `
    <h2 id="sectorHeading">Current Sector</h2>
    <span class="badge">Sector ${sector.number}: ${titleCase(sector.type)}</span>
    <p class="flavor">${sector.flavor}</p>
    <p><strong>Visible objects:</strong> ${sector.objects.join(", ")}</p>
    <h3>Adjacent Sectors</h3>
    <div class="travel-grid">
      ${sector.adjacent.map((number) => `<button type="button" ${cannotTravel ? "disabled" : ""} data-action="travel" data-sector="${number}">Travel to ${number}</button>`).join("")}
    </div>
    ${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : game.player.fuel <= 0 ? `<p class="cooldown">Fuel is empty. Complete math missions for fuel or trade when you reach a port.</p>` : `<p class="help-text">Travel costs 1 turn and 1 fuel. A sector event may occur after arrival.</p>`}`;
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
  return `<p class="port-type">${sector.portType}</p><p class="help-text">Port type affects deterministic local prices. Buy cargo when prices are fair, or sell resources for credits.</p><div class="trade-grid">${RESOURCES.map((resource) => {
    const price = sector.portPrices[resource];
    return `<div class="mini-card"><h3>${resource}</h3><p>Buy ${price.buy} credits · Sell ${price.sell} credits</p><div class="resource-actions">
      <button data-action="buy" data-resource="${resource}" data-amount="1">Buy 1</button><button data-action="buy" data-resource="${resource}" data-amount="5">Buy 5</button>
      <button data-action="sell" data-resource="${resource}" data-amount="1">Sell 1</button><button data-action="sell" data-resource="${resource}" data-amount="5">Sell 5</button>
    </div></div>`;
  }).join("")}</div>`;
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
  return `<h3>Asteroid Field</h3><p>Spend 1 turn and 1 fuel to mine a small amount of Ore. Scanner upgrades improve results.</p><button data-action="mine" ${disabled ? "disabled" : ""}>Mine Asteroids</button>${game.player.turns <= 0 ? `<p class="cooldown">Out of turns. Complete missions for bonus turns or return tomorrow.</p>` : ""}`;
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
    ["cargoHold", "Cargo Hold", "+10 cargo capacity each level"],
    ["engine", "Engine", "+3 max daily turns each level above 1"],
    ["scanner", "Scanner", "Improves mining, anomaly scans, and travel event outcomes"],
    ["shield", "Shield", "Future defensive systems; no combat yet"],
  ];
  panels.upgrade.innerHTML = `<h2 id="upgradeHeading">Ship Upgrades</h2><div class="upgrade-grid">${upgrades.map(([key, name, desc]) => {
    const level = game.player.upgrades[key];
    const cost = level * 250;
    return `<div class="mini-card"><h3>${name}</h3><p>Level ${level}</p><p class="help-text">${desc}</p><button data-upgrade="${key}" ${game.player.credits < cost ? "disabled" : ""}>Upgrade for ${cost}</button></div>`;
  }).join("")}</div>`;
  panels.upgrade.querySelectorAll("[data-upgrade]").forEach((button) => button.addEventListener("click", () => upgradeShip(button.dataset.upgrade)));
}

function renderAchievementsPanel() {
  const unlocked = game.achievements.length;
  panels.achievements.innerHTML = `<h2 id="achievementsHeading">Achievements</h2><p class="help-text">${unlocked}/${achievementDefinitions().length} unlocked.</p><details class="compact-section"><summary>Show achievement list</summary><div class="achievement-grid">${achievementDefinitions().map((achievement) => {
    const done = game.achievements.includes(achievement.id);
    return `<div class="achievement-card ${done ? "unlocked" : "locked"}"><strong>${done ? "★" : "☆"} ${achievement.title}</strong><p>${achievement.description}</p></div>`;
  }).join("")}</div></details>`;
}

function renderStatsPanel() {
  const s = game.stats;
  panels.stats.innerHTML = `<h2 id="statsHeading">Career Stats</h2><div class="stats-grid">
    ${stat("Sectors Visited", s.visitedSectors.length)}${stat("Trade Credits Earned", s.creditsEarnedFromTrade)}${stat("Resources Mined", s.resourcesMined)}${stat("Math Missions", s.mathMissionsCompleted)}${stat("Planets Claimed", s.planetsClaimed)}${stat("Anomalies Scanned", s.anomaliesScanned)}${stat("Achievements", game.achievements.length)}
  </div>`;
}

function renderLogPanel() {
  panels.log.innerHTML = `<h2 id="logHeading">Ship Log</h2><ol class="log-list">${game.log.map((entry) => `<li>${entry}</li>`).join("")}</ol>`;
}

function addLog(message) {
  game.log = [message, ...(game.log || [])].slice(0, 12);
}

function travelToSector(number) {
  const sector = sectorMap[game.player.currentSector];
  if (!sector.adjacent.includes(number) || !spendTurn("travel")) return;
  game.player.fuel -= 1;
  game.player.currentSector = number;
  if (!game.stats.visitedSectors.includes(number)) game.stats.visitedSectors.push(number);
  addLog(`Traveled to Sector ${number}.`);
  completeTutorialStep("travel");
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
  // Future multiplayer: update trading activity in a shared database here.
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
  // Future multiplayer: update trading activity in a shared database here.
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
  // Future multiplayer: update planet ownership in a shared database here.
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
  if (!spendTurn("mine") || cargoSpaceLeft() <= 0) return;
  game.player.fuel -= 1;
  const amount = Math.min(cargoSpaceLeft(), 1 + Math.floor(Math.random() * (3 + game.player.upgrades.scanner)));
  game.player.cargo.Ore += amount;
  game.stats.resourcesMined += amount;
  game.stats.oreMined += amount;
  addLog(`Mined ${amount} Ore from the asteroid field.`);
  completeTutorialStep("mine");
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
    game.player.fuel += fuel;
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
  saveGame();
  render();
}

function submitMissionAnswer() {
  const input = document.getElementById("missionAnswer").value.trim();
  const mission = game.currentMission;
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
  if (roll < 0.34) {
    const credits = 50 + Math.floor(Math.random() * 71);
    game.player.credits += credits;
    game.missionFeedback = `Correct. Awarded ${credits} credits.`;
    addLog(`Correct mission answer. Awarded ${credits} credits.`);
  } else if (roll < 0.62) {
    const fuel = 2 + Math.floor(Math.random() * 4) + Math.floor(game.player.upgrades.engine / 3);
    game.player.fuel += fuel;
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
  const cost = game.player.upgrades[key] * 250;
  if (game.player.credits < cost) return;
  game.player.credits -= cost;
  game.player.upgrades[key] += 1;
  if (key === "cargoHold") game.player.cargoCapacity += 10;
  if (key === "engine") game.player.maxTurns = calculateMaxTurns(game.player.upgrades.engine);
  addLog(`Upgraded ${titleCase(key.replace(/([A-Z])/g, " $1"))} to level ${game.player.upgrades[key]}.`);
  saveGame();
  render();
}

function missionTemplates() {
  return [
    { id: "math-3", title: "Numbers in the Drift", objective: "Complete 3 math missions.", metric: "mathMissionsCompleted", target: 3, reward: { credits: 120, turns: 2 } },
    { id: "trade-300", title: "Honest Hauler", objective: "Earn 300 credits from trading.", metric: "creditsEarnedFromTrade", target: 300, reward: { credits: 80, fuel: 4 } },
    { id: "visit-5", title: "Lane Survey", objective: "Travel to 5 different sectors.", metric: "visitedSectors", target: 5, reward: { turns: 3, fuel: 2 } },
    { id: "mine-10", title: "Ore Sampler", objective: "Mine 10 Ore.", metric: "oreMined", target: 10, reward: { Ore: 2, credits: 75 } },
    { id: "scan-2", title: "Signal Notebook", objective: "Scan 2 anomalies.", metric: "anomaliesScanned", target: 2, reward: { Tech: 1, turns: 2 } },
    { id: "claim-1", title: "First Colony Charter", objective: "Claim 1 planet.", metric: "planetsClaimed", target: 1, reward: { credits: 150, Food: 2 } },
    { id: "deposit-10", title: "Supply Drop", objective: "Deposit 10 total resources onto a planet.", metric: "resourcesDeposited", target: 10, reward: { fuel: 5, turns: 2 } },
    { id: "planet-upgrade-1", title: "Builder Contract", objective: "Upgrade a planet.", metric: "planetUpgrades", target: 1, reward: { credits: 200, Tech: 1 } },
    { id: "sell-tech-5", title: "Circuit Broker", objective: "Sell 5 Tech.", metric: "techSold", target: 5, reward: { credits: 180, fuel: 3 } },
    { id: "credits-1000", title: "Four-Digit Ledger", objective: "Reach 1000 credits.", metric: "credits", target: 1000, reward: { turns: 4, fuel: 4 } },
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
  return game.stats[template.metric] || 0;
}

function syncProgressSystems() {
  let changed = false;
  game.player.maxTurns = calculateMaxTurns(game.player.upgrades.engine);
  if (game.player.turns > game.player.maxTurns) {
    game.player.turns = game.player.maxTurns;
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
    game.player.fuel += fuel;
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

function applyReward(reward) {
  if (reward.credits) game.player.credits += reward.credits;
  if (reward.fuel) game.player.fuel += reward.fuel;
  if (reward.turns) game.player.turns = Math.min(game.player.maxTurns, game.player.turns + reward.turns);
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

function calculateMaxTurns(engineLevel) { return BASE_MAX_TURNS + Math.max(0, engineLevel - 1) * 3; }
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
function cargoUsed() { return RESOURCES.reduce((sum, resource) => sum + game.player.cargo[resource], 0); }
function cargoSpaceLeft() { return game.player.cargoCapacity - cargoUsed(); }
function stat(label, value) { return `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`; }
function titleCase(text) { return text.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, "").replace(/\*+/g, ""); }
function addAndRender(message) { addLog(message); saveGame(); render(); }

// Future multiplayer: teacher dashboard actions such as class reset, roster summaries,
// progress review, and mission support would connect here in a later server-backed version.
