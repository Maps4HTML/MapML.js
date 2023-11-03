import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent tests', () => {
  let page;
  let context;
  test.describe('attribute tests', () => {
    test.beforeEach(async function () {
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
  });
  test('Basic checked functionality and API', async () => {
    // extent ext2-1 starts life checked and hidden
    const extent = await page.getByTestId('ext2-1');
    let checkedInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    let visibleOnMap = await extent.evaluate((extent) => {
      return extent._templatedLayer._container.isConnected;
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
      return extent._templatedLayer._container.isConnected;
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
      return extent._templatedLayer._container.isConnected;
    });
    checkedProperty = await extent2.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(false);
    expect(visibleOnMap).toBe(false);
    expect(checkedProperty).toBe(false);
  });
});
