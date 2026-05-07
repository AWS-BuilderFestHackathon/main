/**
 * Wrap async route handlers to catch errors and pass to Express error handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Parse and clean a JSON string returned by Gemini (removes markdown code fences).
 */
export const parseGeminiJSON = (text) => {
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleaned);
};

/**
 * Generate a random 6-digit OTP string.
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Return Date offset by `minutes` from now.
 */
export const otpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
