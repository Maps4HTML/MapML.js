import { test, expect, chromium } from '@playwright/test';

test.﻿describe("Announce movement test", ()=> {
    let page;
    let context;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
        page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
        await page.goto("mapml-viewer.html");
    });

    test.afterAll(async function () {
        await context.close();
    });

    test("Output values are correct during regular movement", async ()=>{
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowUp");
        await page.waitForTimeout(1000);

        const movedUp = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(movedUp).toEqual("zoom level 0 column 3 row 3");

        for(let i = 0; i < 2; i++){
            await page.keyboard.press("ArrowLeft");
            await page.waitForTimeout(1000);
        }

        const movedLeft = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(movedLeft).toEqual("zoom level 0 column 2 row 3");

        await page.keyboard.press("Equal");
        await page.waitForTimeout(1000);

        const zoomedIn = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(zoomedIn).toEqual("zoom level 1 column 4 row 6");
    });

    test("Output values are correct at bounds and bounces back", async ()=>{
        //Zoom out to min layer bound
        await page.keyboard.press("Minus");
        await page.waitForTimeout(1000);

        const minZoom = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(minZoom).toEqual("At minimum zoom level, zoom out disabled zoom level 0 column 2 row 3");

        //Pan out of west bounds, expect the map to bounce back
        for(let i = 0; i < 4; i++){
            await page.waitForTimeout(1000);
            await page.keyboard.press("ArrowLeft");
        }

        const westBound = await page.waitForFunction(() =>
            document.querySelector("body > mapml-viewer").shadowRoot.querySelector("div > output").innerHTML === "Reached west bound, panning west disabled",
            {}, {timeout: 1000}
        );
        expect(await westBound.jsonValue()).toEqual(true);

        await page.waitForTimeout(1000);
        const bouncedBack = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(bouncedBack).toEqual("zoom level 0 column 1 row 3");

        //Zoom in out of bounds, expect the map to zoom back
        await page.keyboard.press("Equal");

        const zoomedOutOfBounds = await page.waitForFunction(() =>
            document.querySelector("body > mapml-viewer").shadowRoot.querySelector("div > output").innerHTML === "Zoomed out of bounds, returning to",
            {}, {timeout: 1000}
        );
        expect(await zoomedOutOfBounds.jsonValue()).toEqual(true);

        await page.waitForTimeout(1000);
        const zoomedBack = await page.$eval(
            "body > mapml-viewer div > output",
            (output) => output.innerHTML
        );
        expect(zoomedBack).toEqual("zoom level 0 column 1 row 3");

    });
});