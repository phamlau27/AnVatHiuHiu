import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});
const db = getFirestore(app);

async function run() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5));
    const qs = await getDocs(q);
    qs.forEach(doc => console.log(doc.id, doc.data().name, doc.data().imageUrl));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
