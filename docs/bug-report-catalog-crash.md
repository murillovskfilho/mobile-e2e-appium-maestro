# Bug report: tapping a product in the 2nd, or 7th and later, catalog position crashes the app

| Field | Value |
|---|---|
| **Component** | Catalog (product list) → product details navigation |
| **Severity** | Critical (S1): the app process dies |
| **Priority** | P1 for the app owner; accepted with a workaround in this suite (see below) |
| **Frequency** | Always: reproduced in 7 of 7 CI runs where the check executed |
| **Status** | Open, known. The app's own source marks it as intentional for demos |
| **Found by** | The Maestro and Appium suites in this repository, on CI, 2026-11-07 |
| **Pinned by** | [`appium/test/specs/known-defects.spec.ts`](../appium/test/specs/known-defects.spec.ts) |

## Summary

On the catalog screen, tapping the image of the product card in the **2nd position**, or in the **7th
position or later**, closes the app instead of opening the product details. The crash depends on the
card's **position in the list**, not on which product is in it: sorting the catalog moves the crash to
whatever product lands in those positions. Cards in positions 1 and 3 to 6 open normally.

The app is third-party (Sauce Labs *My Demo App*), so this report is written as I would file it to the
app's owners, plus how this suite lives with the defect until it is fixed.

## Environment

| | First observed (crash with stack trace) | Currently pinned (characterisation test) |
|---|---|---|
| App | My Demo App for Android **2.3.0** (`mda-2.3.0-27.apk`, SHA-256 `bd3a3d6f…6591ec8`, pinned in [`scripts/fetch-app.sh`](../scripts/fetch-app.sh)) | same |
| Device | Android Emulator, `pixel_6` profile, x86_64, 4 cores, 4 GB RAM, software GPU (`swiftshader_indirect`) | same |
| OS image | API 34, `google_apis` (Android 14) | API 31, `default` (Android 12, as reported by `getprop ro.build.version.release` in the CI log) |
| Emulator | 37.2.13 on a GitHub Actions `ubuntu-latest` runner | same |
| Tools | Maestro 2.12.1 | Appium 3.9.0, UiAutomator2 driver 8.7.3, WebdriverIO 10.2.0 |
| CI run | https://github.com/murillovskfilho/mobile-e2e-appium-maestro/actions/runs/42330159370 (commit `81b0f88`) | https://github.com/murillovskfilho/mobile-e2e-appium-maestro/actions/runs/42659965558 (commit `02d4176`) |

The crash was **not** reproduced on a physical device or a local emulator: no Android SDK was available
on my machine when writing this report. Everything below comes from CI logs, CI artifacts and the app's
public source code.

## Steps to reproduce

Preconditions: fresh install or cleared app data; the app opens on the catalog (*Products*) screen.
Login is not needed.

**A. 2nd position**

1. Launch the app. Leave the default sort order.
2. Tap the **image** of the second product card (top row, right). The title is not tappable in this
   app; only the image opens the product.

**B. 7th position or later**

1. Launch the app.
2. Scroll down until the 7th card (or any later one) is visible. In the first observed run this was
   *Sauce Labs Bolt T-Shirt*.
3. Tap its image.

## Expected result

The product details screen opens for the tapped product, showing its name, price and the *Add to cart*
button, as it does for the 1st card.

## Actual result

The app closes immediately and the device returns to the home screen. No error is shown to the user
(on CI, system crash dialogs are hidden on purpose by `scripts/ci-*.sh`, so I cannot say whether the
stock "app keeps stopping" dialog appears on a normal device). Any state that only lived in memory is
lost; the user has to relaunch the app.

## Evidence

**1. Logcat, from the Maestro flow *Removing the last item shows the empty cart state* (scenario B, 7th
card), run 42330159370.** Full excerpt saved from the CI artifact:
[`evidence/catalog-crash/logcat-fatal-exception.txt`](evidence/catalog-crash/logcat-fatal-exception.txt).

```text
11-07 02:47:48.641 E/AndroidRuntime( 8551): FATAL EXCEPTION: main
11-07 02:47:48.641 E/AndroidRuntime( 8551): Process: com.saucelabs.mydemoapp.android, PID: 8551
11-07 02:47:48.641 E/AndroidRuntime( 8551): java.lang.ArrayIndexOutOfBoundsException: length=6; index=6
11-07 02:47:48.641 E/AndroidRuntime( 8551):   at com.saucelabs.mydemoapp.android.view.fragments.ProductCatalogFragment.lambda$setAdapter$0$ProductCatalogFragment(ProductCatalogFragment.java:156)
11-07 02:47:48.641 E/AndroidRuntime( 8551):   at com.saucelabs.mydemoapp.android.view.fragments.ProductCatalogFragment$$ExternalSyntheticLambda0.OnClick(Unknown Source:4)
11-07 02:47:48.641 E/AndroidRuntime( 8551):   at com.saucelabs.mydemoapp.android.view.adapters.ProductsAdapter$1.onClick(ProductsAdapter.java:57)
11-07 02:47:48.641 E/AndroidRuntime( 8551):   at android.view.View.performClick(View.java:7659)
...
11-07 02:47:49.633 W/ActivityTaskManager(  527):   Force finishing activity com.saucelabs.mydemoapp.android/.view.activities.MainActivity
11-07 02:47:49.655 I/ActivityManager(  527): Process com.saucelabs.mydemoapp.android (pid 8551) has died: fg  TOP
```

**2. Maestro result for the same flow.** After the tap, the next step failed with
`Assertion is false: "Sauce Labs Bolt T-Shirt", id: (.*:id/)?productTV is visible`, and the screenshot
Maestro took at that step shows the launcher, not the app:
[`evidence/catalog-crash/after-tap-home-screen.png`](evidence/catalog-crash/after-tap-home-screen.png).

**3. Characterisation test results (scenario A, 2nd card).** In every CI run where
`known-defects.spec.ts` executed, *"@known-defect tapping the 2nd product in the catalog crashes the
app"* passed, which means the app left the foreground within 15 s of the tap; the control test
*"tapping the 1st product does not crash"* passed in the same runs:

| CI run | Commit | Result |
|---|---|---|
| 42331282572 | `fb16400` | crash reproduced |
| 42332427730 | `9bc3621` | crash reproduced |
| 42334762270 | `9ccca9d` | crash reproduced |
| 42336504334 | `4f03d29` | crash reproduced |
| 42337532394 | `02d4176` | crash reproduced |
| 42368016483 | `02d4176` | crash reproduced |
| 42659965558 | `02d4176` | crash reproduced |

The first three runs used the API 34 `google_apis` image; from `4f03d29` on, CI uses API 31 `default`.
The crash reproduced on both.

Not counted: run 42333615421, where the test never reached the tap (the app was left on a blank window
at cold start, a separate CI issue later fixed in `9ccca9d`), and run 42337289410, where the Appium job
did not get to the tests.

Limitation: for scenario A the Appium job does not keep logcat, so there is no stack trace for the 2nd
position in the artifacts. The exception type for that case below is inferred from the source.

## Probable cause (hypothesis: third-party code, not verified by debugging)

The app's public source at tag `2.3.0`,
https://github.com/saucelabs/my-demo-app-android/blob/2.3.0/app/src/main/java/com/saucelabs/mydemoapp/android/view/fragments/ProductCatalogFragment.java,
builds a fixed 6-entry array and indexes it with the tapped card's adapter position:

```java
final Integer[] meta = new Integer[] {
        0, null, 2, 3, 4, 5 // null is an intentionally introduced bug for demos
};
...
bundle.putString("meta", "" + meta[position].intValue());   // line 156
```

- **Position 1 (2nd card):** `meta[1]` is `null`, so `.intValue()` should throw a
  `NullPointerException`. *Inferred; no logcat captured for this case.*
- **Position 6 or more (7th card onwards):** the array has only 6 entries, so `meta[6]` throws
  `ArrayIndexOutOfBoundsException: length=6; index=6`. *Confirmed:* the logcat above points to exactly
  this line, 156.

This also explains why the crash follows the position and not the product. The comment in the source
says the `null` is deliberate for demos; the out-of-bounds case for long lists looks like a side effect
of the same hard-coded array. Suggested fix for the owners: drop `meta`, or derive it from the product
instead of the position, and never index a fixed-size array with an adapter position.

## Severity and priority

- **Severity: Critical (S1).** The process dies on one of the most common actions in a shopping app,
  opening a product, with no error message and no recovery other than relaunching. The 2nd card, right
  next to the first one, and every card from the 7th on are affected, so a normal user hits it within
  the first few taps.
- **Priority: P1 for the app owner** if this were a production app: it blocks the browse → product →
  cart path for most of the catalog. **In this project it is accepted:** the app is a third-party demo,
  the bug is intentional, and I cannot fix it. What I can do is keep the suite reliable around it and
  notice when it changes, which is what the next two sections cover.

## Workaround used by the suite

Every test that needs a product page sorts the catalog first so that the product lands in the **1st
card**, checks that it did, and only then taps it:

| Product | Sort used | Where |
|---|---|---|
| Sauce Labs Backpack | Ascending order by name | `PRODUCTS.backpack.firstWhenSortedBy` |
| Sauce Labs Onesie | Ascending order by price | `PRODUCTS.onesie.firstWhenSortedBy` |

- Appium: `CatalogScreen.openProduct()` in [`appium/src/screens/CatalogScreen.ts`](../appium/src/screens/CatalogScreen.ts),
  with the products in [`appium/src/data/catalog.ts`](../appium/src/data/catalog.ts). It throws a clear
  error if the expected product is not first after sorting, so a changed catalog fails loudly instead of
  tapping a crashing card.
- Maestro: [`maestro/subflows/add_to_cart.yaml`](../maestro/subflows/add_to_cart.yaml) takes a `SORT`
  parameter, asserts the product is at index 0, then taps it;
  [`maestro/flows/catalog/open_product.yaml`](../maestro/flows/catalog/open_product.yaml) does the same.

Trade-off: the suite no longer covers opening products in other positions. That gap is deliberate and
is documented by the characterisation test.

## How the suite will flag the fix

[`known-defects.spec.ts`](../appium/test/specs/known-defects.spec.ts) asserts the **current, wrong**
behaviour on purpose:

1. *"@known-defect tapping the 2nd product in the catalog crashes the app"*: taps the 2nd card and waits
   up to 15 s for `mobile: queryAppState` to stop reporting *running in foreground* (state 4). While the
   bug exists, the test passes.
2. *"tapping the 1st product does not crash"*: the control. It guards the workaround that every other
   test relies on.

When a new app build fixes the crash, test 1 **fails** with the message *"The app is still running: the
known crash may be fixed. Turn this into a normal test."* That failure is the signal to:

- turn test 1 into a normal test that expects the product page for the 2nd card, and add one for the
  7th card;
- remove the sort-first workaround from `CatalogScreen.openProduct` and the Maestro subflows, so the
  suite covers every position again;
- close this report.

Because the app version is pinned with a checksum, this can only happen when someone deliberately bumps
the version in `scripts/fetch-app.sh`; the failure then shows up in that same pull request.
