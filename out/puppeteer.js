"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeScreenshot = takeScreenshot;
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
function takeScreenshot(templateFolder, htmlContent) {
    return __awaiter(this, void 0, void 0, function* () {
        // Launch Puppeteer
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        // Define the path to the CSS file (used from template folder)
        const cssFilePath = path_1.default.resolve(__dirname, "../src/data", templateFolder, "css.css");
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
        yield page.setContent(fullHtmlContent, { waitUntil: "domcontentloaded" });
        yield new Promise((resolve) => setTimeout(resolve, 5000));
        // Take a screenshot of the loaded page
        const screenshotPath = path_1.default.resolve(__dirname, `../src/data/${templateFolder}`, "screenshot.png");
        yield page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to: ${screenshotPath}`);
        // Close the browser
        yield browser.close();
    });
}
