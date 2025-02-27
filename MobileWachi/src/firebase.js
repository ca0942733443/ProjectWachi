import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyAULDz5FnQD-RC33f-53Vxhe9WpHIUsWVI",
    authDomain: "project-d2ce2.firebaseapp.com",
    projectId: "project-d2ce2",
    storageBucket: "project-d2ce2.firebasestorage.app",
    messagingSenderId: "533203955267",
    appId: "1:533203955267:web:2ea8d05cde44e2f2116ef6",
    measurementId: "G-JB6GPKCZLJ"
  };


  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
