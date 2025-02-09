import { chromium } from "playwright";
import * as cheerio from "cheerio";

export async function scrapeYahooFinance(symbol) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://finance.yahoo.com/quote/${symbol}/news`;

    console.log(`🔍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const content = await page.content();
    console.log("✅ Page content fetched successfully!");
    await browser.close();

    if (!content) {
        console.error("❌ ERROR: Page content is empty!");
        return null;
    }

    const $ = cheerio.load(content);
    let newsHeadlines = [];

    // ✅ Corrected CSS selector for Yahoo Finance news headlines
    $(".stream-item a").each((index, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr("href");

        if (title && link) {
            newsHeadlines.push({
                title,
                link: link.startsWith("https") ? link : `https://finance.yahoo.com${link}`
            });
        }
    });

    return newsHeadlines.length > 0 ? newsHeadlines : null;
}
