// Copy the working parts from the original file
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Debug API key loading
console.log('API Key Debug:', {
  hasApiKey: !!GEMINI_API_KEY,
  keyLength: GEMINI_API_KEY?.length || 0,
  keyPrefix: GEMINI_API_KEY?.substring(0, 10) || 'none',
  allEnvVars: Object.keys(process.env).filter(key => key.includes('GEMINI'))
});

// Gemini model configurations
export const GEMINI_MODELS = {
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash-Lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    dailyLimit: 1000,
    description: 'Best option - 1,000 requests/day'
  },
  'gemini-2.0-flash-lite': {
    name: 'Gemini 2.0 Flash-Lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    dailyLimit: 1000,
    description: 'Second best - 1,000 requests/day'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    dailyLimit: 50,
    description: 'Higher quality - 50 requests/day'
  }
};

// Default model
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

// Validate API configuration
const validateApiConfig = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set your API key in src/utils/geminiApi.js');
  }
};

// Convert image to base64
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
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
  console.log('generateImageMetadata called with:', {
    imageFile: imageFile?.name,
    selectedModel,
    availableModels,
    platformId
  });
  
  // Validate inputs
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  if (!selectedModel || !GEMINI_MODELS[selectedModel]) {
    throw new Error(`Invalid model: ${selectedModel}`);
  }

  try {
    // Validate API configuration
    validateApiConfig();

    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    
    // Construct the prompt based on platform
    console.log('Generating prompt for platform:', platformId);
    let prompt;
    if (platformId === 'adobe_stock') {
      prompt = `Analyze this image and generate metadata for Adobe Stock. Provide a JSON response with the following fields:
- title: A short, descriptive title (max 200 characters)
- keywords: Comma-separated keywords (max 49 keywords)
- category: Numeric category ID (1-21 from Adobe Stock categories)
- releases: Any model releases or property releases needed

Categories: 1=Animals, 2=Buildings and Architecture, 3=Business, 4=Drinks, 5=The Environment, 6=States of Mind, 7=Food, 8=Graphic Resources, 9=Hobbies and Leisure, 10=Industry, 11=Landscapes, 12=Lifestyle, 13=People, 14=Plants and Flowers, 15=Culture and Religion, 16=Science, 17=Social Issues, 18=Sports, 19=Technology, 20=Transport, 21=Travel

Consider the location from the filename if available. Return only valid JSON.`;
    } else {
      prompt = `Analyze this image and generate metadata for Shutterstock. Provide a JSON response with the following fields:
- description: A short sentence (6-12 words, no commas, proper grammar, includes subject, action, location)
- keywords: Comma-separated keywords (7-50 keywords, ordered by relevance, mix of subjects, actions, locations, concepts, buyer-intent phrases)
- categories: 1-2 categories from Shutterstock's official list
- editorial: "yes" if image shows people, logos, brands, events, landmarks, public figures; otherwise "no"

Categories: Abstract, Animals/Wildlife, Arts, Backgrounds/Textures, Beauty/Fashion, Buildings/Landmarks, Business/Finance, Celebrities, Education, Food and drink, Healthcare/Medical, Holidays, Industrial, Interiors, Miscellaneous, Nature, Objects, Parks/Outdoor, People, Religion, Science, Signs/Symbols, Sports/Recreation, Technology, Transportation, Vintage

Consider the location from the filename if available. Return only valid JSON.`;
    }

    // Try models in order of preference
    let response;
    let lastError;
    
    for (const modelKey of availableModels) {
      const currentModel = GEMINI_MODELS[modelKey];
      
      try {
        console.log(`Trying model: ${modelKey}`);
        
        response = await fetch(`${currentModel.endpoint}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        break; // Success, exit the loop
      } catch (error) {
        console.error(`Model ${modelKey} failed:`, error);
        lastError = error;
        continue; // Try next model
      }
    }

    if (!response) {
      throw lastError || new Error('All models failed');
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(`Failed to parse response: ${jsonError.message}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates in response');
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
      throw new Error('No content generated from Gemini API');
    }

    console.log('Generated text:', generatedText);

    // Parse the JSON response
    try {
      // Clean the response text to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON pattern found in:', generatedText);
        throw new Error('No JSON found in response');
      }
      
      console.log('Extracted JSON:', jsonMatch[0]);
      const metadata = JSON.parse(jsonMatch[0]);
      console.log('Parsed metadata:', metadata);
      
      // Validate and clean the metadata based on platform
      if (platformId === 'adobe_stock') {
        return {
          filename: imageFile.name,
          title: metadata.title || 'No title available',
          keywords: metadata.keywords || 'stock, photo, image',
          category: metadata.category || '',
          releases: metadata.releases || ''
        };
      } else {
        // Default Shutterstock format
        return {
          filename: imageFile.name,
          description: metadata.description || 'No description available',
          keywords: metadata.keywords || 'stock, photo, image',
          categories: metadata.categories || 'Miscellaneous',
          editorial: metadata.editorial === 'yes' ? 'yes' : 'no',
          matureContent: 'no', // Always no as per requirements
          illustration: 'no'   // Always no as per requirements
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
          let keywords = 'stock, photo, image, professional, high-quality';
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
            title,
            keywords,
            category,
            releases
          };
        } else {
          // Default Shutterstock fallback
          let description = 'AI-generated stock photo description';
          let keywords = 'stock, photo, image, professional, high-quality';
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
            description: description,
            keywords: keywords,
            categories: categories,
            editorial: editorial,
            matureContent: 'no',
            illustration: 'no'
          };
        }
      } catch (extractError) {
        console.error('Error extracting from text:', extractError);
        
        // Final fallback metadata
        if (platformId === 'adobe_stock') {
          return {
            filename: imageFile.name,
            title: 'AI-generated stock photo title',
            keywords: 'stock, photo, image, professional, high-quality',
            category: '',
            releases: ''
          };
        } else {
          return {
            filename: imageFile.name,
            description: 'AI-generated stock photo description',
            keywords: 'stock, photo, image, professional, high-quality',
            categories: 'Miscellaneous',
            editorial: 'no',
            matureContent: 'no',
            illustration: 'no'
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
    
    if (error.message.includes('API key')) {
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
    }
    
    // Return error metadata
    return {
      filename: imageFile.name,
      error: true,
      errorType: errorType,
      message: userMessage,
      originalError: error.message
    };
  }
};

// Generate metadata for multiple images
export const generateMultipleImageMetadata = async (images, progressCallback, selectedModel = DEFAULT_MODEL, availableModels = Object.keys(GEMINI_MODELS), platformId = 'shutterstock') => {
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
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
  console.log(`Retrying metadata generation for: ${imageFile.name} with model: ${selectedModel}`);
  return generateImageMetadata(imageFile, selectedModel, availableModels, platformId);
};
