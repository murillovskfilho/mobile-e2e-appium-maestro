# mobile-e2e-appium-maestro

[![mobile-e2e](https://github.com/murillovskfilho/mobile-e2e-appium-maestro/actions/workflows/mobile-e2e.yml/badge.svg)](https://github.com/murillovskfilho/mobile-e2e-appium-maestro/actions/workflows/mobile-e2e.yml)

End-to-end tests for an Android shopping app written **twice, with the same scenarios**: once in
**Appium** (WebdriverIO + TypeScript) and once in **Maestro** (YAML flows). Both suites run on every
push in GitHub Actions, each on its own Android emulator, and publish their reports to GitHub Pages.

**Reports:** https://murillovskfilho.github.io/mobile-e2e-appium-maestro/

The app under test is Sauce Labs' [My Demo App](https://github.com/saucelabs/my-demo-app-android)
for Android, a public demo app built for test automation. CI downloads a pinned release and checks its
SHA-256, so every run tests exactly the same build. The APK is never committed.

## What is covered

| Area | Scenario | Appium | Maestro |
|---|---|:-:|:-:|
| Login | Standard user logs in and the menu switches to *Log Out* | ✅ | ✅ |
| | Locked-out user is refused with a clear message | ✅ | ✅ |
| | Empty username and empty password are reported on the right field | ✅ | ✅ |
| Catalog | Products are listed with a name and a price | ✅ | |
| | Sort by name, A–Z and Z–A | ✅ | ✅ |
| | Sort by price, low–high and high–low | ✅ | ✅ |
| | A product opens with the name and price it had in the list | ✅ | ✅ |
| Cart | Adding a product updates the cart badge | ✅ | ✅ |
| | Quantity zero disables *Add to cart*; quantity never goes negative | ✅ | |
| | Several products and quantities total correctly, in cents | ✅ | ✅ |
| | Changing a quantity in the cart updates total and badge | ✅ | |
| | Removing the last item shows the empty state | ✅ | ✅ |
| Checkout | Guest is sent to login, then completes the order end to end | ✅ | ✅ |
| | Review total is the cart plus the $5.99 delivery | ✅ | ✅ |
| | Shipping step refuses to continue with required fields empty | ✅ | ✅ |
| Lifecycle | Cart and screen survive the app going to the background | ✅ | |
| | Portrait lock holds when the device rotates | ✅ | |

Why some scenarios exist in only one suite, and how I'd split the two tools on a team:
[docs/appium-vs-maestro.md](docs/appium-vs-maestro.md).

## Design decisions

- **Same scenarios, two tools.** It makes the comparison honest: the trade-offs in the docs come from
  writing the same tests both ways, not from feature lists.
- **Every test starts from a clean app.** Appium clears the app's data and relaunches it
  (`mobile: clearApp` + `activateApp`), which is faster than a new session; Maestro uses
  `launchApp: clearState`. No test depends on another test's cart or login.
- **Locators by contract, not by layout.** resource-id first, then accessibility id (which doubles as an
  accessibility check), then visible text for data. The only XPath is the cart row, which has no id of
  its own, and it is explained where it is used.
- **Money in cents.** Expected totals are computed as integers (`totalOf` in TypeScript,
  `expected_total.js` in Maestro), so 3 × $29.99 is $89.97 and never $89.97000000000001.
- **Checked against the source.** Expected messages, prices and rules (quantity can reach zero, the flat
  delivery fee) were taken from the app's source code, not guessed from screenshots.
- **Reproducible environment.** Pinned app version and checksum, pinned Appium, driver and Maestro
  versions, and a cached emulator snapshot (API 31, Pixel 6 profile).

## Run it locally

Requirements: Android SDK with an emulator (API 30+) or a device connected over `adb`, Node 22.19+,
Java 17+.

```bash
bash scripts/fetch-app.sh          # downloads and verifies the APK into apps/
```

Appium:

```bash
cd appium
npm ci
npm test                           # all specs
npm run test:smoke                 # only tests tagged @smoke
npm run report                     # Allure report in appium/allure-report
```

Maestro ([install](https://docs.maestro.dev/getting-started/installing-maestro)):

```bash
adb install -r -g apps/my-demo-app.apk
maestro test maestro                         # all flows
maestro test maestro --include-tags smoke    # smoke only
```

## Project layout

```
appium/
  wdio.conf.ts           capabilities, Appium service, Allure, screenshot on failure
  src/screens/           page objects (one per screen, plus the shared header)
  src/data/              products, users, money helpers
  src/support/           locator helpers, app lifecycle helpers
  test/specs/            login, catalog, cart, checkout, app lifecycle
maestro/
  config.yaml            which flows run
  flows/                 login, catalog, cart, checkout
  subflows/              reusable steps: fresh launch, login, add to cart, checkout
  scripts/               JavaScript used by flows (expected totals)
scripts/                 app download, CI entry points, JUnit summary
.github/workflows/       two emulator jobs and a Pages publish job
```

## License

MIT. The app under test belongs to Sauce Labs and is downloaded from its public releases at run time.
