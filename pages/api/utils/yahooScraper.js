import { chromium } from "playwright";
import cheerio from "cheerio";

export async function scrapeYahooFinance(symbol) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://finance.yahoo.com/quote/${symbol}/news`;

    await page.goto(url, { waitUntil: "domcontentloaded" });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    let newsHeadlines = [];

    $(".Mb(5px)").each((index, element) => {
        const title = $(element).text();
        const link = $(element).find("a").attr("href");

        if (title && link) {
            newsHeadlines.push({ title, link: `https://finance.yahoo.com${link}` });
        }
    });

    return newsHeadlines.length > 0 ? newsHeadlines : null;
}
