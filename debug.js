const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/index.html');
    
    // Fill login
    await page.type('#username', '12510200');
    await page.type('#password', 'Vivek50');
    await page.click('#loginBtn');
    
    // Wait for dashboard
    await page.waitForSelector('#dashboardSection.active');
    
    // Fetch a student
    await page.type('#searchRegNo', '12510201');
    await page.click('#fetchBtn');
    
    // Wait for charts to hopefully render
    await new Promise(r => setTimeout(r, 2000));
    
    // Click sphere
    const sphere = await page.$('#sphereBtn');
    if (sphere) {
        await sphere.click();
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();
