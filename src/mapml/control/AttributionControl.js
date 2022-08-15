export var attributionControl = function (map) {
    map._attributionControl = map._map.attributionControl.setPrefix('<button onclick="this.closest(\'.leaflet-container\').querySelector(\'.shortcuts-dialog\').showModal()" class="shortcuts-button mapml-button">Keyboard shortcuts</button> | <a href="https://www.w3.org/community/maps4html/" title="W3C Maps for HTML Community Group">Maps4HTML</a> | <img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTIiIGhlaWdodD0iOCI+PHBhdGggZmlsbD0iIzRDN0JFMSIgZD0iTTAgMGgxMnY0SDB6Ii8+PHBhdGggZmlsbD0iI0ZGRDUwMCIgZD0iTTAgNGgxMnYzSDB6Ii8+PHBhdGggZmlsbD0iI0UwQkMwMCIgZD0iTTAgN2gxMnYxSDB6Ii8+PC9zdmc+" style="padding-right: 0.3em;" alt="Slava Ukraini"> <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');

    let dialog = document.createElement("dialog");
    dialog.setAttribute("class", "shortcuts-dialog");
    dialog.setAttribute("autofocus", "");
    dialog.onclick = function (e) {
        e.stopPropagation();
    };
    dialog.innerHTML = `<b>${M.options.locale.kbdShortcuts} </b><button aria-label="Close" onclick='this.parentElement.close()'>X</button>` +
        `<ul><b>${M.options.locale.kbdMovement}</b><li><kbd>&#8593</kbd> ${M.options.locale.kbdPanUp}</li><li><kbd>&#8595</kbd> ${M.options.locale.kbdPanDown}</li><li><kbd>&#8592</kbd> ${M.options.locale.kbdPanLeft}</li><li><kbd>&#8594</kbd> ${M.options.locale.kbdPanRight}</li><li><kbd>+</kbd> ${M.options.locale.btnZoomIn}</li><li><kbd>-</kbd> ${M.options.locale.btnZoomOut}</li><li><kbd>shift</kbd> + <kbd>&#8592/&#8593/&#8594/&#8595</kbd> 3x ${M.options.locale.kbdPanIncrement}</li><li><kbd>ctrl</kbd> + <kbd>&#8592/&#8593/&#8594/&#8595</kbd> 0.2x ${M.options.locale.kbdPanIncrement}</li><li><kbd>shift</kbd> + <kbd>+/-</kbd> ${M.options.locale.kbdZoom}</li></ul>` +
        `<ul><b>${M.options.locale.kbdFeature}</b><li><kbd>&#8592/&#8593</kbd> ${M.options.locale.kbdPrevFeature}</li><li><kbd>&#8594/&#8595</kbd> ${M.options.locale.kbdNextFeature}</li></ul>`;
    map._container.appendChild(dialog);

    map._attributionControl.getContainer().setAttribute("role","group");
    map._attributionControl.getContainer().setAttribute("aria-label","Map data attribution");
};