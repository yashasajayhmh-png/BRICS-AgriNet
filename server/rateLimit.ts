import rateLimit, { Options } from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Custom handler that formats 429 Rate Limit responses uniformly with BRICS AgriNet API standards
 */
function createRateLimitHandler(customErrorMessage: string) {
  return (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: customErrorMessage,
      retryAfterSeconds: Math.ceil(((req as any).rateLimit?.resetTime?.getTime() - Date.now()) / 1000) || 60,
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * 1. General API rate limiter for standard database reads and metadata endpoints
 * 300 requests per 15 minutes per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many requests to BRICS AgriNet API. Please slow down and try again later."),
});

/**
 * 2. Auth limiter for login, register, and token endpoints
 * 40 requests per 15 minutes per IP to prevent credential brute-forcing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many authentication requests. Please try again after 15 minutes."),
});

/**
 * 3. Gemini-calling AI Endpoints Limiter
 * Applied across all LLM inference endpoints (/api/agent/*)
 * 25 requests per minute per IP / token
 */
export const geminiAiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 25, // 25 LLM inference calls / min
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Gemini AI inference rate limit exceeded (max 25 requests/min). Please wait a moment before sending additional queries."
  ),
});

/**
 * 4. Multimodal Vision Limiter
 * Applied specifically to large multimodal image diagnosis endpoints (/api/agent/diagnose-crop)
 * 12 requests per minute per IP / token to protect bandwidth & token quotas
 */
export const geminiVisionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 12, // 12 high-resolution image vision analyses / min
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Multimodal crop photo diagnosis rate limit reached (max 12 image scans/min). Please wait 60 seconds before uploading more leaf samples."
  ),
});

/**
 * 5. Federated Round Coordinator Limiter
 * Applied to resource-intensive cross-silo aggregation rounds
 * 15 requests per minute
 */
export const federatedRoundLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Federated aggregation round limit reached. Please wait before executing subsequent global consensus rounds."
  ),
});
