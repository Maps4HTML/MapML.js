export var createLayerControlExtentHTML = function () {
  var extent = L.DomUtil.create('fieldset', 'mapml-layer-extent'),
    extentProperties = L.DomUtil.create(
      'div',
      'mapml-layer-item-properties',
      extent
    ),
    extentSettings = L.DomUtil.create(
      'div',
      'mapml-layer-item-settings',
      extent
    ),
    extentLabel = L.DomUtil.create(
      'label',
      'mapml-layer-item-toggle',
      extentProperties
    ),
    input = L.DomUtil.create('input'),
    svgExtentControlIcon = L.SVG.create('svg'),
    extentControlPath1 = L.SVG.create('path'),
    extentControlPath2 = L.SVG.create('path'),
    extentNameIcon = L.DomUtil.create('span'),
    extentItemControls = L.DomUtil.create(
      'div',
      'mapml-layer-item-controls',
      extentProperties
    ),
    opacityControl = L.DomUtil.create(
      'details',
      'mapml-layer-item-details mapml-control-layers',
      extentSettings
    ),
    extentOpacitySummary = L.DomUtil.create('summary', '', opacityControl),
    mapEl = this.getMapEl(),
    layerEl = this.getLayerEl(),
    opacity = L.DomUtil.create('input', '', opacityControl);
  extentSettings.hidden = true;
  extent.setAttribute('aria-grabbed', 'false');

  // append the svg paths
  svgExtentControlIcon.setAttribute('viewBox', '0 0 24 24');
  svgExtentControlIcon.setAttribute('height', '22');
  svgExtentControlIcon.setAttribute('width', '22');
  extentControlPath1.setAttribute('d', 'M0 0h24v24H0z');
  extentControlPath1.setAttribute('fill', 'none');
  extentControlPath2.setAttribute(
    'd',
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
  );
  svgExtentControlIcon.appendChild(extentControlPath1);
  svgExtentControlIcon.appendChild(extentControlPath2);

  let mapSelects = this.querySelectorAll('map-select');
  if (mapSelects.length) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < mapSelects.length; i++) {
      frag.appendChild(mapSelects[i].selectdetails);
    }
    extentSettings.appendChild(frag);
  }

  let removeExtentButton = L.DomUtil.create(
    'button',
    'mapml-layer-item-remove-control',
    extentItemControls
  );
  removeExtentButton.type = 'button';
  removeExtentButton.title = 'Remove Sub Layer';
  removeExtentButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
  removeExtentButton.classList.add('mapml-button');
  removeExtentButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.remove();
  });

  let extentsettingsButton = L.DomUtil.create(
    'button',
    'mapml-layer-item-settings-control',
    extentItemControls
  );
  extentsettingsButton.type = 'button';
  extentsettingsButton.title = 'Extent Settings';
  extentsettingsButton.setAttribute('aria-expanded', false);
  extentsettingsButton.classList.add('mapml-button');
  L.DomEvent.on(
    extentsettingsButton,
    'click',
    (e) => {
      if (extentSettings.hidden === true) {
        extentsettingsButton.setAttribute('aria-expanded', true);
        extentSettings.hidden = false;
      } else {
        extentsettingsButton.setAttribute('aria-expanded', false);
        extentSettings.hidden = true;
      }
    },
    this
  );

  extentNameIcon.setAttribute('aria-hidden', true);
  extentLabel.appendChild(input);
  extentsettingsButton.appendChild(extentNameIcon);
  extentNameIcon.appendChild(svgExtentControlIcon);
  extentOpacitySummary.innerText = 'Opacity';
  extentOpacitySummary.id =
    'mapml-extent-item-opacity-' + L.stamp(extentOpacitySummary);
  opacity.setAttribute('type', 'range');
  opacity.setAttribute('min', '0');
  opacity.setAttribute('max', '1.0');
  opacity.setAttribute('step', '0.1');
  opacity.setAttribute(
    'aria-labelledby',
    'mapml-extent-item-opacity-' + L.stamp(extentOpacitySummary)
  );
  const changeOpacity = function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this._extentLayer.changeOpacity(e.target.value);
    }
  };
  opacity.setAttribute('value', this.opacity);
  opacity.value = this._extentLayer._container.style.opacity || '1.0';
  opacity.addEventListener('change', changeOpacity.bind(this));

  var extentItemNameSpan = L.DomUtil.create(
    'span',
    'mapml-extent-item-name',
    extentLabel
  );
  input.type = 'checkbox';
  input.defaultChecked = this.checked;
  extentItemNameSpan.innerHTML = this.label;
  const changeCheck = function () {
    this.checked = !this.checked;
  };
  // save for later access by API
  this._layerControlCheckbox = input;
  input.addEventListener('change', changeCheck.bind(this));
  extentItemNameSpan.id =
    'mapml-extent-item-name-{' + L.stamp(extentItemNameSpan) + '}';
  extent.setAttribute('aria-labelledby', extentItemNameSpan.id);
  extentItemNameSpan.extent = this;

  extent.ontouchstart = extent.onmousedown = (downEvent) => {
    if (
      (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
        downEvent.target.tagName.toLowerCase() !== 'input') ||
      downEvent.target.tagName.toLowerCase() === 'label'
    ) {
      downEvent.stopPropagation();
      downEvent =
        downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;

      let control = extent,
        controls = extent.parentNode,
        moving = false,
        yPos = downEvent.clientY,
        originalPosition = Array.from(
          extent.parentElement.querySelectorAll('fieldset')
        ).indexOf(extent);

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
          extent.parentElement.querySelectorAll('fieldset')
        ).indexOf(extent);
        control.setAttribute('aria-grabbed', 'false');
        control.removeAttribute('aria-dropeffect');
        control.style.pointerEvents = null;
        control.style.transform = null;
        if (originalPosition !== newPosition) {
          let controlsElems = controls.children,
            zIndex = 0;
          for (let c of controlsElems) {
            let extentEl = c.querySelector('span').extent;

            extentEl.setAttribute('data-moving', '');
            const node = layerEl.src ? layerEl.shadowRoot : layerEl;
            node.append(extentEl);
            extentEl.removeAttribute('data-moving');

            extentEl.extentZIndex = zIndex;
            extentEl._extentLayer.setZIndex(zIndex);
            zIndex++;
          }
        }
        controls.classList.remove('mapml-draggable');
        document.body.ontouchmove =
          document.body.onmousemove =
          document.body.ontouchend =
          document.body.onmouseup =
            null;
      };
    }
  };
  this._extentRootFieldset = extent;
  this._opacitySlider = opacity;
  this._opacityControl = opacityControl;
  this._layerControlLabel = extentLabel;
  return extent;
};
