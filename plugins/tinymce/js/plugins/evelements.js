/* global tinymce */

tinymce.PluginManager.add('evelements', function(editor) {
    var evelementsConfig = editor.settings.evelements;
    var evelementsOptions = editor.settings.evelementsOptions;

    function setElement(elementConfig) {
        return function() {
            var dom = editor.dom;
            var node = editor.selection.getNode();
            if (node && elementConfig.matches(node)) {
                dom.remove(node, true);
            } else {
                editor.insertContent(
                    dom.createHTML(
                        elementConfig.name,
                        {},
                        dom.encode(editor.selection.getContent({ format: 'text' }))
                    )
                );
            }
        };
    }

    function showDialog(elementConfig) {
        return function() {
            var dom = editor.dom;
            var node = editor.selection.getNode();
            var attributes = null;

            if (node && elementConfig.matches(node)) {
                attributes = {};
                var attribs = dom.getAttribs(node);
                for (var i = 0; i < attribs.length; ++i) {
                    var item = attribs[i];
                    attributes[item.name] = item.value;
                }
            } else {
                node = null;
            }

            var key = elementConfig.key || elementConfig.name;
            var callback = evelementsOptions[key] && evelementsOptions[key].callback;
            var text = node ? ('innerText' in node ? node.innerText : node.textContent)
                                 : editor.selection.getContent({ format: 'text' });
            (callback || elementConfig.callback)(attributes, function(newAttributes, text) {
                if (node) {
                    editor.focus();
                    if (!newAttributes && !text) {
                        dom.remove(node, true);
                        editor.undoManager.add();
                        return;
                    }
                    dom.removeAllAttribs(node);
                    dom.setAttribs(node, newAttributes);
                    if (text) {
                        if ('innerText' in node) {
                            node.innerText = text;
                        } else {
                            node.textContent = text;
                        }
                    }
                    editor.selection.select(node);
                    editor.undoManager.add();
                } else {
                    editor.focus();
                    node = dom.createHTML(elementConfig.name, newAttributes, text && dom.encode(text));
                    editor.selection.setContent(node);
                    editor.undoManager.add();
                }
            }, text, evelementsOptions);
        };
    }

    if (typeof evelementsConfig === 'string') {
        evelementsConfig = evelementsConfig.split(' ');
    }

    evelementsConfig.forEach(function(elementConfig) {
        if (typeof elementConfig === 'string') {
            elementConfig = {
                name: elementConfig
            };
        }

        elementConfig.matches = elementConfig.matches || function(node) {
            return node.nodeName.toLowerCase() === elementConfig.name;
        };

        var callbackAction = elementConfig.callback ? showDialog(elementConfig) : setElement(elementConfig);

        editor.addButton('ev' + (elementConfig.key || elementConfig.name), {
            text: elementConfig.title !== undefined ? elementConfig.title : elementConfig.name,
            icon: elementConfig.icon,
            tooltip: elementConfig.tooltip || ('Set this text as ' + elementConfig.name),
            shortcut: elementConfig.shortcut,
            onclick: callbackAction,
            stateSelector: elementConfig.selector || elementConfig.name,
        });

        if (elementConfig.shortcut) {
            editor.addShortcut(elementConfig.shortcut, '', callbackAction);
        }
    });
});
