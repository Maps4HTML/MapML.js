import { test, expect, chromium } from '@playwright/test';

const request = require('./request');

test.describe('Templated features layer with step', () => {
  request.test(
    'step/templatedFeaturesLayerStep.html',
    0,
    1,
    0,
    0,
    'http://localhost:30001/data/alabama_feature.mapml?',
    '-8030725.916518498-9758400.22013378111151604.1148082329423929.8111929520',
    '',
    '-437169.06273812056-2131770.3835407723531588.8747777491836987.55397510533',
    '',
    '',
    1,
    '-437169.06273812056-1766644.65328931063531588.8747777492202113.28422656663'
  );
});
