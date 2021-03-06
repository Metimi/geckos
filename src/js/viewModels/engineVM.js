define(['knockout',
        'fabric',
        'viewModels/field-factory',
        'viewModels/cardTemplateVM',
        'viewModels/UItemplates',
        'FileSaver'
      ], function(ko, fabric, FieldFactory, CardTemplateVM, UITemplates) {

/***************************************/
/* Main entry point of the application */
/***************************************/
  function engineVM(jsonTemplate) {
    var self = this;

    /*************************/
    /* Variables declaration */
    /*************************/
    self.cardTemplate = ko.observable(null);
    self.listCards = ko.observableArray([]);
    self.editableCard = ko.observable(null);

    self.isCardSelected = ko.pureComputed(function() {
      return self.editableCard() != null;
    });

    self.generatedTemplate = ko.pureComputed(function() {
      var jsonCanvas = { };
      if (self.cardTemplate() != null) {
        jsonCanvas = self.cardTemplate().generateTemplate(self.editableCard());
      }

      return jsonCanvas;
    });

    self.UItemplates = ko.observable(null);
    /********************************/
    /* End of Variables declaration */
    /********************************/

    /*************************/
    /* Functions declaration */
    /*************************/
    self.updateCanvasSize = function() {
      if ((self.canvas != undefined) && (self.cardTemplate() != undefined)) {
        self.canvas.setWidth(self.cardTemplate().canvasWidth());
        self.canvas.setHeight(self.cardTemplate().canvasHeight());
      }
    }

    self.updateCardsFields = function() {
      for(var iCard = 0; iCard < self.listCards().length; iCard++) {
        self.cardTemplate().updateFieldsOfCard(self.listCards()[iCard]);
      }
    }

    self.createNewCard = function() {
      return self.cardTemplate().createNewCard();
    }

    /* Adding / Removing cards from the list */
    self.addNewCard = function() {
      var newCard = self.createNewCard();
      self.listCards.push(newCard);
      self.editableCard(newCard);
    }
    self.removeSelectedCard = function() {

      self.editableCard(self.listCards()[0]);

      if (self.editableCard() != null) {
        self.listCards.remove(self.editableCard());
        if (self.listCards().length > 0) {
          self.editableCard(self.listCards()[0]);
        } else {
          self.editableCard(null);
        }
      }
    }
    self.clearList = function() {
      self.editableCard(null);
      self.listCards.removeAll();
    }

    /* Export the content of the Canvas as a PNG */
    /* TODO : Getting a dedicated object / function to export a card (template + data) as a PNG */
    self.exportPng = function() {
      if (self.editableCard() != null) {
        var canvas = document.getElementById('fabricjs-canvas');
        canvas.toBlob(function(blob) {
          saveAs(blob, self.editableCard().cardName() + ".png");
        });
      }
    }

    /* Import / Export data for list of cards */
    self.exportList = function() {
      var jsonData = [ ];
      for(var iCard = 0; iCard < self.listCards().length; iCard++) {
        jsonData.push(self.listCards()[iCard].getSavedData());
      }
      var blob = new Blob([JSON.stringify(jsonData)], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "listCards.json");
    }
    self.loadList = function() {
      $("#file-load-list").click();
    }
    self.importList = function(jsonData) {

      var cards = [];
      for(var cardData in jsonData) {
        var card = self.createNewCard();
        card.loadFromJson(jsonData[cardData]);
        cards.push(card);
      }
      self.listCards(cards);
      if (cards.length > 0) {
        self.editableCard(cards[0]);
      }
    }

    /*******************************/
    /*End of Functions declaration */
    /*******************************/

    /* Initialization of the FabricJS canvas object */
    self.canvas = new fabric.StaticCanvas('fabricjs-canvas');

    /* Initialization of the Card Template */
    var cardTemplateVM = CardTemplateVM.newCardTemplateVM(jsonTemplate, self.updateCanvasSize, self.updateCardsFields);
    self.cardTemplate(cardTemplateVM);
    self.updateCanvasSize();

    /* Initializing the list with one item */
    self.listCards().push(self.createNewCard());
    self.editableCard(self.listCards()[0]);

    /* Initializing the UI parts */
    self.UItemplates(UITemplates.getUItemplates(self));

  }
  return {
    newEngineVM: function(jsonTemplate) { return new engineVM(jsonTemplate); }
  }
});
