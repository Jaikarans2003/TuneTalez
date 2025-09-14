// Gemini API service for generating images and text

const GEMINI_API_KEY = 'AIzaSyAP71Z4Z6zp09uqTksJeVCNs4v0OU4xO10';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image-preview';
const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-lite';
const IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generate an image using Gemini API based on a text prompt
 * @param prompt Text prompt to generate image from
 * @returns URL of the generated image as a base64 data URL
 */
export async function generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    // Enhance the prompt to specify book cover requirements
    const enhancedPrompt = `Create a high-quality, artistic image with a 9:16 aspect ratio (portrait orientation) based on this description: ${prompt}. 
    The image should be visually appealing and relevant to the description.
    IMPORTANT: Do NOT include any text, titles, or words in the image. 
    Create only a plain visual representation with appropriate visual elements, colors, and styling that match the theme.
    Make it suitable as a book thumbnail that stands out on a digital platform.`;
    
    const response = await fetch(IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the image data from the response
    const imageData = data.candidates[0].content.parts.find(
      (part: any) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (!imageData) {
      throw new Error('No image was generated');
    }

    // Return the base64 data URL
    return `data:${imageData.inlineData.mimeType};base64,${imageData.inlineData.data}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Convert a base64 data URL to a File object
 * @param dataUrl Base64 data URL of the image
 * @param filename Name to give the file
 * @returns File object created from the data URL
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Generate a concise summary from a longer description using Gemini API
 * @param description The original book description
 * @returns A concise summary of the description
 */
export async function generateConciseSummary(description: string): Promise<string> {
  try {
    const prompt = `Create a concise summary (maximum 50 words) of the following book description. 
    Focus on the core theme and most important elements. The summary should be visually descriptive 
    and suitable for generating an image:
    
    ${description}`;
    
    const response = await fetch(TEXT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const summaryText = data.candidates[0].content.parts[0].text;
    return summaryText.trim();
  } catch (error) {
    console.error('Error generating concise summary:', error);
    throw error;
  }
}
