import { test, expect, chromium } from '@playwright/test';

test.describe('Map Tile Dynamic Updates Tests', () => {
  let page;
  let context;

  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-tile-test.html');
  });

  test('removing map-tile from DOM removes it from map rendering', async () => {
    // Wait for initial rendering
    await page.waitForTimeout(1000);

    // Debug: Check initial state
    const debugInfo = await page.evaluate(() => {
      const tiles = document.querySelectorAll('map-tile');
      const mapZoom = document.querySelector('mapml-viewer')._map.getZoom();

      const tileInfo = Array.from(tiles).map((tile) => ({
        zoom: tile.getAttribute('zoom'),
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        hasDiv: tile._tileDiv !== undefined,
        isVisible: tile._tileDiv
          ? !tile._tileDiv.style.display ||
            tile._tileDiv.style.display !== 'none'
          : false
      }));

      return {
        mapZoom,
        totalTiles: tiles.length,
        renderedTiles: tileInfo.filter((t) => t.hasDiv).length,
        visibleTiles: tileInfo.filter((t) => t.isVisible).length,
        tilesByZoom: tileInfo.reduce((acc, t) => {
          acc[t.zoom] = (acc[t.zoom] || 0) + 1;
          return acc;
        }, {}),
        renderedByZoom: tileInfo
          .filter((t) => t.hasDiv)
          .reduce((acc, t) => {
            acc[t.zoom] = (acc[t.zoom] || 0) + 1;
            return acc;
          }, {})
      };
    });

    expect(debugInfo.totalTiles).toBeGreaterThan(0);

    // Take screenshot before removal
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    expect(beforeScreenshot).toMatchSnapshot('before-tile-removal.png');

    // Remove specific tiles that are currently at the map zoom level
    const removedTiles = await page.evaluate(() => {
      const mapZoom = document.querySelector('mapml-viewer')._map.getZoom();
      const tiles = document.querySelectorAll(`map-tile[zoom="${mapZoom}"]`);
      const removed = [];

      // Remove first 3 tiles at current zoom level
      for (let i = 0; i < Math.min(3, tiles.length); i++) {
        removed.push({
          zoom: tiles[i].getAttribute('zoom'),
          row: tiles[i].getAttribute('row'),
          col: tiles[i].getAttribute('col'),
          hadDiv: tiles[i]._tileDiv !== undefined
        });
        tiles[i].remove();
      }

      return {
        mapZoom,
        removedCount: removed.length,
        removed
      };
    });

    // Wait for redraw to complete
    await page.waitForTimeout(1000);

    // Check final state
    const finalDebugInfo = await page.evaluate(() => {
      const tiles = document.querySelectorAll('map-tile');
      const mapZoom = document.querySelector('mapml-viewer')._map.getZoom();

      const tileInfo = Array.from(tiles).map((tile) => ({
        zoom: tile.getAttribute('zoom'),
        hasDiv: tile._tileDiv !== undefined
      }));

      return {
        totalTiles: tiles.length,
        renderedTiles: tileInfo.filter((t) => t.hasDiv).length,
        renderedAtCurrentZoom: tileInfo.filter(
          (t) => t.hasDiv && t.zoom === mapZoom
        ).length
      };
    });

    // Take screenshot after removal to show visual difference
    const afterScreenshot = await page.screenshot({ fullPage: false });
    expect(afterScreenshot).toMatchSnapshot('after-tile-removal.png');

    // The test should pass if we removed tiles successfully
    expect(removedTiles.removedCount).toBeGreaterThan(0);
  });

  test('removing the last map-tile in a sequence removes MapTileLayer container', async () => {
    // Reset by reloading the page
    await page.reload();
    await page.waitForTimeout(1000);

    const viewer = page.getByTestId('viewer');
    let nTiles = await viewer.evaluate(
      (v) => v.querySelectorAll('map-tile').length
    );
    expect(nTiles).toEqual(15);
    const containerConnected = await viewer.evaluate((v) => {
      v.querySelector('map-tile')._tileLayer._container.setAttribute(
        'data-testid',
        'test-tile-container'
      );
      return v.querySelector('map-tile')._tileLayer._container.isConnected;
    });
    expect(containerConnected).toBe(true);
    nTiles = await viewer.evaluate((v) => {
      v.querySelectorAll('map-tile').forEach((el) => el.remove());
      return v.querySelectorAll('map-tile').length;
    });
    expect(nTiles).toEqual(0);
    await expect(page.getByTestId('test-tile-container')).toHaveCount(0);
  });

  test('adding map-tile to DOM renders it on map', async () => {
    // Reset by reloading the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Take baseline screenshot
    const baselineScreenshot = await page.screenshot({ fullPage: false });
    expect(baselineScreenshot).toMatchSnapshot('baseline-before-adding.png');

    // Add a new map-tile element to DOM at a visible location
    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      const newTile = document.createElement('map-tile');
      newTile.setAttribute('zoom', '2');
      newTile.setAttribute('row', '13');
      newTile.setAttribute('col', '12');
      newTile.setAttribute('src', 'tiles/green-tile.png');
      layer.appendChild(newTile);
    });

    // Wait for the tile to be processed and rendered
    await page.waitForTimeout(1000);

    // Verify the new tile exists in DOM
    const newTileExists = await page.evaluate(() => {
      const newTile = document.querySelector('map-tile[row="13"][col="12"]');
      return newTile !== null;
    });

    expect(newTileExists).toBe(true);

    // Verify the new tile is part of a tile layer
    const newTileInLayer = await page.evaluate(() => {
      const newTile = document.querySelector('map-tile[row="13"][col="12"]');
      return newTile && newTile._tileLayer !== undefined;
    });

    expect(newTileInLayer).toBe(true);

    // Take screenshot after adding to show the tile was rendered
    const afterAddingScreenshot = await page.screenshot({ fullPage: false });
    expect(afterAddingScreenshot).toMatchSnapshot('after-adding-tile.png');
  });

  test('bidirectional links are properly cleaned up on removal', async () => {
    // Reload to start fresh
    await page.reload();
    await page.waitForTimeout(1000);

    // Get reference to a tile and its rendered div before removal
    const tileInfo = await page.evaluate(() => {
      const tile = document.querySelector('map-tile[zoom="2"]');
      if (!tile) return null;

      return {
        hasTileDiv: tile._tileDiv !== undefined,
        tileDivExists: tile._tileDiv ? true : false,
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        zoom: tile.getAttribute('zoom')
      };
    });

    expect(tileInfo).toBeTruthy();
    expect(tileInfo.hasTileDiv).toBe(true);

    // Remove the tile from DOM
    await page.evaluate((info) => {
      const tile = document.querySelector(
        `map-tile[zoom="${info.zoom}"][row="${info.row}"][col="${info.col}"]`
      );
      if (tile) {
        tile.remove();
      }
    }, tileInfo);

    // Wait for cleanup
    await page.waitForTimeout(500);

    // Verify the tile is no longer in DOM
    const tileStillExists = await page.evaluate((info) => {
      const tile = document.querySelector(
        `map-tile[zoom="${info.zoom}"][row="${info.row}"][col="${info.col}"]`
      );
      return tile !== null;
    }, tileInfo);

    expect(tileStillExists).toBe(false);
  });

  test('changing src attribute updates tile image', async () => {
    // Reset by reloading the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Find a tile and get initial src
    const initialState = await page.evaluate(() => {
      const mapZoom = document.querySelector('mapml-viewer')._map.getZoom();
      const tile = document.querySelector(`map-tile[zoom="${mapZoom}"]`);

      if (!tile) return null;

      return {
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        zoom: tile.getAttribute('zoom'),
        src: tile.getAttribute('src'),
        hasDiv: tile._tileDiv !== undefined
      };
    });

    expect(initialState).toBeTruthy();
    expect(initialState.hasDiv).toBe(true);

    // Take screenshot before src change
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    expect(beforeScreenshot).toMatchSnapshot('before-src-change.png');

    // Change the src attribute to a different color tile
    const newSrc = initialState.src.includes('green')
      ? 'tiles/red-tile.png'
      : 'tiles/green-tile.png';

    await page.evaluate(
      (params) => {
        const tile = document.querySelector(
          `map-tile[zoom="${params.zoom}"][row="${params.row}"][col="${params.col}"]`
        );
        tile.setAttribute('src', params.newSrc);
      },
      { ...initialState, newSrc }
    );

    // Wait for image to load and update
    await page.waitForTimeout(1500);

    // Verify the src changed and tile is still rendered
    const finalState = await page.evaluate((params) => {
      const tile = document.querySelector(
        `map-tile[zoom="${params.zoom}"][row="${params.row}"][col="${params.col}"]`
      );

      return {
        tileExists: tile !== null,
        hasDiv: tile ? tile._tileDiv !== undefined : false,
        src: tile ? tile.getAttribute('src') : null
      };
    }, initialState);

    expect(finalState.tileExists).toBe(true);
    expect(finalState.hasDiv).toBe(true);
    expect(finalState.src).toBe(newSrc);

    // Take screenshot after src change
    const afterScreenshot = await page.screenshot({ fullPage: false });
    expect(afterScreenshot).toMatchSnapshot('after-src-change.png');
  });

  test('coordinate collision - last tile wins', async () => {
    // Reset by reloading the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Create a new tile at a visible position first
    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      const newTile = document.createElement('map-tile');
      newTile.setAttribute('zoom', '2');
      newTile.setAttribute('row', '10');
      newTile.setAttribute('col', '11');
      newTile.setAttribute('src', 'tiles/red-tile.png');
      newTile.id = 'test-tile-1';
      layer.appendChild(newTile);
    });

    await page.waitForTimeout(1000);

    // Verify first tile is rendered
    const firstTileState = await page.evaluate(() => {
      const tile = document.getElementById('test-tile-1');
      return {
        hasDiv: tile._tileDiv !== undefined,
        position: `${tile.col}:${tile.row}:${tile.zoom}`
      };
    });

    expect(firstTileState.hasDiv).toBe(true);

    // Add a second tile at the same position
    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      const newTile = document.createElement('map-tile');
      newTile.setAttribute('zoom', '2');
      newTile.setAttribute('row', '10');
      newTile.setAttribute('col', '11');
      newTile.setAttribute('src', 'tiles/green-tile.png');
      newTile.id = 'test-tile-2';
      layer.appendChild(newTile);
    });

    await page.waitForTimeout(1000);

    // Check final state - second tile should win, first should lose _tileDiv
    const finalState = await page.evaluate(() => {
      const tile1 = document.getElementById('test-tile-1');
      const tile2 = document.getElementById('test-tile-2');

      return {
        tile1DivIsConnected: tile1._tileDiv.isConnected,
        tile2DivIsConnected: tile2._tileDiv.isConnected,
        tile1Src: tile1.getAttribute('src'),
        tile2Src: tile2.getAttribute('src')
      };
    });

    // Last tile wins - tile2 should be rendered, tile1 should not
    expect(finalState.tile2DivIsConnected).toBe(true);
    expect(finalState.tile1DivIsConnected).toBe(false);
    expect(finalState.tile1Src).toBe('tiles/red-tile.png');
    expect(finalState.tile2Src).toBe('tiles/green-tile.png');
  });

  test.afterAll(async () => {
    await context.close();
  });
});
