import Sprite from '../entity/sprite';

/**
 * @test {Sprite}
 */
describe('Sprite', () => {
  const spriteData = {
    id: 'sprite_id',
    animations: {
      idle: {
        length: 4,
        row: 0,
      },
    },
    width: 32,
    height: 32,
  };
  const scale = 1;
  const sprite = new Sprite(spriteData, scale);

  /**
   * @test {Sprite#constructor}
   */
  describe('constructor()', () => { 

    it('should set the sprite id', () => {
      expect(sprite.id).toEqual('sprite_id');
    });

    it('should set the sprite scale', () => {
      expect(sprite.scale).toEqual(scale);
    });

    it('should set the sprite loaded status to false', () => {
      expect(sprite.loaded).toBe(false);
    });

    it('should set the sprite offset X', () => {
      expect(sprite.offsetX).toEqual(-16);
    });

    it('should set the sprite offset Y', () => {
      expect(sprite.offsetY).toEqual(-16);
    });

    it('should set the sprite offset angle', () => {
      expect(sprite.offsetAngle).toEqual(0);
    });

    it('should load the sprite', () => {
      expect(sprite.image).toBeDefined();
    });
  });

  /**
  * @test {Sprite#update}
  */
  describe('update()', () => {

    it('should update the sprite scale', () => {
      sprite.update(2);
      expect(sprite.scale).toEqual(2);
    });
  });

  /**
  * @test {Sprite#createAnimations}
  */
  describe('createAnimations()', () => {

    it('should create animation objects for all animation data', () => {
      const animations = sprite.createAnimations();
      expect(animations).toBeDefined();
      expect(animations.idle).toBeDefined();
    });
  });

  /**
  * @test {Sprite#getHurtSprite}
  */
  describe('getHurtSprite()', () => {

    it('should return null if the sprite image is not loaded', () => {
      sprite.loaded = false;
      const hurtSprite = sprite.getHurtSprite();
      expect(hurtSprite).toEqual({ loaded: false });
    });

    it('should create a new hurt sprite if it has not been created yet', () => {
      sprite.loaded = false;
      const hurtSprite = sprite.getHurtSprite();
      expect(hurtSprite).toBeDefined();
    });

    it('should return the existing hurt sprite if it has already been created', () => {
      const hurtSprite1 = sprite.getHurtSprite();
      const hurtSprite2 = sprite.getHurtSprite();
      expect(hurtSprite1).toEqual(hurtSprite2);
    });
  });

  /**
  * @test {Sprite#onLoad}
  */
  describe('onLoad()', () => {
    it('onLoad()', () => {
      const callback = jest.fn();
      sprite.onLoad(callback);
      sprite.image.onload();
      expect(callback).toHaveBeenCalled();
    });
  });
});
