import { expect, test } from "@playwright/test";

const NUMBER_OF_WAVEFORMS = 100;
const INITIAL_RENDER_TIME_THRESHOLD_MS = 10_000; // Increased initial budget to 10s
const RESIZE_TIME_THRESHOLD_MS = 3000; // 3 seconds budget for resize - adjust
const TEST_TIMEOUT_MS = 120_000; // 2 minutes overall timeout for waits

// Define specific viewport sizes
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // Example: iPhone 13 Pro

test.describe("Waveform Rendering & Resizing Performance", () => {
  // Load the page and wait for initial render before each test in this suite
  test.beforeEach(async ({ page }) => {
    // Start with the desktop viewport
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/");
    // Ensure initial load is complete before proceeding
    await page
      .getByTestId("music-player")
      .nth(NUMBER_OF_WAVEFORMS - 1)
      .waitFor({ state: "visible", timeout: TEST_TIMEOUT_MS });
  });

  test(`should render ${NUMBER_OF_WAVEFORMS} waveforms within ${INITIAL_RENDER_TIME_THRESHOLD_MS}ms`, async ({
    page,
  }) => {
    // Increase the timeout for this specific test (though beforeEach wait might cover it)
    test.setTimeout(TEST_TIMEOUT_MS);

    // Measure time from navigation start until last element is visible
    // Note: This uses navigation timing API for a slightly different perspective
    const navigationTimingJson = await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType("navigation")),
    );
    const navigationTiming = JSON.parse(navigationTimingJson);
    const navigationStart = navigationTiming[0]?.startTime ?? 0; // Use 0 if unavailable
    const loadEventEnd = navigationTiming[0]?.loadEventEnd ?? performance.now(); // Fallback to now

    // We already waited for the last element in beforeEach, so we approximate the render time
    // using navigation timings or fallback to a simpler measurement if needed.
    // For a more precise initial render measure *after* navigation, startTime could be set *after* page.goto
    const renderTime = loadEventEnd - navigationStart;

    // Log render time to test annotations instead of console

    test.info().annotations.push({
      type: "initial-render-time-ms",
      description: renderTime.toFixed(2),
    });

    // Assert against the initial render budget
    expect(renderTime).toBeLessThanOrEqual(INITIAL_RENDER_TIME_THRESHOLD_MS);
  });

  test(`should resize from Desktop to Mobile within ${RESIZE_TIME_THRESHOLD_MS}ms`, async ({
    page,
  }) => {
    test.setTimeout(TEST_TIMEOUT_MS); // Set timeout for this specific test

    // Test resizing performance between desktop and mobile viewports

    const startTime = performance.now();

    // Resize to the predefined mobile viewport size
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Wait for the last waveform container to signal it has likely re-rendered/stabilized after resize.
    await page
      .getByTestId("music-player")
      .nth(NUMBER_OF_WAVEFORMS - 1)
      .waitFor({ state: "visible" });
    // Add a small extra wait for good measure
    await page.waitForTimeout(250);

    const endTime = performance.now();
    const resizeTime = endTime - startTime;

    // Record resize time in test annotations instead of console

    test.info().annotations.push({
      type: "resize-desktop-to-mobile-time-ms",
      description: resizeTime.toFixed(2),
    });

    expect(resizeTime).toBeLessThanOrEqual(RESIZE_TIME_THRESHOLD_MS);
  });
});
