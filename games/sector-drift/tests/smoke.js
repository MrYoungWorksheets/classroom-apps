const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('games/sector-drift/app.js', 'utf8');
const elementStub = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [], innerHTML: '', value: '' };
const storage = new Map();
const localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
const context = { console, Math, Date, JSON, setTimeout, clearTimeout, fs, localStorage, source, document: { addEventListener: () => {}, getElementById: () => elementStub } };
vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(`
(function () {
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function clean(text) { return normalize(text).replace(/[^a-z0-9^=,./()+-]/g, ''); }
  function makePanelStub() { return { hidden: false, innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }; }
  Object.assign(panels, {
    ship: makePanelStub(),
    sector: makePanelStub(),
    action: makePanelStub(),
    docked: makePanelStub(),
    location: makePanelStub(),
    math: makePanelStub(),
    mission: makePanelStub(),
    tutorial: makePanelStub(),
    upgrade: makePanelStub(),
    achievements: makePanelStub(),
    stats: makePanelStub(),
    log: makePanelStub(),
  });
  game = defaultGameState();

  assert(game.player.turns === 100, 'defaultGameState should start with 100 turns');
  assert(game.player.maxTurns === 500, 'default turn bank should be 500');
  assert(calculateMaxTurnBank(3) === 600, 'engine should raise turn bank');
  assert(calculateDailyTurnGrant(3) === 120, 'engine should raise daily grant');
  game.player.turns = 450;
  game.player.lastTurnRefreshDate = '1999-01-01';
  refreshDailyTurns();
  assert(game.player.turns === 500, 'daily refresh should add turns up to bank');
  game.player.turns = 2;
  assert(spendTurn('scan') && game.player.turns === 1, 'spending turns should still work');

  game.player.currentSector = 3;
  game.player.fuel = 10;
  game.player.credits = 500;
  buyFuel(5);
  assert(game.player.fuel === 15, 'port refuel should add fuel');
  assert(game.player.credits === 460, 'port refuel should charge credits');
  game.player.fuel = game.player.maxFuel - 1;
  buyFuel(10);
  assert(game.player.fuel === game.player.maxFuel, 'fuel should not exceed maxFuel');
  game.player.currentSector = 2;
  game.player.fuel = 5;
  emergencyWarp();
  assert(game.player.currentSector === 1 && game.player.fuel === 0, 'emergency warp should cost 5 fuel and return to Sector 1');

  const bank = missionBank();
  const counts = new Map();
  for (const mission of bank) {
    counts.set(mission.tierName, (counts.get(mission.tierName) || 0) + 1);
    for (const key of ['id', 'tier', 'tierName', 'rewardMultiplier', 'prompt', 'format', 'answers', 'hint', 'explanation', 'skillTag']) {
      assert(mission[key] !== undefined, 'mission missing ' + key + ': ' + mission.id);
    }
    assert(Array.isArray(mission.answers) && mission.answers.length > 0, 'mission needs answers: ' + mission.id);
    const fmt = clean(mission.format);
    for (const answer of mission.answers) {
      const ans = clean(answer);
      if (ans.length > 1) assert(!fmt.includes(ans), 'format leaks answer for ' + mission.id + ': ' + answer);
    }
  }
  assert(counts.get('Basic') >= 8, 'needs 8 Basic missions');
  assert(counts.get('Standard') >= 8, 'needs 8 Standard missions');
  assert(counts.get('Advanced') >= 8, 'needs 8 Advanced missions');
  assert(counts.get('Expert') >= 6, 'needs 6 Expert missions');
  assert(counts.get('Elite') >= 4, 'needs 4 Elite missions');
  assert(generateMission(5).tier === 5, 'selected difficulty should generate same tier');
  assert(generateMission(99).tier === 2, 'empty/invalid tier should fall back to Standard');

  const basic = missionTierByNumber(1).reward;
  const elite = missionTierByNumber(5).reward;
  assert(elite.credits[0] > basic.credits[1] && elite.turns[0] > basic.turns[1], 'Elite rewards should exceed Basic rewards');
  game = defaultGameState();
  game.currentMission = missionBank().find((mission) => mission.tier === 5);
  game.player.fuel = 0;
  game.player.turns = 0;
  const oldCredits = game.player.credits;
  awardMissionReward();
  assert(game.player.credits > oldCredits, 'mission rewards should grant credits');
  assert(game.player.fuel <= game.player.maxFuel, 'reward fuel should respect maxFuel');
  assert(game.player.turns <= game.player.maxTurns, 'reward turns should respect turn bank');

  game = defaultGameState();
  const completedBefore = game.stats.mathMissionsCompleted;
  handleDevCode('9999');
  assert(game.stats.mathMissionsCompleted === completedBefore && !game.missionLocked, '9999 should not complete or lock mission');
  handleDevCode('6767');
  assert(cargoUsed() <= game.player.cargoCapacity, '6767 should jettison overflow');
  const creditsBefore = game.player.credits;
  applyDevCode('8888');
  assert(game.player.credits > creditsBefore, '8888 should still work');

  const legacy = migrateGameState({ player: { shipId: 'rustyComet', upgrades: { cargoHold: 9, engine: 9, scanner: 9, shield: 9 }, turns: 40 } });
  assert(legacy.player.legacyUpgradeOverride, 'legacy over-cap upgrades should be preserved');
  assert(legacy.player.maxTurns >= 900, 'legacy engine should still raise turn bank');

  game = defaultGameState();
  game.player.credits = 5000;
  game.player.cargo.Ore = 20;
  buyShip('nebulaSkiff');
  assert(game.player.shipId === 'rustyComet', 'ship purchase should block when cargo will not fit');

  const activeIds = game.activeMissions.map((mission) => mission.id);
  assert(new Set(activeIds).size === activeIds.length, 'active mission duplicates should not be created');
  const ports = Object.values(sectorMap).filter((sector) => sector.type === 'port');
  for (const port of ports) {
    for (const resource of RESOURCES) {
      assert(port.portPrices[resource].sell < port.portPrices[resource].buy, 'same-port arbitrage should not exist');
    }
  }
  assert(RESOURCES.some((resource) => ports.some((buyPort) => ports.some((sellPort) => sellPort.number !== buyPort.number && sellPort.portPrices[resource].sell > buyPort.portPrices[resource].buy))), 'port economy should include at least one profitable route');



  // Phase 2 combat identity and migration checks.
  game = defaultGameState();
  assert(game.player.reputation === 0, 'default reputation should be 0');
  assert(game.player.fighters === 0, 'default fighters should be 0');
  assert(game.player.fighterCapacity === SHIPS.rustyComet.fighterCapacity, 'fighter capacity should derive from starter ship');
  assert(typeof reputationTitle === 'function' && reputationTitle(75) === 'Star Marshal', 'reputationTitle should exist');
  assert(typeof combatRankTitle === 'function' && combatRankTitle({ reputation: 25, piratesDefeated: 5 }) === 'Deputy Pilot', 'combatRankTitle should use reputation and pirates defeated');
  assert(typeof nextCombatRankProgress === 'function' && nextCombatRankProgress({ reputation: 0, piratesDefeated: 0 }).includes('Patrol Volunteer'), 'nextCombatRankProgress should identify next rank');
  const migrated = migrateGameState({
    player: { credits: 777, fuel: 3, turns: 44, cargo: { Ore: 4 }, shipId: 'rustyComet', fighters: 99, fighterCapacity: 99 },
    planets: { 5: { owner: 'Cadet', productionLevel: 2, stored: { Ore: 1, Food: 2, Tech: 3 }, lastCollectedAt: 0 } },
    achievements: ['first-jump'],
    completedMissions: ['visit-3'],
    log: ['legacy'],
  });
  assert(migrated.player.credits === 777 && migrated.player.turns === 44 && migrated.player.cargo.Ore === 4, 'migration should preserve existing save fields');
  assert(migrated.planets[5].owner === 'Cadet' && migrated.achievements.includes('first-jump'), 'migration should preserve planets and achievements');
  assert(migrated.player.fighterCapacity === calculateFighterCapacity(SHIPS.rustyComet, migrated.player.upgrades), 'migration should recalculate fighter capacity');
  assert(migrated.player.fighters === 99, 'migration should preserve legacy over-cap fighters safely');
  assert(migrated.log[0].includes('preserved 99 fighters'), 'migration should log preserved over-cap fighters');

  // Fighter economy checks.
  game = defaultGameState();
  const shipyardSector = Object.values(sectorMap).find((sector) => sector.hasShipyard).number;
  game.player.currentSector = shipyardSector;
  game.player.credits = 1000;
  const cargoBeforeFighters = cargoUsed();
  buyFighters(10);
  assert(game.player.fighters === 10 && game.player.fightersBought === 10, 'fighters should be buyable at shipyards');
  assert(cargoUsed() === cargoBeforeFighters, 'fighters should not use cargo space');
  buyFighters('max');
  assert(game.player.fighters <= game.player.fighterCapacity, 'fighters should not exceed capacity');
  const fightersBeforeSell = game.player.fighters;
  sellFighters(10);
  assert(game.player.fighters === fightersBeforeSell - 10 && game.player.fightersSold === 10, 'fighters should be sellable at shipyards');

  // Pirate generation and persistence checks.
  game = defaultGameState();
  const pirates = Object.values(game.pirates);
  assert(pirates.length >= 8, 'at least 8 NPC pirates should exist');
  assert(!game.pirates[1], 'Sector 1 should have no pirate');
  assert(pirates.filter((pirate) => pirate.threatLevel >= 4).length >= 2, 'at least 2 strong pirates should exist');
  assert(pirates.filter((pirate) => pirate.isStronghold).length >= 2, 'at least 2 stronghold pirates should exist');
  const defeatedSave = { pirates: { 13: { ...game.pirates[13], defeated: true, hull: 0, fighters: 0 } } };
  assert(migrateGameState(defeatedSave).pirates[13].defeated, 'defeated pirates should remain defeated after migration');

  // Combat checks with deterministic randomness.
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  game = defaultGameState();
  game.player.currentSector = 13;
  game.player.fighters = game.player.fighterCapacity;
  const winCreditsBefore = game.player.credits;
  resolvePirateCombat('engage');
  assert(game.pirates[13].defeated && game.player.combatWins === 1, 'prepared player should beat a weak pirate reliably');
  assert(game.player.credits > winCreditsBefore && game.player.reputation > 0, 'winning should grant bounty and reputation');

  game = defaultGameState();
  game.player.currentSector = 48;
  game.player.fighters = 3;
  const hullBeforeStrong = game.player.hull;
  resolvePirateCombat('engage');
  assert(game.player.combatLosses === 1 && game.player.hull < hullBeforeStrong, 'weak player attacking strong pirate should take hull damage and lose');
  assert(game.player.fighters === 0, 'fighters should be lost before major hull damage');
  game.player.hull = 1;
  applyCombatDamage(0, 99, 'test destruction');
  assert(game.player.currentSector === 1 && game.player.hull === SHIPS.rustyComet.maxHull, 'hull <= 0 should trigger escape pod reset');
  Math.random = originalRandom;

  // Capped actual-loss accounting checks.
  game = defaultGameState();
  const cappedPirate = { ...game.pirates[13], fighters: 2, hull: 4 };
  const pirateDamage = applyPirateCombatDamage(cappedPirate, 15, 20);
  assert(pirateDamage.fightersDestroyed === 2 && game.player.fightersDestroyed === 2, 'pirate fighter losses should be capped to actual fighters');
  assert(pirateDamage.hullDamageDealt === 4 && game.player.pirateHullDamageDealt === 4, 'pirate hull damage should be capped to actual hull');
  game.player.fighters = 3;
  game.player.hull = 6;
  const playerDamage = applyCombatDamage(12, 99, 'capped test');
  assert(playerDamage.fightersLost === 3 && game.player.fightersLost === 3, 'player fighter losses should be capped to actual fighters');
  assert(playerDamage.hullDamage === 6 && game.player.playerHullDamageTaken === 6, 'player hull damage should be capped to actual hull');
  assert(game.log.some((entry) => entry.includes('lost 3 fighters') && entry.includes('6 hull')), 'combat logs should report actual capped losses');

  // Boarding and ship unlock checks.
  game = defaultGameState();
  game.player.currentSector = 13;
  assert(!canBoardPirate({ ...game.pirates[13], hull: 6, fighters: 0, npcOnly: true }), 'boarding unavailable when pirate hull > 5');
  assert(!canBoardPirate({ ...game.pirates[13], hull: 5, fighters: 4, npcOnly: true }), 'boarding unavailable when pirate fighters > 3');
  game.pirates[13].hull = 5;
  game.pirates[13].fighters = 3;
  game.player.fighters = 5;
  assert(canBoardPirate(game.pirates[13]), 'boarding available when pirate is disabled and fighters are low');
  Math.random = () => 0;
  boardPirateShip();
  Math.random = originalRandom;
  assert(game.pirates[13].defeated && game.player.shipsCaptured === 1, 'successful boarding should defeat an NPC pirate');
  assert(!canBoardPirate({ hull: 1, fighters: 0, defeated: false, npcOnly: false }), 'boarding should never target real players');
  game = defaultGameState();
  assert(!shipUnlockStatus(SHIPS.patrolCutter).unlocked, 'Patrol Cutter should be locked at default reputation');
  game.player.reputation = 10;
  assert(shipUnlockStatus(SHIPS.patrolCutter).unlocked, 'Patrol Cutter should unlock at reputation 10+');
  game.player.reputation = 40;
  game.player.piratesDefeated = 8;
  assert(shipUnlockStatus(SHIPS.marshalCorvette).unlocked, 'Marshal Corvette should unlock at reputation 40+');
  game.player.reputation = 75;
  game.player.piratesDefeated = 18;
  assert(shipUnlockStatus(SHIPS.starWardenFrigate).unlocked, 'Star Warden Frigate should unlock at reputation 75+');
  assert(!shipUnlockStatus(SHIPS.blackfinRaider).unlocked, 'locked pirate ships should not be purchasable');


  // Planet type, migration, upgrade clarity, production, and Fighter storage checks.
  game = defaultGameState();
  const generatedPlanets = Object.values(sectorMap).filter((sector) => sector.type === 'planet').map((sector) => getPlanetState(sector));
  assert(generatedPlanets.length > 0, 'generated planets should exist');
  for (const planet of generatedPlanets) {
    assert(planet.type, 'every generated planet needs a type');
    assert(planet.upgradeCaps && PLANET_UPGRADE_TRACKS.every((track) => planet.upgradeCaps[track] !== undefined), 'every generated planet needs upgrade caps');
    assert(planet.upgrades && PLANET_UPGRADE_TRACKS.every((track) => planet.upgrades[track] !== undefined), 'every generated planet needs upgrade tracks');
    assert(planet.stored.Fighters === 0, 'every generated planet needs stored Fighters');
  }
  assert(new Set(generatedPlanets.map((planet) => planet.type)).size > 1, 'planet types should vary');
  const oldSave = migrateGameState({ planets: { 'planet-14': { id: 'planet-14', name: 'Old Rock', owner: 'Cadet', productionLevel: 4, stored: { Ore: 7, Food: 8, Tech: 9 } } } });
  const migratedPlanet = oldSave.planets['planet-14'];
  assert(migratedPlanet.owner === 'Cadet', 'old owned planets remain owned');
  assert(migratedPlanet.upgrades.production === 4 && migratedPlanet.productionLevel === 4, 'old productionLevel maps to production upgrade');
  assert(migratedPlanet.stored.Ore === 7 && migratedPlanet.stored.Food === 8 && migratedPlanet.stored.Tech === 9, 'old stored resources are preserved');
  assert(migratedPlanet.stored.Fighters === 0, 'old planets gain stored Fighters');

  const rocky = normalizePlanetState({ id: 'planet-101', name: 'Rocky Test', type: 'Rocky', stored: { Ore: 1000, Food: 1000, Tech: 1000, Fighters: 1000 } }, 101);
  const fortress = normalizePlanetState({ id: 'planet-102', name: 'Fortress Test', type: 'Fortress', stored: { Ore: 1000, Food: 1000, Tech: 1000, Fighters: 1000 } }, 102);
  const crystal = normalizePlanetState({ id: 'planet-103', name: 'Crystal Test', type: 'Crystal' }, 103);
  const water = normalizePlanetState({ id: 'planet-104', name: 'Water Test', type: 'Water' }, 104);
  const jungle = normalizePlanetState({ id: 'planet-105', name: 'Jungle Test', type: 'Jungle' }, 105);
  const fire = normalizePlanetState({ id: 'planet-106', name: 'Fire Test', type: 'Fire' }, 106);
  assert(getPlanetUpgradeCost(rocky, 'production').Ore < getPlanetUpgradeCost({ ...rocky, upgrades: { ...rocky.upgrades, production: 4 } }, 'production').Ore, 'planet upgrade costs should increase');
  assert(PLANET_UPGRADE_TRACKS.every((track) => rocky.upgradeCaps[track] !== undefined), 'each upgrade track has a cap');
  assert(Object.keys(getPlanetUpgradeMissing(normalizePlanetState({ ...rocky, stored: { Ore: 0, Food: 0, Tech: 0, Fighters: 0 } }), 'production')).length > 0, 'upgrade card data can show missing resources');
  assert(getPlanetProductionPreview(rocky, 'production').Ore > getPlanetProduction(rocky).Ore, 'upgrading production changes preview');
  assert(getPlanetProductionPreview(fortress, 'fighterBays').Fighters > getPlanetProduction(fortress).Fighters, 'upgrading fighter bays changes Fighter preview');
  assert(getPlanetProductionPreview(crystal, 'research').Tech > getPlanetProduction(crystal).Tech, 'upgrading research changes Tech preview');
  assert(getPlanetDefenseRating({ ...rocky, upgrades: { ...rocky.upgrades, defense: 2 } }) > getPlanetDefenseRating(rocky), 'upgrading defense changes defense rating');
  assert(PLANET_PRODUCTION_RESOURCES.every((resource) => getPlanetProduction(rocky)[resource] !== undefined), 'planet production returns all resources');
  assert(getPlanetProduction(fortress).Fighters > getPlanetProduction(rocky).Fighters, 'Fortress produces more Fighters than Rocky');
  assert(getPlanetProduction(crystal).Tech > getPlanetProduction(water).Tech, 'Crystal produces more Tech than Water');
  assert(getPlanetProduction(jungle).Food > getPlanetProduction(fire).Food, 'Jungle produces more Food than Fire');

  game = defaultGameState();
  const planetSector = Object.values(sectorMap).find((sector) => sector.type === 'planet');
  game.player.currentSector = planetSector.number;
  claimPlanet();
  game.lastProductionAt = 0;
  const claimed = game.planets[planetSector.planet.id];
  claimed.upgrades.fighterBays = claimed.upgradeCaps.fighterBays > 0 ? 1 : 0;
  game.planets[claimed.id] = claimed;
  const cargoBeforeProduction = cargoUsed();
  collectPlanetProduction();
  assert(game.planets[claimed.id].stored.Fighters >= 0, 'collected production stores Fighters on planets');
  assert(cargoUsed() === cargoBeforeProduction, 'planet Fighter production does not affect cargo');

  game.planets[claimed.id].stored.Fighters = 20;
  game.player.fighters = 0;
  const cargoBeforeLoad = cargoUsed();
  transferPlanetFighters('load', 'max');
  assert(game.player.fighters <= game.player.fighterCapacity, 'loading fighters respects fighterCapacity');
  assert(cargoUsed() === cargoBeforeLoad, 'loading fighters does not affect cargo');
  const ownedFightersAfterLoad = game.player.fighters;
  game.planets[claimed.id].owner = 'Someone Else';
  transferPlanetFighters('load', '1');
  assert(game.player.fighters === ownedFightersAfterLoad, 'cannot load fighters from unowned planet');
  game.planets[claimed.id].owner = game.player.pilotName;
  game.planets[claimed.id].stored.Fighters = 1;
  game.player.fighters = 0;
  transferPlanetFighters('load', '10');
  assert(game.player.fighters === 1, 'cannot load more fighters than planet has');



  // Docked cockpit screen system.
  game = defaultGameState();
  assert(game.ui.activeScreen === 'cockpit', 'default active screen should be cockpit');
  openScreen('starbase');
  assert(game.ui.activeScreen === 'starbase', 'openScreen should open starbase');
  closeScreen();
  assert(game.ui.activeScreen === 'cockpit', 'closeScreen should return to cockpit');
  openScreen('not-a-screen');
  assert(game.ui.activeScreen === 'cockpit', 'unknown screens should fall back safely');
  renderActiveScreen();
  game.player.currentSector = 1;
  openScreen('starbase');
  assert(panels.docked.innerHTML.includes('Starbase'), 'starbase docked screen should render at a port');
  game.player.currentSector = Object.values(sectorMap).find((sector) => sector.hasShipyard).number;
  openScreen('shipyard');
  assert(panels.docked.innerHTML.includes('Shipyard') && panels.docked.innerHTML.includes('Trade-in'), 'shipyard docked screen should show trade-in cards');
  assert(panels.docked.innerHTML.includes('stat-delta-positive') && panels.docked.innerHTML.includes('stat-delta-neutral'), 'shipyard cards should render comparison delta classes');
  const currentShipCard = renderShipCard(SHIPS.rustyComet);
  assert(currentShipCard.includes('Current Ship') && currentShipCard.includes('(±0)'), 'current ship card should show current status and neutral comparisons');
  const haulerCard = renderShipCard(SHIPS.atlasHauler);
  assert(haulerCard.includes('Cargo') && haulerCard.includes('(+16)') && haulerCard.includes('stat-delta-positive'), 'larger cargo ship should show positive cargo delta');
  const lockedShipCard = renderShipCard(SHIPS.blackfinRaider);
  assert(lockedShipCard.includes('Locked') && lockedShipCard.includes('stat-delta'), 'locked ships should still render comparison deltas');
  openScreen('specialMissions');
  assert(panels.docked.innerHTML.includes('Math Mission') && panels.docked.innerHTML.includes('Delivery / Fetch Missions'), 'special missions should include math and delivery foundations');

  // Ship trade-in and fighter/cargo guards.
  game = defaultGameState();
  game.player.credits = 10000;
  const freighterCost = netShipCost(SHIPS.atlasHauler);
  assert(shipTradeInValue(currentShip()) === 0, 'starter ship should have zero trade-in value');
  buyShip('atlasHauler');
  assert(game.player.shipId === 'atlasHauler', 'ship purchase should switch active ship');
  assert(game.player.ownedShips.length === 1 && game.player.ownedShips[0] === 'atlasHauler', 'ship purchase should not keep ghost ships');
  assert(game.player.credits === 10000 - freighterCost, 'ship purchase should charge net cost');
  game.player.credits = 10000;
  game.player.fighters = game.player.fighterCapacity;
  const lowerFighterCard = renderShipCard(SHIPS.nebulaSkiff);
  assert(lowerFighterCard.includes('Fighters') && lowerFighterCard.includes('(-25)') && lowerFighterCard.includes('stat-delta-negative'), 'lower fighter capacity ship should show negative fighter delta');
  buyShip('nebulaSkiff');
  assert(game.player.shipId === 'atlasHauler', 'ship purchase should block when fighters will not fit');

  game = defaultGameState();
  game.player.credits = 10000;
  game.player.cargo.Ore = 25;
  const cargoBlockedCard = renderShipCard(SHIPS.nebulaSkiff);
  assert(cargoBlockedCard.includes('Cannot Fit Cargo') && cargoBlockedCard.includes('Current cargo will not fit'), 'shipyard card should explain cargo blocking');

  // Protected space, Alliance, smuggled inventory, and route travel foundations.
  game = defaultGameState();
  assert(isProtectedSpace(1), 'Sector 1 should be protected');
  assert(sectorMap[1].adjacent.every((sector) => isProtectedSpace(sector)), 'sectors one lane step from 1 should be protected');
  assert(sectorMap[1].adjacent.flatMap((sector) => sectorMap[sector].adjacent).every((sector) => isProtectedSpace(sector)), 'sectors two lane steps from 1 should be protected');
  assert(!Object.keys(game.pirates).some((sector) => isProtectedSpace(Number(sector))), 'pirates should not spawn in protected space');
  game.player.currentSector = 1;
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('Alliance Protected Space'), 'protected label should appear in sector intel');
  resolveAllianceSearch(true);
  assert(game.player.cargo.Smuggled === 0, 'Alliance search should handle no smuggled inventory');
  game.player.cargo.Smuggled = 3;
  resolveAllianceSearch(true);
  assert(game.player.cargo.Smuggled >= 0 && game.player.cargo.Smuggled < 3, 'Alliance search should confiscate smuggled inventory safely');
  assert(SMUGGLED_DESCRIPTION.includes('Unregistered cargo') && !SMUGGLED_DESCRIPTION.match(/drug|weapon/i), 'smuggled display should stay vague and classroom-safe');
  const migratedSmuggled = migrateGameState({ player: { cargo: { Smuggled: 2 } } });
  assert(migratedSmuggled.player.cargo.Smuggled === 2, 'migration should preserve smuggled inventory field');
  game = defaultGameState();
  game.revealedSectors = [1, 2, 3, 4];
  const route = findRouteToSector(1, 4);
  assert(route && route[0] === 1 && route[route.length - 1] === 4, 'route helper should find known lane route');
  assert(findRouteToSector(1, 999) === null, 'route helper should reject invalid target');
  game.player.fuel = 10;
  game.player.turns = 10;
  setWarpDestination(4);
  maybeTravelEvent = function () { return false; };
  resolveSectorDanger = function () { return false; };
  const fuelBeforeWarp = game.player.fuel;
  const turnsBeforeWarp = game.player.turns;
  performWarpStep();
  assert(game.player.currentSector !== 1 && game.player.fuel === fuelBeforeWarp - 1, 'warp step should move and consume normal fuel');
  game.player.fuel = 0;
  const sectorBeforeStop = game.player.currentSector;
  performWarpStep();
  assert(game.player.currentSector === sectorBeforeStop, 'warp step should stop when out of fuel');

  // Mission board combat progress and existing system guards.
  game = defaultGameState();
  game.player.piratesDefeated = 1;
  game.activeMissions = [createActiveMission('pirates-1')];
  syncProgressSystems();
  assert(game.activeMissions[0].readyLogged, 'combat missions should progress');
  game.activeMissions = [createActiveMission('visit-3'), createActiveMission('visit-3')];
  while (game.activeMissions.length < 3) {
    const next = nextAvailableMission(game.activeMissions, game.completedMissions);
    if (!next) break;
    game.activeMissions.push(createActiveMission(next.id));
  }
  const boardIds = game.activeMissions.map((mission) => mission.id);
  assert(new Set(boardIds).size !== boardIds.length || boardIds.filter((id) => id === 'visit-3').length === 2, 'manual duplicates should not cause generated replacement duplicates');

  const oldZoom = game.ui.mapZoom;
  zoomMap(0.25);
  assert(game.ui.mapZoom > oldZoom, 'map zoom should still update');
  assert(renderMinimap().includes('data-map-sector'), 'minimap should render clickable sector nodes');

  // Firebase readiness, launch gate, admin role, and local-save safety checks.
  assert(source.includes('const REQUIRE_FIREBASE_LOGIN = true'), 'app.js should define login-first requirement');
  assert(source.includes('function renderLaunchScreen()'), 'launch/login screen renderer should exist');
  assert(source.includes('function renderAdminPanelScreen()'), 'teacher Admin Panel renderer should exist');
  const firebaseClientSource = fs.readFileSync('games/sector-drift/firebase-client.js', 'utf8');
  assert(firebaseClientSource.includes('ensureUserProfile'), 'firebase-client should keep user profile helper');
  assert(firebaseClientSource.includes('role: "student"'), 'firebase-client should create first sign-in users as students');
  assert(firebaseClientSource.includes('roleReason'), 'firebase-client should expose friendly role lookup reasons');

  game = defaultGameState();
  window = {};
  launchGate.mode = 'signedOut';
  cloudUiState.status = 'not initialized';
  cloudUiState.user = null;
  cloudUiState.role = 'unknown';
  game.ui.activeScreen = 'launch';
  renderActiveScreen();
  assert(panels.docked.innerHTML.includes('Sector Drift') && panels.docked.innerHTML.includes('Sign in with Google'), 'launch/login screen can render signed-out state');
  openScreen('starbase');
  assert(game.ui.activeScreen === 'launch', 'signed-out state blocks cockpit/gameplay screens when login is required');
  enterLocalPrototypeMode();
  assert(game.ui.activeScreen === 'cockpit', 'Local Prototype Mode can enter cockpit when enabled');

  launchGate.mode = 'signedIn';
  cloudUiState.status = 'available';
  cloudUiState.user = { uid: 'student-1', email: 'student@example.com', displayName: 'Student One' };
  cloudUiState.role = 'student';
  game.ui.activeScreen = 'cockpit';
  renderActionPanel();
  assert(!panels.action.innerHTML.includes('Admin Panel'), 'student role does not show Admin Panel');
  openScreen('adminPanel');
  assert(game.ui.activeScreen !== 'adminPanel', 'non-teacher cannot open Admin Panel');

  cloudUiState.user = { uid: 'teacher-1', email: 'teacher@example.com', displayName: 'Teacher One' };
  cloudUiState.role = 'teacher';
  window.SectorDriftFirebase = {
    getFirebaseStatus: () => ({ ok: true, status: 'available', user: cloudUiState.user, role: 'teacher', roleReason: 'test teacher role' }),
    getCurrentFirebaseUser: () => ({ ok: true, data: cloudUiState.user }),
    getCurrentUserRole: () => ({ ok: true, data: 'teacher', reason: 'test teacher role' }),
  };
  launchGate.mode = 'signedIn';
  game.ui.activeScreen = 'cockpit';
  renderActionPanel();
  assert(panels.action.innerHTML.includes('Admin Panel'), 'teacher role shows Admin Panel action');
  openScreen('adminPanel');
  assert(panels.docked.innerHTML.includes('Teacher access confirmed') && panels.docked.innerHTML.includes('Cloud Save / Recovery Tools'), 'teacher Admin Panel renders classroom shell');
  window = undefined;

  game = defaultGameState();
  openScreen('settings');
  assert(panels.docked.innerHTML.includes('Cloud Login / Firebase Backup'), 'settings should render Firebase login/cloud backup section');
  assert(panels.docked.innerHTML.includes('Cloud backup unavailable') || panels.docked.innerHTML.includes('not initialized'), 'settings should be friendly when Firebase global is missing');
  assert(panels.docked.innerHTML.includes('Sign in first') || panels.docked.innerHTML.includes('Cloud backup unavailable'), 'settings cloud panel explains signed-out save/load state');
  const currentCredits = game.player.credits;
  const badLoad = applyLoadedSavePayload({ notPlayerData: true });
  assert(!badLoad.ok && game.player.credits === currentCredits, 'bad cloud save payload cannot wipe current local save');
  const migratedCloud = applyLoadedSavePayload({ player: { credits: 4321, shipId: 'rustyComet' }, log: ['cloud legacy'] });
  assert(migratedCloud.ok && game.player.credits === 4321 && game.player.shipId === 'rustyComet', 'cloud load should run migration before applying');
  const payload = getCurrentSavePayload();
  assert(payload.version === STORAGE_KEY && payload.ui.activeScreen === 'cockpit', 'cloud payload should preserve save data while avoiding docked-screen restore');
  game.player.credits = 2468;
  saveGame();
  assert(loadGame().player.credits === 2468, 'localStorage save/load should still work');
  const html = fs.readFileSync('games/sector-drift/index.html', 'utf8');
  assert(html.includes('<script type="module" src="firebase-client.js"></script>'), 'index.html should load firebase-client.js as a module script');
})();
`, context);
console.log('Sector Drift smoke checks passed.');
