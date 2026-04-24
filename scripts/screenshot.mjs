// Captures README screenshots from the running dev server.
// Run with: node scripts/screenshot.mjs

import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const URL = "http://localhost:5180";
const OUT = path.resolve("docs/images");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = { width: 1440, height: 1000, deviceScaleFactor: 2 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`✓ ${name}.png`);
}

// Click button by visible text content
async function clickByText(page, text, opts = {}) {
  const startsWith = opts.startsWith ?? true;
  await page.evaluate(({ text, startsWith }) => {
    const matches = (b) => {
      const t = b.textContent.trim();
      return startsWith ? t.startsWith(text) : t === text;
    };
    const btn = [...document.querySelectorAll("button")].find(matches);
    if (!btn) throw new Error(`No button with text: ${text}`);
    btn.scrollIntoView({ block: "center" });
  }, { text, startsWith });
  // Use Puppeteer real click for proper React event flow
  const handle = await page.evaluateHandle(({ text, startsWith }) => {
    const matches = (b) => {
      const t = b.textContent.trim();
      return startsWith ? t.startsWith(text) : t === text;
    };
    return [...document.querySelectorAll("button")].find(matches);
  }, { text, startsWith });
  const el = handle.asElement();
  await el.click();
}

async function clickSelector(page, selector) {
  await page.waitForSelector(selector, { timeout: 5000 });
  await page.click(selector);
}

async function clearAndType(page, selector, value) {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press("Backspace");
  // type() simulates real keystrokes; for newlines we need separate handling
  for (const line of value.split("\n")) {
    await page.keyboard.type(line);
    if (line !== value.split("\n").at(-1)) {
      await page.keyboard.down("Shift");
      await page.keyboard.press("Enter");
      await page.keyboard.up("Shift");
    }
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: VIEWPORT,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  await sleep(800);

  // Always start clean — clear IndexedDB draft and reload
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases?.();
    if (dbs) for (const d of dbs) indexedDB.deleteDatabase(d.name);
  });
  await page.reload({ waitUntil: "networkidle2" });
  await sleep(800);

  // 01 — Empty overview
  await shot(page, "01-overview");

  // 02 — Library, 4-per-row default
  await clickByText(page, "Library");
  await sleep(700);
  await shot(page, "02-library-4col");

  // 03 — Library, 2-per-row toggle
  await clickSelector(page, '[aria-label="2 per row"]');
  await sleep(400);
  await shot(page, "03-library-2col");

  // Switch back to 4col then pick the first image so the next shots have content
  await clickSelector(page, '[aria-label="4 per row"]');
  await sleep(300);
  // First library thumbnail
  await page.waitForSelector("button[title] > img", { timeout: 5000 });
  const thumbHandle = await page.$("button[title]");
  await thumbHandle.click();
  await sleep(1500); // wait for image fetch + library to close

  // 04 — Image picked, sliders revealed
  await shot(page, "04-image-and-sliders");

  // 05 — Fill in copy
  // Title is the first textarea
  await page.click("textarea", { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await clearAndType(page, "textarea", "Earn\nUnlimited 1%\ncash back");
  // Subtitle (first text input inside Card Content)
  const textInputs = await page.$$('input[type="text"]');
  if (textInputs[0]) {
    await textInputs[0].click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Terms apply");
  }
  if (textInputs[1]) {
    await textInputs[1].click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Get the Card");
  }
  await sleep(500);
  await shot(page, "05-card-filled");

  // 06 — Accessibility mode on
  // Click the toggle next to "Accessibility mode" label
  await page.evaluate(() => {
    const span = [...document.querySelectorAll("span")].find(
      (s) => s.textContent.trim() === "Accessibility mode",
    );
    span?.parentElement?.querySelector("button")?.scrollIntoView({ block: "center" });
  });
  const a11yToggle = await page.evaluateHandle(() => {
    const span = [...document.querySelectorAll("span")].find(
      (s) => s.textContent.trim() === "Accessibility mode",
    );
    return span?.parentElement?.querySelector("button");
  });
  await a11yToggle.asElement().click();
  await sleep(500);
  await shot(page, "06-a11y-mode");

  // Toggle a11y back off so it doesn't bleed into the next shot
  const a11yToggle2 = await page.evaluateHandle(() => {
    const span = [...document.querySelectorAll("span")].find(
      (s) => s.textContent.trim() === "Accessibility mode",
    );
    return span?.parentElement?.querySelector("button");
  });
  await a11yToggle2.asElement().click();
  await sleep(300);

  // 07 — Multi-card variants. "+ Add Card" button — the "+" is an SVG icon,
  // so textContent is just "Add Card".
  const clickAddCard = async () => {
    const handle = await page.evaluateHandle(() =>
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes("Add Card"),
      ),
    );
    await handle.asElement().click();
  };
  await clickAddCard();
  await sleep(300);
  await clickAddCard();
  await sleep(300);
  // Pick a different image for newest card
  await clickByText(page, "Library");
  await sleep(600);
  const thumbs = await page.$$("button[title]");
  if (thumbs[5]) await thumbs[5].click();
  await sleep(1500);

  // Click Card 2 then assign yet another image
  await page.evaluate(() => {
    const card2 = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim().startsWith("Card 2"),
    );
    card2?.click();
  });
  await sleep(400);
  await clickByText(page, "Library");
  await sleep(500);
  const thumbs2 = await page.$$("button[title]");
  if (thumbs2[2]) await thumbs2[2].click();
  await sleep(1500);

  // Switch to Card 1 to display the deck stack from front
  await page.evaluate(() => {
    const card1 = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim().startsWith("Card 1"),
    );
    card1?.click();
  });
  await sleep(700);

  await shot(page, "07-multi-card");

  await browser.close();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
