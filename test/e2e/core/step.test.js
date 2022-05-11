describe("Input step test", ()=> {
    beforeAll(async () => {
        await page.goto(PATH + "tms.html");
    });

    afterAll(async function () {
        await context.close();
    });

    test("Step = 1, Zooming to zoom level 1", async ()=>{
        let requests = 0;
        page.on('request', request => {requests += 1});
        await page.keyboard.press("Tab");
        await page.waitForTimeout(1000);
        await page.keyboard.press("Equal");
        await page.waitForTimeout(1000);
        await expect(requests).toEqual(4);
    });

    test("Step = 1, Zooming to zoom level 2", async ()=>{
        let requests = 0;
        page.on('request', request => {requests += 1});
        await page.keyboard.press("Equal");
        await page.waitForTimeout(1000);
        await expect(requests).toEqual(9);
    });

    test("Step = 3, Zooming to zoom level 4", async ()=>{
        await page.goto(PATH + "step.html")
        let requests = 0;
        page.on('request', request => {requests += 1});
        await page.keyboard.press("Tab");
        await page.waitForTimeout(1000);

        for(let i = 0; i < 4; i++){
            await page.keyboard.press("Equal");
            await page.waitForTimeout(1000);
        }

        await expect(requests).toEqual(12);
    });

    test("Step = 3, Zooming out of max native zoom", async ()=>{
        let requests = 0;
        page.on('request', request => {requests += 1});
        await page.keyboard.press("Equal");
        await page.waitForTimeout(1000);
        await expect(requests).toEqual(4);
    });

    test("Step = 3, Zooming outside of max native zoom", async ()=>{
        let requests = 0;
        page.on('request', request => {requests += 1});
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Equal");
            await page.waitForTimeout(1000);
        }
        await expect(requests).toEqual(0);
    });
});