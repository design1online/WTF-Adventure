const mockJqueryElement = {
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
  focus: jest.fn().mockReturnThis(),
  blur: jest.fn().mockReturnThis(),
  val: jest.fn().mockReturnValue(''),
  is: jest.fn().mockReturnValue(false),
  addClass: jest.fn().mockReturnThis(),
  removeClass: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  scrollTop: jest.fn().mockReturnThis(),
  click: jest.fn().mockImplementation(function(cb) { this._clickCb = cb; return this; }),
  _clickCb: null,
};

jest.mock('jquery', () => {
  const jq = jest.fn(() => mockJqueryElement);
  jq.fn = {};
  return jq;
});

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../utils/modules', () => ({
  Keys: { Enter: 13 },
}));

jest.mock('../network/packets', () => ({
  Chat: 'chat',
}));

import Chat from './chat';

describe('Chat', () => {
  let chat;
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockJqueryElement.val.mockReturnValue('');
    mockJqueryElement.is.mockReturnValue(false);

    mockGame = {
      socket: {
        send: jest.fn(),
      },
    };

    chat = new Chat(mockGame);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(chat.game).toBe(mockGame);
    });

    test('initializes visible as false', () => {
      expect(chat.visible).toBe(false);
    });

    test('initializes fadingDuration as 5000', () => {
      expect(chat.fadingDuration).toBe(5000);
    });

    test('initializes fadingTimeout as null', () => {
      expect(chat.fadingTimeout).toBeNull();
    });

    test('registers click handler on button', () => {
      expect(mockJqueryElement.click).toHaveBeenCalled();
    });
  });

  describe('showChat', () => {
    test('sets visible to true', () => {
      chat.showChat();
      expect(chat.visible).toBe(true);
    });

    test('calls fadeIn on chat element', () => {
      chat.showChat();
      expect(mockJqueryElement.fadeIn).toHaveBeenCalledWith('fast');
    });
  });

  describe('showInput', () => {
    test('adds active class to button', () => {
      chat.showInput();
      expect(mockJqueryElement.addClass).toHaveBeenCalledWith('active');
    });

    test('calls fadeIn on input', () => {
      chat.showInput();
      expect(mockJqueryElement.fadeIn).toHaveBeenCalledWith('fast');
    });

    test('sets fadingTimeout to null (clean)', () => {
      chat.fadingTimeout = setTimeout(() => {}, 5000);
      chat.showInput();
      expect(chat.fadingTimeout).toBeNull();
    });
  });

  describe('hideInput', () => {
    test('removes active class from button', () => {
      chat.hideInput();
      expect(mockJqueryElement.removeClass).toHaveBeenCalledWith('active');
    });

    test('calls fadeOut on input', () => {
      chat.hideInput();
      expect(mockJqueryElement.fadeOut).toHaveBeenCalledWith('fast');
    });

    test('calls blur on input', () => {
      chat.hideInput();
      expect(mockJqueryElement.blur).toHaveBeenCalled();
    });
  });

  describe('clean', () => {
    test('clears fadingTimeout and sets to null', () => {
      chat.fadingTimeout = setTimeout(() => {}, 5000);
      chat.clean();
      expect(chat.fadingTimeout).toBeNull();
    });

    test('works when fadingTimeout is already null', () => {
      expect(() => chat.clean()).not.toThrow();
    });
  });

  describe('isActive', () => {
    test('returns false when input is not focused', () => {
      mockJqueryElement.is.mockReturnValue(false);
      expect(chat.isActive()).toBe(false);
    });

    test('returns true when input is focused', () => {
      mockJqueryElement.is.mockReturnValue(true);
      expect(chat.isActive()).toBe(true);
    });
  });

  describe('send', () => {
    test('sends chat packet via socket', () => {
      const Packets = require('../network/packets');
      mockJqueryElement.val.mockReturnValue('hello world');
      chat.send();
      expect(mockGame.socket.send).toHaveBeenCalledWith(Packets.Chat, ['hello world']);
    });
  });

  describe('add', () => {
    test('appends message element to log', () => {
      chat.add('Player', 'Hello', 'red', 'white');
      expect(mockJqueryElement.append).toHaveBeenCalled();
    });

    test('uses default white colors when not provided', () => {
      expect(() => chat.add('Player', 'Hello')).not.toThrow();
    });
  });

  describe('key', () => {
    test('calls toggle when Enter is pressed with empty input', () => {
      const toggleSpy = jest.spyOn(chat, 'toggle');
      mockJqueryElement.val.mockReturnValue('');
      chat.key(13); // Module.Keys.Enter
      expect(toggleSpy).toHaveBeenCalled();
    });

    test('calls send when Enter is pressed with non-empty input', () => {
      const sendSpy = jest.spyOn(chat, 'send');
      mockJqueryElement.val.mockReturnValue('hello');
      chat.key(13);
      expect(sendSpy).toHaveBeenCalled();
    });

    test('does nothing for unknown key codes', () => {
      expect(() => chat.key(999)).not.toThrow();
    });
  });

  describe('toggle', () => {
    test('calls showChat and showInput when not visible', () => {
      const showChatSpy = jest.spyOn(chat, 'showChat');
      const showInputSpy = jest.spyOn(chat, 'showInput');
      chat.visible = false;
      chat.toggle();
      expect(showChatSpy).toHaveBeenCalled();
      expect(showInputSpy).toHaveBeenCalled();
    });

    test('calls hideInput and hideChat when visible and active', () => {
      const hideInputSpy = jest.spyOn(chat, 'hideInput');
      chat.visible = true;
      mockJqueryElement.is.mockReturnValue(true); // isActive returns true
      chat.toggle();
      expect(hideInputSpy).toHaveBeenCalled();
    });
  });
});
