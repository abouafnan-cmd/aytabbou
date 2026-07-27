// استدعاء مكتبات Firebase عبر الروابط المباشرة للمتصفح
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// إعدادات مشروعك الخاص
const firebaseConfig = {
  apiKey: "AIzaSyA0vuu9Wi3ubo-jHsJXXxTdjyVqIyNyF_Q",
  authDomain: "arabic-edu-platform.firebaseapp.com",
  projectId: "arabic-edu-platform",
  storageBucket: "arabic-edu-platform.firebasestorage.app",
  messagingSenderId: "202627398120",
  appId: "1:202627398120:web:e354b0f442fea205354c5d",
  measurementId: "G-FTF8GK4B3G"
};

// تهيئة الاتصال بالسحابة والتخزين
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, ref, uploadBytes, getDownloadURL, collection, addDoc, getDocs, query, where, deleteDoc, doc };