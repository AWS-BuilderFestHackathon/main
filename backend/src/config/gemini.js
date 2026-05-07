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

// Model fallback chain — try each in order when rate-limited
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

// Reduced retries — fail fast if quota is fully exhausted (limit: 0)
const MAX_RETRIES = 2;

export const getGeminiModel = (modelName) => {
  return getGenAI().getGenerativeModel({ model: modelName || MODEL_CHAIN[0] });
};

/**
 * Check if an error is a rate-limit / quota error
 */
const isRateLimitError = (err) => {
  const msg = (err.message || '') + (err.status || '');
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Too Many Requests')
  );
};

/**
 * Check if quota is fully exhausted (limit: 0 = account-level block, not temporary)
 */
const isQuotaFullyExhausted = (err) => {
  const msg = err.message || '';
  return msg.includes('limit: 0');
};

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Try primary model, fall back to secondary/tertiary if rate-limited.
 * If quota is fully exhausted (limit: 0), skip retries — they won't help.
 */
export const generateWithFallback = async (prompt, options = {}) => {
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = getGenAI().getGenerativeModel({
          model: modelName,
          ...options,
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;

        if (isRateLimitError(err)) {
          // If limit is 0, don't waste time retrying — move to next model immediately
          if (isQuotaFullyExhausted(err)) {
            console.log(`❌ ${modelName} quota fully exhausted (limit: 0), trying next model...`);
            break;
          }

          // Temporary rate limit — wait and retry
          const delay = Math.min(3000 * (attempt + 1), 10000);
          console.log(
            `⚠️  ${modelName} rate-limited (attempt ${attempt + 1}/${MAX_RETRIES}), ` +
            `retrying in ${(delay / 1000).toFixed(1)}s...`
          );
          await sleep(delay);
          continue;
        }

        // Non-rate-limit error — throw immediately
        throw err;
      }
    }
  }

  // All models + retries exhausted — give a helpful error
  const err = new Error(
    'AI service temporarily unavailable. Your Gemini API quota may be exhausted. ' +
    'Please enable billing on your Google Cloud project or try again later.'
  );
  err.statusCode = 503;
  throw err;
};

/**
 * Chat-based generation with fallback (for solveDoubt etc.)
 * Same fast-fail logic for quota exhaustion.
 */
export const chatWithFallback = async (history, message, chatOptions = {}) => {
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = getGenAI().getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history,
          generationConfig: { maxOutputTokens: 2048, ...chatOptions },
        });
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch (err) {
        lastError = err;

        if (isRateLimitError(err)) {
          if (isQuotaFullyExhausted(err)) {
            console.log(`❌ Chat ${modelName} quota fully exhausted (limit: 0), trying next model...`);
            break;
          }

          const delay = Math.min(3000 * (attempt + 1), 10000);
          console.log(
            `⚠️  Chat ${modelName} rate-limited (attempt ${attempt + 1}/${MAX_RETRIES}), ` +
            `retrying in ${(delay / 1000).toFixed(1)}s...`
          );
          await sleep(delay);
          continue;
        }

        throw err;
      }
    }
  }

  const err = new Error(
    'AI service temporarily unavailable. Your Gemini API quota may be exhausted. ' +
    'Please enable billing on your Google Cloud project or try again later.'
  );
  err.statusCode = 503;
  throw err;
};

export default getGenAI;
