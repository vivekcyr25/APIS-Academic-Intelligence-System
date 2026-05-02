const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/ai-analysis
router.post('/', protect, async (req, res) => {
    const { studentData } = req.body;
    
    if (!studentData) {
        return res.status(400).json({ error: "Student data is required for analysis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback if no API key is configured
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found in environment. Using fallback mock AI response.");
        return res.json({
            analysis: "⚠️ *API Key Missing*. This is a mock response.\n\n" +
            "**Strengths**: This student shows consistency across most subjects.\n" +
            "**Areas for Improvement**: Consider dedicating more study time to subjects with lower CA2 scores.\n" +
            "**Tactics**: Review past MTE papers to better prepare for the ETE format."
        });
    }

    try {
        const prompt = `Analyze the following student academic record and provide a short, actionable performance tactic summary (3-4 sentences max). Be encouraging but specific about which subjects and assessment types (CA1, CA2, MTE) need the most focus for the upcoming ETE. Use markdown formatting.\n\nStudent Data:\n${JSON.stringify(studentData, null, 2)}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: "AI API returned an error." });
        }

        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis at this time.";
        res.json({ analysis: analysisText });

    } catch (error) {
        console.error("Server error during AI API call:", error);
        res.status(500).json({ error: "Server error connecting to AI service." });
    }
});

module.exports = router;
