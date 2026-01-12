// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Gemini model configurations - using correct API model names
export const GEMINI_MODELS = {
  'gemini-3-pro-preview': {
    name: 'Gemini 3 Pro Preview',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
    dailyLimit: 1000,
    description: 'Latest preview model - 1,000 requests/day'
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    dailyLimit: 1000,
    description: 'Fast & efficient - 1,000 requests/day'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    dailyLimit: 50,
    description: 'Higher quality - 50 requests/day'
  }
};

// Default model
export const DEFAULT_MODEL = 'gemini-3-pro-preview';

// Validate API configuration
const validateApiConfig = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set your API key in src/utils/geminiApi.js');
  }
};

// Convert image to base64
const convertImageToBase64 = (imageOrFile) => {
  return new Promise((resolve, reject) => {
    // Handle both File objects and image objects with file property
    let file;
    if (imageOrFile instanceof File) {
      file = imageOrFile;
    } else if (imageOrFile && imageOrFile.file instanceof File) {
      file = imageOrFile.file;
    } else {
      reject(new Error('Invalid file object: expected File or image object with file property'));
      return;
    }

    // Validate that we have a proper File/Blob
    if (!(file instanceof File) && !(file instanceof Blob)) {
      reject(new Error('Invalid file type: expected File or Blob object'));
      return;
    }

    const reader = new FileReader();
    const timeout = setTimeout(() => {
      reader.abort();
      reject(new Error('Image conversion timeout'));
    }, 10000);

    reader.onload = () => {
      clearTimeout(timeout);
      try {
        const result = reader.result.split(',')[1];
        if (!result) {
          throw new Error('Failed to convert image to base64');
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to read image file'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

// Generate metadata for a single image using Gemini Multimodal
export const generateImageMetadata = async (imageFile, selectedModel = DEFAULT_MODEL, availableModels = Object.keys(GEMINI_MODELS), platformId = 'shutterstock') => {
  // Validate inputs
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Validate selected model exists
  if (!GEMINI_MODELS[selectedModel]) {
    console.warn(`Invalid model "${selectedModel}", falling back to "${DEFAULT_MODEL}"`);
    selectedModel = DEFAULT_MODEL;
  }

  // Filter available models to only include valid ones
  availableModels = availableModels.filter(model => GEMINI_MODELS[model]);

  if (!selectedModel || !GEMINI_MODELS[selectedModel]) {
    throw new Error(`Invalid model: ${selectedModel}`);
  }

  try {
    // Validate API configuration
    validateApiConfig();

    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    
    // Construct the comprehensive prompt for the specified platform
    const prompt = `You are generating metadata for stock photography content. 
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

Target platform: ${platformId === 'adobe_stock' ? 'Adobe Stock' : 'Shutterstock'}`;

    // Try models in order of preference
    let response;
    let lastError;

    // API request timeout (30 seconds)
    const API_TIMEOUT_MS = 30000;

    for (const modelKey of availableModels) {
      const currentModel = GEMINI_MODELS[modelKey];

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      try {
        console.log('Attempting API call to:', currentModel.endpoint);
        console.log('API Key present:', !!GEMINI_API_KEY, 'Length:', GEMINI_API_KEY?.length);

        response = await fetch(`${currentModel.endpoint}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: imageFile.type,
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 32,
              topP: 1,
              maxOutputTokens: 1024,
            }
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });

          // Handle 429 Rate Limit specifically
          if (response.status === 429) {
            let retryAfterSeconds = 60; // Default to 60 seconds

            // Try to parse retry-after from response
            try {
              const errorJson = JSON.parse(errorText);
              // Look for retryDelay in the error response
              if (errorJson.error?.details) {
                for (const detail of errorJson.error.details) {
                  if (detail.retryDelay) {
                    // Parse "43s" format
                    const match = detail.retryDelay.match(/(\d+)s/);
                    if (match) {
                      retryAfterSeconds = parseInt(match[1], 10);
                    }
                  }
                }
              }
            } catch (parseErr) {
              // Use default retry time if parsing fails
            }

            const rateLimitError = new Error(`Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`);
            rateLimitError.isRateLimit = true;
            rateLimitError.retryAfterSeconds = retryAfterSeconds;
            rateLimitError.statusCode = 429;
            throw rateLimitError;
          }

          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        break; // Success, exit the loop
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort/timeout specifically
        if (error.name === 'AbortError') {
          console.error(`Model ${modelKey} timed out after ${API_TIMEOUT_MS}ms`);
          lastError = new Error(`Request timed out after ${API_TIMEOUT_MS / 1000} seconds`);
        } else {
          console.error(`Model ${modelKey} failed:`, error);
          lastError = error;
        }
        continue; // Try next model
      }
    }

    if (!response) {
      const errorMessage = lastError?.message || 'All AI models failed to respond';
      console.error('All models failed:', lastError);
      throw new Error(`API Error: ${errorMessage}. Please check your API key and try again.`);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('API Response Status:', response.status);
      console.log('API Response Text (first 500 chars):', responseText.substring(0, 500));

      // Check if response is empty
      if (!responseText || responseText.trim() === '') {
        throw new Error('API returned empty response. Please check your API key.');
      }

      // Try to parse as JSON
      try {
        data = JSON.parse(responseText);
        console.log('Parsed API response successfully');
      } catch (parseError) {
        // Check for common error patterns in the response
        if (responseText.includes('API key')) {
          throw new Error('Invalid API key. Please check your REACT_APP_GEMINI_API_KEY in .env file.');
        }
        if (responseText.includes('quota') || responseText.includes('rate limit')) {
          throw new Error('API quota exceeded or rate limited. Please try again later.');
        }
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          throw new Error('API returned HTML instead of JSON. This usually means an authentication or configuration error.');
        }
        console.error('Failed to parse API response:', responseText.substring(0, 500));
        throw new Error(`API returned invalid JSON. Response preview: ${responseText.substring(0, 100)}...`);
      }
    } catch (fetchError) {
      console.error('Error reading API response:', fetchError);
      throw fetchError;
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in API response:', data);
      throw new Error('API Error: No content generated. The AI model may be unavailable or overloaded.');
    }

    const candidate = data.candidates[0];
    const finishReason = candidate.finishReason;
    
    if (finishReason === 'SAFETY') {
      throw new Error('Content blocked by safety filters. Please try a different image.');
    } else if (finishReason === 'RECITATION') {
      throw new Error('Content blocked due to recitation policy. Please try a different image.');
    } else if (finishReason === 'OTHER') {
      throw new Error('Content generation failed for unknown reasons. Please try again.');
    }

    const generatedText = candidate.content.parts[0].text;
    if (!generatedText) {
      console.error('No text content in API response:', candidate);
      throw new Error('API Error: No text content generated. The AI model may have failed to process the image.');
    }

    // Parse the JSON response
    try {
      // Clean the response text to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON pattern found in AI response');
        throw new Error('AI Response Error: No valid JSON found in the response. The AI may not have followed the format instructions.');
      }

      const metadata = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the metadata based on platform
      // Handle both old format (lowercase) and new format (capitalized) field names
      if (platformId === 'adobe_stock') {
        const title = metadata.Title || metadata.title;
        const keywords = metadata.Keywords || metadata.keywords;
        const category = metadata.Category || metadata.category;
        const releases = metadata.Releases || metadata.releases;
        
        const hasEmptyFields = !title || !keywords;
        return {
          filename: imageFile.name,
          title: title || '[FALLBACK] No title available - please edit manually',
          keywords: keywords || '[FALLBACK] Please add relevant keywords manually',
          category: category || '[FALLBACK] Please select category',
          releases: releases || '[FALLBACK] Please specify releases if needed',
          ...(hasEmptyFields && {
            error: true,
            errorType: 'incomplete_data',
            message: 'AI returned incomplete metadata. Please review and edit manually.'
          })
        };
      } else {
        // Default Shutterstock format
        const description = metadata.Description || metadata.description;
        const keywords = metadata.Keywords || metadata.keywords;
        const categories = metadata.Categories || metadata.categories;
        const editorial = metadata.Editorial || metadata.editorial;
        
        const hasEmptyFields = !description || !keywords;
        return {
          filename: imageFile.name,
          description: description || '[FALLBACK] No description available - please edit manually',
          keywords: keywords || '[FALLBACK] Please add relevant keywords manually',
          categories: categories || '[FALLBACK] Miscellaneous',
          editorial: editorial === 'yes' ? 'yes' : 'no',
          matureContent: 'no', // Always no as per requirements
          illustration: 'no',   // Always no as per requirements
          ...(hasEmptyFields && {
            error: true,
            errorType: 'incomplete_data',
            message: 'AI returned incomplete metadata. Please review and edit manually.'
          })
        };
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', generatedText);
      
      // Try to extract information from the text even if JSON parsing fails
      try {
        const lines = generatedText.split('\n');
        
        if (platformId === 'adobe_stock') {
          let title = 'AI-generated stock photo title';
          let keywords = 'Please add relevant keywords manually';
          let category = '';
          let releases = '';
          
          // Look for title patterns
          for (const line of lines) {
            if (line.toLowerCase().includes('title') && line.includes(':')) {
              const titleMatch = line.split(':')[1]?.trim();
              if (titleMatch && titleMatch.length > 5) {
                title = titleMatch.replace(/['"]/g, '');
                break;
              }
            }
          }
          
          // Look for keywords patterns
          for (const line of lines) {
            if (line.toLowerCase().includes('keyword') && line.includes(':')) {
              const keywordMatch = line.split(':')[1]?.trim();
              if (keywordMatch && keywordMatch.length > 5) {
                keywords = keywordMatch.replace(/['"]/g, '');
                break;
              }
            }
          }
          
          // Look for category patterns
          for (const line of lines) {
            if (line.toLowerCase().includes('category') && line.includes(':')) {
              const catMatch = line.split(':')[1]?.trim();
              if (catMatch && catMatch.length > 0) {
                category = catMatch.replace(/['"]/g, '');
                break;
              }
            }
          }
          
          // Look for releases patterns
          for (const line of lines) {
            if (line.toLowerCase().includes('release') && line.includes(':')) {
              const relMatch = line.split(':')[1]?.trim();
              if (relMatch && relMatch.length > 0) {
                releases = relMatch.replace(/['"]/g, '');
                break;
              }
            }
          }
          
          return {
            filename: imageFile.name,
            title: title.includes('AI-generated') ? title : `[PARTIAL] ${title}`,
            keywords: keywords.includes('Please add relevant keywords') ? keywords : `[PARTIAL] ${keywords}`,
            category: category || '[PARTIAL] Please select category',
            releases: releases || '[PARTIAL] Please specify releases if needed',
            error: true,
            errorType: 'partial_parsing',
            message: 'AI response partially parsed. Please review and edit metadata.'
          };
        } else {
          // Default Shutterstock fallback
          let description = 'AI-generated stock photo description';
          let keywords = 'Please add relevant keywords manually';
          let categories = 'Miscellaneous';
          let editorial = 'no';
        
          // Look for description patterns
          for (const line of lines) {
            if (line.toLowerCase().includes('description') && line.includes(':')) {
              const descMatch = line.split(':')[1]?.trim();
              if (descMatch && descMatch.length > 5) {
                description = descMatch.replace(/['"]/g, '');
              }
            }
            if (line.toLowerCase().includes('keywords') && line.includes(':')) {
              const keyMatch = line.split(':')[1]?.trim();
              if (keyMatch && keyMatch.length > 5) {
                keywords = keyMatch.replace(/['"]/g, '');
              }
            }
            if (line.toLowerCase().includes('categories') && line.includes(':')) {
              const catMatch = line.split(':')[1]?.trim();
              if (catMatch && catMatch.length > 5) {
                categories = catMatch.replace(/['"]/g, '');
              }
            }
            if (line.toLowerCase().includes('editorial') && line.includes(':')) {
              const editMatch = line.split(':')[1]?.trim();
              if (editMatch && editMatch.toLowerCase().includes('yes')) {
                editorial = 'yes';
              }
            }
          }
          
          return {
            filename: imageFile.name,
            description: description.includes('AI-generated') ? description : `[PARTIAL] ${description}`,
            keywords: keywords.includes('Please add relevant keywords') ? keywords : `[PARTIAL] ${keywords}`,
            categories: categories === 'Miscellaneous' ? '[PARTIAL] Miscellaneous' : `[PARTIAL] ${categories}`,
            editorial: editorial,
            matureContent: 'no',
            illustration: 'no',
            error: true,
            errorType: 'partial_parsing',
            message: 'AI response partially parsed. Please review and edit metadata.'
          };
        }
      } catch (extractError) {
        console.error('Error extracting from text:', extractError);
        
        // Final fallback metadata - clearly marked as fallback
        if (platformId === 'adobe_stock') {
          return {
            filename: imageFile.name,
            title: '[FALLBACK] Unable to generate title - please edit manually',
            keywords: '[FALLBACK] Please add relevant keywords manually',
            category: '[FALLBACK] Please select category',
            releases: '[FALLBACK] Please specify releases if needed',
            error: true,
            errorType: 'parsing_failed',
            message: 'AI response could not be parsed. Please edit metadata manually.'
          };
        } else {
          return {
            filename: imageFile.name,
            description: '[FALLBACK] Unable to generate description - please edit manually',
            keywords: '[FALLBACK] Please add relevant keywords manually',
            categories: '[FALLBACK] Miscellaneous',
            editorial: 'no',
            matureContent: 'no',
            illustration: 'no',
            error: true,
            errorType: 'parsing_failed',
            message: 'AI response could not be parsed. Please edit metadata manually.'
          };
        }
      }
    }
  } catch (error) {
    console.error(`Error generating metadata for ${imageFile.name}:`, error);
    console.error('Error details:', {
      filename: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      errorMessage: error.message,
      errorStack: error.stack
    });
    
    // Determine error type and provide appropriate fallback
    let errorType = 'unknown';
    let userMessage = error.message || 'An unexpected error occurred';
    let retryAfterSeconds = null;

    // Handle rate limit errors specifically
    if (error.isRateLimit || error.statusCode === 429) {
      errorType = 'rate_limit';
      retryAfterSeconds = error.retryAfterSeconds || 60;
      userMessage = `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds and try again.`;
    } else if (error.message.includes('API key')) {
      errorType = 'api_key';
      userMessage = 'API key not configured. Please set your Gemini API key.';
    } else if (error.message.includes('safety') || error.message.includes('blocked')) {
      errorType = 'safety';
      userMessage = 'Image blocked by safety filters. Please try a different image.';
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
      userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      errorType = 'rate_limit';
      userMessage = 'API quota exceeded. Please wait a minute and try again.';
      retryAfterSeconds = 60;
    }

    // Return error metadata
    return {
      filename: imageFile.name,
      error: true,
      errorType: errorType,
      message: userMessage,
      originalError: error.message,
      ...(retryAfterSeconds && { retryAfterSeconds })
    };
  }
};

// Generate metadata for multiple images
// isCancelledFn is an optional function that returns true if processing should be cancelled
export const generateMultipleImageMetadata = async (images, progressCallback, selectedModel = DEFAULT_MODEL, availableModels = Object.keys(GEMINI_MODELS), platformId = 'shutterstock', isCancelledFn = null) => {
  const results = [];

  for (let i = 0; i < images.length; i++) {
    // Check if cancelled before processing each image
    if (isCancelledFn && isCancelledFn()) {
      // Mark remaining images as cancelled
      for (let j = i; j < images.length; j++) {
        results.push({
          filename: images[j].name,
          error: true,
          errorType: 'cancelled',
          message: 'Processing was cancelled',
          originalError: 'User cancelled'
        });
      }
      break;
    }

    const file = images[i];

    try {
      progressCallback(i + 1, images.length, file.name);
      const metadata = await generateImageMetadata(file, selectedModel, availableModels, platformId);
      results.push(metadata);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      results.push({
        filename: file.name,
        error: true,
        errorType: 'processing',
        message: error.message || 'Failed to process image',
        originalError: error.message
      });
    }
  }

  return results;
};

// Retry generating metadata for a specific image
export const retryImageMetadata = async (imageFile, selectedModel = DEFAULT_MODEL, availableModels = Object.keys(GEMINI_MODELS), platformId = 'shutterstock') => {
  return generateImageMetadata(imageFile, selectedModel, availableModels, platformId);
};
