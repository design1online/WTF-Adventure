import Packets from './packets';

describe('Packets', () => {
  test('main packet type constants are defined', () => {
    expect(Packets.Handshake).toBe(0);
    expect(Packets.Intro).toBe(1);
    expect(Packets.Welcome).toBe(2);
    expect(Packets.Spawn).toBe(3);
    expect(Packets.List).toBe(4);
    expect(Packets.Who).toBe(5);
    expect(Packets.Equipment).toBe(6);
    expect(Packets.Ready).toBe(7);
    expect(Packets.Movement).toBe(9);
    expect(Packets.Combat).toBe(14);
    expect(Packets.Chat).toBe(20);
    expect(Packets.Warp).toBe(40);
  });

  test('IntroOpcode constants are defined', () => {
    expect(Packets.IntroOpcode.Login).toBe(0);
    expect(Packets.IntroOpcode.Register).toBe(1);
    expect(Packets.IntroOpcode.Guest).toBe(2);
  });

  test('EquipmentOpcode constants are defined', () => {
    expect(Packets.EquipmentOpcode.Batch).toBe(0);
    expect(Packets.EquipmentOpcode.Equip).toBe(1);
    expect(Packets.EquipmentOpcode.Unequip).toBe(2);
  });

  test('MovementOpcode constants are defined', () => {
    expect(Packets.MovementOpcode.Request).toBe(0);
    expect(Packets.MovementOpcode.Started).toBe(1);
    expect(Packets.MovementOpcode.Step).toBe(2);
    expect(Packets.MovementOpcode.Stop).toBe(3);
    expect(Packets.MovementOpcode.Move).toBe(4);
    expect(Packets.MovementOpcode.Entity).toBe(6);
  });

  test('TargetOpcode constants are defined', () => {
    expect(Packets.TargetOpcode.Talk).toBe(0);
    expect(Packets.TargetOpcode.Attack).toBe(1);
    expect(Packets.TargetOpcode.None).toBe(2);
  });

  test('CombatOpcode constants are defined', () => {
    expect(Packets.CombatOpcode.Initiate).toBe(0);
    expect(Packets.CombatOpcode.Hit).toBe(1);
    expect(Packets.CombatOpcode.Finish).toBe(2);
  });

  test('NetworkOpcode constants are defined', () => {
    expect(Packets.NetworkOpcode.Ping).toBe(0);
    expect(Packets.NetworkOpcode.Pong).toBe(1);
  });

  test('InventoryOpcode constants are defined', () => {
    expect(Packets.InventoryOpcode.Batch).toBe(0);
    expect(Packets.InventoryOpcode.Add).toBe(1);
    expect(Packets.InventoryOpcode.Remove).toBe(2);
    expect(Packets.InventoryOpcode.Select).toBe(3);
  });

  test('QuestOpcode constants are defined', () => {
    expect(Packets.QuestOpcode.Batch).toBe(0);
    expect(Packets.QuestOpcode.Progress).toBe(1);
    expect(Packets.QuestOpcode.Finish).toBe(2);
  });

  test('NPCOpcode constants are defined', () => {
    expect(Packets.NPCOpcode.Talk).toBe(0);
    expect(Packets.NPCOpcode.Store).toBe(1);
    expect(Packets.NPCOpcode.Bank).toBe(2);
    expect(Packets.NPCOpcode.Enchant).toBe(3);
    expect(Packets.NPCOpcode.Countdown).toBe(4);
  });

  test('EnchantOpcode constants are defined', () => {
    expect(Packets.EnchantOpcode.Select).toBe(0);
    expect(Packets.EnchantOpcode.Remove).toBe(1);
    expect(Packets.EnchantOpcode.Enchant).toBe(2);
    expect(Packets.EnchantOpcode.Update).toBe(3);
  });

  test('PointerOpcode constants are defined', () => {
    expect(Packets.PointerOpcode.Location).toBe(0);
    expect(Packets.PointerOpcode.NPC).toBe(1);
    expect(Packets.PointerOpcode.Relative).toBe(2);
    expect(Packets.PointerOpcode.Remove).toBe(3);
  });

  test('ShopOpcode constants are defined', () => {
    expect(Packets.ShopOpcode.Open).toBe(0);
    expect(Packets.ShopOpcode.Buy).toBe(1);
    expect(Packets.ShopOpcode.Sell).toBe(2);
    expect(Packets.ShopOpcode.Refresh).toBe(3);
  });
});
