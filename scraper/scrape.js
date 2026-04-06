const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http  = require("http");

const BASE_URL = "https://medex.com.bd";

// ── Output / checkpoint paths ─────────────────────────────────────────────
const INDEX_FILE      = path.resolve(__dirname, "../public/data/medicines-index.json");
const MD_DIR          = path.resolve(__dirname, "../public/data/medicines");
const IMAGES_DIR      = path.resolve(__dirname, "../public/images/medicines");
const CHECKPOINT_FILE = path.resolve(__dirname, "./checkpoint.json");

// ── Tunables ──────────────────────────────────────────────────────────────
const MAX_PAGES   = 2;      // number of brand-list pages to scrape
const RETRY_LIMIT = 3;      // attempts per URL before giving up
const RETRY_DELAY = 3000;   // base ms between retries (doubles each attempt)
const NAV_TIMEOUT = 30000;  // ms for page.goto / waitForSelector
const PAGE_DELAY  = 2500;   // base ms between successive medicine requests

// ── Anti-blocking: rotate through these common desktop user-agents ─────────
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

function randomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Jitter: return PAGE_DELAY ± 30 % so requests don't look perfectly metronomic
function jitterDelay(base = PAGE_DELAY) {
    const spread = base * 0.3;
    return base + Math.floor(Math.random() * spread * 2 - spread);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

// Block resource types that waste bandwidth and trigger fingerprinting scripts
const BLOCKED_TYPES = new Set(["image", "media", "font", "stylesheet"]);
// Block known analytics / ad domains
const BLOCKED_DOMAINS = [
    "google-analytics.com", "googletagmanager.com", "doubleclick.net",
    "facebook.com", "fbcdn.net", "hotjar.com", "clarity.ms", "ads.com",
];

async function setupPage(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());

    // Hide WebDriver flag to reduce bot-detection risk
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    // Intercept and block unnecessary requests
    await page.setRequestInterception(true);
    page.on("request", (req) => {
        const type   = req.resourceType();
        const reqUrl = req.url();
        const isBlockedDomain = BLOCKED_DOMAINS.some((d) => reqUrl.includes(d));
        if (BLOCKED_TYPES.has(type) || isBlockedDomain) {
            req.abort();
        } else {
            req.continue();
        }
    });

    return page;
}

// Navigate to a URL and retry up to RETRY_LIMIT times on any network error,
// using exponential backoff between attempts (3 s → 6 s → 12 s …).
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
                const wait = RETRY_DELAY * Math.pow(2, attempt - 1); // 3 s → 6 s → 12 s
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
        if (fs.existsSync(INDEX_FILE)) {
            return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
        }
    } catch (_) {}
    return [];
}

function saveIndex(data) {
    const dir = path.dirname(INDEX_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
}

/** Write per-medicine sections to a .md file in ## Heading\nContent format. */
function writeMd(slug, sections) {
    if (!fs.existsSync(MD_DIR)) fs.mkdirSync(MD_DIR, { recursive: true });
    const parts = Object.entries(sections).map(([title, body]) => `## ${title}\n${body}`);
    fs.writeFileSync(path.join(MD_DIR, `${slug}.md`), parts.join("\n\n"), "utf8");
}

/** Download medicine image locally; resolves to the local public path or a fallback. */
function downloadImage(imageUrl, slug) {
    return new Promise((resolve) => {
        if (!imageUrl) { resolve(null); return; }
        const urlObj = new URL(imageUrl);
        const ext = path.extname(urlObj.pathname) || ".webp";
        const filename = `${slug}${ext}`;
        const localPath = path.join(IMAGES_DIR, filename);
        if (fs.existsSync(localPath)) { resolve(`/images/medicines/${filename}`); return; }
        if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
        const file = fs.createWriteStream(localPath);
        const proto = urlObj.protocol === "https:" ? https : http;
        proto.get(imageUrl, (res) => {
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(`    📷 Image saved: ${filename}`);
                resolve(`/images/medicines/${filename}`);
            });
        }).on("error", (err) => {
            fs.unlink(localPath, () => {});
            console.warn(`    ⚠ Image download failed: ${err.message}`);
            resolve(imageUrl); // fall back to remote URL
        });
    });
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
        const listPage = await setupPage(browser);

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
                // Each detail page gets a fresh page with a rotated user-agent
                const detailPage = await setupPage(browser);

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

                        const localImage = await downloadImage(data.image, slug);
                        writeMd(slug, data.sections);

                        results.push({
                            slug,
                            name:         item.name,
                            strength:     item.strength,
                            generic:      item.generic,
                            manufacturer: item.company,
                            image:        localImage,
                        });

                        // Persist after every medicine so progress is never lost
                        doneSet.add(slug);
                        checkpoint.done.push(slug);
                        saveIndex(results);
                        saveCheckpoint(checkpoint);

                        console.log(`    ✓ Saved: ${item.name}`);
                        scraped = true;
                        break;
                    } catch (err) {
                        if (attempt < RETRY_LIMIT) {
                            const wait = RETRY_DELAY * Math.pow(2, attempt - 1); // 3 s → 6 s → 12 s
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
                // Jittered delay avoids metronomic request patterns that trigger rate-limiting
                if (scraped) await delay(jitterDelay());
            }
        }
    } finally {
        await browser.close();
    }

    console.log(`\nDone. ${results.length} medicines written to ${INDEX_FILE}`);

    // Remove checkpoint on clean completion so the next full run starts fresh
    if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
}

scrape().catch((err) => {
    console.error("Fatal scraper error:", err.message);
    process.exit(1);
});