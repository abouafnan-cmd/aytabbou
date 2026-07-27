// استدعاء مكتبات Firebase عبر الروابط المباشرة للمتصفح
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// إعدادات مشروعك الخاص (تم إدراج بياناتك)
const firebaseConfig = {
  apiKey: "AIzaSyA0vuu9Wi3ubo-jHsJXXxTdjyVqIyNyF_Q",
  authDomain: "arabic-edu-platform.firebaseapp.com",
  projectId: "arabic-edu-platform",
  storageBucket: "arabic-edu-platform.firebasestorage.app",
  messagingSenderId: "202627398120",
  appId: "1:202627398120:web:e354b0f442fea205354c5d",
  measurementId: "G-FTF8GK4B3G"
};

// تهيئة الاتصال
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تصدير الأدوات لاستخدامها في واجهات المنصة
export { db, collection, addDoc, getDocs, query, where, deleteDoc, doc };