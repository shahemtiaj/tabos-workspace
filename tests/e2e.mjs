// Loads the built extension in Chrome and checks the main flows.
// Needs Playwright (npm i -D playwright). Weather and favicon requests are
// answered locally, so no network is needed.
//   node tests/e2e.mjs [path/to/chrome]
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ext = join(dirname(fileURLToPath(import.meta.url)), "..", "extension");
const shots = process.env.SHOTS || null;
const profile = mkdtempSync(join(tmpdir(), "tabos-e2e-"));
const ctx = await chromium.launchPersistentContext(profile, {
  headless: false,
  executablePath: process.argv[2] || process.env.CHROME_PATH || undefined,
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
  args: ["--headless=new", "--no-sandbox", `--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});

// ---- fake network ----
const calls = [];
await ctx.route(/open-meteo\.com|geojs\.io|google\.com\/s2\/favicons|example\.(com|org)/, (route) => {
  const url = route.request().url();
  calls.push(url);
  if (url.includes("geocoding-api"))
    return route.fulfill({ json: { results: [{ name: "Habiganj", latitude: 24.38, longitude: 91.41, admin1: "Sylhet", country: "Bangladesh" }] } });
  if (url.includes("api.open-meteo"))
    return route.fulfill({
      json: {
        current: { temperature_2m: 27.4, apparent_temperature: 30.1, weather_code: 81, is_day: 1 },
        daily: { temperature_2m_max: [31.2], temperature_2m_min: [22.8] },
      },
    });
  if (url.includes("geojs")) return route.fulfill({ json: { latitude: "23.81", longitude: "90.41", city: "Dhaka" } });
  if (url.includes("favicons")) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({ contentType: "text/html", body: "<title>site</title>ok" });
});

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(["ok", name]);
  } catch (e) {
    results.push(["FAIL", name, e.message.split("\n").slice(0, 3).join(" | ")]);
  }
};

// extension id
let [sw] = ctx.serviceWorkers();
const idPage = await ctx.newPage();
await idPage.goto("chrome://extensions");
await idPage.waitForTimeout(500);
const extId = await idPage.evaluate(
  () => new Promise((r) => chrome.management.getAll((l) => r(l.find((e) => e.name.startsWith("TabOS")).id))),
);
await idPage.close();
const NEWTAB = `chrome-extension://${extId}/newtab.html`;

const errors = [];
const open = async () => {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await p.goto(NEWTAB);
  await p.waitForSelector("text=Bookmarks", { timeout: 15000 }).catch(() => {});
  return p;
};
const store = (p, key) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), key);

const page = await open();

await check("first run: setup appears, and nothing goes online before you choose", async () => {
  await page.waitForSelector("text=Welcome to TabOS");
  assert.equal(calls.filter((u) => /open-meteo|geojs/.test(u)).length, 0, calls.join(" "));
  assert.ok(!(await page.isVisible("text=Design TabOS dashboard")), "no demo tasks");
});

await check("first run: name, city search, workspace", async () => {
  await page.fill('input[placeholder="Your name"]', "Shah");
  await page.click("text=Next");
  await page.fill('input[placeholder="Search your city…"]', "Habig");
  await page.click("text=Habiganj");
  await page.waitForSelector("text=Weather set to Habiganj");
  await page.click("text=Next");
  await page.click('[role=dialog] button:has-text("Development")');
  if (shots) await page.screenshot({ path: join(shots, "onboarding.png") });
  await page.click("text=Start using TabOS");
  await page.waitForSelector("text=Welcome to TabOS", { state: "detached" });
  assert.match(await page.textContent("h1"), /, Shah$/);
  assert.equal((await store(page, "tabos-workspaces")).state.activeId, "dev");
});

await check("weather: the chosen city, correct label, high / low", async () => {
  await page.waitForSelector("text=Rain showers");
  const box = await page.locator("text=Rain showers").locator("xpath=ancestor::div[contains(@class,'glass')][1]").innerText();
  assert.match(box, /27°/);
  assert.match(box, /H 31° · L 23°/);
  assert.match(box, /Habiganj/);
  assert.ok(!calls.some((u) => u.includes("geojs")), "no IP lookup when a city was chosen");
});

await check("weather: cached — opening more tabs does not call the weather service again", async () => {
  const before = calls.filter((u) => u.includes("api.open-meteo")).length;
  const p2 = await open();
  await p2.waitForSelector("text=Rain showers");
  await p2.reload();
  await p2.waitForSelector("text=Rain showers");
  await p2.close();
  assert.equal(calls.filter((u) => u.includes("api.open-meteo")).length, before);
});

await check("bookmarks: blank site icons fall back to a letter; add, edit, reorder", async () => {
  await page.click('button[aria-label="Add bookmark"]');
  await page.fill('input[placeholder="Web address (example.com)"]', "javascript:alert(1)");
  await page.click('button:has-text("Add bookmark")');
  await page.waitForSelector("text=Enter a web address");
  await page.fill('input[placeholder="Web address (example.com)"]', "example.com");
  await page.click('button:has-text("Add bookmark")');
  await page.waitForSelector('a[title="https://example.com/"]');
  const tile = page.locator('a[title="https://example.com/"]');
  assert.equal((await tile.innerText()).trim().split("\n")[0], "E", "letter icon shown");
  await tile.hover();
  await page.click('button[aria-label="Edit example.com"]');
  await page.fill('input[placeholder="Name (optional)"]', "Example");
  await page.click('button:has-text("Save")');
  await page.waitForSelector('a[title="https://example.com/"] >> text=Example');
  const titles = async () => (await store(page, "tabos-workspaces")).state.workspaces.find((w) => w.id === "dev").bookmarks.map((b) => b.title);
  const before = await titles();
  await page.evaluate(() => { window.__ev = []; for (const t of ["dragstart", "dragover", "drop", "dragend"]) document.addEventListener(t, (e) => window.__ev.push(t + ":" + (e.target.closest?.("a")?.title || e.target.nodeName)), true); });
  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('a[title="https://example.com/"]').hover();
  await page.mouse.down();
  const target = await page.locator('a[title="https://npmjs.com"]').boundingBox();
  await page.mouse.move(target.x + 20, target.y + 20, { steps: 8 });
  await page.mouse.move(target.x + 30, target.y + 30, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const after = await titles();
  await page.setViewportSize({ width: 1440, height: 900 });
  assert.equal(after.indexOf("Example"), before.indexOf("npm"), `order ${after.join(",")} ev ${[...new Set(await page.evaluate(() => window.__ev))].join(" ")}`);
  assert.equal(after.length, before.length);
});

await check("recent widget: shows what you opened, not a copy of your bookmarks", async () => {
  assert.ok(await page.isVisible("text=Bookmarks you open from TabOS will show up here"));
  await page.click('a[title="https://example.com/"]');
  await page.waitForURL(/example\.com/);
  await page.goBack();
  await page.waitForSelector("text=Recently opened");
  const usage = (await store(page, "tabos-workspaces")).state.usage;
  assert.equal(usage["https://example.com/"].count, 1);
  assert.ok(await page.isVisible("text=Recently opened >> xpath=ancestor::div[contains(@class,'glass')][1] >> text=Example"));
});

await check("open tabs stay in step: a todo added in one tab isn't lost by another", async () => {
  const other = await open();
  await page.fill('input[placeholder="Add a task…"]', "Task from tab A");
  await page.keyboard.press("Enter");
  await other.waitForSelector("text=Task from tab A", { timeout: 3000 });
  await other.fill('input[placeholder="Add a task…"]', "Task from tab B");
  await other.keyboard.press("Enter");
  await page.waitForSelector("text=Task from tab B", { timeout: 3000 });
  const todos = (await store(page, "tabos-todos")).state.todos.map((t) => t.title);
  assert.deepEqual(todos.sort(), ["Task from tab A", "Task from tab B"]);
  await other.close();
});

await check("focus timer: chime, break after focus, session counted", async () => {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.clock.install();
  await p.goto(NEWTAB);
  await p.waitForSelector('button[aria-label="Start"]');
  await p.click('button[aria-label="Start"]');
  await p.clock.runFor(5 * 60_000);
  assert.match(await p.title(), /^20:00 · Focus/);
  await p.clock.runFor(20 * 60_000 + 1000);
  await p.waitForFunction(() => document.title.includes("Break"), null, { timeout: 5000 });
  assert.equal((await store(p, "tabos-focus")).state.phase, "break");
  assert.ok(await p.isVisible("text=1 done today"));
  await p.clock.runFor(5 * 60_000 + 1000);
  await p.waitForSelector('button[aria-label="Start"]');
  const f = (await store(p, "tabos-focus")).state;
  assert.equal(f.phase, "focus");
  assert.equal(f.sessions, 1);
  await p.close();
});

await check("focus timer keeps running after the tab is reloaded or closed", async () => {
  const p = await open();
  await p.click('button[aria-label="Start"]');
  await p.waitForTimeout(1500);
  await p.reload();
  await p.waitForSelector('button[aria-label="Pause"]');
  assert.match(await p.title(), /^24:5\d · Focus/);
  await p.close();
  const q = await open();
  await q.waitForSelector('button[aria-label="Pause"]');
  await q.click('button[aria-label="Reset"]');
  await q.close();
});

await check("workspace delete asks first and can be undone", async () => {
  await page.keyboard.press("Escape");
  await page.click('button[aria-label="Open settings"]');
  await page.click('button[aria-label="Delete Study"]');
  assert.ok((await store(page, "tabos-workspaces")).state.workspaces.some((w) => w.id === "study"), "not deleted on first click");
  await page.click('button[aria-label="Confirm delete Study"]');
  await page.waitForSelector('text=Deleted "Study"');
  assert.ok(!(await store(page, "tabos-workspaces")).state.workspaces.some((w) => w.id === "study"));
  await page.click('button:has-text("Undo")');
  await page.waitForTimeout(200);
  const ids = (await store(page, "tabos-workspaces")).state.workspaces.map((w) => w.id);
  assert.ok(ids.includes("study"));
  assert.equal(ids.indexOf("study"), 5, "back in its place");
});

await check("backup: download, erase, restore", async () => {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=Download backup")]);
  const path = await dl.path();
  const backup = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(backup.app, "tabos");
  assert.ok(backup.data["tabos-todos"]);
  assert.ok(!backup.data["tabos-weather-cache"], "caches are left out");
  page.once("dialog", (d) => d.accept());
  await Promise.all([page.waitForEvent("load"), page.click("text=Erase all data")]);
  await page.waitForSelector("text=Welcome to TabOS");
  await page.click("text=Skip setup");
  await page.click('button[aria-label="Open settings"]');
  page.once("dialog", (d) => d.accept());
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("text=Restore from file")]);
  await Promise.all([page.waitForEvent("load"), chooser.setFiles(path)]);
  await page.waitForSelector("text=Task from tab A");
  assert.match(await page.textContent("h1"), /, Shah$/);
});

await check("upgrade from 1.2.2: no setup screen, old data and location choice kept", async () => {
  const p = await open();
  await p.evaluate(() => {
    for (const k of Object.keys(localStorage)) localStorage.removeItem(k);
    localStorage.setItem("tabos-settings", JSON.stringify({ state: { userName: "Old User", locationMode: "auto", searchEngine: "bing", tempUnit: "c" }, version: 0 }));
    localStorage.setItem("tabos-todos", JSON.stringify({ state: { todos: [{ id: "1", title: "Old task", done: false, priority: "med", createdAt: 1 }] }, version: 0 }));
  });
  await p.reload();
  await p.waitForSelector("text=Old task");
  assert.ok(!(await p.isVisible("text=Welcome to TabOS")));
  assert.match(await p.textContent("h1"), /, Old User$/);
  await p.waitForSelector("text=Rain showers");
  assert.match(await p.locator("text=Rain showers").locator("xpath=ancestor::div[contains(@class,'glass')][1]").innerText(), /Dhaka/);
  await p.close();
});

await check("weather off: no weather requests at all", async () => {
  const p = await open();
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("tabos-settings"));
    s.state.locationMode = "off";
    localStorage.setItem("tabos-settings", JSON.stringify(s));
  });
  const before = calls.filter((u) => /open-meteo|geojs/.test(u)).length;
  await p.reload();
  await p.waitForSelector("text=Show the weather for where you are.");
  await p.waitForTimeout(800);
  assert.equal(calls.filter((u) => /open-meteo|geojs/.test(u)).length, before);
  if (shots) await p.screenshot({ path: join(shots, "weather-off.png") });
  await p.close();
});

await check("no errors", async () => assert.equal(errors.join(" ;; "), ""));

if (shots) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(shots, "dashboard.png") });
}

await ctx.close();
rmSync(profile, { recursive: true, force: true });
for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] !== "ok").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
