define(["jquery", "./container/container"], function($, Container) {
  return Class.extend({
    init(game, inventoryContainer, size) {
      var self = this;

      this.game = game;
      this.inventoryContainer = inventoryContainer;

      this.player = game.player;

      this.body = $("#bank");
      this.bankSlots = $("#bankSlots");
      this.bankInventorySlots = $("#bankInventorySlots");

      this.container = new Container(size);
      this.close = $("#closeBank");

      this.close.css("left", "97%");
      this.close.click(function() {
        this.hide();
      });
    },

    load(data) {
      var self = this,
        bankList = this.bankSlots.find("ul"),
        inventoryList = this.bankInventorySlots.find("ul");

      for (var i = 0; i < data.length; i++) {
        var item = data[i],
          slot = $('<div id="bankSlot' + i + '" class="bankSlot"></div>');

        this.container.setSlot(i, item);

        slot.css({
          "margin-right": 2 * this.getScale() + "px",
          "margin-bottom": 4 * this.getScale() + "px"
        });

        var image = $('<div id="bankImage' + i + '" class="bankImage"></div>');

        if (item.string)
          image.css(
            "background-image",
            this.container.getImageFormat(this.getDrawingScale(), item.string)
          );

        slot.click(function(event) {
          this.click("bank", event);
        });

        if (this.game.app.isMobile()) image.css("background-size", "600%");

        slot.append(image);
        slot.append(
          '<div id="bankItemCount' +
            i +
            '" class="itemCount">' +
            (item.count > 1 ? item.count : "") +
            "</div>"
        );

        slot.find("#bankItemCount" + i).css({
          "font-size": 4 * this.getScale() + "px",
          "margin-top": "0",
          "margin-left": "0"
        });

        var bankListItem = $("<li></li>");

        bankListItem.append(slot);

        bankList.append(bankListItem);
      }

      for (var j = 0; j < this.inventoryContainer.size; j++) {
        var iItem = this.inventoryContainer.slots[j],
          iSlot = $(
            '<div id="bankInventorySlot' + j + '" class="bankSlot"></div>'
          );

        iSlot.css({
          "margin-right": 3 * this.getScale() + "px",
          "margin-bottom": 6 * this.getScale() + "px"
        });

        var slotImage = $(
          '<div id="inventoryImage' + j + '" class="bankImage"></div>'
        );

        if (iItem.string)
          slotImage.css(
            "background-image",
            this.container.getImageFormat(this.getDrawingScale(), iItem.string)
          );

        iSlot.click(function(event) {
          this.click("inventory", event);
        });

        if (this.game.app.isMobile()) slotImage.css("background-size", "600%");

        iSlot.append(slotImage);
        iSlot.append(
          '<div id="inventoryItemCount' +
            j +
            '" class="itemCount">' +
            (iItem.count > 1 ? iItem.count : "") +
            "</div>"
        );

        iSlot.find("#inventoryItemCount" + j).css({
          "margin-top": "0",
          "margin-left": "0"
        });

        var inventoryListItem = $("<li></li>");

        inventoryListItem.append(iSlot);

        inventoryList.append(inventoryListItem);
      }
    },

    resize() {
      var self = this,
        bankList = this.getBankList(),
        inventoryList = this.getInventoryList();

      for (var i = 0; i < bankList.length; i++) {
        var bankSlot = $(bankList[i]).find("#bankSlot" + i),
          image = bankSlot.find("#bankImage" + i),
          slot = this.container.slots[i];

        bankSlot.css({
          "margin-right": 2 * this.getScale() + "px",
          "margin-bottom": 4 * this.getScale() + "px"
        });

        bankSlot.find("#bankItemCount" + i).css({
          "font-size": 4 * this.getScale() + "px",
          "margin-top": "0",
          "margin-left": "0"
        });

        if (this.game.app.isMobile()) image.css("background-size", "600%");
        else
          image.css(
            "background-image",
            this.container.getImageFormat(this.getDrawingScale(), slot.string)
          );
      }

      for (var j = 0; j < inventoryList.length; j++) {
        var inventorySlot = $(inventoryList[j]).find("#bankInventorySlot" + j),
          iImage = inventorySlot.find("#inventoryImage" + j),
          iSlot = this.inventoryContainer.slots[j];

        inventorySlot.css({
          "margin-right": 3 * this.getScale() + "px",
          "margin-bottom": 6 * this.getScale() + "px"
        });

        if (this.game.app.isMobile()) iImage.css("background-size", "600%");
        else
          iImage.css(
            "background-image",
            this.container.getImageFormat(this.getDrawingScale(), iSlot.string)
          );
      }
    },

    click(type, event) {
      var self = this,
        isBank = type === "bank",
        index = event.currentTarget.id.substring(isBank ? 8 : 17);

      this.game.socket.send(Packets.Bank, [
        Packets.BankOpcode.Select,
        type,
        index
      ]);
    },

    add(info) {
      var self = this,
        item = $(this.getBankList()[info.index]),
        slot = this.container.slots[info.index];

      if (!item || !slot) return;

      if (slot.isEmpty())
        slot.load(info.string, info.count, info.ability, info.abilityLevel);

      slot.setCount(info.count);

      var bankSlot = item.find("#bankSlot" + info.index),
        cssSlot = bankSlot.find("#bankImage" + info.index),
        count = bankSlot.find("#bankItemCount" + info.index);

      cssSlot.css(
        "background-image",
        this.container.getImageFormat(this.getDrawingScale(), info.string)
      );

      if (this.game.app.isMobile()) cssSlot.css("background-size", "600%");

      if (slot.count > 1) count.text(slot.count);
    },

    remove(info) {
      var self = this,
        item = $(this.getBankList()[info.index]),
        slot = this.container.slots[info.index];

      if (!item || !slot) return;

      slot.count -= info.count;

      if (slot.count < 1) {
        var divItem = item.find("#bankSlot" + info.index);

        divItem.find("#bankImage" + info.index).css("background-image", "");
        divItem.find("#bankItemCount" + info.index).text("");

        slot.empty();
      }
    },

    addInventory(info) {
      var self = this,
        item = $(this.getInventoryList()[info.index]);

      if (!item) return;

      var slot = item.find("#bankInventorySlot" + info.index),
        image = slot.find("#inventoryImage" + info.index);

      image.css(
        "background-image",
        this.container.getImageFormat(this.getDrawingScale(), info.string)
      );

      if (this.game.app.isMobile()) image.css("background-size", "600%");

      if (info.count > 1)
        slot.find("#inventoryItemCount" + info.index).text(info.count);
    },

    removeInventory(info) {
      var self = this,
        item = $(this.getInventoryList()[info.index]);

      if (!item) return;

      var slot = item.find("#bankInventorySlot" + info.index);

      slot.find("#inventoryImage" + info.index).css("background-image", "");
      slot.find("#inventoryItemCount" + info.index).text("");
    },

    display() {
      this.body.fadeIn("slow");
    },

    hide() {
      this.body.fadeOut("fast");
    },

    isVisible() {
      return this.body.css("display") === "block";
    },

    getDrawingScale() {
      return this.game.renderer.getDrawingScale();
    },

    getScale() {
      return this.game.getScaleFactor();
    },

    getBankList() {
      return this.bankSlots.find("ul").find("li");
    },

    getInventoryList() {
      return this.bankInventorySlots.find("ul").find("li");
    }
  });
});