import $ from 'jquery';
import Packets from '../network/packets';

export default class Warp {
  constructor(game) {
    this.game = game;
    this.mapFrame = $('#mapFrame');
    this.warp = $('#hud-world');
    this.close = $('#closeMapFrame');
    this.warpCount = 0;
    this.loadWarp();
  }

  loadWarp() {
    this.warp.click(() => {
      this.toggle();
    });

    this.close.click(() => {
      this.hide();
    });

    for (let i = 1; i < 7; i += 1) {
      const warp = this.mapFrame.find(`#warp${i}`);

      if (warp) {
        warp.click((event) => {
          this.hide();

          this.game.socket.send(Packets.Warp, [
            event.currentTarget.id.substring(4),
          ]);
        });
      }
    }
  }

  /**
   * Just so it fades out nicely.
   */
  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.display();
    }
  }

  getScale() {
    return this.game.getScaleFactor();
  }

  isVisible() {
    return this.mapFrame.css('display') === 'block';
  }

  display() {
    this.mapFrame.fadeIn('slow');
  }

  hide() {
    this.mapFrame.fadeOut('fast');
  }
}
