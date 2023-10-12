/* eslint-disable */
import _ from 'underscore';
import log from './log.js';
import NPCData from '../../data/npcs.json' assert { type: 'json' };
import ItemData from '../../data/items.json' assert { type: 'json' };
import MobData from '../../data/mobs.json' assert { type: 'json' };
import AbilityData from '../../data/abilities.json' assert { type: 'json' };
import ShopsData from '../../data/shops.json' assert { type: 'json' };
import ItemsDictionary from './items.js';
import NpcsDictionary from './npcs.js';
import MobsDictionary from './mobs.js';
import AbilitiesDictionary from './abilities.js';
import ShopsDictionary from './shops.js';
import Formulas from '../game/formulas.js';
import utils from './utils.js';

const __dirname = utils.dirName(import.meta.url);

export default class Parser {
  constructor() {
    this.mobsDictionary = MobsDictionary;
    this.npcsDictionary = NpcsDictionary;
    this.shopsDictionary = ShopsDictionary;
    this.itemsDictionary = ItemsDictionary;
    this.abilitiesDictionary = AbilitiesDictionary;

    this.loadMobData();
    this.loadNPCData();
    this.loadItemData();
    this.loadAbilityData();
    this.loadShops();
    this.loadLevels();

    return true;
  }

  loadMobData() {
    let mobCounter = 0;

    _.each(MobData, (value, key) => {
      key = key.toLowerCase(); // eslint-disable-line

      MobsDictionary.setData(key, {
        key,
        id: value.id,
        name: value.name ? value.name : key,
        drops: value.drops ? value.drops : null,
        hitPoints: value.hitPoints ? value.hitPoints : 10,
        armour: value.armour ? value.armour : 0,
        weapon: value.weapon ? value.weapon : 0,
        xp: value.xp ? value.xp : 0,
        level: value.level ? value.level : 0,
        aggroRange: value.aggroRange ? value.aggroRange : 2,
        attackRange: value.attackRange ? value.attackRange : 1,
        aggressive: value.aggressive ? value.aggressive : false,
        isPoisonous: value.isPoisonous ? value.isPoisonous : false,
        attackRate: value.attackRate ? value.attackRate : 1000,
        movementSpeed: value.movementSpeed ? value.movementSpeed : 200,
        projectileName: value.projectileName ? value.projectileName : null,
        spawnDelay: value.spawnDelay ? value.spawnDelay : 60000,
        combatPlugin: value.combatPlugin ? value.combatPlugin : null,
      });

      mobCounter += 1;
    });

    MobsDictionary.setPlugins(`${__dirname}/../../data/combat/`);

    log.notice(`Finished loading ${mobCounter} mobs.`);
    log.notice(`Loaded ${Object.keys(MobsDictionary.plugins).length} mob plugins.`);
  }

  loadNPCData() {
    let npcCounter = 0;

    _.each(NPCData, (value, key) => {
      key = key.toLowerCase(); // eslint-disable-line

      NpcsDictionary.setData(key, {
        key,
        id: value.id,
        name: value.name ? value.name : key,
        text: value.text ? value.text : null,
        type: value.type ? value.type : null,
      });

      npcCounter += 1;
    });

    log.notice(`Finished loading ${npcCounter} NPCs.`);
  }

  loadItemData() {
    let itemCounter = 0;

    _.each(ItemData, (value, key) => {
      key = key.toLowerCase(); // eslint-disable-line

      ItemsDictionary.setData(key, {
        key,
        id: value.id ? value.id : -1,
        type: value.type ? value.type : 'object',
        attack: value.attack ? value.attack : 0,
        defense: value.defense ? value.defense : 0,
        pendantLevel: value.pendantLevel ? value.pendantLevel : null,
        ringLevel: value.ringLevel ? value.ringLevel : null,
        bootsLevel: value.bootsLevel ? value.bootsLevel : null,
        name: value.name ? value.name : key,
        price: value.price ? value.price : 1,
        storeCount: value.storeCount ? value.storeCount : 1,
        stackable: value.stackable ? value.stackable : 0,
        edible: value.edible ? value.edible : 0,
        healsHealth: value.healsHealth ? value.healsHealth : 0,
        healsMana: value.healsMana ? value.healsMana : 0,
        maxStackSize: value.maxStackSize ? value.maxStackSize : -1,
        plugin: value.plugin ? value.plugin : null,
        customData: value.customData ? value.customData : null,
      });

      itemCounter += 1;
    });

    ItemsDictionary.setPlugins(`${__dirname}/../../data/items/`);

    log.notice(`Finished loading ${itemCounter} items.`);
    log.notice(`Loaded ${Object.keys(ItemsDictionary.plugins).length} item plugins.`);
  }

  loadAbilityData() {
    let skillCounter = 0;

    _.each(AbilityData, (value, key) => {
      key = key.toLowerCase(); // eslint-disable-line

      AbilitiesDictionary.setData(key, {
        key,
        id: value.id,
        type: value.type,
        mana: value.mana ? value.mana : 0,
        cooldown: value.cooldown ? value.cooldown : null,
      });

      skillCounter += 1;
    });

    log.notice(`Finished loading ${skillCounter} skills.`);
  }

  loadShops() {
    let shopCounter = 0;

    _.each(ShopsData, (value, key) => {
      key = key.toLowerCase();

      this.shopsDictionary.setData(key, {
        key,
        id: value.npcId,
        items: value.items,
        count: value.count,
        prices: value.prices,
      });
      shopCounter += 1;
    });

    log.notice(`Finished loading ${shopCounter} shops.`);
  }

  loadLevels() {
    Formulas.LevelExp[0] = 0;

    for (let i = 1; i < 130; i += 1) {
      const points = Math.floor(0.25 * Math.floor(i + 300 * Math.pow(2, i / 7)));
      Formulas.LevelExp[i] = points + Formulas.LevelExp[i - 1];
    }
  }
}
