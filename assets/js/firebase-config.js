// استدعاء مكتبات Firebase الأساسية
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// إعدادات مشروعك الخاص (ضع بياناتك هنا)
const firebaseConfig = {
    apiKey: "// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0vuu9Wi3ubo-jHsJXXxTdjyVqIyNyF_Q",
  authDomain: "arabic-edu-platform.firebaseapp.com",
  projectId: "arabic-edu-platform",
  storageBucket: "arabic-edu-platform.firebasestorage.app",
  messagingSenderId: "202627398120",
  appId: "1:202627398120:web:e354b0f442fea205354c5d",
  measurementId: "G-FTF8GK4B3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);",
    authDomain: "project-id.firebaseapp.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// تهيئة الاتصال
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تصدير الأدوات
export { db, collection, addDoc, getDocs, query, where, deleteDoc, doc };