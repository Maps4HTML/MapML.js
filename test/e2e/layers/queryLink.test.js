const playwright = require("playwright");

jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright Query Link Tests in " + browserType,
      () => {
        beforeAll(async () => {
          browser = await playwright[browserType].launch({
            headless: ISHEADLESS,
            slowMo: 50,
          });
          context = await browser.newContext();
          page = await context.newPage();
          if (browserType === "firefox") {
            await page.waitForNavigation();
          }
          await page.goto(PATH + "queryLink.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        describe("Query Popup Tests in " + browserType, () => {

          test("[" + browserType + "]" + " Query link shows when within bounds", async () => {
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNum).toEqual(1);
          });

          test("[" + browserType + "]" + " Query link closes previous popup when new query made within bounds", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(9, -27, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNum).toEqual(1);
          });

          test("[" + browserType + "]" + " Query link does not show when out of bounds", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.078210, -9.010487, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div", { state: "hidden" });
            const popupNumRight = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-45.679787, -93.041053, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumBottom = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.399782, 177.152220, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumLeft = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-32.240953, 94.969783, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumTop = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            expect(popupNumRight).toEqual(0);
            expect(popupNumBottom).toEqual(0);
            expect(popupNumLeft).toEqual(0);
            expect(popupNumTop).toEqual(0);
          });
        });
        describe("Queried Feature Tests in " + browserType, () => {
          test("[" + browserType + "]" + " First feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > a");
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M259 279L263 279L267 287L267 291L260 292L260 294L258 294L257 280z");
            expect(popup).toEqual("Alabama");
          });

          test("[" + browserType + "]" + " Next feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > div > a:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M183 204L183 205zM183 203L183 204zM183 200L183 200zM182 200L182 205L180 203L182 200zM181 201L181 202zM183 198L183 200L183 198zM182 199L181 199zM181 199L181 195L181 198zM184 194L183 197L184 194zM181 195L181 196zM182 193L182 196L182 193zM174 178L172 178L174 178zM174 177L173 178L174 177zM194 159L198 164L180 184L183 186L182 189L186 191L186 204L184 206L183 201L185 192L183 194L183 192L181 192L181 186L176 181L176 177L175 176L173 178L168 175L172 173L173 174L173 172L166 172L166 174L157 173L148 167L147 168L145 165L156 171L161 170L162 169L159 164L161 162L159 160L160 157L162 157L163 154L168 155L170 158L172 157L173 156L170 153L170 151L173 148L177 154L177 152L179 152L178 151L180 146L192 150L191 151L194 158zM164 176L165 175L165 177L164 176zM162 175L164 177L163 178L160 177L162 175zM159 176L159 176zM157 176L156 176zM151 171L151 171zM151 170L150 171L151 170zM149 168L148 168zM170 156L170 156zM147 168L147 169zM144 165L144 164zM144 164L144 164zM159 156L158 157L158 155L159 156zM143 164L140 163L143 164zM139 161L141 162L139 161zM138 160L137 159zM149 154L149 154zM137 158L136 158zM165 146L165 150L164 146zM135 156L134 156zM133 154L134 155L133 154zM133 153L132 152L133 153zM131 150L131 149zM131 148L130 148zM130 147L130 147zM130 131L130 128z");
            expect(popup).toEqual("Alaska");
          });

          test("[" + browserType + "]" + " Previous feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > div > a:nth-child(2)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M259 279L263 279L267 287L267 291L260 292L260 294L258 294L257 280z");
            expect(popup).toEqual("Alabama");
          });
        });
      });
  };
})();
