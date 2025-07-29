import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  testDir: './test/e2e',
  webServer: {
      command: 'node test/server.js',
//      port: 30001,  // this causes a 2 min pause on my machine as of Sept 2025
//      url: 'http://localhost:30001/', //also causes a 2 min pause
      timeout: 10000,
      reuseExistingServer: true
  },
  use: {
      headless: true,
      browserName: 'chromium',
      baseURL: 'http://localhost:30001/',
      ignoreHTTPSErrors: true
  }
});
