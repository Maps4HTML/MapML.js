CustomUI = {
  initialize: function () {
    let layers = document.querySelectorAll("layer-");
    let map = document.querySelector("mapml-viewer");

    let mapObserver = new MutationObserver((m) => {
      m.forEach((mut) => {
        if (mut.type === "childList") {
          mut.addedNodes.forEach((l) => {
            if (l.tagName === "LAYER-") {
              CustomUI.addLayer(l);
            }
          });
        }
      });
    });

    mapObserver.observe(map, { childList: true });

    for (let i = 0; i < layers.length; i++) {
      CustomUI.addLayer(layers[i]);
    }
  },
  addLayer: function (layerEl) {
    let layer = document.createElement("button");

    layer.classList.add("btn");
    layer.innerHTML = layerEl.label;
    if (layerEl.checked) layer.classList.add("btn-info");

    layer.toggleChecked = layerEl.toggleChecked;
    layer.addEventListener("click", function (e) {
      if (layerEl.checked) {
        layerEl.removeAttribute("checked");
        layer.classList.remove("btn-info");
        layer.classList.add("btn-light");

      } else {
        layerEl.setAttribute("checked", "");
        layer.classList.add("btn-info");
        layer.classList.remove("btn-light");
      }
    });

    let observer = new MutationObserver((m) => {
      m.forEach((mut) => {
        if (mut.type === "attributes") {
          if (mut.attributeName === "disabled") {
            if (mut.target.disabled) {
              layer.setAttribute("disabled", "");
            } else {
              layer.removeAttribute("disabled");
            }
          }
          if (mut.attributeName === "label") {
            layer.innerHTML = layerEl.label;
          }
        }
      });
    });
    observer.observe(layerEl, { attributes: true });

    document.getElementById("layers").appendChild(layer);
  },
  zoomIn: function () {
    let map = document.getElementById("custom-map"),
      lat = +map.lat,
      lon = +map.lon,
      zoom = +map.zoom + 1;
    map.zoomTo(lat, lon, zoom);
  },
  zoomOut: function () {
    let map = document.getElementById("custom-map"),
      lat = +map.lat,
      lon = +map.lon,
      zoom = +map.zoom - 1;
    map.zoomTo(lat, lon, zoom);
  },
}