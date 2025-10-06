'use client';

import { useState, useRef } from 'react';
import { generateAudio, arrayBufferToBlob, extractContentMetadata, ContentMetadata } from '@/services/openai';
import { uploadAudioNarration } from '@/firebase/services';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { 
  getRandomBackgroundMusicForMetadata,
  getRandomBackgroundMusicForParagraphs
} from '@/firebase/backgroundMusicService';
import { 
  stitchAudioWithBackground, 
  stitchAudioWithMultipleBackgrounds, 
  estimateParagraphTimings,
  ParagraphTiming
} from '@/utils/audioStitcher';
// Using stitchAudioWithBackground instead of processAudioWithNodeLibs

interface AudiobookProductionProps {
  text: string;
  bookId?: string;
  onSuccess?: (audioUrl: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const AudiobookProduction = ({ 
  text, 
  bookId, 
  onSuccess, 
  onError,
  className = ''
}: AudiobookProductionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('idle');
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null);
  const [segments, setSegments] = useState<{text: string, metadata: ContentMetadata}[]>([]);
  const [segmentAudios, setSegmentAudios] = useState<Blob[]>([]);
  const [finalAudio, setFinalAudio] = useState<Blob | null>(null);

  const handleGenerateAudiobook = async () => {
    if (!text.trim()) {
      setError('No text provided for audiobook');
      if (onError) onError(new Error('No text provided for audiobook'));
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setCurrentStep('segmenting-text');

      // Step 1: Split text into coherent segments (paragraphs)
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      console.log(`Identified ${paragraphs.length} paragraphs for processing`);
      
      // Step 2: Determine mood for each paragraph using OpenAI
      setCurrentStep('detecting-moods');
      const segmentsWithMetadata: {text: string, metadata: ContentMetadata}[] = [];
      
      // Process each paragraph individually to ensure distinct mood detection
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        console.log(`Analyzing paragraph ${i+1}/${paragraphs.length}...`);
        
        // Extract metadata for this paragraph with OpenAI
        const segmentMetadata = await extractContentMetadata(paragraph);
        console.log(`Paragraph ${i+1} mood detected: ${segmentMetadata.mood}`);
        
        segmentsWithMetadata.push({
          text: paragraph,
          metadata: segmentMetadata
        });
      }
      
      setSegments(segmentsWithMetadata);
      
      // Step 3: Process each paragraph separately
      setCurrentStep('processing-segments');
      const processedSegments: Blob[] = [];
      
      for (let i = 0; i < segmentsWithMetadata.length; i++) {
        const segment = segmentsWithMetadata[i];
        console.log(`Processing paragraph ${i+1}/${segmentsWithMetadata.length}...`);
        console.log(`Paragraph mood: ${segment.metadata.mood}, genre: ${segment.metadata.genre}`);
        
        // Generate narration for this paragraph using OpenAI
        console.log(`Generating narration for paragraph ${i+1}...`);
        const audioBuffer = await generateAudio(segment.text);
        const narrationBlob = arrayBufferToBlob(audioBuffer);
        console.log(`Narration generated for paragraph ${i+1}, size: ${narrationBlob.size} bytes`);
        
        // Get background music based on paragraph's mood
        console.log(`Selecting background music for paragraph ${i+1} with mood: ${segment.metadata.mood}`);
        const backgroundMusic = await getRandomBackgroundMusicForMetadata(segment.metadata);
        console.log(`Selected music: ${backgroundMusic.name} (${backgroundMusic.category})`);
        
        // Stitch narration with background music using browser audio utilities
        console.log(`Stitching narration with background music for paragraph ${i+1}...`);
        const processedSegment = await stitchAudioWithBackground(
          narrationBlob,
          backgroundMusic.url,
          { 
            backgroundVolume: 0.2, // 20% volume as specified
            crossfadeDuration: 3    // 3-second crossfade
          }
        );
        
        console.log(`Paragraph ${i+1} processing complete`);
        processedSegments.push(processedSegment);
      }
      
      setSegmentAudios(processedSegments);
      
      // Step 4: Concatenate all segments with crossfade
      setCurrentStep('concatenating-segments');
      
      // If only one segment, no need to concatenate
      let finalAudioBlob: Blob;
      if (processedSegments.length === 1) {
        finalAudioBlob = processedSegments[0];
      } else {
        // For multiple segments, we need to create paragraph timings
        // and use stitchAudioWithMultipleBackgrounds
        
        // First, create a single narration blob from all segments
        const narrationBlob = await concatenateAudioBlobs(processedSegments);
        
        // Estimate paragraph timings
        const totalDuration = await getAudioDuration(narrationBlob);
        const paragraphTimings: ParagraphTiming[] = [];
        
        let currentTime = 0;
        for (let i = 0; i < segmentsWithMetadata.length; i++) {
          const segment = segmentsWithMetadata[i];
          // Estimate duration based on text length (rough approximation)
          const segmentDuration = (segment.text.length / text.length) * totalDuration;
          
          // Calculate end time
          const endTime = currentTime + segmentDuration;
          
          // Extract mood from metadata for this segment
          const mood = segment.metadata.mood || 'neutral';
          
          // Make sure we're using the correct properties for ParagraphTiming
          paragraphTimings.push({
            index: i,
            start: currentTime,
            end: endTime,
            text: segment.text,
            mood: mood // Add mood to paragraph timing for background music selection
          });
          
          // Update current time for next segment
          currentTime = endTime;
        }
        
        // Get background music for each paragraph based on its mood
        console.log('Paragraph timings before music selection:', JSON.stringify(paragraphTimings, null, 2));
        
        const backgroundMusicByParagraph = await Promise.all(
          paragraphTimings.map(async (paragraph, index) => {
            console.log(`Selecting background music for paragraph ${index}:`, {
              paragraphIndex: paragraph.index,
              mood: paragraph.mood,
              textPreview: paragraph.text.substring(0, 50) + '...'
            });
            
            // Use the mood from paragraph timing to get appropriate background music
            if (paragraph.mood) {
              // Create a complete metadata object with required properties
              const moodMetadata: ContentMetadata = { 
                mood: paragraph.mood,
                genre: "general", // Default genre
                intensity: 5,     // Default mid-level intensity
                tempo: "medium"   // Default tempo
              };
              console.log(`Using mood "${paragraph.mood}" for paragraph ${index}`);
              try {
                const music = await getRandomBackgroundMusicForMetadata(moodMetadata);
                console.log(`Selected music for paragraph ${index}:`, {
                  url: music.url,
                  category: music.category,
                  name: music.name
                });
                return music;
              } catch (error) {
                console.error(`Error getting background music for paragraph ${index}:`, error);
                // Fallback to a default mood if the specific mood fails
                console.log(`Falling back to default background music for paragraph ${index}`);
                const fallbackMetadata: ContentMetadata = {
                  mood: "neutral",
                  genre: "general",
                  intensity: 5,
                  tempo: "medium"
                };
                const fallbackMusic = await getRandomBackgroundMusicForMetadata(fallbackMetadata);
                return fallbackMusic;
               }
            } else {
              // Fallback to the segment's metadata if no mood is available
              console.log(`No mood found for paragraph ${index}, using segment metadata`);
              const music = await getRandomBackgroundMusicForMetadata(segmentsWithMetadata[paragraph.index].metadata);
              console.log(`Selected fallback music for paragraph ${index}:`, {
                url: music.url,
                category: music.category,
                name: music.name
              });
              return music;
            }
          })
        );
        
        // Stitch with crossfade
        finalAudioBlob = await stitchAudioWithMultipleBackgrounds(
          narrationBlob,
          paragraphTimings,
          backgroundMusicByParagraph,
          { 
            backgroundVolume: 0.2, // 20% volume for background music
            crossfadeDuration: 3   // 3-second crossfade between tracks
          }
        );
      }
      
      // Set the final audio
      setFinalAudio(finalAudioBlob);
      
      // Step 5: Upload to Firebase
      setCurrentStep('uploading');
      setIsUploading(true);
      
      const finalAudioToUpload = finalAudioBlob;
      const uploadedUrl = await uploadAudioNarration(
        finalAudioToUpload,
        bookId || `audiobook_${Date.now()}`
      );
      
      // Set upload complete
      setUploadProgress(100);
      
      setAudioUrl(uploadedUrl);
      setIsUploading(false);
      setIsGenerating(false);
      
      if (onSuccess) onSuccess(uploadedUrl);
      
    } catch (err: any) {
      console.error('Error generating audiobook:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
      setIsGenerating(false);
      setIsUploading(false);
      if (onError) onError(err);
    }
  };
  
  // Helper function to concatenate audio blobs
  const concatenateAudioBlobs = async (blobs: Blob[]): Promise<Blob> => {
    if (blobs.length === 0) throw new Error('No audio blobs to concatenate');
    if (blobs.length === 1) return blobs[0];
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Decode all audio blobs
    const buffers = await Promise.all(
      blobs.map(blob => 
        blob.arrayBuffer().then(arrayBuffer => 
          audioContext.decodeAudioData(arrayBuffer)
        )
      )
    );
    
    // Calculate total duration
    const totalDuration = buffers.reduce((sum, buffer) => sum + buffer.duration, 0);
    
    // Create offline context for the total duration
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: audioContext.sampleRate * totalDuration,
      sampleRate: audioContext.sampleRate
    });
    
    // Concatenate buffers
    let currentTime = 0;
    buffers.forEach(buffer => {
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start(currentTime);
      currentTime += buffer.duration;
    });
    
    // Render audio
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to blob
    const audioData = await audioBufferToWav(renderedBuffer);
    return new Blob([audioData], { type: 'audio/wav' });
  };
  
  // Helper function to get audio duration from a blob
  const getAudioDuration = async (audioBlob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audioElement = new Audio();
      const objectUrl = URL.createObjectURL(audioBlob);
      
      audioElement.addEventListener('loadedmetadata', () => {
        const duration = audioElement.duration;
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      });
      
      audioElement.addEventListener('error', (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Error loading audio: ' + err));
      });
      
      audioElement.src = objectUrl;
    });
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    return new Promise((resolve) => {
      const numberOfChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;
      
      const dataLength = buffer.length * numberOfChannels * (bitDepth / 8);
      const headerLength = 44;
      const totalLength = headerLength + dataLength;
      
      const wavData = new ArrayBuffer(totalLength);
      const view = new DataView(wavData);
      
      // Write WAV header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataLength, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true);
      view.setUint16(32, numberOfChannels * (bitDepth / 8), true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataLength, true);
      
      // Write audio data
      const channels = [];
      for (let i = 0; i < numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
      }
      
      let offset = 44;
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, channels[channel][i]));
          const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(offset, value, true);
          offset += 2;
        }
      }
      
      resolve(wavData);
    });
  };
  
  // Helper function to write string to DataView
  const writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Helper function to get status text
  const getStatusText = () => {
    if (isUploading) return `Uploading: ${uploadProgress.toFixed(0)}%`;
    if (isGenerating) {
      switch (currentStep) {
        case 'segmenting-text':
          return 'Segmenting text...';
        case 'detecting-moods':
          return 'Detecting moods...';
        case 'processing-segments':
          return `Processing segments (${segments.length > 0 ? `${segmentAudios.length}/${segments.length}` : '...'})...`;
        case 'concatenating-segments':
          return 'Concatenating segments...';
        case 'uploading':
          return `Uploading (${uploadProgress.toFixed(0)}%)...`;
        default:
          return 'Processing...';
      }
    }
    return 'Generate Audiobook';
  };

  return (
    <div className={`flex flex-col items-start ${className}`}>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      
      <button 
        onClick={handleGenerateAudiobook}
        disabled={isGenerating || isUploading}
        className="flex items-center px-4 py-2 bg-[#5A3E85] text-white rounded hover:bg-[#6E4A9E] transition-colors disabled:bg-[#3E2A5C]"
        title="Generate audiobook with dynamic background music"
        type="button"
      >
        {isGenerating || isUploading ? (
          <>
            <span className="inline-block animate-spin mr-2">⟳</span>
            {getStatusText()}
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Generate Audiobook
          </>
        )}
      </button>
      
      {audioUrl && !error && (
        <div className="mt-3 w-full">
          <p className="text-sm text-green-500 mb-1">
            Audiobook generated successfully!
          </p>
          <h3 className="text-lg font-medium mt-2 mb-1">Continuous Playback</h3>
          <p className="text-sm text-gray-600 mb-2">All paragraphs with appropriate background music will play continuously</p>
          <AudioPlayer 
            audioUrl={audioUrl} 
            className="w-full"
          />
          
          {segments.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h4 className="text-md font-medium mb-2">Paragraph Information</h4>
              <ul className="space-y-2">
                {segments.map((segment, index) => (
                  <li key={index} className="p-2 bg-gray-50 rounded">
                    <strong>Paragraph {index + 1}:</strong> {segment.metadata.mood} mood
                    <p className="text-sm text-gray-700 mt-1">{segment.text.substring(0, 100)}...</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudiobookProduction;