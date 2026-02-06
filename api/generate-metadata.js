/**
 * Vercel Serverless Function: Generate Metadata
 *
 * Proxies requests to Google Gemini API, keeping the API key server-side.
 * This prevents API key exposure in client-side code.
 *
 * Security Features:
 * - API key stored server-side only
 * - Rate limiting per IP (30 req/min)
 * - Input validation for all parameters
 * - Request size validation (5MB max)
 *
 * PRODUCTION NOTE: Rate limiting requires Upstash Redis configuration.
 */

import { checkRateLimit, getClientIp, rateLimitConfig } from './_utils/rateLimit.js';

// Gemini model configurations
const GEMINI_MODELS = {
  'gemini-3-flash-preview': {
    name: 'Gemini 3 Flash Preview',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
    dailyLimit: 1000
  },
  'gemini-3-flash': {
    name: 'Gemini 3 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent',
    dailyLimit: 1000
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    dailyLimit: 1000
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    dailyLimit: 1000
  }
};

const DEFAULT_MODEL = 'gemini-3-flash-preview';

// Request size limit (5MB to account for base64 overhead)
const MAX_REQUEST_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;


/**
 * Build the prompt for metadata generation
 */
function buildPrompt(platformId) {
  return `You are generating metadata for stock photography content.
The user will specify whether the target platform is Shutterstock or Adobe Stock.
Your metadata must strictly follow all rules for the chosen platform, and produce CSV-ready structured data that helps maximize sales.

====================
GENERAL SAFETY RULES
====================
- All output must be accurate, factual, professional, and free of offensive, derogatory, culturally insensitive, or trademarked brand names (unless editorial and legally permitted).
- Never guess or assume identity (ethnicity, religion, brand, person) unless clearly identifiable and allowed.
- Metadata must directly match the content of the image and, where relevant, information such as location in the filename.

=======================
TITLE / DESCRIPTION RULES
=======================
- Write in clear, natural English with correct grammar and capitalization.
- Capitalize the first word and all proper nouns. Do not use ALL CAPS.
- Avoid generic adjectives like "beautiful," "amazing," "stunning." Focus on factual content.
- Keep titles:
  - Shutterstock: 5–10 words (about 6–12 is ideal).
  - Adobe Stock: concise, under ~70 characters.
- If the filename includes a location (city, country, or date), extract and use it in the title and keywords.
- Editorial images: description must follow this format:
  "City, State/Country – Month Day Year: Description"

Example:
Filename: 308-2-Kathmandu-Nepal-2024.JPG
Title: "Traditional Nepalese momos served in Kathmandu, Nepal"

================
KEYWORD RULES
================
- Shutterstock: 7–50 unique keywords.
- Adobe Stock: up to 49 keywords.
- Order keywords by relevance; the **first 10 are the most important**.
- Keywords must be buyer-friendly, high-traffic, and reflect **real-world search queries** used on stock photo platforms.
- Always prioritize **specific subject keywords first**, then context (location, activity), then broader concepts.
- Include synonyms, plural/singular variations, and regional terms if relevant.
- Always include location names if in filename.
- Do not repeat words unnecessarily.
- Do not include offensive, irrelevant, or trademarked terms.

=====================
SEO OPTIMIZATION RULES
=====================
- Write metadata to match **what buyers type in search bars**, not just what you see.
- Use **high-traffic, commercially relevant keywords**. For example:
  - Instead of "tranquil meadow," prefer "green field, mountain landscape, river valley."
  - Instead of "delicious dumplings," use "Nepalese momos, Asian street food, Kathmandu market."
- Include **both common terms and specific regional terms** if relevant (e.g., "soccer" and "football").
- For food, include cuisine type (e.g., "Nepalese cuisine, Asian food, street food").
- For animals, include species name + generic name (e.g., "Indian rhinoceros, rhino, wildlife Nepal").
- For cities/locations, include **city + country** together (e.g., "Kathmandu Nepal").
- Place the **highest-traffic, most relevant terms in the first 10 keyword slots**.

================
CATEGORY RULES
================
- Use only official categories from the chosen platform.
- **Shutterstock categories**:
  ["Abstract", "Animals/Wildlife", "Arts", "Backgrounds/Textures", "Beauty/Fashion",
   "Buildings/Landmarks", "Business/Finance", "Celebrities", "Education", "Food and drink",
   "Healthcare/Medical", "Holidays", "Industrial", "Interiors", "Miscellaneous", "Nature",
   "Objects", "Parks/Outdoor", "People", "Religion", "Science", "Signs/Symbols",
   "Sports/Recreation", "Technology", "Transportation", "Vintage"]

- **Adobe Stock categories**:
  ["Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment",
   "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", "Industry",
   "Landscape", "Lifestyle", "People", "Plants and Flowers", "Culture and Religion",
   "Science", "Social Issues", "Sports", "Technology", "Transport", "Travel"]

========================
EDITORIAL / OTHER FIELDS
========================
- Editorial: "yes" if image contains public figures, logos, recognizable events/landmarks, or newsworthy content; otherwise "no".
- Mature content: always "no" unless explicitly required.
- Illustration: always "no" unless the asset is an illustration.
- Adobe Stock CSV note: Filename must include extension and be ≤ 30 characters. CSV max 5000 rows, ≤ 1 MB.

==================
OUTPUT FORMAT
==================
Always return structured JSON (ready for CSV export) with these exact fields:

${platformId === 'adobe_stock' ? `{
  "Filename": "example.jpg",
  "Title": "Concise factual title with proper capitalization",
  "Keywords": "keyword1, keyword2, keyword3",
  "Category": "CategoryName",
  "Releases": "Any model releases or property releases needed"
}` : `{
  "Filename": "example.jpg",
  "Description": "Concise factual description with proper capitalization",
  "Keywords": "keyword1, keyword2, keyword3",
  "Categories": "CategoryName",
  "Editorial": "yes/no",
  "Mature content": "no",
  "Illustration": "no"
}`}

- Ensure headers and field names match the required CSV format for the chosen platform.
- Ensure all metadata complies with platform word/character/keyword count limits.
- Reject any category not in the official list.
- Respond with a single JSON object and nothing else. Do not include markdown, code fences, or extra commentary.
- Output must be valid JSON (double quotes for keys/values, no trailing commas).

Target platform: ${platformId === 'adobe_stock' ? 'Adobe Stock' : 'Shutterstock'}`;
}

async function callGemini({ apiKey, modelConfig, prompt, generationConfig }) {
  const response = await fetch(modelConfig.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: generationConfig.mimeType,
              data: generationConfig.imageBase64
            }
          }
        ]
      }],
      generationConfig: generationConfig.config
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 429) {
      let retryAfterSeconds = 60;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.details) {
          for (const detail of errorJson.error.details) {
            if (detail.retryDelay) {
              const match = detail.retryDelay.match(/(\d+)s/);
              if (match) {
                retryAfterSeconds = parseInt(match[1], 10);
              }
            }
          }
        }
      } catch (e) {
        // Use default
      }

      return {
        errorResponse: {
          status: 429,
          payload: {
            error: `Gemini API rate limit exceeded. Please wait ${retryAfterSeconds} seconds.`,
            errorType: 'rate_limit',
            retryAfterSeconds
          }
        }
      };
    }

    console.error('Gemini API error:', response.status, errorText.substring(0, 500));
    return {
      errorResponse: {
        status: 502,
        payload: {
          error: 'AI service temporarily unavailable',
          errorType: 'api_error'
        }
      }
    };
  }

  const data = await response.json();
  return { data };
}

/**
 * Parse the Gemini API response
 */
function parseGeminiResponse(data, filename, platformId) {
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No content generated by AI model');
  }

  const candidate = data.candidates[0];
  const finishReason = candidate.finishReason;

  if (finishReason === 'SAFETY') {
    throw new Error('Content blocked by safety filters');
  } else if (finishReason === 'RECITATION') {
    throw new Error('Content blocked due to recitation policy');
  } else if (finishReason === 'OTHER') {
    throw new Error('Content generation failed');
  }

  const generatedText = candidate.content?.parts
    ?.map(part => part.text)
    ?.filter(Boolean)
    ?.join('\n');
  if (!generatedText) {
    throw new Error('No text content in response');
  }

  const trimmedText = generatedText.trim();

  if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return normalizeMetadata(parsed, filename, platformId);
      }
    } catch (error) {
      // Fall through to regex extraction
    }
  }

  // Extract JSON from response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    if (process.env.NODE_ENV === 'development') {
      console.error('No JSON object found in response:', trimmedText.slice(0, 800));
    }
    throw new Error('No valid JSON in AI response');
  }

  const metadata = JSON.parse(jsonMatch[0]);
  return normalizeMetadata(metadata, filename, platformId);
}

function normalizeMetadata(metadata, filename, platformId) {
  if (platformId === 'adobe_stock') {
    return {
      filename: filename,
      title: metadata.Title || metadata.title || '',
      keywords: metadata.Keywords || metadata.keywords || '',
      category: metadata.Category || metadata.category || '',
      releases: metadata.Releases || metadata.releases || ''
    };
  }

  return {
    filename: filename,
    description: metadata.Description || metadata.description || '',
    keywords: metadata.Keywords || metadata.keywords || '',
    categories: metadata.Categories || metadata.categories || '',
    editorial: (metadata.Editorial || metadata.editorial) === 'yes' ? 'yes' : 'no',
    matureContent: 'no',
    illustration: 'no'
  };
}

/**
 * Main handler for the serverless function
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({
      error: 'Service configuration error',
      errorType: 'config'
    });
  }

  // Rate limiting with safe IP extraction
  const clientIp = getClientIp(req);

  const rateLimit = await checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    if (rateLimit.errorType === 'config') {
      return res.status(500).json({
        error: 'Rate limiting not configured',
        errorType: 'config'
      });
    }

    res.setHeader('Retry-After', rateLimit.retryAfter || rateLimitConfig.windowSeconds);
    return res.status(429).json({
      error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter || rateLimitConfig.windowSeconds} seconds.`,
      errorType: 'rate_limit',
      retryAfterSeconds: rateLimit.retryAfter || rateLimitConfig.windowSeconds
    });
  }

  try {
    // Check request body size
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_REQUEST_SIZE_BYTES) {
      return res.status(413).json({
        error: 'Request too large. Maximum size is 5MB.',
        errorType: 'validation'
      });
    }

    const {
      imageBase64,
      mimeType,
      filename,
      model = DEFAULT_MODEL,
      platformId = 'shutterstock'
    } = req.body;

    // Validate required fields
    if (!imageBase64) {
      return res.status(400).json({
        error: 'Missing image data',
        errorType: 'validation'
      });
    }

    // Validate imageBase64 is a string and reasonable size
    if (typeof imageBase64 !== 'string' || imageBase64.length > MAX_REQUEST_SIZE_BYTES) {
      return res.status(400).json({
        error: 'Invalid image data',
        errorType: 'validation'
      });
    }

    if (!BASE64_REGEX.test(imageBase64)) {
      return res.status(400).json({
        error: 'Invalid image data encoding',
        errorType: 'validation'
      });
    }

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename',
        errorType: 'validation'
      });
    }

    // Validate filename is a string and reasonable length
    if (typeof filename !== 'string' || filename.length > 255) {
      return res.status(400).json({
        error: 'Invalid filename',
        errorType: 'validation'
      });
    }

    if (filename.includes('/') || filename.includes('\\') || filename.includes('\u0000')) {
      return res.status(400).json({
        error: 'Invalid filename format',
        errorType: 'validation'
      });
    }

    if (mimeType && (typeof mimeType !== 'string' || !ALLOWED_MIME_TYPES.has(mimeType))) {
      return res.status(400).json({
        error: 'Invalid image MIME type',
        errorType: 'validation'
      });
    }

    // Validate model
    const modelConfig = GEMINI_MODELS[model];
    if (!modelConfig) {
      return res.status(400).json({
        error: 'Invalid model specified',
        errorType: 'validation'
      });
    }

    // Validate platform
    if (!['shutterstock', 'adobe_stock'].includes(platformId)) {
      return res.status(400).json({
        error: 'Invalid platform specified',
        errorType: 'validation'
      });
    }

    const prompt = buildPrompt(platformId);
    const baseConfig = {
      temperature: 0.1,
      topK: 32,
      topP: 1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json'
    };

    const requestConfig = {
      mimeType: mimeType || 'image/jpeg',
      imageBase64,
      config: baseConfig
    };

    const attempt = await callGemini({ apiKey, modelConfig, prompt, generationConfig: requestConfig });
    if (attempt.errorResponse) {
      return res.status(attempt.errorResponse.status).json(attempt.errorResponse.payload);
    }

    const metadata = parseGeminiResponse(attempt.data, filename, platformId);

    return res.status(200).json({
      success: true,
      metadata
    });

  } catch (error) {
    console.error('Generate metadata error:', error.message);

    // Determine error type for client
    let errorType = 'unknown';
    let statusCode = 500;
    let userMessage = 'An error occurred while generating metadata';

    if (error.message.includes('safety') || error.message.includes('blocked')) {
      errorType = 'safety';
      statusCode = 422;
      userMessage = 'Image blocked by safety filters. Please try a different image.';
    } else if (error.message.includes('JSON')) {
      errorType = 'parsing';
      statusCode = 422;
      userMessage = 'Failed to parse AI response. Please try again.';
    }

    return res.status(statusCode).json({
      error: userMessage,
      errorType
    });
  }
}
