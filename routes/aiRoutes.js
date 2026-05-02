const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// POST /api/ai-analysis
router.post('/', protect, async (req, res) => {
    const { studentData } = req.body;
    
    if (!studentData) {
        return res.status(400).json({ error: "Student data is required for analysis." });
    }

    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) {
        console.warn("GEMINI_API_KEY not found in environment. Using fallback mock AI response.");
        return res.json({
            analysis: "⚠️ *API Key Missing*. This is a mock response.\n\n" +
            "**Strengths**: This student shows consistency across most subjects.\n" +
            "**Areas for Improvement**: Consider dedicating more study time to subjects with lower CA2 scores.\n" +
            "**Tactics**: Review past MTE papers to better prepare for the ETE format."
        });
    }

    const apiKey = rawKey.trim();
    console.log("Initializing Gemini with Key length:", apiKey.length);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let model;
        let result;

        try {
            console.log("Using Gemini model: gemini-1.5-flash");
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Analyze the following student academic record and provide a short, actionable performance tactic summary (3-4 sentences max). Be encouraging but specific about which subjects and assessment types (CA1, CA2, MTE) need the most focus for the upcoming ETE. Use markdown formatting.\n\nStudent Data:\n${JSON.stringify(studentData, null, 2)}`;
            result = await model.generateContent(prompt);
        } catch (primaryErr) {
            console.warn("Primary model failed, trying fallback: gemini-1.5-flash-latest", primaryErr.message);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const prompt = `Analyze the following student academic record and provide a short, actionable performance tactic summary (3-4 sentences max). Be encouraging but specific about which subjects and assessment types (CA1, CA2, MTE) need the most focus for the upcoming ETE. Use markdown formatting.\n\nStudent Data:\n${JSON.stringify(studentData, null, 2)}`;
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const analysisText = response.text() || "Unable to generate analysis at this time.";
        res.json({ analysis: analysisText });

    } catch (error) {
        console.error("Server error during AI API call:", error);
        res.status(500).json({ error: "Server error connecting to AI service." });
    }
});

module.exports = router;
