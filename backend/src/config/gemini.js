import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy-init: don't read env at import time (dotenv hasn't loaded yet in ESM)
let _genAI = null;

const getGenAI = () => {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// Primary model, with fallback
const PRIMARY_MODEL = 'gemini-2.0-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

export const getGeminiModel = (modelName) => {
  return getGenAI().getGenerativeModel({ model: modelName || PRIMARY_MODEL });
};

/**
 * Try primary model, fall back to secondary if rate-limited
 */
export const generateWithFallback = async (prompt, options = {}) => {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const modelName of models) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        ...options,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const msg = err.message || '';
      const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && modelName === PRIMARY_MODEL) {
        console.log(`⚠️  ${PRIMARY_MODEL} rate-limited, trying ${FALLBACK_MODEL}...`);
        continue;
      }
      throw err;
    }
  }
};

export default getGenAI;
