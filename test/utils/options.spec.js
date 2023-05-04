describe('M.Options Tests', () => {
  test('M.options.announceMovement default set', async () => {
    await expect(M.options.announceMovement).toEqual(false);
  });
});
