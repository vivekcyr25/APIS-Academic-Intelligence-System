// api/ums-sync.js — Fortified Neural Extraction with OCR Fallback
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Tesseract = require('tesseract.js');

module.exports = async function handler(req, res) {
    console.log("[ums-sync-api] Received request at:", new Date().toISOString());

    // ── CORS & HEADERS ────────────────────────────────────────────────────────
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, imageBase64, mimeType = 'image/png' } = req.body || {};
    const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_KEY';
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);

    try {
        if (action === 'extract_vision') {
            console.log("[ums-sync-api] Initializing Extraction Pipeline...");

            if (!imageBase64) {
                console.error("[ums-sync-api] Missing imageBase64 data");
                return res.status(400).json({ success: false, message: 'No academic evidence provided' });
            }

            // Log image metadata
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
            console.log(`[ums-sync-api] Image received. Size: ${(buffer.length / 1024).toFixed(2)} KB | MIME: ${mimeType}`);

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                Extract academic data from this UMS screenshot. 
                Return ONLY a JSON object with this structure:
                {
                    "attendance": [{"subject": "string", "percentage": number}],
                    "marks": [{"subject": "string", "score": number, "total": number, "type": "string"}],
                    "assignments": [{"title": "string", "subject": "string", "dueDate": "string", "priority": "high|medium|low"}]
                }
                If data is missing for a category, return an empty array.
                No markdown, no talk, just JSON.
            `;

            console.log("[ums-sync-api] Sending request to Gemini Vision...");
            
            let extractedData = null;
            let responseText = "";

            try {
                const visionResult = await model.generateContent([
                    prompt,
                    { inlineData: { data: imageBase64.split(',')[1], mimeType } }
                ]);

                // DEBUG: Log raw SDK response structure
                console.log("[ums-sync-api] Gemini Raw Response received.");
                responseText = visionResult.response.text();
                
                if (responseText && responseText.trim().length > 5) {
                    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    extractedData = JSON.parse(cleanedJson);
                    console.log("[ums-sync-api] Primary Vision Extraction Success");
                }
            } catch (visionErr) {
                console.warn("[ums-sync-api] Primary Vision Path Failed. Triggering OCR Fallback...", visionErr.message);
            }

            // ── OCR FALLBACK PATH ─────────────────────────────────────────────
            if (!extractedData) {
                console.log("[ums-sync-api] Starting Tesseract OCR Fallback...");
                const ocrResult = await Tesseract.recognize(buffer, 'eng');
                const rawText = ocrResult.data.text;
                console.log("[ums-sync-api] OCR Text Extracted (chars):", rawText.length);

                console.log("[ums-sync-api] Sending OCR text to Gemini for structuring...");
                const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const textPrompt = `
                    I have raw OCR text from an academic portal screenshot. 
                    Structure this data into the following JSON format:
                    {
                        "attendance": [{"subject": "string", "percentage": number}],
                        "marks": [{"subject": "string", "score": number, "total": number, "type": "string"}],
                        "assignments": [{"title": "string", "subject": "string", "dueDate": "string", "priority": "high|medium|low"}]
                    }
                    RAW TEXT:
                    ${rawText}
                `;

                const structResult = await textModel.generateContent(textPrompt);
                responseText = structResult.response.text();
                const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                extractedData = JSON.parse(cleanedJson);
                console.log("[ums-sync-api] Fallback Structuring Success");
            }

            return res.status(200).json({ 
                success: true, 
                data: extractedData,
                message: 'Academic intelligence extracted successfully'
            });
        }

        return res.status(404).json({ success: false, message: 'Invalid action' });

    } catch (err) {
        console.error('[ums-sync-api] Extraction Pipeline Error:', err.message);
        return res.status(500).json({ success: false, message: `Extraction failed: ${err.message}` });
    }
};
