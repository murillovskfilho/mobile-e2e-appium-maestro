// Locator strategy, in order of preference:
//   1. resource-id     – stable, set by developers, independent of copy and language
//   2. accessibility id – content-desc; doubles as an accessibility check
//   3. UiSelector text  – only for data (product names) and copy we assert on
export const APP_PACKAGE = 'com.saucelabs.mydemoapp.android'

export const byId = (id: string) => `id=${APP_PACKAGE}:id/${id}`
export const byDesc = (description: string) => `~${description}`
export const byText = (text: string) => `android=new UiSelector().text("${text}")`
export const byTextContains = (text: string) => `android=new UiSelector().textContains("${text}")`

/** Scrolls the first scrollable container until an element with this exact text is in view. */
export const scrollToText = (text: string) =>
  `android=new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("${text}"))`

/** Scrolls the first scrollable container until an element with this resource-id is in view. */
export const scrollToId = (id: string) =>
  `android=new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().resourceId("${APP_PACKAGE}:id/${id}"))`
