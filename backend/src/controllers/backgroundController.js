import { generateMotivationalQuote, generateBackgroundPrompt } from '../services/geminiService.js';
import { asyncHandler } from '../utils/helpers.js';

// POST /api/background/generate
export const generateBackground = asyncHandler(async (req, res) => {
  const { context = {}, timeOfDay, subject, theme } = req.body;

  const prompt = generateBackgroundPrompt({ timeOfDay, subject, theme });
  const quote = await generateMotivationalQuote({ subject, timeOfDay });

  res.json({
    success: true,
    prompt,
    quote,
    // In production, you'd call an image generation API here
    // For hackathon: return the prompt for use with a background CSS gradient
  });
});
