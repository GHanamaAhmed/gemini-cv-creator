import puppeteer from "puppeteer";
import path from "path";
export async function takeScreenshot(
  templateFolder: string,
  htmlContent: string
) {
  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Define the path to the CSS file (used from template folder)
  const cssFilePath = path.resolve(
    __dirname,
    "../src/data",
    templateFolder,
    "css.css"
  );

  // Read CSS content from the CSS file
  const cssContent = require("fs").readFileSync(cssFilePath, "utf8");

  // Create an HTML template combining the HTML content and CSS
  const fullHtmlContent = `
    <html>
      <head>
        <style>
          ${cssContent}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  // Load the HTML content with the embedded CSS
  await page.setContent(fullHtmlContent, { waitUntil: "domcontentloaded" });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  // Take a screenshot of the loaded page
  const screenshotPath = path.resolve(
    __dirname,
    `../src/data/${templateFolder}`,
    "screenshot.png"
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Close the browser
  await browser.close();
}
