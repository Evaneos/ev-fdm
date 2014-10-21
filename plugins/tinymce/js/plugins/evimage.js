/*global tinymce:true */

tinymce.PluginManager.add('evimage', function(editor) {
    function showDialog() {
        var data, dom = editor.dom, imgElm = editor.selection.getNode();

        if (imgElm && imgElm.nodeName.toLowerCase() === 'img') {
            data = {
                src: dom.getAttrib(imgElm, 'src'),
                alt: dom.getAttrib(imgElm, 'alt'),
                "class": dom.getAttrib(imgElm, 'class'),
                dataPictureId: dom.getAttrib(imgElm, 'data-picture-id')
            };
        } else {
            data = false;
        }

        editor.settings.evimage(data, function(newAttributes) {
            if (imgElm) {
                dom.setAttribs(imgElm, newAttributes);
            } else {
                editor.insertContent(dom.create('img', newAttributes));
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
