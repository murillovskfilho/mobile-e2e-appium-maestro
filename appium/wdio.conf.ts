import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const app = process.env.APP_PATH ?? path.resolve(root, '../apps/my-demo-app.apk')

export const APP_PACKAGE = 'com.saucelabs.mydemoapp.android'

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./test/specs/**/*.spec.ts'],
  // One emulator, one session at a time: parallel sessions on a single device fight over the UI.
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.DEVICE_NAME ?? 'Android Emulator',
      'appium:app': app,
      'appium:appPackage': APP_PACKAGE,
      'appium:appWaitActivity': '*.MainActivity',
      'appium:autoGrantPermissions': true,
      // Every spec file starts from a clean install state; tests inside a file reset through the app itself.
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:uiautomator2ServerInstallTimeout': 120_000,
      'appium:adbExecTimeout': 120_000,
      'appium:disableWindowAnimation': true,
    },
  ],

  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 15_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  services: [
    [
      'appium',
      {
        logPath: path.resolve(root, 'logs'),
        args: { relaxedSecurity: true },
        appiumStartTimeout: 90_000,
      },
    ],
  ],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180_000,
    // A retry hides flakiness unless it is reported, so retried tests are listed in the Allure report.
    retries: Number(process.env.MOCHA_RETRIES ?? 0),
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.resolve(root, 'allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        addConsoleLogs: true,
      },
    ],
  ],

  afterTest: async function (_test, _context, { passed }) {
    if (!passed) {
      await browser.takeScreenshot()
    }
  },
}
