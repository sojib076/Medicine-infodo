const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://medex.com.bd";
const OUTPUT_DIR = "./medicines";

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function scrape() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    for (let p = 1; p <= 2; p++) {
        const url = `${BASE_URL}/brands?page=${p}`;
        console.log("Page:", url);

        await page.goto(url, { waitUntil: "networkidle2" });
        await page.waitForSelector(".hoverable-block");

        const links = await page.$$eval(".hoverable-block", (els) =>
            els.map((el) => ({
                url: el.href,
                name: el.querySelector(".data-row-top")?.innerText,
                strength: el.querySelector(".data-row-strength")?.innerText,
                generic: el.querySelector(".data-row-strength")
                    ?.parentElement?.nextElementSibling?.innerText,
                company: el.querySelector(".data-row-company")?.innerText,
            }))
        );

        for (const item of links) {
            console.log("→", item.name);

            const detailPage = await browser.newPage();

            try {
                await detailPage.goto(item.url, { waitUntil: "networkidle2" });
                await detailPage.waitForSelector(".ac-header");

                const data = await detailPage.evaluate(() => {
                    function formatNode(node) {
                        let result = "";

                        node.childNodes.forEach((child) => {
                            if (child.nodeType === Node.TEXT_NODE) {
                                result += child.textContent.trim() + "\n";
                            }

                            if (child.nodeName === "BR") {
                                result += "\n";
                            }

                            if (child.nodeName === "UL") {
                                child.querySelectorAll("li").forEach((li) => {
                                    result += `- ${li.innerText.trim()}\n`;
                                });
                                result += "\n";
                            }

                            if (child.nodeName === "OL") {
                                child.querySelectorAll("li").forEach((li, i) => {
                                    result += `${i + 1}. ${li.innerText.trim()}\n`;
                                });
                                result += "\n";
                            }

                            if (child.nodeName === "STRONG") {
                                result += `**${child.innerText.trim()}** `;
                            }
                        });

                        return result.trim();
                    }

                    const sections = {};

                    document.querySelectorAll(".ac-header").forEach((header) => {
                        const title = header.innerText.trim();
                        const body = header.parentElement.nextElementSibling;

                        if (body && body.classList.contains("ac-body")) {
                            sections[title] = formatNode(body);
                        }
                    });

                    // IMAGE (top OR bottom)
                    const image =
                        document.querySelector(".mp-trigger")?.href ||
                        document.querySelector(".img-defer")?.src ||
                        null;

                    return { sections, image };
                });

                const companyFolder = path.join(
                    OUTPUT_DIR,
                    slugify(item.company || "unknown")
                );

                if (!fs.existsSync(companyFolder)) {
                    fs.mkdirSync(companyFolder, { recursive: true });
                }

                const fileSlug = slugify(item.name);
                const mdPath = path.join(companyFolder, fileSlug + ".md");
                const imgPath = path.join(companyFolder, fileSlug + ".webp");

                // DOWNLOAD IMAGE
                if (data.image) {
                    const view = await detailPage.goto(data.image);
                    const buffer = await view.buffer();
                    fs.writeFileSync(imgPath, buffer);
                }

                // MARKDOWN
                let markdown = `# ${item.name}

**Strength:** ${item.strength}  
**Generic:** ${item.generic}  
**Company:** ${item.company}  

---

`;

                if (data.image) {
                    markdown += `![${item.name}](./${fileSlug}.webp)\n\n---\n\n`;
                }

                for (const [title, content] of Object.entries(data.sections)) {
                    markdown += `## ${title}\n${cleanText(content)}\n\n---\n\n`;
                }

                fs.writeFileSync(mdPath, markdown);
            } catch (err) {
                console.log("❌ Failed:", item.name);
            }

            await detailPage.close();
            await delay(2500); // slower = safer
        }
    }

    await browser.close();
}

scrape();