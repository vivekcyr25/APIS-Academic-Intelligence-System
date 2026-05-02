/**
 * umsService.js — LPU UMS Puppeteer Scraper
 *
 * Usage:
 *   const { syncUMS } = require('./umsService');
 *   const data = await syncUMS('12510201', 'yourPassword');
 *
 * Returns: { timetable, academicHistory, attendance, syllabus }
 *
 * NOTE: This service requires a REAL Puppeteer-compatible environment.
 *       It will NOT work on GitHub Pages (frontend-only). It runs on Render/server.
 *       Install dependencies: npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
 */

let puppeteer, StealthPlugin;

try {
    puppeteer   = require('puppeteer-extra');
    StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    console.log('✅ Puppeteer + Stealth plugin loaded.');
} catch (e) {
    console.warn('⚠️  puppeteer-extra not installed. UMS sync will return mock data.');
    console.warn('   Run: npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth');
}

const UMS_URL = 'https://ums.lpu.in/lpuums/';
const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/**
 * syncUMS — Main scraper function
 * @param {string} regNo     Student registration number
 * @param {string} password  UMS password (NEVER saved to DB)
 * @returns {Promise<Object>} Scraped data object
 */
async function syncUMS(regNo, password) {
    // ── Guard: puppeteer not installed ────────────────────────────────────────
    if (!puppeteer) {
        console.log('[UMS] Puppeteer unavailable — returning mock data for development.');
        return getMockData(regNo);
    }

    let browser;
    try {
        console.log(`[UMS] Starting headless browser for ${regNo}...`);
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1280,800'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36');

        // ── Step 1: Login ─────────────────────────────────────────────────────
        console.log(`[UMS] Navigating to ${UMS_URL}...`);
        await page.goto(UMS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('[UMS] Page loaded. Looking for login form...');

        await page.waitForSelector('#txtU', { timeout: 10000 });
        await page.type('#txtU', regNo, { delay: 80 });
        await page.type('#txtP', password, { delay: 80 });
        console.log('[UMS] Credentials entered. Submitting...');

        await Promise.all([
            page.click('#btnLogin'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
        ]);
        console.log('[UMS] Login submitted. Checking auth...');

        // Check if login succeeded
        const loginError = await page.$('.login-error, #lblMsg');
        if (loginError) {
            const errText = await page.evaluate(el => el.textContent, loginError);
            throw new Error(`UMS login failed: ${errText.trim()}`);
        }
        console.log('[UMS] ✅ Login successful!');

        // ── Step 2: Scrape Timetable ──────────────────────────────────────────
        console.log('[UMS] Navigating to Timetable page...');
        await page.goto(UMS_URL + 'timetable', { waitUntil: 'networkidle2', timeout: 20000 });
        await page.waitForSelector('table', { timeout: 10000 });
        console.log('[UMS] Timetable page loaded. Scraping...');

        const timetable = await page.evaluate((DAYS) => {
            const entries = [];
            const rows = document.querySelectorAll('table tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    const day     = cells[0]?.innerText?.trim();
                    const subject = cells[1]?.innerText?.trim();
                    const time    = cells[2]?.innerText?.trim();
                    const room    = cells[3]?.innerText?.trim();
                    if (DAYS.includes(day) && subject) {
                        entries.push({ subject, time, room, day });
                    }
                }
            });
            return entries;
        }, DAYS);
        console.log(`[UMS] Scraped ${timetable.length} timetable entries.`);

        // ── Step 3: Scrape Marks / Results ────────────────────────────────────
        console.log('[UMS] Navigating to Results page...');
        await page.goto(UMS_URL + 'examination', { waitUntil: 'networkidle2', timeout: 20000 });
        await page.waitForSelector('table', { timeout: 10000 });
        console.log('[UMS] Results page loaded. Scraping...');

        const academicHistory = await page.evaluate(() => {
            const history = {};
            const semHeaders = document.querySelectorAll('.sem-header, h3, h4');
            semHeaders.forEach((header, idx) => {
                const semKey = `sem${idx + 1}`;
                const table  = header.nextElementSibling;
                if (!table) return;
                const rows = table.querySelectorAll('tr');
                const subjects = [];
                let cgpa = 0;
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 3) {
                        const name  = cells[0]?.innerText?.trim();
                        const marks = parseFloat(cells[1]?.innerText) || 0;
                        const grade = cells[2]?.innerText?.trim();
                        if (name) subjects.push({ name, marks, grade });
                    }
                });
                const cgpaEl = table.querySelector('.cgpa, [class*="cgpa"]');
                if (cgpaEl) cgpa = parseFloat(cgpaEl.innerText) || 0;
                if (subjects.length > 0) history[semKey] = { subjects, cgpa };
            });
            return history;
        });
        console.log(`[UMS] Scraped ${Object.keys(academicHistory).length} semester records.`);

        // ── Step 4: Scrape Attendance ─────────────────────────────────────────
        console.log('[UMS] Navigating to Attendance page...');
        await page.goto(UMS_URL + 'attendance', { waitUntil: 'networkidle2', timeout: 20000 });
        const attendance = await page.evaluate(() => {
            const el = document.querySelector('.attendance-percent, [class*="attend"]');
            return el ? el.innerText.trim() : null;
        });
        console.log(`[UMS] Attendance scraped: ${attendance}`);

        await browser.close();
        console.log('[UMS] ✅ Browser closed. Sync complete!');

        return {
            timetable:       timetable.length > 0 ? timetable : [],
            academicHistory: Object.keys(academicHistory).length > 0 ? academicHistory : {},
            attendance:      attendance || null,
            syllabus:        [] // Not available from UMS — use mock or manual entry
        };

    } catch (err) {
        console.error(`[UMS] ❌ Error during sync: ${err.message}`);
        if (browser) {
            try { await browser.close(); } catch (_) {}
        }
        throw err; // Re-throw so the route can handle it
    }
}

/**
 * getMockData — Fallback when Puppeteer is unavailable (dev mode)
 */
function getMockData(regNo) {
    return {
        timetable: [
            { subject: "Mathematics",      time: "08:00 - 09:00", room: "Block-32, R-301", day: "Monday"   },
            { subject: "Computer Science", time: "10:00 - 11:00", room: "Block-32, Lab-1", day: "Monday"   },
            { subject: "Physics",          time: "09:00 - 10:00", room: "Block-32, R-302", day: "Tuesday"  },
            { subject: "DBMS",             time: "11:00 - 12:00", room: "Block-34, R-401", day: "Wednesday"},
            { subject: "C Programming",    time: "09:00 - 10:00", room: "Block-32, Lab-2", day: "Thursday" },
            { subject: "English",          time: "10:00 - 11:00", room: "Block-32, R-201", day: "Friday"   },
        ],
        academicHistory: {
            sem1: {
                subjects: [
                    { name: "Engineering Mathematics I", grade: "A+", marks: 82 },
                    { name: "Programming in C",          grade: "O",  marks: 91 }
                ],
                cgpa: 8.4
            }
        },
        attendance: '85%',
        syllabus:   []
    };
}

module.exports = { syncUMS };
