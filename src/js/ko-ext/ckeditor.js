define(['knockout', 'ckeditor', 'jQuery'], function(ko) {

  /*************************/
  /* Binding with CKEditor */
  /*************************/
  ko.bindingHandlers.CKEDITOR = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var modelValue = ko.utils.unwrapObservable(valueAccessor()) || {};
      // Id of the element (found or generated)
      var id = $(element).attr('id');
      if(id == undefined || id == '') {
        $(element).attr('id','id_' + Math.floor(new Date().valueOf()));
        id = $(element).attr('id');
      }

      var editorElement = CKEDITOR.document.getById(id);
      editorElement.setHtml(modelValue);
      editorElement.setAttribute( 'contenteditable', 'true' );
      // Configuration needed for the EnterMode (not having breakline plus new paragraphs)

      var editor = CKEDITOR.replace(id);
      editor.on( 'change', function( evt ) {

        var observable;
        var content = ko.utils.unwrapObservable(valueAccessor()) || {};

        if (content.data != undefined) {
            observable = valueAccessor().data;
        } else {
            observable = valueAccessor();
        }
        observable(evt.editor.getData());
      });


      /* Handle disposal if KO removes an editor
       * through template binding */
      ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
        editor.updateElement();
        editor.destroy();
      });

    }
  };
});
