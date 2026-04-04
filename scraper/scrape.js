const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://medex.com.bd";

// ── Output / checkpoint paths ─────────────────────────────────────────────
// Scraped data is written as a single JSON file that the Next.js app can read.
const OUTPUT_FILE = path.resolve(__dirname, "../public/data/medicines.json");
// Checkpoint persists the list of slugs already scraped so a crashed run can
// resume from where it left off instead of restarting from zero.
const CHECKPOINT_FILE = path.resolve(__dirname, "./checkpoint.json");

// ── Tunables ──────────────────────────────────────────────────────────────
const MAX_PAGES    = 2;     // number of brand-list pages to scrape
const RETRY_LIMIT  = 3;     // attempts per URL before giving up
const RETRY_DELAY  = 3000;  // base ms between retries (doubles each attempt)
const NAV_TIMEOUT  = 30000; // ms for page.goto / waitForSelector
const PAGE_DELAY   = 2500;  // ms between successive medicine requests

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

// ── Helpers ───────────────────────────────────────────────────────────────

function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

// Navigate to a URL and retry up to RETRY_LIMIT times on any network error,
// using exponential backoff between attempts.
async function gotoWithRetry(page, url, options = {}) {
    let lastErr;
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: NAV_TIMEOUT,
                ...options,
            });
            return; // success
        } catch (err) {
            lastErr = err;
            if (attempt < RETRY_LIMIT) {
                const wait = RETRY_DELAY * attempt; // 3 s → 6 s → 9 s
                console.warn(
                    `  ⚠ Attempt ${attempt}/${RETRY_LIMIT} failed for ${url} ` +
                    `(${err.message.split("\n")[0]}) — retrying in ${wait / 1000}s…`
                );
                await delay(wait);
            }
        }
    }
    throw lastErr; // re-throw after all retries exhausted
}

// ── Checkpoint helpers ────────────────────────────────────────────────────

function loadCheckpoint() {
    try {
        if (fs.existsSync(CHECKPOINT_FILE)) {
            return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
        }
    } catch (_) {}
    return { done: [] };
}

function saveCheckpoint(checkpoint) {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

// ── Output helpers ────────────────────────────────────────────────────────

function loadExistingData() {
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
        }
    } catch (_) {}
    return [];
}

function saveOutput(data) {
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
}

// ── Main scraper ──────────────────────────────────────────────────────────

async function scrape() {
    const checkpoint = loadCheckpoint();
    const results    = loadExistingData();
    const doneSet    = new Set(checkpoint.done);

    console.log(`Resuming: ${doneSet.size} medicines already scraped.`);

    const browser = await puppeteer.launch({
        // "new" headless mode is stable and works in server / CI environments
        headless: "new",
        defaultViewport: { width: 1280, height: 800 },
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const listPage = await browser.newPage();
        await listPage.setUserAgent(USER_AGENT);

        for (let p = 1; p <= MAX_PAGES; p++) {
            const url = `${BASE_URL}/brands?page=${p}`;
            console.log(`\nFetching brand list page ${p}: ${url}`);

            // Retry the brand-list page itself on network errors
            await gotoWithRetry(listPage, url, { waitUntil: "networkidle2" });
            await listPage.waitForSelector(".hoverable-block", { timeout: NAV_TIMEOUT });

            const links = await listPage.$$eval(".hoverable-block", (els) =>
                els.map((el) => ({
                    url:      el.href,
                    name:     el.querySelector(".data-row-top")?.innerText?.trim()  || "",
                    strength: el.querySelector(".data-row-strength")?.innerText?.trim() || "",
                    generic:  el.querySelector(".data-row-strength")
                                  ?.parentElement?.nextElementSibling?.innerText?.trim() || "",
                    company:  el.querySelector(".data-row-company")?.innerText?.trim()  || "",
                }))
            );

            console.log(`  Found ${links.length} medicines on page ${p}`);

            for (const item of links) {
                const slug = slugify(item.name || item.url);

                if (doneSet.has(slug)) {
                    console.log(`  ↩ Skip (already scraped): ${item.name}`);
                    continue;
                }

                console.log(`  → Scraping: ${item.name}`);
                const detailPage = await browser.newPage();
                await detailPage.setUserAgent(USER_AGENT);

                let scraped = false;

                // Each medicine gets its own retry loop so one flaky URL doesn't
                // abort the whole run.
                for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
                    try {
                        await gotoWithRetry(detailPage, item.url);
                        await detailPage.waitForSelector(".ac-header", {
                            timeout: NAV_TIMEOUT,
                        });

                        const data = await detailPage.evaluate(() => {
                            function extractText(node) {
                                let result = "";
                                node.childNodes.forEach((child) => {
                                    if (child.nodeType === Node.TEXT_NODE) {
                                        const t = child.textContent.trim();
                                        if (t) result += t + " ";
                                    } else if (child.nodeName === "BR") {
                                        result += "\n";
                                    } else if (child.nodeName === "UL") {
                                        child.querySelectorAll("li").forEach((li) => {
                                            result += `\n- ${li.innerText.trim()}`;
                                        });
                                        result += "\n";
                                    } else if (child.nodeName === "OL") {
                                        child.querySelectorAll("li").forEach((li, i) => {
                                            result += `\n${i + 1}. ${li.innerText.trim()}`;
                                        });
                                        result += "\n";
                                    } else if (child.nodeName === "STRONG") {
                                        result += child.innerText.trim() + " ";
                                    } else if (child.innerText) {
                                        result += child.innerText.trim() + " ";
                                    }
                                });
                                return result.trim();
                            }

                            const sections = {};
                            document.querySelectorAll(".ac-header").forEach((header) => {
                                const title = header.innerText.trim();
                                const body  = header.parentElement.nextElementSibling;
                                if (body && body.classList.contains("ac-body")) {
                                    sections[title] = extractText(body);
                                }
                            });

                            const image =
                                document.querySelector(".mp-trigger")?.href ||
                                document.querySelector(".img-defer")?.src  ||
                                null;

                            return { sections, image };
                        });

                        results.push({
                            slug,
                            name:         item.name,
                            strength:     item.strength,
                            generic:      item.generic,
                            manufacturer: item.company,
                            url:          item.url,
                            image:        data.image || null,
                            sections:     data.sections,
                        });

                        // Persist after every medicine so progress is never lost
                        doneSet.add(slug);
                        checkpoint.done.push(slug);
                        saveOutput(results);
                        saveCheckpoint(checkpoint);

                        console.log(`    ✓ Saved: ${item.name}`);
                        scraped = true;
                        break;
                    } catch (err) {
                        if (attempt < RETRY_LIMIT) {
                            const wait = RETRY_DELAY * attempt;
                            console.warn(
                                `    ⚠ Attempt ${attempt}/${RETRY_LIMIT} failed: ` +
                                `${err.message.split("\n")[0]} — retrying in ${wait / 1000}s…`
                            );
                            await delay(wait);
                        } else {
                            console.error(
                                `    ✗ Gave up after ${RETRY_LIMIT} attempts: ` +
                                `${item.name} — ${err.message.split("\n")[0]}`
                            );
                        }
                    }
                }

                await detailPage.close();
                if (scraped) await delay(PAGE_DELAY);
            }
        }
    } finally {
        await browser.close();
    }

    console.log(`\nDone. ${results.length} medicines written to ${OUTPUT_FILE}`);

    // Remove checkpoint on clean completion so the next full run starts fresh
    if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
}

scrape().catch((err) => {
    console.error("Fatal scraper error:", err.message);
    process.exit(1);
});