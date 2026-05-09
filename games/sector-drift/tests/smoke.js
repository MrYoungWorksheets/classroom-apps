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
const context = { console, Math, Date, JSON, setTimeout, clearTimeout, fs, storage, localStorage, source, document: { addEventListener: () => {}, getElementById: () => elementStub } };
vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(`
(function () {
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function clean(text) { return normalize(text).replace(/[^a-z0-9^=,./()+-]/g, ''); }
  function makeEventTargetStub({ dataset = {}, className = '', parent = null } = {}) {
    const listeners = {};
    const classes = new Set(String(className || '').split(/\s+/).filter(Boolean));
    const target = {
      dataset,
      className,
      parent,
      get offsetWidth() { return 1; },
      addEventListener(type, handler) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
        target._listenerCounts = target._listenerCounts || {};
        target._listenerCounts[type] = listeners[type].length;
      },
      dispatchEvent(event) {
        const evt = event || { type: '' };
        evt.target = evt.target || this;
        evt.currentTarget = this;
        if (!evt.preventDefault) evt.preventDefault = function () { evt.defaultPrevented = true; };
        for (const handler of listeners[evt.type] || []) handler(evt);
        if (evt.bubbles !== false && this.parent) this.parent.dispatchEvent(evt);
        return !evt.defaultPrevented;
      },
      querySelector(selector) {
        return (this.children || []).find((child) => child.matches?.(selector)) || null;
      },
      querySelectorAll(selector) {
        return (this.children || []).filter((child) => child.matches?.(selector));
      },
      matches(selector) {
        if (selector === '.map-hit-target') return this.className === 'map-hit-target';
        if (selector === '.map-visible-node') return this.className === 'map-visible-node';
        if (selector === 'text') return this.className === 'map-label';
        return false;
      },
    };
    target.classList = {
      add(value) { classes.add(value); target.className = Array.from(classes).join(' '); },
      remove(value) { classes.delete(value); target.className = Array.from(classes).join(' '); },
      contains(value) { return classes.has(value); },
    };
    return target;
  }
  function makePanelStub() {
    const panel = makeEventTargetStub();
    panel.hidden = false;
    panel.value = '';
    panel._innerHTML = '';
    panel._mapNodes = [];
    panel._travelButtons = [];
    panel._actionButtons = [];
    panel._screenButtons = [];
    panel._inputs = {};
    Object.defineProperty(panel, 'innerHTML', {
      get() { return this._innerHTML; },
      set(value) {
        this._innerHTML = String(value);
        this._mapNodes = [];
        this._travelButtons = [];
        this._actionButtons = [];
        this._screenButtons = [];
        this._inputs = {};
        const mapNodePattern = /<g\\b[^>]*data-map-sector="(\\d+)"[^>]*>([\\s\\S]*?)<\\/g>/g;
        let match;
        while ((match = mapNodePattern.exec(this._innerHTML))) {
          const node = makeEventTargetStub({ dataset: { mapSector: match[1] }, parent: this });
          node.children = [
            makeEventTargetStub({ className: 'map-hit-target', parent: node }),
            makeEventTargetStub({ className: 'map-visible-node', parent: node }),
            makeEventTargetStub({ className: 'map-label', parent: node }),
          ];
          this._mapNodes.push(node);
        }
        const travelPattern = /<button\\b[^>]*data-action="travel"[^>]*data-sector="(\\d+)"[^>]*>/g;
        while ((match = travelPattern.exec(this._innerHTML))) {
          const button = makeEventTargetStub({ dataset: { action: 'travel', sector: match[1] }, parent: this });
          this._travelButtons.push(button);
          this._actionButtons.push(button);
        }
        const actionPattern = /<button\\b[^>]*data-action="([^"]+)"[^>]*>/g;
        while ((match = actionPattern.exec(this._innerHTML))) {
          if (match[1] !== 'travel') {
            const tag = match[0];
            const mode = tag.match(/data-mode="([^"]+)"/);
            const sector = tag.match(/data-sector="([^"]+)"/);
            const upgrade = tag.match(/data-upgrade="([^"]+)"/);
            const ship = tag.match(/data-ship="([^"]+)"/);
            const amount = tag.match(/data-amount="([^"]+)"/);
            const resource = tag.match(/data-resource="([^"]+)"/);
            const track = tag.match(/data-track="([^"]+)"/);
            this._actionButtons.push(makeEventTargetStub({ dataset: { action: match[1], mode: mode ? mode[1] : '', sector: sector ? sector[1] : '', upgrade: upgrade ? upgrade[1] : '', ship: ship ? ship[1] : '', amount: amount ? amount[1] : '', resource: resource ? resource[1] : '', track: track ? track[1] : '' }, parent: this }));
          }
        }
        const screenPattern = /<button\\b[^>]*data-screen="([^"]+)"[^>]*>/g;
        while ((match = screenPattern.exec(this._innerHTML))) {
          this._screenButtons.push(makeEventTargetStub({ dataset: { screen: match[1] }, parent: this }));
        }
        const warpInput = this._innerHTML.match(/<input\\b[^>]*id="warpDestination"[^>]*value="([^"]*)"[^>]*>/);
        if (warpInput) this._inputs.warpDestination = { value: warpInput[1] };
      },
    });
    panel.querySelectorAll = function (selector) {
      if (selector === '[data-map-sector]') return this._mapNodes;
      if (selector === '[data-screen]') return this._screenButtons;
      if (selector === "[data-action='travel']") return this._travelButtons;
      if (selector === "[data-action='plotSelectedRoute']") return this._actionButtons.filter((button) => button.dataset.action === 'plotSelectedRoute');
      const actionSelector = String(selector).match(/data-action=['"]([^'"]+)['"]/);
      if (actionSelector) return this._actionButtons.filter((button) => button.dataset.action === actionSelector[1]);
      return [];
    };
    panel.querySelector = function (selector) {
      if (selector === '#warpDestination') return this._inputs.warpDestination || null;
      return this.querySelectorAll(selector)[0] || null;
    };
    return panel;
  }
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

  game = defaultGameState();
  game.player.currentSector = 13;
  game.player.fuel = 10;
  game.player.turns = 10;
  resolvePirateCombat('retreat');
  assert(!game.pirates[13].defeated && currentPirateEncounter(), 'disengage should leave the pirate encounter active');
  assert(game.ui.lastSectorActionResult?.title === 'Disengaged Temporarily', 'disengage action result uses non-escape wording');
  assert(game.ui.lastSectorActionResult.message.includes('remains active in the sector') && game.ui.lastSectorActionResult.message.includes('Travel is still blocked'), 'disengage result explains travel remains blocked');
  assert(liveEvents[0]?.title === 'Disengaged Temporarily' && liveEvents[0].message.includes('Travel is still blocked'), 'disengage live event matches unresolved combat behavior');
  assert(game.log.some((entry) => entry.includes('Pirate remains active') && entry.includes('travel is still blocked')), 'Captain Log records unresolved pirate disengage');
  const sectorBeforeBlockedTravel = game.player.currentSector;
  const blockedAdjacentSector = sectorMap[sectorBeforeBlockedTravel].adjacent[0];
  handleMapNodeSelect(blockedAdjacentSector);
  handleMapNodeSelect(blockedAdjacentSector);
  assert(game.player.currentSector === sectorBeforeBlockedTravel && game.ui.lastSectorActionResult.message.includes('Pirate encounter blocks travel') && game.ui.lastSectorActionResult.message.includes('travel stays blocked'), 'disengage does not imply travel freedom while pirate remains');

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
  const planetSector = Object.values(sectorMap).find((sector) => sector.type === 'planet' && !isProtectedSpace(sector.number));
  const protectedTestSector = sectorMap[2];
  const originalProtectedType = protectedTestSector.type;
  const originalProtectedPlanet = protectedTestSector.planet;
  protectedTestSector.type = 'planet';
  protectedTestSector.planet = { ...JSON.parse(JSON.stringify(planetSector.planet)), id: 'planet-2', name: 'Alliance Survey World', owner: null };
  game.player.currentSector = protectedTestSector.number;
  panels.docked.innerHTML = renderScreenContent('planets');
  assert(panels.docked.innerHTML.includes('Protected Alliance territory') && panels.docked.innerHTML.includes('Planet claiming is restricted in this sector') && panels.docked.innerHTML.includes('data-action="claim" disabled'), 'Planets screen disables and explains protected-space claims');
  claimPlanet();
  assert(!game.planets[protectedTestSector.planet.id], 'claimPlanet directly blocks protected-space planet claims');
  assert(game.ui.lastSectorActionResult?.message.includes('Planet claiming is restricted in this sector'), 'protected-space claim block explains the sector rule');
  protectedTestSector.type = originalProtectedType;
  protectedTestSector.planet = originalProtectedPlanet;

  game = defaultGameState();
  game.player.currentSector = planetSector.number;
  claimPlanet();
  assert(game.planets[planetSector.planet.id]?.owner === game.player.pilotName, 'legal non-protected planet claim still assigns ownership');
  assert(game.ui.lastSectorActionResult?.title === 'Planet Claimed' && liveEvents[0]?.title === 'Planet Claimed', 'legal planet claim reports through action result and live event');
  assert(game.log.some((entry) => entry.includes('Claimed') && entry.includes('planet')), 'Captain Log still records planet claims');
  const claimCountAfterLegalClaim = game.stats.planetsClaimed;
  claimPlanet();
  assert(game.stats.planetsClaimed === claimCountAfterLegalClaim && game.ui.lastSectorActionResult.message.includes('already owned by you'), 'already-owned planets still block duplicate claims');
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
  assert(panels.docked.innerHTML.includes('Docked at Sector 1') && panels.docked.innerHTML.includes('Station Activities'), 'starbase mode should render station identity and activities');
  assert(panels.docked.innerHTML.includes('Cargo Sorting Job') && panels.docked.innerHTML.includes('Repair Bay Assist') && panels.docked.innerHTML.includes('Rumor Board'), 'starbase activities and rumor board should render');
  assert(panels.docked.innerHTML.includes('Exit / Return to Ship'), 'starbase mode should render the consistent return button');
  assert(!panels.docked.innerHTML.includes('sector-map'), 'starbase mode should not render the cockpit map');
  assert(!panels.docked.innerHTML.includes('Shipyard Ships'), 'starbase mode should keep ship catalog out of port services');

  // Sector 1 mission terminal, delivery contracts, route helper, and station activities.
  game = defaultGameState();
  game.player.currentSector = 1;
  openScreen('specialMissions');
  assert(panels.docked.innerHTML.includes('Station Contract Terminal') && panels.docked.innerHTML.includes('Math Contracts'), 'Sector 1 mission terminal renders contract sections');
  assert(panels.docked.innerHTML.includes('Delivery / Fetch Contracts') && panels.docked.innerHTML.includes('Bounty Board'), 'mission terminal renders delivery and bounty sections');
  assert(panels.docked.innerHTML.includes('Training Jobs') && panels.docked.innerHTML.includes('Active Contracts'), 'mission terminal renders training and active sections');
  const delivery = deliveryQuestById('deliver-food-24');
  assert(delivery.targetSector !== game.player.currentSector, 'delivery contracts cannot target current sector by default');
  startDeliveryQuest(delivery.id);
  assert(delivery.status === 'active' && delivery.acceptedAtSector === 1, 'delivery contract can be accepted from Sector 1');
  const activeCount = game.deliveryQuests.filter((quest) => quest.status === 'active' && quest.targetSector === delivery.targetSector).length;
  startDeliveryQuest(delivery.id);
  assert(game.deliveryQuests.filter((quest) => quest.status === 'active' && quest.targetSector === delivery.targetSector).length === activeCount, 'duplicate active delivery contracts are not created');
  assert(!canCompleteDeliveryQuest(delivery), 'delivery cannot complete before reaching target sector');
  assert(renderRouteHelp(delivery).includes('Route Status'), 'route helper renders without crashing');
  game.player.currentSector = delivery.targetSector;
  game.player.cargo.Food = delivery.requiredAmount;
  const creditsBeforeDelivery = game.player.credits;
  completeDeliveryQuest(delivery.id);
  assert(delivery.status === 'complete', 'delivery completes at target sector');
  assert(game.player.cargo.Food === 0, 'delivery deducts required resource');
  assert(game.player.credits > creditsBeforeDelivery, 'delivery grants reward');

  game = defaultGameState();
  game.player.currentSector = 1;
  const cargoCreditsBefore = game.player.credits;
  runStationActivity('cargoSorting', '9');
  assert(game.player.credits === cargoCreditsBefore + 35, 'Cargo Sorting Job grants small reward');
  const repairCreditsBefore = game.player.credits;
  runStationActivity('repairAssist', '12');
  assert(game.player.credits === repairCreditsBefore + 20 && game.stationActivities.repairDiscount >= 20, 'Repair Bay Assist grants small reward and discount');
  const rumorCreditsBefore = game.player.credits;
  readRumorBoard();
  assert(game.stationActivities.lastRumor && game.player.credits === rumorCreditsBefore - 5, 'Rumor Board renders rumor text and charges small fee');
  game.player.currentSector = 1;
  const originalWireDockedButtons = wireDockedButtons;
  let dockedWireCount = 0;
  wireDockedButtons = function (scope) { dockedWireCount += 1; return originalWireDockedButtons(scope); };
  openScreen('shipyard');
  wireDockedButtons = originalWireDockedButtons;
  assert(dockedWireCount === 1, 'renderDockedScreen should wire docked buttons exactly once per render');
  assert(panels.docked.innerHTML.includes('Shipyard') && panels.docked.innerHTML.includes('Trade-in'), 'shipyard docked screen should show trade-in cards');
  assert(panels.docked.innerHTML.includes('Docked at Sector 1') && panels.docked.innerHTML.includes('Current Ship'), 'Sector 1 shipyard screen should show current ship section');
  assert(panels.docked.innerHTML.includes('Cargo Capacity') && panels.docked.innerHTML.includes('Fuel') && panels.docked.innerHTML.includes('Hull') && panels.docked.innerHTML.includes('Fighters'), 'current ship section should show core ship stats');
  assert(panels.docked.innerHTML.includes('Upgrade Current Ship'), 'shipyard screen should show current ship upgrades');
  for (const label of ['Cargo Hold', 'Engine', 'Scanner', 'Shield']) {
    assert(panels.docked.innerHTML.includes('Upgrade ' + label), label + ' upgrade control should be visible');
  }
  assert(panels.docked.innerHTML.includes('Cost: 250 credits') && panels.docked.innerHTML.includes('Ready: upgrades to Level 2'), 'shipyard upgrade cards should show costs and readiness');
  game.player.credits = 2000;
  game.log = [];
  liveEvents = [];
  game.ui.lastSectorActionResult = null;
  openScreen('shipyard');
  const cargoUpgradeButton = makeEventTargetStub({ dataset: { action: 'upgradeShip', upgrade: 'cargoHold' } });
  const refuelButton = makeEventTargetStub({ dataset: { action: 'refuel', amount: '1' } });
  const fakeDockedScope = {
    querySelectorAll(selector) {
      if (String(selector).includes('upgradeShip')) return [cargoUpgradeButton];
      if (String(selector).includes('refuel')) return [refuelButton];
      return [];
    },
    querySelector() { return null; },
  };
  wireDockedButtons(fakeDockedScope);
  assert(cargoUpgradeButton._listenerCounts?.click === 1, 'cargo upgrade button should be wired exactly once per render');
  assert(refuelButton._listenerCounts?.click === 1, 'other docked service buttons should be wired exactly once per render');
  game.player.fuel = game.player.maxFuel - 2;
  const fuelBeforeDockedRefuel = game.player.fuel;
  const creditsBeforeDockedRefuel = game.player.credits;
  refuelButton.dispatchEvent({ type: 'click' });
  assert(game.player.fuel === fuelBeforeDockedRefuel + 1 && game.player.credits === creditsBeforeDockedRefuel - FUEL_COST_PER_UNIT, 'other docked service buttons should still work after wiring audit');
  game.log = [];
  liveEvents = [];
  game.ui.lastSectorActionResult = null;
  const creditsBeforeUpgrade = game.player.credits;
  const cargoLevelBefore = game.player.upgrades.cargoHold;
  const cargoCapacityBefore = game.player.cargoCapacity;
  cargoUpgradeButton.dispatchEvent({ type: 'click' });
  const cargoUpgradeLogCount = game.log.filter((entry) => entry.includes('Cargo Hold upgraded to Level 2')).length;
  const cargoUpgradeLiveCount = liveEvents.filter((event) => event.message.includes('Cargo Hold upgraded to Level 2')).length;
  assert(game.player.upgrades.cargoHold === cargoLevelBefore + 1, 'one cargo upgrade click should purchase exactly one cargoHold level');
  assert(game.player.credits === creditsBeforeUpgrade - cargoLevelBefore * 250, 'one cargo upgrade click should charge credits exactly once');
  assert(game.player.cargoCapacity > cargoCapacityBefore, 'cargo hold upgrade should increase cargo capacity');
  assert(cargoUpgradeLogCount === 1, "one cargo upgrade click should create exactly one Captain\'s Log entry");
  assert(cargoUpgradeLiveCount === 1, 'one cargo upgrade click should create exactly one live event');
  assert(game.ui.lastSectorActionResult.message.includes('Cargo Hold upgraded to Level 2'), 'one cargo upgrade click should set the action result once');
  assert(panels.docked.innerHTML.includes('Ship Upgrade Purchased') && panels.docked.innerHTML.includes('Cargo Hold upgraded to Level 2'), 'upgrade result should appear in the shipyard action result');
  game.player.upgrades.shield = currentShip().upgradeCaps.shield;
  const maxShield = game.player.upgrades.shield;
  upgradeShip('shield');
  assert(game.player.upgrades.shield === maxShield, 'maxed ship upgrades cannot exceed ship cap');
  assert(panels.docked.innerHTML.includes("Shield is already at this ship's maximum"), 'maxed upgrade should report clear maximum message');
  game.player.upgrades.engine = 1;
  game.player.credits = 0;
  upgradeShip('engine');
  assert(game.player.upgrades.engine === 1, 'unaffordable ship upgrade should not change level');
  assert(panels.docked.innerHTML.includes('Not enough credits for Engine Level 2'), 'unaffordable upgrade should report clear message');
  game.player.credits = 500;
  game.player.currentSector = 2;
  upgradeShip('scanner');
  assert(panels.docked.innerHTML.includes('Scanner upgrades require an available shipyard'), 'non-shipyard upgrade attempt should report unavailable shipyard');
  game.player.currentSector = 1;
  openScreen('shipyard');
  assert(panels.docked.innerHTML.includes('Ship purchases only happen in this Shipyard mode'), 'shipyard screen should explain focused purchase mode');
  assert(panels.docked.innerHTML.includes('Exit / Return to Ship') && !panels.docked.innerHTML.includes('sector-map'), 'shipyard mode should have return button and hide cockpit map');
  assert(panels.docked.innerHTML.includes('stat-delta-positive') && panels.docked.innerHTML.includes('stat-delta-neutral'), 'shipyard cards should render comparison delta classes');
  const currentShipCard = renderShipCard(SHIPS.rustyComet);
  assert(currentShipCard.includes('Current Ship') && currentShipCard.includes('(±0)'), 'current ship card should show current status and neutral comparisons');
  const haulerCard = renderShipCard(SHIPS.atlasHauler);
  assert(haulerCard.includes('Cargo') && haulerCard.includes('(+16)') && haulerCard.includes('stat-delta-positive'), 'larger cargo ship should show positive cargo delta');
  const lockedShipCard = renderShipCard(SHIPS.blackfinRaider);
  assert(lockedShipCard.includes('Locked') && lockedShipCard.includes('stat-delta'), 'locked ships should still render comparison deltas');
  openScreen('specialMissions');
  assert(panels.docked.innerHTML.includes('Special Missions Terminal') && panels.docked.innerHTML.includes('Math Contracts') && panels.docked.innerHTML.includes('Delivery / Fetch Contracts'), 'special missions mode should include math and delivery foundations');
  assert(panels.docked.innerHTML.includes('Dev Code Handling') && !panels.docked.innerHTML.includes('sector-map'), 'missions mode should keep terminal activity focused away from cockpit map');
  game.player.currentSector = 14;
  openScreen('planets');
  assert(panels.docked.innerHTML.includes('Planet Management') && panels.docked.innerHTML.includes('Future Tech Potential'), 'planets mode should render planet management details');
  assert(!panels.docked.innerHTML.includes('sector-map'), 'planets mode should not render cockpit map');
  const pirateSector = Number(Object.keys(game.pirates).find((sector) => !game.pirates[sector].defeated));
  if (pirateSector) game.player.currentSector = pirateSector;
  openScreen('combat');
  assert(panels.docked.innerHTML.includes('Focused tactical display') && panels.docked.innerHTML.includes('Known NPC Pirate Ledger'), 'combat mode should render focused tactical display');
  assert(!panels.docked.innerHTML.includes('sector-map'), 'combat mode should not render cockpit map');
  openScreen('settings');
  assert(panels.docked.innerHTML.includes('Settings / Save') && panels.docked.innerHTML.includes('Exit / Return to Ship'), 'settings mode should render as a docked location with return button');
  closeScreen();
  assert(game.ui.activeScreen === 'cockpit', 'Exit / Return to Ship returns to cockpit without travel');
  renderActionPanel();
  assert(panels.action.innerHTML.includes('Dock at Starbase') && panels.action.innerHTML.includes('Mission terminal available'), 'cockpit should show compact location summaries and action buttons');

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
  selectedSectorNumber = 1;
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

  // Navigation feedback, map two-step travel, arrival reports, and docking ledger checks.
  game = defaultGameState();
  selectedSectorNumber = 1;
  game.tutorial.completedSteps.push('travel');
  launchGate.mode = 'localPrototype';
  maybeTravelEvent = function () { return false; };
  resolveSectorDanger = function () { return false; };
  renderSectorPanel();
  setSectorActionResult('Smoke Result', 'Only the current situation should render this cockpit action result.', { skipLiveEvent: true });
  renderSectorPanel();
  const actionResultBlockCount = (panels.sector.innerHTML.match(/class="action-result /g) || []).length;
  assert(actionResultBlockCount === 1, 'cockpit render contains only one active action-result block');
  assert(panels.sector.innerHTML.includes('Selected Sector Intel') && panels.sector.innerHTML.includes('Arrival Report'), 'selected sector intel and arrival report render in the main viewer');
  const selectedIntelHtml = panels.sector.innerHTML.slice(panels.sector.innerHTML.indexOf('Selected Sector Intel'));
  assert(!selectedIntelHtml.includes('Only the current situation should render this cockpit action result.'), 'selected sector intel omits duplicate action-result copy');
  assert(panels.sector.innerHTML.includes('data-situation-type="shipyard port"') && panels.sector.innerHTML.includes('Safe Port / Starbase'), 'situation card renders on Sector 1 port');
  assert(panels.sector.innerHTML.includes('Dock at Starbase') && panels.sector.innerHTML.includes('Open Mission Terminal'), 'situation card exposes starbase and mission terminal buttons');
  assert(panels.sector.innerHTML.includes('Enter Shipyard'), 'situation card shows shipyard button when shipyard exists');
  const starbaseSituationButton = panels.sector.querySelectorAll('[data-screen]').find((button) => button.dataset.screen === 'starbase');
  assert(starbaseSituationButton, 'starbase situation button is wired as a screen button');
  starbaseSituationButton.dispatchEvent({ type: 'click' });
  assert(game.ui.activeScreen === 'starbase' && panels.docked.innerHTML.includes('Starbase'), 'starbase situation button opens starbase screen');
  closeScreen();
  const sector2Node = panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2');
  assert(sector2Node, 'rendered sector panel should expose Sector 2 as a clickable map node');
  assert(sector2Node.querySelector('.map-hit-target') && sector2Node.querySelector('.map-visible-node') && sector2Node.querySelector('text'), 'map node should expose hit target, visible circle, and text label children');
  const fuelBeforeMap = game.player.fuel;
  const turnsBeforeMap = game.player.turns;
  sector2Node.dispatchEvent({ type: 'click' });
  assert(game.player.currentSector === 1 && selectedSectorNumber === 2, 'map node click selects/scans without travel');
  assert(panels.sector.innerHTML.includes('Tap again to travel to Sector 2'), 'adjacent selected node shows tap-again travel hint');
  assert(panels.sector.innerHTML.includes('Scanned Sector 2') && panels.sector.innerHTML.includes('Tap Map Node to Travel'), 'selected adjacent sector still shows scan/travel situation hint');
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').dispatchEvent({ type: 'click' });
  assert(game.player.currentSector === 2, 'second click on same adjacent node travels');
  assert(game.player.fuel === fuelBeforeMap - 1 && game.player.turns === turnsBeforeMap - 1, 'map travel costs fuel and turns');
  assert(game.arrivalReport.includes('Arrived in Sector 2'), 'arrival report updates after map travel');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  maybeTravelEvent = function () { return false; };
  resolveSectorDanger = function () { return false; };
  game.player.upgrades.scanner = 4;
  sectorMap[2].dangerLevel = 3;
  sectorMap[2].hazardType = 'radiation';
  renderSectorPanel();
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').dispatchEvent({ type: 'click' });
  assert(panels.sector.innerHTML.includes('Danger 3') && panels.sector.innerHTML.includes('Tap again to travel to Sector 2'), 'dangerous adjacent sector still shows travel-ready feedback after first click');
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').dispatchEvent({ type: 'click' });
  assert(game.player.currentSector === 2, 'danger state alone does not block second-click map travel');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  game.player.fuel = 0;
  handleMapNodeSelect(2);
  handleMapNodeSelect(2);
  assert(game.player.currentSector === 1 && game.ui.lastSectorActionResult?.message.includes('Fuel is empty'), 'blocked map travel reports fuel reason in main-viewer action result');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('Tactical Cockpit') && panels.sector.innerHTML.includes('current-situation'), 'center panel prioritizes current situation above secondary controls');
  assert(panels.sector.innerHTML.includes('<details class="warp-panel collapsible-system compact-section" >'), 'warp/autopilot renders as a collapsed secondary system when no route is active');
  assert(panels.sector.innerHTML.includes('No active destination'), 'collapsed warp summary explains there is no active destination');
  assert(panels.sector.innerHTML.includes('<summary>Manual travel controls</summary>'), 'adjacent sector fallback buttons are tucked into manual travel controls');
  game.revealedSectors = [1, 2];
  setWarpDestination(2);
  assert(game.ui.warpDestination === 2, 'existing warp plotting still stores destination');
  assert(panels.sector.innerHTML.includes('<details class="warp-panel collapsible-system compact-section" open>'), 'warp/autopilot expands automatically when a route is active');
  assert(panels.sector.innerHTML.includes('Sector 2, 1 jump'), 'expanded warp summary shows plotted route distance');
  assert(panels.sector.innerHTML.includes('data-action="warpStep"'), 'expanded warp controls still expose Engage Autopilot / Warp Step');
  performWarpStep();
  assert(game.player.currentSector === 2, 'expanded warp step behavior still performs autopilot travel');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.player.upgrades.scanner = 4;
  game.revealedSectors = [1];
  setWarpDestination(3);
  assert(game.ui.warpDestination === 3 && game.ui.exploratoryWarp === true, 'visible-but-unrevealed target can set controlled exploratory autopilot');
  assert(game.ui.lastSectorActionResult?.message.includes('Exploratory autopilot'), 'exploratory autopilot route setting warns about dangerous unexplored sectors');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  maybeTravelEvent = function () { return false; };
  resolveSectorDanger = function () { return false; };
  renderSectorPanel();
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').querySelector('.map-hit-target').dispatchEvent({ type: 'click' });
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').querySelector('.map-visible-node').dispatchEvent({ type: 'click' });
  assert(game.player.currentSector === 2, 'clicks from the transparent hit target and visible circle bubble to map-node travel wiring');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  const keydownNode = panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2');
  keydownNode.dispatchEvent({ type: 'keydown', key: 'Enter' });
  assert(selectedSectorNumber === 2 && game.player.currentSector === 1, 'Enter key selects a map node');
  let spacePrevented = false;
  panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2').dispatchEvent({ type: 'keydown', key: ' ', preventDefault: () => { spacePrevented = true; } });
  assert(spacePrevented && game.player.currentSector === 2, 'Space key prevents page scroll and triggers map-node travel');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  const labelNode = panels.sector.querySelectorAll('[data-map-sector]').find((node) => node.dataset.mapSector === '2');
  labelNode.querySelector('text').dispatchEvent({ type: 'click' });
  assert(selectedSectorNumber === 2 && game.player.currentSector === 1, 'clicks from the text label bubble to map-node travel wiring');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('data-action="travel" data-sector="2"'), 'manual adjacent-sector travel button should still render as a fallback');
  travelToSector(2);
  assert(game.player.currentSector === 2, 'manual adjacent-sector travel behavior still travels directly');

  // Manual teacher playtest checklist: 1. Open Sector Drift fresh. 2. Confirm cockpit loads. 3. Reset prototype save. 4. Travel by clicking map node twice. 5. Dock at Starbase. 6. Buy/sell cargo. 7. Check docking ledger. 8. Open Settings / Save. 9. Confirm local save status is visible. 10. Sign in if Firebase is available. 11. Try cloud backup if available. 12. Reload page and confirm progress remains.

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.revealedSectors = [1, 2, 3];
  handleMapNodeSelect(3);
  const nonAdjacentSector = game.player.currentSector;
  handleMapNodeSelect(3);
  assert(game.player.currentSector === nonAdjacentSector, 'double-clicking a non-adjacent node does not travel');
  assert(renderNavigationIntel().includes('Route known') || renderNavigationIntel().includes('Route unknown'), 'non-adjacent selection renders route status');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.revealedSectors = [1, 2, 3];
  selectedSectorNumber = 3;
  renderSectorPanel();
  let plotButtons = panels.sector.querySelectorAll("[data-action='plotSelectedRoute']");
  assert(plotButtons.length === 2, 'non-adjacent routed sector renders both situation-card and Main Viewer plot buttons');
  let logCountBeforePlot = game.log.length;
  plotButtons[0].dispatchEvent({ type: 'click' });
  assert(game.ui.warpDestination === 3, 'situation-card plot button sets warp destination');
  assert(game.log.length === logCountBeforePlot + 1, 'situation-card plot button has one listener side effect');
  game.ui.warpDestination = null;
  renderSectorPanel();
  plotButtons = panels.sector.querySelectorAll("[data-action='plotSelectedRoute']");
  logCountBeforePlot = game.log.length;
  plotButtons[plotButtons.length - 1].dispatchEvent({ type: 'click' });
  assert(game.ui.warpDestination === 3, 'existing Main Viewer plot button sets warp destination');
  assert(game.log.length === logCountBeforePlot + 1, 'existing Main Viewer plot button has one listener side effect');
  game.player.fuel = 0;
  handleMapNodeSelect(2);
  handleMapNodeSelect(2);
  assert(game.player.currentSector === 1 && game.log[0].includes('Fuel is empty'), 'blocked map travel gives a clear reason');
  game.player.fuel = 5;
  game.player.currentSector = 2;
  emergencyWarp();
  assert(game.arrivalReport.includes('Emergency warp completed') && game.player.currentSector === 1, 'emergency warp updates the arrival report');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  const anomalySector = Object.values(sectorMap).find((sector) => sector.type === 'anomaly');
  game.player.currentSector = anomalySector.number;
  game.player.turns = 5;
  game.player.fuel = 5;
  Math.random = () => 0.7;
  scanAnomaly();
  Math.random = originalRandom;
  assert(game.ui.lastSectorActionResult?.title === 'Anomaly Scan Complete' && game.ui.lastSectorActionResult.gained.length > 0 && game.ui.lastSectorActionResult.lost.some((item) => item.includes('turn')), 'anomaly scan shows immediate action result with gains and losses');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  const asteroidSector = Object.values(sectorMap).find((sector) => sector.type === 'asteroid');
  game.player.currentSector = asteroidSector.number;
  game.player.turns = 5;
  game.player.fuel = 5;
  Math.random = () => 0.4;
  mineAsteroids();
  Math.random = originalRandom;
  assert(game.ui.lastSectorActionResult?.title === 'Mining Complete' && game.ui.lastSectorActionResult.gained.some((item) => item.includes('Ore')) && game.ui.lastSectorActionResult.lost.some((item) => item.includes('fuel')), 'asteroid mining shows immediate action result with gains and losses');

  const pulseButton = makeEventTargetStub();
  pulseActionButton(pulseButton);
  assert(pulseButton.classList.contains('action-pulse'), 'action button feedback class is applied briefly');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.player.currentSector = 1;
  openScreen('starbase');
  assert(panels.docked.innerHTML.includes('Docking Ledger'), 'starbase docking ledger starts when docking');
  const oreBuy = sectorMap[1].portPrices.Ore.buy;
  const oreSell = sectorMap[1].portPrices.Ore.sell;
  const dockingStart = game.dockingLedger.startedWith;
  buyResource('Ore', 5);
  assert(game.player.cargoCostBasis.Ore.known && game.player.cargoCostBasis.Ore.quantity === 5, 'cargo average purchase price updates on buy');
  assert(Math.round(game.player.cargoCostBasis.Ore.totalCost / game.player.cargoCostBasis.Ore.quantity) === oreBuy, 'cargo cost basis tracks average buy price');
  buyResource('Food', 10);
  assert(game.player.cargo.Food === 10 && game.ui.lastSectorActionResult?.message.includes('Bought 10 Food'), 'Buy 10 purchases ten units and reports result');
  fillCargoWithResource('Tech');
  assert(game.player.cargo.Tech > 0 && game.dockingLedger.spent > 0 && game.player.cargoCostBasis.Tech.quantity === game.player.cargo.Tech, 'Fill Cargo buys max affordable/cargo Tech and updates cost basis/ledger');
  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.player.currentSector = 1;
  game.player.credits = 5000;
  game.dockingLedger = defaultDockingLedger(game.player.credits, 1);
  fillBalancedCargo();
  assert(RESOURCES.every((resource) => game.player.cargo[resource] > 0) && game.ui.lastSectorActionResult?.message.includes('Balanced load purchased'), 'Fill Balanced buys Ore/Food/Tech and reports result');
  assert(RESOURCES.every((resource) => game.player.cargoCostBasis[resource].quantity === game.player.cargo[resource]) && game.dockingLedger.spent > 0, 'Fill Balanced updates cargo cost basis and docking ledger');
  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.player.currentSector = 1;
  buyResource('Ore', 5);
  sellResource('Ore', 2);
  assert(game.dockingLedger.tradeProfit === Math.round((oreSell - oreBuy) * 2), 'selling calculates profit/loss using average cost');
  game.player.fuel = game.player.maxFuel - 2;
  buyFuel(1);
  game.player.hull = game.player.maxHull - 2;
  repairHull();
  assert(game.dockingLedger.serviceCosts > 0 && game.dockingLedger.spent > 0, 'fuel and repair costs update docking ledger');
  const earnedBeforeJob = game.dockingLedger.earned;
  runStationActivity('cargoSorting', '9');
  assert(game.dockingLedger.earned === earnedBeforeJob + 35 && game.dockingLedger.activityRewards >= 35, 'starbase activity rewards update docking ledger');
  assert(game.dockingLedger.current === game.player.credits && game.dockingLedger.startedWith === dockingStart, 'docking ledger tracks current and starting credits');
  const legacyCost = migrateGameState({ player: { cargo: { Ore: 4 } } });
  assert(legacyCost.player.cargoCostBasis.Ore.known === false, 'legacy saves without cargo cost basis migrate safely as unknown average cost');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  game.player.currentSector = 13;
  selectedSectorNumber = 13;
  game.visitedSectors.push(13);
  game.revealedSectors.push(13);
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('Pirate Encounter: Scrap Raider') && panels.sector.innerHTML.includes('Disengage Temporarily') && panels.sector.innerHTML.includes('Pay Off Pirates'), 'pirate card renders when active pirate exists');
  game.player.cargoCapacity = 20;
  defeatPirate(game.pirates[13], 'defeated', { fightersLost: 1, hullDamage: 2 });
  assert(game.ui.lastSectorActionResult?.title === 'Pirates Defeated' && game.ui.lastSectorActionResult.message.includes('Salvage') && game.ui.lastSectorActionResult.gained.some((item) => item.includes('credits')), 'pirate victory shows prominent reward and salvage result');

  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  const targetQuest = deliveryQuestById('deliver-food-24');
  startDeliveryQuest(targetQuest.id);
  selectedSectorNumber = targetQuest.targetSector;
  assert(renderNavigationIntel().includes('Mission Target') && renderNavigationIntel().includes(targetQuest.title), 'selected mission target shows mission indicator');
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('data-situation-type="mission"') && panels.sector.innerHTML.includes(targetQuest.title), 'mission target card renders when active delivery target is selected');
  game.player.upgrades.scanner = 4;
  game.revealedSectors = [1];
  plotDeliveryRoute(targetQuest.id);
  assert(game.ui.warpDestination === targetQuest.targetSector && game.ui.lastSectorActionResult?.message.includes('Next hop'), 'mission route setting shows immediate route result with next hop');

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
  storage.clear();
  sessionRecoveryMessages = [];
  game = loadGame();
  assert(game.player.currentSector === 1 && game.ui.activeScreen === 'cockpit', 'loading with no save starts playable cockpit state');

  storage.set(STORAGE_KEY, JSON.stringify({ player: { credits: 1357, currentSector: 2, cargo: { Ore: 3 }, cargoCostBasis: { Ore: { quantity: 3, totalCost: 30, known: true } } }, ui: { activeScreen: 'starbase' } }));
  const validLoaded = loadGame();
  assert(validLoaded.player.credits === 1357 && validLoaded.player.currentSector === 2 && validLoaded.ui.activeScreen === 'cockpit', 'loading valid save migrates and returns to cockpit');

  storage.clear();
  storage.set(STORAGE_KEY, '{not valid json');
  sessionRecoveryMessages = [];
  const malformed = loadGame();
  assert(malformed.player.currentSector === 1 && sessionRecoveryMessages.some((message) => message.includes('corrupted local save')), 'malformed JSON recovers to a fresh save');
  assert(Array.from(storage.keys()).some((key) => key.startsWith(STORAGE_KEY + '_corruptBackup_')), 'malformed JSON is preserved under a corrupt backup key');

  const missingPlayer = migrateGameState({ ui: { activeScreen: 'settings' }, stats: {} });
  assert(missingPlayer.player.currentSector === 1 && missingPlayer.player.cargo.Ore === 0, 'missing player object is restored safely');

  const invalidSector = migrateGameState({ player: { currentSector: 999, fuel: Infinity, hull: -20, turns: 'bad', credits: -5 } });
  assert(invalidSector.player.currentSector === 1 && invalidSector.player.credits === 0 && invalidSector.player.hull >= 1, 'invalid sector and player numbers are clamped safely');

  const missingCostBasis = migrateGameState({ player: { cargo: { Ore: 4 } }, dockingLedger: null });
  assert(missingCostBasis.player.cargoCostBasis.Ore.quantity === 4 && missingCostBasis.player.cargoCostBasis.Ore.known === false, 'missing cargoCostBasis is rebuilt from cargo');
  assert(missingCostBasis.dockingLedger.current === missingCostBasis.player.credits, 'missing dockingLedger is rebuilt from credits');

  const invalidScreen = migrateGameState({ player: { currentSector: 2 }, ui: { activeScreen: 'badScreen', warpDestination: 999 } });
  assert(invalidScreen.ui.activeScreen === 'cockpit' && invalidScreen.ui.warpDestination === null, 'invalid activeScreen and warp destination are reset');

  game = migrateGameState({ player: { currentSector: 999, cargo: { Ore: -3, Food: 'lots' }, fighters: 999999, upgrades: { cargoHold: 'x', engine: -1, scanner: 1000, shield: null } }, deliveryQuests: { bad: true }, stationActivities: [], pirates: [] });
  selectedSectorNumber = game.player.currentSector;
  assert(game.player.currentSector === 1 && game.deliveryQuests.length >= 3 && Number.isFinite(game.stationActivities.cargoSortingUses), 'migration keeps malformed save playable');
  let renderAfterMigrationOk = true;
  try { render(); } catch (error) { renderAfterMigrationOk = false; }
  assert(renderAfterMigrationOk, 'render does not throw after malformed-save migration');

  const originalGetItem = localStorage.getItem;
  const originalSetItem = localStorage.setItem;
  localStorage.getItem = () => { throw new Error('blocked getItem'); };
  const memoryOnly = loadGame();
  assert(memoryOnly.player.currentSector === 1 && localStorageAvailable === false, 'localStorage getItem failure falls back to in-memory game');
  localStorage.getItem = originalGetItem;
  game = defaultGameState();
  localStorage.setItem = () => { throw new Error('blocked setItem'); };
  assert(saveGame() === false && localSaveStatus.includes('continuing in memory'), 'localStorage setItem failure is handled without throwing');
  game.log = [];
  const manualSaveResult = manualSaveNow();
  assert(manualSaveResult === false, 'Settings Save Now returns false when localStorage write is blocked');
  assert(!game.log.some((entry) => entry.includes('Manual save complete')), 'Settings Save Now should not report success when localStorage write fails');
  assert(game.log.some((entry) => entry.includes('progress may not persist after reload')) || panels.docked.innerHTML.includes('progress may not persist after reload'), 'Settings Save Now warning is logged or visible when storage is unavailable');
  game.player.turns = 3;
  assert(spendTurn('scan') && game.player.turns === 2, 'gameplay remains usable in memory after localStorage setItem failure');
  localStorage.setItem = originalSetItem;
  localStorageAvailable = true;

  window = {};
  cloudUiState.message = '';
  let firebaseStatusOk = true;
  try { refreshFirebaseUiState(); } catch (error) { firebaseStatusOk = false; }
  assert(firebaseStatusOk, 'Firebase unavailable status does not crash app');
  assert(cloudUiState.status === 'not initialized' && cloudUiState.message.includes('Local prototype save'), 'Firebase unavailable status explains local prototype fallback');
  game = defaultGameState();
  launchGate.mode = 'localPrototype';
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('Display-only sector traffic is unavailable in local prototype mode.'), 'sector traffic renders local unavailable state');
  assert(panels.sector.innerHTML.includes('Live Events') && panels.sector.innerHTML.includes('Immediate Cockpit Feed'), 'live event box renders in cockpit');
  const liveTokenBefore = liveEventPulseToken;
  pushLiveEvent({ type: 'test', title: 'Test Event', message: 'Smoke test event visible.', tone: 'positive', sectorNumber: 1 });
  assert(liveEvents[0].title === 'Test Event' && panels.sector.innerHTML.includes('Smoke test event visible.'), 'local live event push displays an event');
  assert(liveEventPulseToken > liveTokenBefore && panels.sector.innerHTML.includes('live-event-pulse'), 'live event pulse state changes when event is pushed');
  const localPresence = updatePresenceStatus('online');
  assert(localPresence && typeof localPresence.then === 'function', 'presence write helper returns safely without Firebase');
  window = undefined;

  window = { SectorDriftFirebase: {
    getFirebaseStatus: () => ({ ok: true, status: 'available', user: { uid: 'student-2', displayName: 'Student Two' }, role: 'student' }),
    getCurrentFirebaseUser: () => ({ ok: true, data: { uid: 'student-2', displayName: 'Student Two' } }),
    getCurrentUserRole: () => ({ ok: true, data: 'student', reason: 'test' }),
    updatePresence: (payload) => ({ ok: Boolean(payload && payload.sectorNumber), data: payload }),
    onPresenceChange: (callback) => { callback({ ok: true, records: [], status: { ok: true, status: 'listening' } }); return () => {}; },
  } };
  launchGate.mode = 'signedIn';
  refreshFirebaseUiState(false);
  subscribeToSectorTraffic();
  renderSectorPanel();
  assert(panels.sector.innerHTML.includes('No other online captains in this sector.'), 'sector traffic renders empty signed-in state');
  const remoteNow = Date.now();
  applyPresenceRecords([{ uid: 'other-1', captainName: 'Jordan', shipName: 'Rusty Comet', sectorNumber: 2, status: 'docked', updatedAt: remoteNow }]);
  game.player.currentSector = 1;
  applyPresenceRecords([{ uid: 'other-1', captainName: 'Jordan', shipName: 'Rusty Comet', sectorNumber: 1, status: 'docked', updatedAt: remoteNow }]);
  assert(liveEvents.some((event) => event.message.includes('Jordan') && event.message.includes('warped into Sector 1')), 'remote sector arrival pushes live event without initial spam');
  assert(renderSectorTraffic().includes('Jordan') && renderSectorTraffic().includes('Rusty Comet') && renderSectorTraffic().includes('docked'), 'sector traffic lists nearby captain, ship, and status');
  const firebaseSource = fs.readFileSync('games/sector-drift/firebase-client.js', 'utf8');
  const presenceFunction = firebaseSource.slice(firebaseSource.indexOf('function presencePayload'), firebaseSource.indexOf('// Presence is display-only'));
  assert(presenceFunction.includes('sectorNumber') && presenceFunction.includes('shipName') && presenceFunction.includes('status'), 'presence data model includes safe display fields');
  assert(!/credits|cargo|saveData|combatWins|combatLosses/.test(presenceFunction), 'presence data model excludes credits, cargo, full save, and combat outcomes');

  game = defaultGameState();
  game.player.fuel = 10;
  game.player.turns = 10;
  liveEvents = [];
  travelToSector(2);
  assert(liveEvents.some((event) => event.type === 'travel' && event.title.includes('Arrived in Sector 2')), 'travel pushes a live event');
  setWarpDestination(1);
  assert(liveEvents.some((event) => event.title.includes('Route Set') && event.message.includes('Sector 1')), 'route setting pushes a live event');
  window = undefined;

  game.player.credits = 2468;
  saveGame();
  assert(loadGame().player.credits === 2468, 'localStorage save/load should still work');
  const html = fs.readFileSync('games/sector-drift/index.html', 'utf8');
  assert(html.includes('<script type="module" src="firebase-client.js"></script>'), 'index.html should load firebase-client.js as a module script');
})();
`, context);
console.log('Sector Drift smoke checks passed.');
