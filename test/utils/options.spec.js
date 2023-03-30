describe("M.Options Tests", () => {
  test("M.options.announceZoom default set", async () => {
    await expect(M.options.announceZoom).toEqual(false);
  });
});