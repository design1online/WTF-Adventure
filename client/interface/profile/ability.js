import GamePage from './gamePage';

export default class Ability extends GamePage {
  constructor(game) {
    super('#skillPage');
    this.game = game;
  }
}
