export var createLayerControlHTML = async function () {
  var fieldset = L.DomUtil.create('fieldset', 'mapml-layer-item'),
    input = L.DomUtil.create('input'),
    layerItemName = L.DomUtil.create('span', 'mapml-layer-item-name'),
    settingsButtonNameIcon = L.DomUtil.create('span'),
    layerItemProperty = L.DomUtil.create(
      'div',
      'mapml-layer-item-properties',
      fieldset
    ),
    layerItemSettings = L.DomUtil.create(
      'div',
      'mapml-layer-item-settings',
      fieldset
    ),
    itemToggleLabel = L.DomUtil.create(
      'label',
      'mapml-layer-item-toggle',
      layerItemProperty
    ),
    layerItemControls = L.DomUtil.create(
      'div',
      'mapml-layer-item-controls',
      layerItemProperty
    ),
    opacityControl = L.DomUtil.create(
      'details',
      'mapml-layer-item-opacity mapml-control-layers',
      layerItemSettings
    ),
    opacity = L.DomUtil.create('input'),
    opacityControlSummary = L.DomUtil.create('summary'),
    svgSettingsControlIcon = L.SVG.create('svg'),
    settingsControlPath1 = L.SVG.create('path'),
    settingsControlPath2 = L.SVG.create('path'),
    extentsFieldset = L.DomUtil.create(
      'fieldset',
      'mapml-layer-grouped-extents'
    ),
    mapEl = this.parentNode;

  // append the paths in svg for the remove layer and toggle icons
  svgSettingsControlIcon.setAttribute('viewBox', '0 0 24 24');
  svgSettingsControlIcon.setAttribute('height', '22');
  svgSettingsControlIcon.setAttribute('width', '22');
  svgSettingsControlIcon.setAttribute('fill', 'currentColor');
  settingsControlPath1.setAttribute('d', 'M0 0h24v24H0z');
  settingsControlPath1.setAttribute('fill', 'none');
  settingsControlPath2.setAttribute(
    'd',
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
  );
  svgSettingsControlIcon.appendChild(settingsControlPath1);
  svgSettingsControlIcon.appendChild(settingsControlPath2);

  layerItemSettings.hidden = true;
  settingsButtonNameIcon.setAttribute('aria-hidden', true);

  let removeControlButton = L.DomUtil.create(
    'button',
    'mapml-layer-item-remove-control',
    layerItemControls
  );
  removeControlButton.type = 'button';
  removeControlButton.title = 'Remove Layer';
  removeControlButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
  removeControlButton.classList.add('mapml-button');
  L.DomEvent.on(removeControlButton, 'click', L.DomEvent.stop);
  L.DomEvent.on(
    removeControlButton,
    'click',
    (e) => {
      let fieldset = 0,
        elem,
        root;
      root =
        mapEl.tagName === 'MAPML-VIEWER'
          ? mapEl.shadowRoot
          : mapEl.querySelector('.mapml-web-map').shadowRoot;
      if (
        e.target.closest('fieldset').nextElementSibling &&
        !e.target.closest('fieldset').nextElementSibling.disbaled
      ) {
        elem = e.target.closest('fieldset').previousElementSibling;
        while (elem) {
          fieldset += 2; // find the next layer menu item
          elem = elem.previousElementSibling;
        }
      } else {
        // focus on the link
        elem = 'link';
      }
      mapEl.removeChild(
        e.target.closest('fieldset').querySelector('span').layer._layerEl
      );
      elem = elem
        ? root.querySelector('.leaflet-control-attribution').firstElementChild
        : (elem = root.querySelectorAll('input')[fieldset]);
      elem.focus();
    },
    this._layer
  );

  let itemSettingControlButton = L.DomUtil.create(
    'button',
    'mapml-layer-item-settings-control',
    layerItemControls
  );
  itemSettingControlButton.type = 'button';
  itemSettingControlButton.title = 'Layer Settings';
  itemSettingControlButton.setAttribute('aria-expanded', false);
  itemSettingControlButton.classList.add('mapml-button');
  L.DomEvent.on(
    itemSettingControlButton,
    'click',
    (e) => {
      let layerControl = this._layer._layerEl._layerControl._container;
      if (!layerControl._isExpanded && e.pointerType === 'touch') {
        layerControl._isExpanded = true;
        return;
      }
      if (layerItemSettings.hidden === true) {
        itemSettingControlButton.setAttribute('aria-expanded', true);
        layerItemSettings.hidden = false;
      } else {
        itemSettingControlButton.setAttribute('aria-expanded', false);
        layerItemSettings.hidden = true;
      }
    },
    this._layer
  );

  input.defaultChecked = this.checked;
  input.type = 'checkbox';
  input.setAttribute('class', 'leaflet-control-layers-selector');
  layerItemName.layer = this._layer;
  const changeCheck = function () {
    this.checked = !this.checked;
  };
  input.addEventListener('change', changeCheck.bind(this));
  if (this._layer._legendUrl) {
    var legendLink = document.createElement('a');
    legendLink.text = ' ' + this._layer._title;
    legendLink.href = this._layer._legendUrl;
    legendLink.target = '_blank';
    legendLink.draggable = false;
    layerItemName.appendChild(legendLink);
  } else {
    layerItemName.innerHTML = this._layer._title;
  }
  layerItemName.id = 'mapml-layer-item-name-{' + L.stamp(layerItemName) + '}';
  opacityControlSummary.innerText = 'Opacity';
  opacityControlSummary.id =
    'mapml-layer-item-opacity-' + L.stamp(opacityControlSummary);
  opacityControl.appendChild(opacityControlSummary);
  opacityControl.appendChild(opacity);
  opacity.setAttribute('type', 'range');
  opacity.setAttribute('min', '0');
  opacity.setAttribute('max', '1.0');
  opacity.setAttribute('value', this._layer._container.style.opacity || '1.0');
  opacity.setAttribute('step', '0.1');
  opacity.setAttribute(
    'aria-labelledby',
    'mapml-layer-item-opacity-' + L.stamp(opacityControlSummary)
  );

  const changeOpacity = function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this._layer.changeOpacity(e.target.value);
    }
  };
  opacity.value = this._layer._container.style.opacity || '1.0';
  opacity.addEventListener('change', changeOpacity.bind(this));

  fieldset.setAttribute('aria-grabbed', 'false');
  fieldset.setAttribute('aria-labelledby', layerItemName.id);

  fieldset.ontouchstart = fieldset.onmousedown = (downEvent) => {
    if (
      (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
        downEvent.target.tagName.toLowerCase() !== 'input') ||
      downEvent.target.tagName.toLowerCase() === 'label'
    ) {
      downEvent =
        downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;
      let control = fieldset,
        controls = fieldset.parentNode,
        moving = false,
        yPos = downEvent.clientY,
        originalPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);

      document.body.ontouchmove = document.body.onmousemove = (moveEvent) => {
        moveEvent.preventDefault();
        moveEvent =
          moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent;

        // Fixes flickering by only moving element when there is enough space
        let offset = moveEvent.clientY - yPos;
        moving = Math.abs(offset) > 15 || moving;
        if (
          (controls && !moving) ||
          (controls && controls.childElementCount <= 1) ||
          controls.getBoundingClientRect().top >
            control.getBoundingClientRect().bottom ||
          controls.getBoundingClientRect().bottom <
            control.getBoundingClientRect().top
        ) {
          return;
        }

        controls.classList.add('mapml-draggable');
        control.style.transform = 'translateY(' + offset + 'px)';
        control.style.pointerEvents = 'none';

        let x = moveEvent.clientX,
          y = moveEvent.clientY,
          root =
            mapEl.tagName === 'MAPML-VIEWER'
              ? mapEl.shadowRoot
              : mapEl.querySelector('.mapml-web-map').shadowRoot,
          elementAt = root.elementFromPoint(x, y),
          swapControl =
            !elementAt || !elementAt.closest('fieldset')
              ? control
              : elementAt.closest('fieldset');

        swapControl =
          Math.abs(offset) <= swapControl.offsetHeight ? control : swapControl;

        control.setAttribute('aria-grabbed', 'true');
        control.setAttribute('aria-dropeffect', 'move');
        if (swapControl && controls === swapControl.parentNode) {
          swapControl =
            swapControl !== control.nextSibling
              ? swapControl
              : swapControl.nextSibling;
          if (control !== swapControl) {
            yPos = moveEvent.clientY;
            control.style.transform = null;
          }
          controls.insertBefore(control, swapControl);
        }
      };

      document.body.ontouchend = document.body.onmouseup = () => {
        let newPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);
        control.setAttribute('aria-grabbed', 'false');
        control.removeAttribute('aria-dropeffect');
        control.style.pointerEvents = null;
        control.style.transform = null;
        if (originalPosition !== newPosition) {
          let controlsElems = controls.children,
            zIndex = 1;
          // re-order layer elements DOM order
          for (let c of controlsElems) {
            let layerEl = c.querySelector('span').layer._layerEl;
            layerEl.setAttribute('data-moving', '');
            mapEl.insertAdjacentElement('beforeend', layerEl);
            layerEl.removeAttribute('data-moving');
          }
          // update zIndex of all layer- elements
          let layers = mapEl.querySelectorAll('layer-');
          for (let i = 0; i < layers.length; i++) {
            let layer = layers[i]._layer;
            if (layer.options.zIndex !== zIndex) {
              layer.setZIndex(zIndex);
            }
            zIndex++;
          }
        }
        controls.classList.remove('mapml-draggable');
        document.body.ontouchmove =
          document.body.onmousemove =
          document.body.onmouseup =
            null;
      };
    }
  };

  itemToggleLabel.appendChild(input);
  itemToggleLabel.appendChild(layerItemName);
  itemSettingControlButton.appendChild(settingsButtonNameIcon);
  settingsButtonNameIcon.appendChild(svgSettingsControlIcon);

  let mapml = this.src ? this.shadowRoot : this;
  var styleLinks = mapml.querySelectorAll(
    'map-link[rel=style],map-link[rel="self style"],map-link[rel="style self"]'
  );
  let styles;
  if (styleLinks) {
    styles = this.getAlternateStyles(styleLinks);
    if (styles) {
      layerItemSettings.appendChild(styles);
    }
  }

  this._layerControlCheckbox = input;
  this._layerControlLabel = itemToggleLabel;
  this._opacityControl = opacityControl;
  this._opacitySlider = opacity;
  this._layerControlHTML = fieldset;
  this._layerItemSettingsHTML = layerItemSettings;
  this._propertiesGroupAnatomy = extentsFieldset;
  this._styles = styles;
  extentsFieldset.setAttribute('aria-label', 'Sublayers');
  extentsFieldset.setAttribute('hidden', '');
  let mapExtents = mapml.querySelectorAll('map-extent:not([hidden])');
  let mapExtentLayerControls = [];
  for (let i = 0; i < mapExtents.length; i++) {
    mapExtentLayerControls.push(mapExtents[i].whenReady());
    // if any map-extent is not hidden, the parent fieldset should not be hidden
    extentsFieldset.removeAttribute('hidden');
  }
  await Promise.all(mapExtentLayerControls);
  for (let i = 0; i < mapExtents.length; i++) {
    extentsFieldset.appendChild(mapExtents[i].getLayerControlHTML());
  }
  layerItemSettings.appendChild(extentsFieldset);
  return this._layerControlHTML;
};
