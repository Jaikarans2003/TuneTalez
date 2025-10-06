'use client';

import { getFirestore, collection, addDoc, getDoc, getDocs, doc, query, where, orderBy, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { Episode, EpisodeCreatePayload, EpisodeUpdatePayload } from '@/types/episode';
import { uploadAudioNarration } from './services';

// Create a new episode
export const createEpisode = async (episode: EpisodeCreatePayload): Promise<Episode> => {
  try {
    const timestamp = Date.now();
    const episodeDoc = {
      ...episode,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    const docRef = await addDoc(collection(db, 'episodes'), episodeDoc);
    return { ...episodeDoc, id: docRef.id } as Episode;
  } catch (error) {
    console.error('Error creating episode:', error);
    throw error;
  }
};

// Get episode by ID
export const getEpisodeById = async (id: string): Promise<Episode | null> => {
  try {
    const docRef = doc(db, 'episodes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Episode;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting episode:', error);
    throw error;
  }
};

// Get all episodes
export const getEpisodes = async (seriesId?: string) => {
  try {
    let q;
    if (seriesId) {
      q = query(
        collection(db, 'episodes'), 
        where('seriesId', '==', seriesId),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'episodes'), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Episode));
  } catch (error) {
    console.error('Error getting episodes:', error);
    throw error;
  }
};

// Update episode
export const updateEpisode = async (id: string, updates: EpisodeUpdatePayload): Promise<Episode> => {
  try {
    const episodeRef = doc(db, 'episodes', id);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(episodeRef, updateData);
    
    // Get the updated episode
    const updatedDoc = await getDoc(episodeRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Episode;
  } catch (error) {
    console.error('Error updating episode:', error);
    throw error;
  }
};

// Delete episode
export const deleteEpisode = async (id: string): Promise<boolean> => {
  try {
    const episodeRef = doc(db, 'episodes', id);
    const episodeSnap = await getDoc(episodeRef);
    
    if (!episodeSnap.exists()) {
      throw new Error('Episode not found');
    }
    
    const episodeData = episodeSnap.data() as Episode;
    
    // Delete thumbnail if exists
    if (episodeData.thumbnailUrl) {
      try {
        const thumbnailRef = ref(storage, episodeData.thumbnailUrl);
        await deleteObject(thumbnailRef);
      } catch (err) {
        console.warn('Error deleting thumbnail:', err);
      }
    }
    
    // Delete narration audio if exists
    if (episodeData.narrationUrl) {
      try {
        const audioRef = ref(storage, episodeData.narrationUrl);
        await deleteObject(audioRef);
      } catch (err) {
        console.warn('Error deleting narration audio:', err);
      }
    }
    
    // Delete the episode document
    await deleteDoc(episodeRef);
    return true;
  } catch (error) {
    console.error('Error deleting episode:', error);
    throw error;
  }
};

// Upload episode narration and update the episode with the URL
export const uploadEpisodeNarration = async (
  episodeId: string, 
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // First, get the episode to make sure it exists
    const episodeRef = doc(db, 'episodes', episodeId);
    const episodeSnap = await getDoc(episodeRef);
    
    if (!episodeSnap.exists()) {
      throw new Error('Episode not found');
    }
    
    // Upload the audio file to Firebase Storage
    const storageUrl = await uploadAudioNarration(
      audioBlob,
      'episodes', // Use 'episodes' as the root folder
      episodeId,  // Use episodeId as the subfolder
      onProgress
    );
    
    // Update the episode with the narration URL
    await updateDoc(episodeRef, {
      narrationUrl: storageUrl,
      updatedAt: Date.now()
    });
    
    return storageUrl;
  } catch (error) {
    console.error('Error uploading episode narration:', error);
    throw error;
  }
};

// Generate and upload narration for an episode
export const generateAndUploadEpisodeNarration = async (
  episodeId: string,
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Upload the audio to Firebase Storage and update the episode
    const narrationUrl = await uploadEpisodeNarration(episodeId, audioBlob, onProgress);
    return narrationUrl;
  } catch (error) {
    console.error('Error generating and uploading episode narration:', error);
    throw error;
  }
};
