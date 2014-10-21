/*global tinymce:true */

tinymce.PluginManager.add('evimage', function(editor) {
    function showDialog() {
        var dom = editor.dom, 
            node = editor.selection.getNode(),
            attributes = null;

        if (node && node.getAttribute('data-picture-id')) {
            attributes = {
                src: dom.getAttrib(node, 'src'),
                alt: dom.getAttrib(node, 'alt'),
                'class': dom.getAttrib(node, 'class'),
                dataPictureId: dom.getAttrib(node, 'data-picture-id')
            };
        }

        editor.settings.evimage(attributes, function(attributesNew) {
            if (attributes) {
                dom.setAttribs(node, attributesNew);
            } else {
                editor.selection.setContent(editor.dom.createHTML('img', attributesNew)); 
            }
        });
    }

    editor.addButton('evimage', {
        icon: 'image',
        tooltip: 'Insert/edit image',
        onclick: showDialog,
        stateSelector: 'img[data-picture-id]:not([data-mce-object],[data-mce-placeholder])'
    });

    editor.addMenuItem('evimage', {
        icon: 'image',
        text: 'Insert image',
        onclick: showDialog,
        context: 'insert',
        prependToContext: true
    });

    editor.addCommand('mceImage', showDialog);
});
