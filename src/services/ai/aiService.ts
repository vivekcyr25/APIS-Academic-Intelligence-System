import { createWorker } from 'tesseract.js';
import { calculateConfidence } from './visionParser';

// Production Throttling: 1 request per 10 seconds for general AI actions
const AI_THROTTLE_MS = 10000;
let lastRequestTime = 0;

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

/**
 * APIS AI - Secure Synthesis Interface
 * Communicates with the /api/ai proxy to prevent key exposure.
 */
export const askAI = async (prompt: string, context: string): Promise<string> => {
  const now = Date.now();
  if (now - lastRequestTime < AI_THROTTLE_MS) {
    throw new Error('AI Intelligence is cooling down. Please wait a few seconds before the next synthesis.');
  }
  lastRequestTime = now;

  const fullPrompt = `You are APIS (Academic Performance Intelligence System), an advanced AI academic advisor for a university student.

Context about the student:
${context}

User question: ${prompt}

Guidelines:
1. Be data-driven and analytical.
2. Provide actionable advice for academic improvement.
3. Keep responses concise and well-structured (use markdown formatting like **bold** and bullet points).
4. Use a futuristic, professional, and encouraging tone.
5. Always reference the student's actual data when available.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error || 'Failed to connect to AI Intelligence';
      throw new Error(errMsg);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Intelligence synthesis resulted in no actionable data');
    
    return text;
  } catch (err: any) {
    // Semantic Failsafe Logic
    const isTimeout = err.message?.includes('timed out');
    if (isTimeout) {
      return "The Neural Intelligence layer is currently experiencing high latency. Academic systems remain operational. Please try again in a few moments.";
    }
    
    throw err;
  }
};

export const getPerformanceAnalysis = async (marksData: any[]): Promise<string> => {
  const context = JSON.stringify(marksData, null, 2);
  const prompt = `Perform a comprehensive multi-dimensional analysis of my academic performance. 
  Identify:
  1. Top performing subjects and why.
  2. High-risk subjects (low CA or ETE).
  3. Strategic recommendations for the upcoming ETE or next semester.
  4. A "Survival Strategy" for subjects where total is near 40.
  
  Format as a professional report with clear headings.`;

  return askAI(prompt, context);
};

export const getRoadmapAnalysis = async (marksData: any[]): Promise<any> => {
  const context = JSON.stringify(marksData, null, 2);
  const prompt = `Based on these marks: ${context}, provide a strategic academic roadmap. 
  Return ONLY a JSON object with this structure:
  {
    "interventions": [{"subject": "string", "reason": "string", "priority": "high|medium", "action": "string"}],
    "growth": [{"title": "string", "description": "string", "target": "string"}]
  }`;
  
  const text = await askAI(prompt, context);
  try {
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    throw new Error('AI analysis produced invalid data format.');
  }
};

export const getCustomStudyPlan = async (marksData: any[], focusSubject?: string): Promise<string> => {
  const context = JSON.stringify(marksData, null, 2);
  const prompt = `Create a detailed, day-by-day study plan (7 days) for a student with these marks: ${context}.
  ${focusSubject ? `Special focus on: ${focusSubject}.` : 'Focus on improving the overall GPA.'}
  Use professional Markdown formatting with headers, bold text, and bullet points. Include specific topics to study based on common curricula.`;
  
  return askAI(prompt, context);
};

export const getDashboardSnapshot = async (marksData: any[]): Promise<string> => {
  const context = JSON.stringify(marksData, null, 2);
  const prompt = `Based on these marks: ${context}, provide a one-sentence high-impact strategic tip for the student's dashboard. 
  Make it motivating and focus on the most critical area for improvement. Keep it under 20 words.`;
  
  const text = await askAI(prompt, context);
  return text.trim();
};

/**
 * Hybrid AI Vision: OCR + Cognitive Structuring via Proxy
 */
export const processAcademicImage = async (imageFile: File, type: string) => {
  try {
    // 1. Tesseract OCR Layer (Remains on client for speed/privacy)
    const worker = await createWorker('eng');
    const imageUrl = URL.createObjectURL(imageFile);
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    
    // 2. Proxy request for structuring
    const prompt = `
      You are an Academic Data Architect. 
      Review this extracted text from an academic ${type} screenshot:
      
      "${text}"
      
      Structure this into a JSON array of objects. 
      For attendance, use keys: subjectName, attendancePercentage.
      For marks, use keys: subjectName, marks, maxMarks.
      
      Return ONLY valid JSON.
    `;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error('AI structuring failed');

    const aiJson = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/```json|```/g, '').trim();
    const structuredData = JSON.parse(aiJson);
    const confidence = calculateConfidence(text);

    return {
      rawText: text,
      structuredData,
      confidence,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('AI Vision Pipeline Failed:', error);
    throw new Error('Failed to process academic image. Please try a clearer screenshot.');
  }
};

export const generateAcademicReflection = async (ruleBasedSummary: string, memoryVectors: any): Promise<string> => {
  const prompt = `You are the APIS Academic Intelligence Engine.
I have a rule-based summary of a student's longitudinal academic performance:
"${ruleBasedSummary}"

And their memory vectors:
${JSON.stringify(memoryVectors)}

Synthesize this into a beautifully phrased, emotionally intelligent, and encouraging academic reflection (max 3 sentences).
It should feel like Apple Health or a calm AI. Do NOT use emojis. Keep it extremely premium and calm.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 150 },
      }),
    });
    const data = await response.json();
    if (!response.ok) return ruleBasedSummary;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : ruleBasedSummary;
  } catch (e) {
    return ruleBasedSummary;
  }
};
