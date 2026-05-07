const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('games/sector-drift/app.js', 'utf8');
const elementStub = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [], innerHTML: '', value: '' };
const context = { console, Math, Date, JSON, setTimeout, clearTimeout, document: { addEventListener: () => {}, getElementById: () => elementStub } };
vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(`
(function () {
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function clean(text) { return normalize(text).replace(/[^a-z0-9^=,./()+-]/g, ''); }
  const panelStub = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
  Object.assign(panels, {
    ship: panelStub,
    sector: panelStub,
    location: panelStub,
    math: panelStub,
    mission: panelStub,
    tutorial: panelStub,
    upgrade: panelStub,
    achievements: panelStub,
    stats: panelStub,
    log: panelStub,
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
})();
`, context);
console.log('Sector Drift smoke checks passed.');
