const { chromium } = require('@playwright/test');

(async () => {
    let browser;
    try {
        console.log("Launching browser...");
        browser = await chromium.launch();
        
        // Use standard desktop CSS sizing but 2x scale to generate a beautiful crisp 2400x1800 image!
        const context = await browser.newContext({
            viewport: { width: 1200, height: 900 },
            deviceScaleFactor: 2
        });
        const page = await context.newPage();
        
        console.log("Navigating to http://localhost:3000 ...");
        await page.goto('http://localhost:3000');
        
        console.log("Waiting for loading screen (100%) to complete and globe to form...");
        // Wait a generous 20 seconds to guarantee loading completes perfectly and globe forms
        await page.waitForTimeout(20000); 
        
        try {
            await page.click('button:has-text("CLOUDS")');
            console.log("Clicked CLOUDS debug button.");
            await page.waitForTimeout(4000); // Wait for cloud transition
        } catch (e) {
            console.log("No CLOUDS button found or clickable. Proceeding...");
        }

        console.log("Taking 2400x1800 screenshot...");
        await page.screenshot({ path: 'portfolio_2400x1800.png', fullPage: false });
        console.log("Screenshot successfully saved as portfolio_2400x1800.png in the project root!");
        
    } catch (err) {
        console.error("Error taking screenshot:", err);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
