jest.mock('../lib/log', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../renderer/grids', () => {
  return jest.fn().mockImplementation(() => ({
    addToEntityGrid: jest.fn(),
    addToPathingGrid: jest.fn(),
    addToItemGrid: jest.fn(),
    addToRenderingGrid: jest.fn(),
    removeFromRenderingGrid: jest.fn(),
    removeFromPathingGrid: jest.fn(),
    removeFromItemGrid: jest.fn(),
    removeEntity: jest.fn(),
    resetPathingGrid: jest.fn(),
    entityGrid: Array.from({ length: 100 }, () =>
      Array.from({ length: 100 }, () => ({}))
    ),
    pathingGrid: Array.from({ length: 100 }, () => new Array(100).fill(0)),
    renderingGrid: Array.from({ length: 100 }, () =>
      Array.from({ length: 100 }, () => ({}))
    ),
  }));
});

jest.mock('./sprites', () => {
  return jest.fn().mockImplementation(() => ({
    sprites: {},
    updateSprites: jest.fn(),
    onLoadedSprites: jest.fn(),
  }));
});

jest.mock('../entity/objects/chest', () => {
  return jest.fn().mockImplementation((id, name, label) => ({
    id,
    name,
    label,
    type: 'chest',
    gridX: 0,
    gridY: 0,
    dropped: false,
    setGridPosition: jest.fn(),
    setName: jest.fn(),
    setSprite: jest.fn(),
    idle: jest.fn(),
    fadeIn: jest.fn(),
    handler: null,
  }));
});

jest.mock('../entity/character/player/player', () => {
  class MockPlayer {
    constructor() {
      this.id = null;
      this.name = null;
      this.type = 'player';
      this.gridX = 0;
      this.gridY = 0;
      this.nextGridX = -1;
      this.nextGridY = -1;
      this.dropped = false;
      this.rights = 0;
      this.level = 1;
      this.pvp = false;
      this.pvpKills = 0;
      this.pvpDeaths = 0;
      this.setId = jest.fn(function(id) { this.id = id; });
      this.setName = jest.fn(function(name) { this.name = name; });
      this.setGridPosition = jest.fn();
      this.setHitPoints = jest.fn();
      this.setMaxHitPoints = jest.fn();
      this.setMana = jest.fn();
      this.setMaxMana = jest.fn();
      this.setSprite = jest.fn();
      this.setEquipment = jest.fn();
      this.idle = jest.fn();
      this.fadeIn = jest.fn();
      this.loadHandler = jest.fn();
      this.handler = null;
    }
  }
  return MockPlayer;
});

jest.mock('../entity/objects/item', () => {
  return jest.fn().mockImplementation((id, name, label, count, ability, abilityLevel) => ({
    id,
    name,
    label,
    count,
    ability,
    abilityLevel,
    type: 'item',
    gridX: 0,
    gridY: 0,
    dropped: false,
    setGridPosition: jest.fn(),
    setName: jest.fn(),
    setSprite: jest.fn(),
    idle: jest.fn(),
    fadeIn: jest.fn(),
    handler: null,
  }));
});

jest.mock('../entity/character/mob/mob', () => {
  return jest.fn().mockImplementation((id, name, label) => ({
    id,
    name,
    label,
    type: 'mob',
    gridX: 0,
    gridY: 0,
    nextGridX: -1,
    nextGridY: -1,
    dropped: false,
    attackRange: 1,
    level: 1,
    hitPoints: 100,
    maxHitPoints: 100,
    setHitPoints: jest.fn(),
    setMaxHitPoints: jest.fn(),
    setGridPosition: jest.fn(),
    setName: jest.fn(),
    setSprite: jest.fn(),
    idle: jest.fn(),
    fadeIn: jest.fn(),
    handler: { setGame: jest.fn(), load: jest.fn() },
  }));
});

jest.mock('../entity/character/npc/npc', () => {
  return jest.fn().mockImplementation((id, name, label) => ({
    id,
    name,
    label,
    type: 'npc',
    gridX: 0,
    gridY: 0,
    nextGridX: -1,
    nextGridY: -1,
    dropped: false,
    setGridPosition: jest.fn(),
    setName: jest.fn(),
    setSprite: jest.fn(),
    idle: jest.fn(),
    fadeIn: jest.fn(),
    handler: { setGame: jest.fn(), load: jest.fn() },
  }));
});

jest.mock('../entity/objects/projectile', () => {
  return jest.fn().mockImplementation((id, projectileType, attacker, name) => ({
    id,
    projectileType,
    name,
    type: 'projectile',
    gridX: 0,
    gridY: 0,
    angled: false,
    owner: attacker,
    dropped: false,
    setStart: jest.fn(),
    setTarget: jest.fn(),
    setSprite: jest.fn(),
    setAnimation: jest.fn(),
    getSpeed: jest.fn().mockReturnValue(100),
    onImpact: jest.fn(),
    fadeIn: jest.fn(),
    getId: jest.fn().mockReturnValue(id),
  }));
});

jest.mock('../utils/modules', () => ({
  __esModule: true,
  default: {
    AudioTypes: { Music: 0, SFX: 1 },
    Actions: { Attack: 1, Idle: 0, Walk: 2 },
    Hits: { Explosive: 8, Damage: 0 },
    Equipment: { Armour: 0, Weapon: 1, Pendant: 2, Ring: 3, Boots: 4 },
  },
}));

jest.mock('../network/packets', () => ({
  __esModule: true,
  default: {
    Projectile: 'projectile',
    ProjectileOpcode: { Impact: 'impact' },
  },
}));

import Entities from './entities';
import Item from '../entity/objects/item';
import Player from '../entity/character/player/player';

describe('Entities', () => {
  let entities;
  let mockGame;
  let mockRenderer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRenderer = {
      mobile: false,
      isPortableDevice: jest.fn().mockReturnValue(false),
    };

    mockGame = {
      renderer: mockRenderer,
      player: { id: 9999 },
      map: {},
      client: {
        sendStatus: jest.fn(),
      },
      input: {
        loadCursors: jest.fn(),
      },
      postLoad: jest.fn(),
      start: jest.fn(),
      socket: {
        send: jest.fn(),
      },
      info: {
        create: jest.fn(),
      },
      time: 1000,
    };

    entities = new Entities(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(entities.game).toBe(mockGame);
    });

    test('sets renderer reference', () => {
      expect(entities.renderer).toBe(mockRenderer);
    });

    test('initializes grids as null', () => {
      expect(entities.grids).toBeNull();
    });

    test('initializes sprites as null', () => {
      expect(entities.sprites).toBeNull();
    });

    test('initializes entities as empty object', () => {
      expect(entities.entities).toEqual({});
    });

    test('initializes decrepit as empty object', () => {
      expect(entities.decrepit).toEqual({});
    });
  });

  describe('loadEntities', () => {
    test('sends status to client', () => {
      entities.loadEntities();
      expect(mockGame.client.sendStatus).toHaveBeenCalled();
    });

    test('creates Sprites instance when sprites is null', () => {
      entities.loadEntities();
      expect(entities.sprites).not.toBeNull();
    });

    test('does not recreate sprites when already loaded', () => {
      entities.loadEntities();
      const firstSprites = entities.sprites;
      entities.loadEntities();
      expect(entities.sprites).toBe(firstSprites);
    });

    test('creates Grids instance when grids is null', () => {
      entities.loadEntities();
      expect(entities.grids).not.toBeNull();
    });

    test('does not recreate grids when already loaded', () => {
      entities.loadEntities();
      const firstGrids = entities.grids;
      entities.loadEntities();
      expect(entities.grids).toBe(firstGrids);
    });
  });

  describe('update', () => {
    test('does nothing when sprites is null', () => {
      entities.sprites = null;
      expect(() => entities.update()).not.toThrow();
    });

    test('calls updateSprites when sprites are loaded', () => {
      entities.loadEntities();
      entities.update();
      expect(entities.sprites.updateSprites).toHaveBeenCalled();
    });
  });

  describe('isPlayer', () => {
    test('returns true when id matches game player id', () => {
      expect(entities.isPlayer(9999)).toBe(true);
    });

    test('returns false when id does not match game player id', () => {
      expect(entities.isPlayer(1)).toBe(false);
    });
  });

  describe('get', () => {
    test('returns entity when it exists', () => {
      const mockEntity = { id: 1 };
      entities.entities[1] = mockEntity;
      expect(entities.get(1)).toBe(mockEntity);
    });

    test('returns null when entity does not exist', () => {
      expect(entities.get(9999)).toBeNull();
    });
  });

  describe('exists', () => {
    test('returns true when entity exists', () => {
      entities.entities[5] = { id: 5 };
      expect(entities.exists(5)).toBe(true);
    });

    test('returns false when entity does not exist', () => {
      expect(entities.exists(999)).toBe(false);
    });
  });

  describe('getAll', () => {
    test('returns the entities object', () => {
      const mockEntity = { id: 1 };
      entities.entities[1] = mockEntity;
      expect(entities.getAll()).toBe(entities.entities);
    });
  });

  describe('getSprite', () => {
    test('returns sprite by name from sprites.sprites', () => {
      entities.loadEntities();
      entities.sprites.sprites['wizard'] = { name: 'wizard' };
      expect(entities.getSprite('wizard')).toEqual({ name: 'wizard' });
    });
  });

  describe('addEntity', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('adds entity to entities map', () => {
      const entity = {
        id: 10,
        type: 'npc',
        gridX: 1,
        gridY: 1,
        dropped: false,
        fadeIn: jest.fn(),
      };
      entities.addEntity(entity);
      expect(entities.entities[10]).toBe(entity);
    });

    test('does not overwrite existing entity', () => {
      const entity = {
        id: 10,
        type: 'npc',
        gridX: 1,
        gridY: 1,
        dropped: false,
        fadeIn: jest.fn(),
      };
      entities.entities[10] = entity;
      const newEntity = { id: 10, type: 'npc' };
      entities.addEntity(newEntity);
      expect(entities.entities[10]).toBe(entity);
    });

    test('calls registerPosition on the entity', () => {
      const registerSpy = jest.spyOn(entities, 'registerPosition');
      const entity = {
        id: 20,
        type: 'chest',
        gridX: 2,
        gridY: 2,
        dropped: false,
        fadeIn: jest.fn(),
      };
      entities.addEntity(entity);
      expect(registerSpy).toHaveBeenCalledWith(entity);
    });

    test('calls fadeIn when entity is not a dropped Item and not portable device', () => {
      const entity = {
        id: 30,
        type: 'mob',
        gridX: 3,
        gridY: 3,
        dropped: false,
        fadeIn: jest.fn(),
      };
      entities.addEntity(entity);
      expect(entity.fadeIn).toHaveBeenCalledWith(mockGame.time);
    });

    test('does not call fadeIn when renderer is portable device', () => {
      mockRenderer.isPortableDevice.mockReturnValue(true);
      const entity = {
        id: 40,
        type: 'mob',
        gridX: 4,
        gridY: 4,
        dropped: false,
        fadeIn: jest.fn(),
      };
      entities.addEntity(entity);
      expect(entity.fadeIn).not.toHaveBeenCalled();
    });

    test('calls fadeIn for non-dropped Item entities', () => {
      const item = new Item(50, 'potion', 'Potion', 1, 0, 0);
      item.dropped = false;
      item.gridX = 5;
      item.gridY = 5;
      item.fadeIn = jest.fn();

      entities.addEntity(item);
      // Since mock Item is not a real instanceof Item, the check !(instanceof Item && dropped)
      // evaluates the instanceof as false, so fadeIn is always called for non-portable devices
      expect(item.fadeIn).toHaveBeenCalledWith(mockGame.time);
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('does nothing when item is null', () => {
      expect(() => entities.removeItem(null)).not.toThrow();
    });

    test('removes item from entities map', () => {
      const item = { id: 50, gridX: 1, gridY: 1 };
      entities.entities[50] = item;

      entities.removeItem(item);

      expect(entities.entities[50]).toBeUndefined();
      expect(entities.grids.removeFromItemGrid).toHaveBeenCalledWith(item, 1, 1);
      expect(entities.grids.removeFromRenderingGrid).toHaveBeenCalledWith(item, 1, 1);
    });
  });

  describe('registerPosition', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('does nothing when entity is null', () => {
      expect(() => entities.registerPosition(null)).not.toThrow();
    });

    test('adds player to entity grid but not pathing grid (not nonPathable)', () => {
      const entity = { id: 1, type: 'player', gridX: 5, gridY: 5, nonPathable: false };
      entities.registerPosition(entity);
      expect(entities.grids.addToEntityGrid).toHaveBeenCalledWith(entity, 5, 5);
      expect(entities.grids.addToPathingGrid).not.toHaveBeenCalled();
      expect(entities.grids.addToRenderingGrid).toHaveBeenCalledWith(entity, 5, 5);
    });

    test('adds nonPathable player to pathing grid', () => {
      const entity = { id: 1, type: 'player', gridX: 5, gridY: 5, nonPathable: true };
      entities.registerPosition(entity);
      expect(entities.grids.addToPathingGrid).toHaveBeenCalledWith(5, 5);
    });

    test('adds mob to entity grid and pathing grid', () => {
      const entity = { id: 2, type: 'mob', gridX: 3, gridY: 3 };
      entities.registerPosition(entity);
      expect(entities.grids.addToEntityGrid).toHaveBeenCalledWith(entity, 3, 3);
      expect(entities.grids.addToPathingGrid).toHaveBeenCalledWith(3, 3);
    });

    test('adds npc to entity grid and pathing grid', () => {
      const entity = { id: 3, type: 'npc', gridX: 2, gridY: 2 };
      entities.registerPosition(entity);
      expect(entities.grids.addToEntityGrid).toHaveBeenCalledWith(entity, 2, 2);
      expect(entities.grids.addToPathingGrid).toHaveBeenCalledWith(2, 2);
    });

    test('adds item to item grid', () => {
      const entity = { id: 4, type: 'item', gridX: 2, gridY: 2 };
      entities.registerPosition(entity);
      expect(entities.grids.addToItemGrid).toHaveBeenCalledWith(entity, 2, 2);
    });

    test('adds all entities to rendering grid', () => {
      const entity = { id: 5, type: 'projectile', gridX: 1, gridY: 1 };
      entities.registerPosition(entity);
      expect(entities.grids.addToRenderingGrid).toHaveBeenCalledWith(entity, 1, 1);
    });
  });

  describe('unregisterPosition', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('does nothing when entity is null', () => {
      expect(() => entities.unregisterPosition(null)).not.toThrow();
    });

    test('calls grids.removeEntity', () => {
      const entity = { id: 1 };
      entities.unregisterPosition(entity);
      expect(entities.grids.removeEntity).toHaveBeenCalledWith(entity);
    });
  });

  describe('registerDuality', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('does nothing when entity is null', () => {
      expect(() => entities.registerDuality(null)).not.toThrow();
    });

    test('adds entity to entityGrid and renderingGrid', () => {
      const entity = {
        id: 1,
        gridX: 2,
        gridY: 3,
        nextGridX: -1,
        nextGridY: -1,
      };
      entities.registerDuality(entity);
      expect(entities.grids.entityGrid[3][2][1]).toBe(entity);
      expect(entities.grids.addToRenderingGrid).toHaveBeenCalledWith(entity, 2, 3);
    });

    test('registers entity in next grid position when nextGridX and nextGridY are valid', () => {
      const entity = {
        id: 5,
        gridX: 1,
        gridY: 1,
        nextGridX: 2,
        nextGridY: 2,
      };
      entities.registerDuality(entity);
      expect(entities.grids.entityGrid[2][2][5]).toBe(entity);
      expect(entities.grids.pathingGrid[2][2]).toBe(1);
    });

    test('does not set pathing grid for Player instances', () => {
      const playerInstance = new Player();
      playerInstance.id = 7;
      playerInstance.gridX = 1;
      playerInstance.gridY = 1;
      playerInstance.nextGridX = 2;
      playerInstance.nextGridY = 2;

      entities.grids.pathingGrid[2][2] = 0;

      entities.registerDuality(playerInstance);
      expect(entities.grids.pathingGrid[2][2]).toBe(0);
    });
  });

  describe('clearPlayers', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('removes player entities except the exception', () => {
      const player1 = { id: 1, type: 'player', gridX: 1, gridY: 1 };
      const player2 = { id: 2, type: 'player', gridX: 2, gridY: 2 };
      const mob = { id: 3, type: 'mob', gridX: 3, gridY: 3 };

      entities.entities[1] = player1;
      entities.entities[2] = player2;
      entities.entities[3] = mob;

      entities.clearPlayers({ id: 1 });

      expect(entities.entities[1]).toBeDefined();
      expect(entities.entities[2]).toBeUndefined();
      expect(entities.entities[3]).toBeDefined();
    });

    test('resets pathing grid after clearing', () => {
      entities.clearPlayers({ id: 999 });
      expect(entities.grids.resetPathingGrid).toHaveBeenCalled();
    });
  });

  describe('forEachEntity', () => {
    test('calls callback for each entity', () => {
      const entity1 = { id: 1 };
      const entity2 = { id: 2 };
      entities.entities[1] = entity1;
      entities.entities[2] = entity2;

      const callback = jest.fn();
      entities.forEachEntity(callback);

      expect(callback).toHaveBeenCalledWith(entity1);
      expect(callback).toHaveBeenCalledWith(entity2);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      entities.loadEntities();
    });

    test('does nothing when id is the player id', () => {
      entities.create({ id: 9999, type: 'mob' });
      expect(Object.keys(entities.entities).length).toBe(0);
    });

    test('creates a chest entity', () => {
      entities.create({ id: 1, type: 'chest', name: 'chest1', label: 'Chest', x: 5, y: 5 });
      expect(entities.entities[1]).toBeDefined();
      expect(entities.entities[1].type).toBe('chest');
    });

    test('creates an npc entity', () => {
      entities.create({ id: 2, type: 'npc', name: 'npc1', label: 'Guard', x: 3, y: 3 });
      expect(entities.entities[2]).toBeDefined();
      expect(entities.entities[2].type).toBe('npc');
    });

    test('creates an item entity', () => {
      entities.create({
        id: 3,
        type: 'item',
        name: 'sword',
        label: 'Sword',
        count: 1,
        ability: 0,
        abilityLevel: 0,
        x: 1,
        y: 1,
      });
      expect(entities.entities[3]).toBeDefined();
      expect(entities.entities[3].type).toBe('item');
    });

    test('creates a mob entity', () => {
      entities.create({
        id: 4,
        type: 'mob',
        name: 'goblin',
        label: 'Goblin',
        hitPoints: 50,
        maxHitPoints: 100,
        attackRange: 1,
        level: 5,
        x: 10,
        y: 10,
      });
      expect(entities.entities[4]).toBeDefined();
      expect(entities.entities[4].type).toBe('mob');
    });

    test('creates a player entity and adds it', () => {
      entities.create({
        id: 5,
        type: 'player',
        name: 'TestPlayer',
        x: 7,
        y: 7,
        rights: 0,
        level: 1,
        pvp: false,
        pvpKills: 0,
        pvpDeaths: 0,
        hitPoints: [100, 100],
        mana: [50, 50],
        armour: [0, 'clotharmour'],
        weapon: [0, 'none'],
        pendant: [0, 'none'],
        ring: [0, 'none'],
        boots: [0, 'none'],
      });
      expect(entities.entities[5]).toBeDefined();
    });

    test('does nothing for unknown type', () => {
      entities.create({ id: 6, type: 'unknown', name: 'unknown', x: 0, y: 0 });
      expect(entities.entities[6]).toBeUndefined();
    });

    test('does nothing for projectile when attacker or target is missing', () => {
      entities.create({
        id: 7,
        type: 'projectile',
        characterId: 999,
        targetId: 888,
        projectileType: 1,
        name: 'arrow',
        x: 0,
        y: 0,
      });
      expect(entities.entities[7]).toBeUndefined();
    });

    test('creates projectile when attacker and target both exist', () => {
      const mockAttacker = {
        id: 100,
        type: 'mob',
        x: 5,
        y: 5,
        orientation: 0,
        lookAt: jest.fn(),
        performAction: jest.fn(),
        triggerHealthBar: jest.fn(),
      };
      const mockTarget = {
        id: 200,
        type: 'player',
        x: 6,
        y: 6,
        explosion: false,
        triggerHealthBar: jest.fn(),
      };
      entities.entities[100] = mockAttacker;
      entities.entities[200] = mockTarget;

      entities.create({
        id: 8,
        type: 'projectile',
        characterId: 100,
        targetId: 200,
        projectileType: 1,
        name: 'arrow',
        hitType: 0,
        damage: 10,
        x: 5,
        y: 5,
      });

      expect(entities.entities[8]).toBeDefined();
    });
  });
});
