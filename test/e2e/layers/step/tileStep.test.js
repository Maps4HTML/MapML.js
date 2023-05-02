import { test, expect, chromium } from '@playwright/test';

const request = require('./request');

test.describe('Templated tile layer with step', () => {
  request.test(
    'step/templatedTileLayerStep.html',
    0,
    12,
    0,
    4,
    'https://maps4html.org/TiledArt-Rousseau/TheBanksOfTheBi%C3%A8vreNearBic%C3%AAtre/',
    '0/0/0.png',
    '',
    '3/4/2.png',
    '',
    '4/6/6.png',
    6,
    '3/3/5.png',
    true
  );
});
