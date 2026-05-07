const STORAGE_KEY = "sectorDriftSaveV1";
const PRODUCTION_COOLDOWN_MS = 10 * 60 * 1000;
const RESOURCES = ["Ore", "Food", "Tech"];

let sectorMap = createSectorMap();
let game = loadGame();

const panels = {};

document.addEventListener("DOMContentLoaded", () => {
  panels.ship = document.getElementById("shipPanel");
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
      objects: getSectorObjects(type, number),
    };

    if (type === "port") sectors[number].portPrices = createPortPrices(number);
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

function createPortPrices(number) {
  return {
    Ore: { buy: 14 + (number % 6), sell: 9 + (number % 5) },
    Food: { buy: 10 + ((number * 2) % 5), sell: 6 + (number % 4) },
    Tech: { buy: 34 + ((number * 3) % 12), sell: 22 + (number % 9) },
  };
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
  return {
    player: {
      pilotName: "Cadet",
      shipName: "Rusty Comet",
      credits: 500,
      fuel: 20,
      cargoCapacity: 20,
      currentSector: 1,
      cargo: { Ore: 0, Food: 0, Tech: 0 },
      upgrades: { cargoHold: 1, engine: 1, scanner: 1, shield: 1 },
    },
    planets: {},
    log: ["Welcome to Sector Drift. Start at Sector 1 and move at your own pace."],
    currentMission: generateMission(),
    missionAttempts: 0,
    missionLocked: false,
    missionFeedback: "Solve the mission for credits, fuel, or cargo.",
    lastProductionAt: 0,
  };
}

function loadGame() {
  // Future multiplayer: load player profile from a database here.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultGameState();
  try {
    const parsed = JSON.parse(saved);
    return { ...defaultGameState(), ...parsed, currentMission: rehydrateMission(parsed.currentMission) };
  } catch (error) {
    return defaultGameState();
  }
}

function saveGame() {
  // Future multiplayer: save player profile to a database here.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function render() {
  renderShipPanel();
  renderSectorPanel();
  renderLocationPanel();
  renderMathMission();
  renderUpgradePanel();
  renderLogPanel();
}

function renderShipPanel() {
  const p = game.player;
  panels.ship.innerHTML = `
    <h2 id="shipHeading">Ship Status</h2>
    <div class="stat-grid">
      ${stat("Pilot", p.pilotName)}${stat("Ship", p.shipName)}${stat("Credits", p.credits)}${stat("Fuel", p.fuel)}${stat("Sector", p.currentSector)}${stat("Cargo Space", `${cargoUsed()}/${p.cargoCapacity}`)}
    </div>
    <h3>Cargo</h3>
    <div class="cargo-grid">${RESOURCES.map((r) => `<div class="resource"><span class="label">${r}</span><span class="value">${p.cargo[r]}</span></div>`).join("")}</div>
    <h3>Upgrades</h3>
    <div class="cargo-grid">
      ${stat("Cargo Hold", `Level ${p.upgrades.cargoHold}`)}${stat("Engine", `Level ${p.upgrades.engine}`)}${stat("Scanner", `Level ${p.upgrades.scanner}`)}${stat("Shield", `Level ${p.upgrades.shield}`)}
    </div>`;
}

function renderSectorPanel() {
  const sector = sectorMap[game.player.currentSector];
  const noFuel = game.player.fuel <= 0;
  panels.sector.innerHTML = `
    <h2 id="sectorHeading">Current Sector</h2>
    <span class="badge">Sector ${sector.number}: ${titleCase(sector.type)}</span>
    <p class="flavor">${sector.flavor}</p>
    <p><strong>Visible objects:</strong> ${sector.objects.join(", ")}</p>
    <h3>Adjacent Sectors</h3>
    <div class="travel-grid">
      ${sector.adjacent.map((number) => `<button type="button" ${noFuel ? "disabled" : ""} data-action="travel" data-sector="${number}">Travel to ${number}</button>`).join("")}
    </div>
    ${noFuel ? `<p class="cooldown">Fuel is empty. Complete math missions for fuel or trade when you reach a port.</p>` : `<p class="help-text">Travel costs 1 fuel and saves immediately.</p>`}`;
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
  return `<p class="help-text">Buy cargo when prices are fair, or sell resources for credits.</p><div class="trade-grid">${RESOURCES.map((resource) => {
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
  return `<h3>Asteroid Field</h3><p>Spend 1 fuel to mine a small amount of Ore. Scanner upgrades improve results.</p><button data-action="mine" ${game.player.fuel <= 0 || cargoSpaceLeft() <= 0 ? "disabled" : ""}>Mine Asteroids</button>`;
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
  const upgrades = [
    ["cargoHold", "Cargo Hold", "+10 cargo capacity each level"],
    ["engine", "Engine", "+1 bonus fuel reward every 3 levels"],
    ["scanner", "Scanner", "Improves mining and anomaly scans"],
    ["shield", "Shield", "Future defensive systems; no combat yet"],
  ];
  panels.upgrade.innerHTML = `<h2 id="upgradeHeading">Ship Upgrades</h2><div class="upgrade-grid">${upgrades.map(([key, name, desc]) => {
    const level = game.player.upgrades[key];
    const cost = level * 250;
    return `<div class="mini-card"><h3>${name}</h3><p>Level ${level}</p><p class="help-text">${desc}</p><button data-upgrade="${key}" ${game.player.credits < cost ? "disabled" : ""}>Upgrade for ${cost}</button></div>`;
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
  addLog(`Traveled to Sector ${number}.`);
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
  saveGame();
  render();
}

function scanAnomaly() {
  const scanner = game.player.upgrades.scanner;
  const roll = Math.random() + scanner * 0.05;
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
    game.player.fuel += fuel;
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
  const cost = game.player.upgrades[key] * 250;
  if (game.player.credits < cost) return;
  game.player.credits -= cost;
  game.player.upgrades[key] += 1;
  if (key === "cargoHold") game.player.cargoCapacity += 10;
  addLog(`Upgraded ${titleCase(key.replace(/([A-Z])/g, " $1"))} to level ${game.player.upgrades[key]}.`);
  saveGame();
  render();
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

function cargoUsed() { return RESOURCES.reduce((sum, resource) => sum + game.player.cargo[resource], 0); }
function cargoSpaceLeft() { return game.player.cargoCapacity - cargoUsed(); }
function stat(label, value) { return `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`; }
function titleCase(text) { return text.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, "").replace(/\*+/g, ""); }
function addAndRender(message) { addLog(message); saveGame(); render(); }

// Future multiplayer: teacher dashboard actions such as class reset, roster summaries,
// progress review, and mission support would connect here in a later server-backed version.
