/**
 * umsService.js — LPU UMS Puppeteer Scraper (Robust Edition)
 *
 * Error codes returned in thrown Error objects:
 *   WRONG_PASSWORD   — Login credentials rejected by UMS
 *   CAPTCHA_DETECTED — UMS showed a CAPTCHA page
 *   TIMEOUT          — Sync exceeded 30 seconds
 *   SCRAPE_FAILED    — Generic scraping error
 *
 * Install: npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
 */

let puppeteer, StealthPlugin;

try {
    puppeteer     = require('puppeteer-extra');
    StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    console.log('✅ Puppeteer + Stealth plugin loaded.');
} catch (e) {
    console.warn('⚠️  puppeteer-extra not installed. UMS sync will return mock data.');
    console.warn('   Run: npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth');
}

const UMS_URL        = 'https://ums.lpu.in/lpuums/';
const DAYS           = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SYNC_TIMEOUT_MS = 30000; // Step 11: hard 30-second total timeout

// ── Custom error class with error codes ───────────────────────────────────────
class UMSError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;   // WRONG_PASSWORD | CAPTCHA_DETECTED | TIMEOUT | SCRAPE_FAILED
        this.name = 'UMSError';
    }
}

/**
 * syncUMS — Main scraper function
 * @param {string} regNo     Student registration number
 * @param {string} password  UMS password (NEVER saved to DB)
 * @returns {Promise<Object>} { timetable, academicHistory, attendance, syllabus }
 * @throws {UMSError} with .code for specific failure reasons
 */
async function syncUMS(regNo, password) {
    if (!puppeteer) {
        console.log('[UMS] Puppeteer unavailable — returning mock data for development.');
        return getMockData(regNo);
    }

    // Step 11: Race the whole sync against a 30-second timeout
    return Promise.race([
        _doSync(regNo, password),
        new Promise((_, reject) =>
            setTimeout(() => reject(new UMSError('TIMEOUT', 'UMS sync timed out after 30 seconds. The UMS server may be slow. Please try again.')), SYNC_TIMEOUT_MS)
        )
    ]);
}

async function _doSync(regNo, password) {
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
        page.setDefaultTimeout(15000);

        // ── Step 1: Navigate & Login ───────────────────────────────────────────
        console.log(`[UMS] Navigating to ${UMS_URL}...`);
        await page.goto(UMS_URL, { waitUntil: 'networkidle2', timeout: 20000 });
        console.log('[UMS] Page loaded. Checking for CAPTCHA...');

        // Step 11: CAPTCHA detection — check before login attempt
        await _assertNoCaptcha(page);

        console.log('[UMS] Looking for login form...');
        await page.waitForSelector('#txtU', { timeout: 8000 });
        await page.type('#txtU', regNo,    { delay: 60 });
        await page.type('#txtP', password, { delay: 60 });
        console.log('[UMS] Credentials entered. Submitting...');

        await Promise.all([
            page.click('#btnLogin'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 })
        ]);
        console.log('[UMS] Login submitted. Checking result...');

        // Step 11: Check for CAPTCHA after login redirect
        await _assertNoCaptcha(page);

        // Step 11: Specific login error detection
        const loginErrorEl = await page.$('.login-error, #lblMsg, [id*="Error"], [id*="error"]');
        if (loginErrorEl) {
            const errText = await page.evaluate(el => el.textContent?.trim(), loginErrorEl);
            if (errText) {
                const isWrongPwd = /invalid|incorrect|wrong|password|credentials/i.test(errText);
                console.error(`[UMS] Login rejected: "${errText}"`);
                throw new UMSError(
                    isWrongPwd ? 'WRONG_PASSWORD' : 'SCRAPE_FAILED',
                    isWrongPwd
                        ? 'Login Failed. Please check your UMS credentials.'
                        : `UMS rejected login: ${errText}`
                );
            }
        }

        // Verify we're past the login page (look for a nav/dashboard element)
        const loggedIn = await page.$('.main-nav, #main-content, [class*="dashboard"], [id*="home"]');
        if (!loggedIn) {
            // One more captcha check — sometimes it appears post-login
            await _assertNoCaptcha(page);
            // If still no dashboard, assume wrong password
            throw new UMSError('WRONG_PASSWORD', 'Login Failed. Please check your UMS credentials.');
        }
        console.log('[UMS] ✅ Login successful!');

        // ── Step 2: Timetable ─────────────────────────────────────────────────
        console.log('[UMS] Navigating to Timetable page...');
        await page.goto(UMS_URL + 'timetable', { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForSelector('table', { timeout: 8000 });
        console.log('[UMS] Timetable page loaded. Scraping...');

        const timetable = await page.evaluate((DAYS) => {
            const entries = [];
            document.querySelectorAll('table tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    const day     = cells[0]?.innerText?.trim();
                    const subject = cells[1]?.innerText?.trim();
                    const time    = cells[2]?.innerText?.trim();
                    const room    = cells[3]?.innerText?.trim();
                    if (DAYS.includes(day) && subject) entries.push({ subject, time, room, day });
                }
            });
            return entries;
        }, DAYS);
        console.log(`[UMS] Scraped ${timetable.length} timetable entries.`);

        // ── Step 3: Results ───────────────────────────────────────────────────
        console.log('[UMS] Navigating to Results page...');
        await page.goto(UMS_URL + 'examination', { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForSelector('table', { timeout: 8000 });
        console.log('[UMS] Results page loaded. Scraping...');

        const academicHistory = await page.evaluate(() => {
            const history = {};
            document.querySelectorAll('.sem-header, h3, h4').forEach((header, idx) => {
                const semKey = `sem${idx + 1}`;
                const table  = header.nextElementSibling;
                if (!table) return;
                const subjects = [];
                let cgpa = 0;
                table.querySelectorAll('tr').forEach(row => {
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

        // ── Step 4: Attendance ────────────────────────────────────────────────
        console.log('[UMS] Navigating to Attendance page...');
        await page.goto(UMS_URL + 'attendance', { waitUntil: 'networkidle2', timeout: 15000 });
        const attendance = await page.evaluate(() => {
            const el = document.querySelector('.attendance-percent, [class*="attend"]');
            return el ? el.innerText.trim() : null;
        });
        console.log(`[UMS] Attendance scraped: ${attendance}`);

        await browser.close();
        console.log('[UMS] ✅ Browser closed. Sync complete!');

        return {
            timetable:       timetable,
            academicHistory: academicHistory,
            attendance:      attendance || null,
            syllabus:        []
        };

    } catch (err) {
        if (browser) { try { await browser.close(); } catch (_) {} }

        // Re-throw UMSErrors as-is (they already have the right code)
        if (err.name === 'UMSError') throw err;

        // Wrap timeout/navigation errors
        if (err.message?.includes('timeout') || err.name === 'TimeoutError') {
            throw new UMSError('TIMEOUT', 'UMS sync timed out. The UMS server may be slow. Please try again.');
        }

        console.error(`[UMS] ❌ Unexpected error: ${err.message}`);
        throw new UMSError('SCRAPE_FAILED', `Sync failed: ${err.message}`);
    }
}

// ── CAPTCHA detector ──────────────────────────────────────────────────────────
async function _assertNoCaptcha(page) {
    const captchaEl = await page.$('[class*="captcha"], [id*="captcha"], iframe[src*="recaptcha"], .g-recaptcha');
    if (captchaEl) {
        console.error('[UMS] ⚠️ CAPTCHA detected!');
        throw new UMSError(
            'CAPTCHA_DETECTED',
            'Manual Sync Required: Please log in to UMS once on your browser to verify your session, then try syncing again.'
        );
    }

    // Also check page title/URL for common CAPTCHA landing pages
    const url = page.url();
    if (url.includes('captcha') || url.includes('verify')) {
        throw new UMSError(
            'CAPTCHA_DETECTED',
            'Manual Sync Required: Please log in to UMS once on your browser to verify your session, then try syncing again.'
        );
    }
}

// ── Dev fallback data ─────────────────────────────────────────────────────────
function getMockData(regNo) {
    return {
        timetable: [
            { subject: 'Mathematics',      time: '08:00 - 09:00', room: 'Block-32, R-301', day: 'Monday'    },
            { subject: 'Computer Science', time: '10:00 - 11:00', room: 'Block-32, Lab-1', day: 'Monday'    },
            { subject: 'Physics',          time: '09:00 - 10:00', room: 'Block-32, R-302', day: 'Tuesday'   },
            { subject: 'DBMS',             time: '11:00 - 12:00', room: 'Block-34, R-401', day: 'Wednesday' },
            { subject: 'C Programming',    time: '09:00 - 10:00', room: 'Block-32, Lab-2', day: 'Thursday'  },
            { subject: 'English',          time: '10:00 - 11:00', room: 'Block-32, R-201', day: 'Friday'    }
        ],
        academicHistory: {
            sem1: { subjects: [{ name: 'Engineering Mathematics I', grade: 'A+', marks: 82 }, { name: 'Programming in C', grade: 'O', marks: 91 }], cgpa: 8.4 },
            sem2: { subjects: [{ name: 'Data Structures', grade: 'A+', marks: 85 }, { name: 'OOP', grade: 'O', marks: 93 }], cgpa: 8.7 }
        },
        attendance: '85%',
        syllabus: []
    };
}

module.exports = { syncUMS, UMSError };
