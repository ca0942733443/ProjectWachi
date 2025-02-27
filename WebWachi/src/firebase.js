import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ตั้งค่า Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAULDz5FnQD-RC33f-53Vxhe9WpHIUsWVI",
    authDomain: "project-d2ce2.firebaseapp.com",
    projectId: "project-d2ce2",
    storageBucket: "project-d2ce2.firebasestorage.app",
    messagingSenderId: "533203955267",
    appId: "1:533203955267:web:2ea8d05cde44e2f2116ef6",
    measurementId: "G-JB6GPKCZLJ"
  };

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // ✅ ตรวจสอบให้แน่ใจว่ามีการส่งออก auth
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
