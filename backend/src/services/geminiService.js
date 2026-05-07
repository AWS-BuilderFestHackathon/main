import { getGeminiModel } from '../config/gemini.js';
import { parseGeminiJSON } from '../utils/helpers.js';

/**
 * Summarize student notes using Gemini.
 * Returns { summary, keyPoints, difficulty, estimatedReadTime }
 */
export const summarizeNotes = async (text) => {
  const model = getGeminiModel();

  const prompt = `
You are an expert study assistant. Analyze and summarize the following student notes.
Your response MUST be ONLY valid JSON — no markdown, no explanation.

Notes:
${text}

Return this exact JSON structure:
{
  "summary": "A comprehensive paragraph summary of the notes",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": "X minutes"
}
`.trim();

  const result = await model.generateContent(prompt);
  return parseGeminiJSON(result.response.text());
};

/**
 * Generate quiz questions from note text using Gemini.
 * Returns array of question objects.
 */
export const generateQuizQuestions = async (noteText, difficulty = 'medium', count = 5) => {
  const model = getGeminiModel();

  const prompt = `
Generate ${count} multiple-choice questions from the following study notes.
Difficulty: ${difficulty}
Rules: 4 options each, one correct answer, brief explanation for each.
Response MUST be ONLY valid JSON array — no markdown.

Notes:
${noteText}

Return this exact JSON structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct...",
    "difficulty": "${difficulty}"
  }
]
`.trim();

  const result = await model.generateContent(prompt);
  return parseGeminiJSON(result.response.text());
};

/**
 * Answer a student doubt using Gemini with conversation history.
 * history = array of { role: 'user'|'model', parts: [{text}] }
 */
export const solveDoubt = async (question, subject = 'General', history = []) => {
  const model = getGeminiModel();

  const chat = model.startChat({
    history,
    generationConfig: { maxOutputTokens: 2048 },
  });

  const systemContext = `You are a helpful, patient study assistant specializing in ${subject}. 
Explain concepts clearly with examples. Format math with clear notation. 
Keep responses structured and easy to read.`;

  const message = history.length === 0
    ? `${systemContext}\n\nStudent question: ${question}`
    : question;

  const result = await chat.sendMessage(message);
  return result.response.text();
};

/**
 * Generate an AI study plan for given parameters.
 */
export const generateStudyPlan = async ({ subject, examDate, hoursPerDay, currentLevel }) => {
  const model = getGeminiModel();
  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));

  const prompt = `
Create a detailed day-by-day study plan for a student.
Subject: ${subject}
Days until exam: ${daysUntilExam}
Hours available per day: ${hoursPerDay}
Current knowledge level: ${currentLevel}

Return ONLY valid JSON — no markdown. Follow this exact structure:
{
  "title": "Study Plan for ${subject}",
  "tasks": [
    {
      "title": "Task title",
      "description": "What to study",
      "date": "YYYY-MM-DD",
      "duration": 60,
      "priority": "high|medium|low",
      "subject": "${subject}"
    }
  ]
}
`.trim();

  const result = await model.generateContent(prompt);
  return parseGeminiJSON(result.response.text());
};

/**
 * Generate a motivational quote for the dashboard.
 */
export const generateMotivationalQuote = async (context = {}) => {
  const model = getGeminiModel();
  const { subject, timeOfDay } = context;

  const prompt = `Generate a single short motivational quote (max 20 words) for a student ${subject ? `studying ${subject}` : ''} in the ${timeOfDay || 'morning'}. Return ONLY the quote text, no quotes, no attribution.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

/**
 * Generate a context-aware background image prompt for Gemini image generation.
 * (Returns a descriptive prompt string — actual image generation uses Cloudinary or similar)
 */
export const generateBackgroundPrompt = ({ timeOfDay, subject, theme }) => {
  const timePrompts = {
    morning: 'sunrise over mountains, warm golden tones, fresh start energy',
    afternoon: 'bright modern library with natural light, plants, organized desk',
    evening: 'cozy evening study setup, warm lamp light, books, coffee',
    night: 'city lights at night from a study window, calm focused atmosphere',
  };

  const subjectPrompts = {
    Mathematics: 'geometric patterns, fractals, minimalist mathematical beauty',
    Science: 'laboratory aesthetic, molecular structures',
    History: 'ancient scrolls, vintage library',
    Literature: 'stacked books, cozy reading nook',
    Programming: 'code editor terminal windows, dark tech workspace',
    General: 'inspiring study environment',
  };

  const base = timePrompts[timeOfDay] || timePrompts.morning;
  const subjectHint = subjectPrompts[subject] || subjectPrompts.General;

  return `A beautiful, inspiring study background: ${base}, ${subjectHint}. ${theme === 'dark' ? 'Dark moody aesthetic.' : 'Bright clean aesthetic.'} Ultra HD, 4K, professional photography style.`;
};
