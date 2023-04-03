import { test, expect, chromium } from '@playwright/test';

test.﻿describe("Announce movement test", ()=> {
    let page;
    let context;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
        page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
        await page.goto("map.html");
    });

    test.afterAll(async function () {
        await context.close();
    });

    test("Output values are correct during zoom in", async ()=>{
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        const movedUp = await page.$eval(
            "body > map div > output:nth-child(7)",
            (output) => output.innerHTML
        );
        expect(movedUp).toEqual("1.7 centimeters to 500 kilometers");

        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        const movedUpAgain = await page.$eval(
            "body > map div > output:nth-child(7)",
            (output) => output.innerHTML
        );
        expect(movedUpAgain).toEqual("1.7 centimeters to 300 kilometers");

    });

    test("Output values are correct during zoom out", async ()=>{
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        const movedUp = await page.$eval(
            "body > map div > output:nth-child(7)",
            (output) => output.innerHTML
        );
        expect(movedUp).toEqual("1.7 centimeters to 500 kilometers");

        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        const movedUpAgain = await page.$eval(
            "body > map div > output:nth-child(7)",
            (output) => output.innerHTML
        );
        expect(movedUpAgain).toEqual("2 centimeters to 1000 kilometers");

    });
});