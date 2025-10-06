'use client';

// OpenAI TTS API service
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const TTS_MODEL = 'gpt-4o-mini-tts';
const TEXT_MODEL = 'gpt-3.5-turbo';

// Generate audio from text using OpenAI TTS API
export const generateAudio = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        instructions: "You are a professional storyteller narrating a story for children and students. Read the following text as if you are narrating it aloud in a calm, engaging, and natural voice. Speak slowly and clearly, with natural pauses between sentences and paragraphs. Pause for atleast 3 seconds after double full stops (..). Add slight breaths and pauses where a real narrator would breathe. Include natural emphasis on important words to make the story engaging. Add subtle human-like sounds such as soft sighs or gentle coughed breaths when appropriate. Vary the intonation to make the narration expressive, not monotone. Keep the pace steady and comfortable, as if telling the story aloud in person. Avoid robotic or overly formal speech. Pause slightly after commas, and more after periods or paragraph breaks. Use storytelling style: friendly, warm, and captivating.",
        voice: 'alloy', // Default voice, can be customized
        style: "narration",
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error;
  }
};

// Extract metadata from text content using OpenAI API
export interface ContentMetadata {
  mood: string;       // e.g., "suspense", "happy", "sad", "thriller"
  genre: string;      // e.g., "mystery", "romance", "adventure"
  intensity: number;  // 1-10 scale
  tempo: string;      // e.g., "slow", "medium", "fast"
  paragraphMoods?: {  // Optional paragraph-level mood analysis
    index: number;
    text: string;
    mood: string;
    transition?: {
      from: string;
      to: string;
      intensity: number; // 1-10 scale
    }
  }[];
}

export const extractContentMetadata = async (content: string): Promise<ContentMetadata> => {
  try {
    // Split content into paragraphs for paragraph-level analysis
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const isParagraphAnalysis = paragraphs.length > 1;
    
    // Create a system prompt for the analysis
    const systemPrompt = `
      You are an expert content analyzer that extracts emotional metadata from text.
      Analyze the provided content and extract the following information:
      - mood: The primary emotional tone (e.g., suspense, happy, sad, thriller, romantic)
      - genre: The content genre (e.g., mystery, romance, adventure, sci-fi)
      - intensity: A number from 1-10 representing emotional intensity (1=calm, 10=intense)
      - tempo: The appropriate pace for narration (slow, medium, fast)
      ${isParagraphAnalysis ? `
      - paragraphMoods: An array of objects for each paragraph containing:
        - index: The paragraph number (starting from 0)
        - mood: The emotional tone of this specific paragraph
        - transition: If the mood changes from previous paragraph, include details about the transition
      ` : ''}
      
      Return ONLY a JSON object with these fields, no additional text.
    `;
    
    // Create the prompt with the content
    const userPrompt = `Analyze this content: ${content.substring(0, 8000)}`; // Limit to 8000 chars to avoid token limits
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const metadataString = data.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const metadata = JSON.parse(metadataString) as ContentMetadata;
      console.log('Extracted metadata:', metadata);
      return metadata;
    } catch (parseError) {
      console.error('Error parsing metadata JSON:', parseError);
      throw new Error('Failed to parse metadata from API response');
    }
  } catch (error) {
    console.error('Error extracting content metadata:', error);
    throw error;
  }
};

// Convert ArrayBuffer to Blob for playback or download
export const arrayBufferToBlob = (buffer: ArrayBuffer): Blob => {
  return new Blob([buffer], { type: 'audio/mpeg' });
};

// ❌ REMOVED: createAudioUrl function has been removed
// Instead, use the following pattern:
// 1. Convert ArrayBuffer to Blob using arrayBufferToBlob
// 2. Upload to Firebase Storage using uploadAudioNarration
// 3. Get HTTPS URL from the returned Firebase Storage URL
// 4. Use that URL in AudioPlayer
//
// Example:
// const audioBuffer = await generateAudio(text);
// const audioBlob = arrayBufferToBlob(audioBuffer);
// const firebaseUrl = await uploadAudioNarration(audioBlob, id);
// setAudioUrl(firebaseUrl); // This is a valid HTTPS URL
