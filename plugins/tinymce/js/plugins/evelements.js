/* global tinymce:true */

tinymce.PluginManager.add('evelements', function(editor) {
    function setElement(nodeName) {
        return function() {
            var dom = editor.dom, elm = editor.selection.getNode();
            if (elm && elm.nodeName.toLowerCase() === nodeName) {
                dom.remove(elm, true);
            } else {
                editor.insertContent(
                    dom.createHTML(
                        nodeName,
                        {},
                        dom.encode(editor.selection.getContent({format: 'text'}))
                    )
                );
            }
        };
    }

    editor.settings.evelements.split(' ').forEach(function(elementName) {
        editor.addButton('ev' + elementName, {
            text: elementName,
            tooltip: 'Set this text as ' + elementName,
            onclick: setElement(elementName),
            stateSelector: elementName
        });
    });
});
