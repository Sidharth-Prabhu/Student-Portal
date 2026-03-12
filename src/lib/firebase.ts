import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyACDKS4IhNjibxczgIRF6Evn33QeOyOBXI",
    authDomain: "aids-attendance-system.firebaseapp.com",
    projectId: "aids-attendance-system",
    storageBucket: "aids-attendance-system.firebasestorage.app",
    messagingSenderId: "152454157784",
    appId: "1:152454157784:web:a1872042dc91edf79ccead"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
