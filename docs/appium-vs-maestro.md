# Appium or Maestro?

This repository tests the same app, with the same scenarios, in both tools. These are the trade-offs that showed up while writing them, and how I'd choose between the two on a real team.

## Side by side

| | Appium (WebdriverIO, TypeScript) | Maestro |
|---|---|---|
| Test format | Code: page objects, helpers, any npm library | YAML flows, with JavaScript for logic |
| Who can write tests | Engineers comfortable with code | Anyone on the team, including manual QA and product |
| Waiting and flakiness | Explicit waits (`waitForDisplayed`, `waitUntil`) that you design | Built-in: every step waits for the UI to settle |
| Locators | resource-id, accessibility id, UiSelector, XPath | text, accessibility text, id (regex) |
| Device control | Full: app state, background, rotation, permissions, files, network, logs | What the flow commands expose |
| Assertions | Any logic (sorting over a list, cents arithmetic, cross-screen checks) | `assertVisible`, `assertTrue` with JS expressions |
| Setup | Node, Appium server, driver, capabilities | One binary |
| Speed to first test | Slower: framework and page objects first | Minutes |
| Reports | Allure (steps, screenshots, history) | JUnit, screenshots, recordings |
| Cross-platform | Android and iOS (XCUITest), plus hybrid and web views | Android and iOS, Flutter, React Native, web |

## What each suite here does that the other doesn't

**Only in Appium**

- **App lifecycle**: background the app and check the cart and screen survive; rotate and check the portrait lock (`app-lifecycle.spec.ts`).
- **Assertions over a whole list**: every visible product must be in order after a sort, not just the first one.
- **Disabled state**: `Add to cart` is disabled at quantity zero, read from the element's `enabled` attribute.
- **Fast reset without reinstall**: `mobile: clearApp` plus `activateApp` between tests.

**Only in Maestro**

- **Readable by anyone**: `guest_checkout.yaml` reads like the manual test case it replaces.
- **No explicit waits anywhere**: not one sleep or wait in the flows.
- **Parameterised subflows**: `add_to_cart.yaml` takes `PRODUCT` and `QUANTITY`, the YAML equivalent of a page-object method.

## How I'd split them on a team

- **Maestro for the smoke and happy paths**: quick to write, easy to review, and the people closest to the product can own them.
- **Appium for what needs code**: device and lifecycle behaviour, data-heavy assertions, integrations with other tooling, and anything that has to run inside a larger TypeScript test platform.
- Both run in the same pipeline against the same build, so one doesn't drift from the other.
