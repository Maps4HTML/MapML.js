describe("Scroll test", ()=> {
    beforeAll(async () => {
        await page.goto(PATH + "mapml-viewer.html");
    });

    afterAll(async function () {
        await context.close();
    });

    test("Scrolling the map does not scroll the document", async ()=>{
        //Force the windows scroll bar to appear
        await page.$eval("body > textarea",
            (textarea) => textarea.setAttribute("cols", 200)
        );
        await page.waitForTimeout(1000);
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(1000);

        const scrollX = await page.evaluate('window.scrollX');
        expect(scrollX).toEqual(0);
    });
});