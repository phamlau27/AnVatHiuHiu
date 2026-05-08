import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { mockProducts } from "../src/data/mockProducts";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedProducts() {
  console.log("Seeding products...");
  let count = 0;
  
  for (const product of mockProducts) {
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
      });
      console.log(`Seeded: ${product.name}`);
      count++;
    } catch (error) {
      console.error(`Error seeding ${product.name}:`, error);
    }
  }
  
  console.log(`Successfully seeded ${count} products.`);
  process.exit(0);
}

seedProducts();
