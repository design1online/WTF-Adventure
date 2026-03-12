import Quest from './quest';

jest.mock('jquery', () => {
  const mockEl = {
    find: jest.fn().mockReturnThis(),
    css: jest.fn().mockReturnThis(),
    click: jest.fn().mockReturnThis(),
    fadeIn: jest.fn().mockReturnThis(),
    fadeOut: jest.fn().mockReturnThis(),
    prepend: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    val: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    removeClass: jest.fn().mockReturnThis(),
    addClass: jest.fn().mockReturnThis(),
    hasClass: jest.fn().mockReturnValue(false),
    on: jest.fn().mockReturnThis(),
    change: jest.fn().mockReturnThis(),
    blur: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    focus: jest.fn().mockReturnThis(),
    empty: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    toggleClass: jest.fn().mockReturnThis(),
    dblclick: jest.fn().mockReturnThis(),
    width: jest.fn().mockReturnValue(100),
    height: jest.fn().mockReturnValue(100),
    remove: jest.fn().mockReturnThis(),
    length: 0,
  };
  const $ = jest.fn(() => mockEl);
  $.fn = mockEl;
  return $;
});

jest.mock('underscore', () => ({
  each: jest.fn((collection, fn) => {
    if (Array.isArray(collection)) collection.forEach(fn);
  }),
}));

describe('Quest', () => {
  let quest;

  beforeEach(() => {
    quest = new Quest();
  });

  test('constructor initializes achievements element', () => {
    expect(quest.achievements).toBeDefined();
  });

  test('constructor initializes quests element', () => {
    expect(quest.quests).toBeDefined();
  });

  test('constructor initializes achievementsCount element', () => {
    expect(quest.achievementsCount).toBeDefined();
  });

  test('constructor initializes questCount element', () => {
    expect(quest.questCount).toBeDefined();
  });

  test('constructor initializes achievementsList', () => {
    expect(quest.achievementsList).toBeDefined();
  });

  test('constructor initializes questList', () => {
    expect(quest.questList).toBeDefined();
  });

  test('loadQuest() does not throw with empty arrays', () => {
    expect(() => quest.loadQuest([], [])).not.toThrow();
  });

  test('loadQuest() processes quests and achievements', () => {
    const quests = [
      { id: 0, name: 'Test Quest', stage: 5, finished: false },
    ];
    const achievements = [
      { id: 0, name: 'Test Achievement', progress: 5000, count: 1, finished: true },
    ];
    expect(() => quest.loadQuest(quests, achievements)).not.toThrow();
  });

  test('getItem() returns a div element string with correct id', () => {
    const item = quest.getItem(true, 0);
    expect(item).toBeDefined();
  });

  test('getName() returns a div element string with correct id', () => {
    const name = quest.getName(false, 1);
    expect(name).toBeDefined();
  });

  test('progress() does not throw when item not found', () => {
    expect(() => quest.progress({ isQuest: true, id: 99, name: 'Test', count: 1, progress: 1 })).not.toThrow();
  });

  test('finish() does not throw when item not found', () => {
    expect(() => quest.finish({ isQuest: false, id: 99, name: 'Test' })).not.toThrow();
  });
});
