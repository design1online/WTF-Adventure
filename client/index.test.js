/* global document, window, Event */
import Client from '.';

// mock the Detect import
jest.mock('./utils/detect');

/**
 * @test {Client}
 */
describe('Client', () => {
  const instance = new Client();

  /**
   * @test {Client#constructor}
   */
  it('.constructor()', () => {
    expect(Client).toBeDefined();
  });

//   /**
//    * @test {WTF#load}
//    */
//   it('.load()', () => {
//     expect(instance.app).toEqual(null);
//     instance.load();
//     expect(instance.app).toBeDefined();
//     expect(instance.body).toBeDefined();
//     expect(instance.chatInput).toBeDefined();
//   });

//   /**
//    * @test {WTF#documentReady}
//    */
//   it('.documentReady()', () => {
//     expect(instance.app).toEqual(null);
//     instance.documentReady();
//     expect(instance.app).toBeDefined();
//     expect(instance.body).toBeDefined();
//     expect(instance.chatInput).toBeDefined();
//   });

//   /**
//    * @test {WTF#addClasses}
//    */
//   it('.addClasses()', () => {
//     instance.documentReady();
//     instance.addClasses();
//     expect(instance.chatInput).toBeDefined();
//     expect(instance.body[0].className).toEqual('windows opera');
//   });

//   /**
//    * @test {WTF#addResizeListeners}
//    */
//   it('.addResizeListeners()', () => {
//     instance.documentReady();
//     const map = {};
//     document.addEventListener = jest.fn((event, callback) => {
//       map[event] = callback;
//     });

//     instance.addResizeListeners();
//     expect(map.touchstart).toBeDefined();
//     expect(map.touchmove).toBeDefined();
//     expect(map.touchmove(new Event('test'))).toEqual(false);

//     // check window orientation changes
//     const updateOrientationMock = jest.spyOn(instance.app, 'updateOrientation');
//     window.dispatchEvent(new Event('orientationchange'));
//     expect(updateOrientationMock).toHaveBeenCalled();
//   });

//   /**
//    * @test {WTF#initGame}
//    */
//   it('.initGame()', () => {
//     const wtf = new WTF();
//     expect(wtf.app).toEqual(null);
//     wtf.documentReady();
//     wtf.initGame();
//     expect(wtf.app.readyCallback).toBeDefined();
//   });
});