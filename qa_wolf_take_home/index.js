// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  const articleDetails = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll(".athing"));
    return rows.slice(0, 100).map((row) => {
      const title = row.querySelector(".titleline")?.textContent || "No title";
      const ageElement = row.nextElementSibling?.querySelector(".age a");
      const age = ageElement ? ageElement.textContent.trim() : "No time";
      return { title, age };
    });
  });

  console.log("Extracted Articles:", articleDetails);
  if (articleDetails.some((article) => article.age === "No time")) {
    console.error(
      "Failed to extract timestamps. Check the selector or page structure."
    );
    await browser.close();
    return;
  }

  const parseRelativeTime = (relativeTime) => {
    const [value, unit] = relativeTime.split(" ");
    const multiplier = {
      minute: 60 * 1000,
      minutes: 60 * 1000,
      hour: 60 * 60 * 1000,
      hours: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() - parseInt(value) * multiplier[unit]);
  };
  const parsedArticles = articleDetails.map((article) => ({
    ...article,
    parsedAge: parseRelativeTime(article.age),
  }));

  const isSorted = parsedArticles.every((article, i, arr) => {
    return i === 0 || arr[i - 1].parsedAge >= article.parsedAge;
  });

  if (isSorted) {
    console.log("The first 100 articles are sorted from newest to oldest.");
  } else {
    console.error("The articles are NOT sorted correctly.");
  }

  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
