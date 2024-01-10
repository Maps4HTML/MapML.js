import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-extent.html');
  });
  test('Basic hidden functionality and API', async () => {
    const extent = await page.getByTestId('ext1');
    let hiddenInLayerControl = await extent.evaluate((extent) => {
      return !extent._layerControlHTML.isConnected;
    });
    expect(hiddenInLayerControl).toBe(true);

    await extent.evaluate((extent) => {
      extent.hidden = false;
    });
    hiddenInLayerControl = await extent.evaluate((extent) => {
      return !extent._layerControlHTML.isConnected;
    });
    expect(hiddenInLayerControl).toBe(false);

    let labelProperty = await extent.evaluate((extent) => {
      return extent.label;
    });
    expect(labelProperty === 'User-generated label').toBe(true);

    let labelInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlLabel.innerText;
    });
    expect(labelInLayerControl === labelProperty).toBe(true);

    await extent.evaluate((extent) => {
      extent.removeAttribute('label');
    });

    await page.waitForTimeout(500);
    const labelChangesToDefaultAndLayerNotHidden = await extent.evaluate(
      (extent) => {
        return (
          extent.label === 'Sub-layer' &&
          !extent.hidden &&
          extent._layerControlLabel.innerText === extent.label
        );
      }
    );
    expect(labelChangesToDefaultAndLayerNotHidden).toBe(true);
    await extent.evaluate((extent) => {
      // restore original state
      extent.hidden = true;
    });
  });

  test('hidden DOM order maintained when unhiding', async () => {
    const t = await page.getByTestId('template');
    await t.evaluate((t) => {
      let extents = t.content.cloneNode(true);
      let l = document.querySelector('#cbmt1');
      l.appendChild(extents);
    });
    await page.waitForTimeout(500);
    const layer = await page.getByTestId('cbmt1');
    let unhiddenMapExtentCount = await layer.evaluate((layer) => {
      return layer._propertiesGroupAnatomy.childElementCount;
    });
    // all hidden extents
    expect(unhiddenMapExtentCount).toEqual(0);
    await layer.evaluate((layer) => {
      return layer.whenElemsReady();
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext3"]').hidden = false;
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext1"]').hidden = false;
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext2"]').hidden = false;
    });
    unhiddenMapExtentCount = await layer.evaluate((layer) => {
      return layer._propertiesGroupAnatomy.childElementCount;
    });
    // no hidden extents
    expect(unhiddenMapExtentCount).toBe(3);

    const orderOfDOMExtentsEqualsLayerControlOrder = await layer.evaluate(
      (layer) => {
        let extents = layer.querySelectorAll('map-extent');
        let match = true;
        for (let i = 0; i < extents.length; i++) {
          if (
            extents[i]._layerControlHTML !==
            layer._propertiesGroupAnatomy.children[i]
          ) {
            match = false;
            break;
          }
        }
        return match;
      }
    );
    expect(orderOfDOMExtentsEqualsLayerControlOrder).toBe(true);
  });
  test('Basic checked functionality and API', async () => {
    // extent ext2-1 starts life checked and hidden
    const extent = await page.getByTestId('ext2-1');
    let checkedInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    let visibleOnMap = await extent.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    let checkedProperty = await extent.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(true);
    expect(visibleOnMap).toBe(true);
    expect(checkedProperty).toBe(true);
    await extent.evaluate((extent) => {
      extent.checked = false;
    });

    await extent.evaluate((extent) => {
      extent.hidden = false;
    });
    checkedInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    visibleOnMap = await extent.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    checkedProperty = await extent.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(false);
    expect(visibleOnMap).toBe(false);
    expect(checkedProperty).toBe(false);

    // extent2 is not checked when loaded
    const extent2 = await page.getByTestId('ext2-2');
    checkedInLayerControl = await extent2.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    visibleOnMap = await extent2.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    checkedProperty = await extent2.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(false);
    expect(visibleOnMap).toBe(false);
    expect(checkedProperty).toBe(false);
  });
  test('Ensure that undefined projection throws exception', async () => {
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    const viewer = page.getByTestId('firstmap');
    await viewer.evaluate((viewer) => {
      const l = document.createElement('layer-');
      l.label = 'Layer';
      const e = document
        .querySelector('template')
        .content.querySelector('[data-testid=ext4]')
        .cloneNode(true);
      l.checked = true;
      l.appendChild(e);
      viewer.appendChild(l);
    });
    // map-extent.connectedCallback does an await map.whenProjectionDefined('foo')
    // which has a timeout of 5 seconds
    await page.waitForTimeout(5500);
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0]).toBe('Undefined projection:foo');
  });
});
