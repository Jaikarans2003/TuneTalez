// Script to verify Firebase deployment
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getStorage, ref, listAll } = require('firebase/storage');

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  // Your config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function verifyFirestoreRules() {
  console.log('Verifying Firestore Rules deployment...');
  try {
    // Try to access the pdfs collection (should be allowed for public read)
    const pdfsSnapshot = await getDocs(collection(db, 'pdfs'));
    console.log(`Successfully accessed pdfs collection. Found ${pdfsSnapshot.size} documents.`);
    
    // Try to access the books collection (should be allowed for public read)
    const booksSnapshot = await getDocs(collection(db, 'books'));
    console.log(`Successfully accessed books collection. Found ${booksSnapshot.size} documents.`);
    
    console.log('Firestore Rules verification: SUCCESS');
  } catch (error) {
    console.error('Firestore Rules verification: FAILED', error);
  }
}

async function verifyStorageRules() {
  console.log('Verifying Storage Rules deployment...');
  try {
    // Try to access the pdfs folder in storage (should be allowed for public read)
    const pdfsRef = ref(storage, 'pdfs');
    const pdfsResult = await listAll(pdfsRef);
    console.log(`Successfully accessed pdfs storage. Found ${pdfsResult.items.length} files.`);
    
    // Try to access the books/thumbnails folder in storage (should be allowed for public read)
    const thumbnailsRef = ref(storage, 'books/thumbnails');
    const thumbnailsResult = await listAll(thumbnailsRef);
    console.log(`Successfully accessed books/thumbnails storage. Found ${thumbnailsResult.items.length} files.`);
    
    console.log('Storage Rules verification: SUCCESS');
  } catch (error) {
    console.error('Storage Rules verification: FAILED', error);
  }
}

async function main() {
  console.log('Starting deployment verification...');
  await verifyFirestoreRules();
  await verifyStorageRules();
  console.log('Deployment verification completed.');
}

main().catch(console.error);