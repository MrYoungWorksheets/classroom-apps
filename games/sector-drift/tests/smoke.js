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

  const oldZoom = game.ui.mapZoom;
  zoomMap(0.25);
  assert(game.ui.mapZoom > oldZoom, 'map zoom should still update');
  assert(renderMinimap().includes('data-map-sector'), 'minimap should render clickable sector nodes');
})();
`, context);
console.log('Sector Drift smoke checks passed.');
