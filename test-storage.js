import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
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

const storage = getStorage(app);

async function run() {
  try {
    const storageRef = ref(storage, "test.txt");
    await uploadString(storageRef, "Hello World");
    console.log("Upload success!");
    const url = await getDownloadURL(storageRef);
    console.log("URL:", url);
  } catch (err) {
    console.error("Upload Error:", err.code, err.message);
  }
}
run();
