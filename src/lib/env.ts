/**
 * Detect whether the code is running inside the Chrome extension context
 * (newtab.html served by chrome_url_overrides). We use `chrome.runtime.id`,
 * which is only present for extension pages and avoids false positives from
 * the regular `window.chrome` object that exists in normal Chrome tabs.
 */
export const isExtension =
  typeof window !== "undefined" &&
  typeof (window as unknown as { chrome?: { runtime?: { id?: string } } }).chrome !==
    "undefined" &&
  !!(window as unknown as { chrome?: { runtime?: { id?: string } } }).chrome?.runtime?.id;
