define(function() {
  return Class.extend({
    constructor(id, element, type) {
      

      this.id = id;
      this.element = element;
      this.type = type;

      this.blinkInterval = null;
      this.visible = true;

      this.x = -1;
      this.y = -1;

      this.load();
    },

    load() {
      

      this.blinkInterval = setInterval(function() {
        if (this.visible) this.hide();
        else this.show();

        this.visible = !this.visible;
      }, 600);
    },

    destroy() {
      

      clearInterval(this.blinkInterval);
      this.element.remove();
    },

    setPosition(x, y) {
      

      this.x = x;
      this.y = y;
    },

    show() {
      this.element.css("display", "block");
    },

    hide() {
      this.element.css("display", "none");
    }
  });
});
