# 🎓 منصة التعليم والتواصل الرقمي | Educational Web Platform

<p align="center">
  <b>منصة ويب تعليمية متكاملة لتسهيل التواصل بين الأستاذ والتلاميذ ومتابعة الأداء الأكاديمي.</b><br>
  <i>An integrated educational web platform designed to facilitate teacher-student communication and academic performance tracking.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
</p>

---

## 📌 نبذة عن المشروع | About The Project

**بالعربية:**  
تهدف هذه المنصة إلى توفير بيئة رقمية سهلة الاستخدام ومتجاوبة مع مختلف الأجهزة لتيسير عملية التعلم وتتبع المسار الدراسي للتلاميذ. تتيح للأستاذ رفع الموارد التعليمية، إدارة التكليفات المنزلية، إنشاء اختبارات إلكترونية تفاعلية، ونشر التنبيهات العاجلة للقسم.

**In English:**  
This platform aims to provide an intuitive, responsive digital environment across all devices to streamline learning and academic tracking. It empowers teachers to upload educational resources, manage home assignments, create interactive online quizzes, and broadcast urgent class announcements.

---

## ✨ المميزات الرئيسية | Key Features

### 👨‍🏫 لوحة تحكم الأستاذ (Teacher Dashboard)
* **إدارة المحتوى والدروس:** رفع وتنسيق الدروس بمختلف الصيغ (PDF، روابط فيديو، ملخصات نصية).
* **إدارة التكليفات:** وضع واجبات منزلية وتحديد المواعيد النهائية للتسليم (`Deadlines`).
* **صانع الاختبارات الإلكترونية:** إنشاء اختبارات تفاعلية (10 / 20 / 40 سؤال) بأسئلة اختيار من متعدد (MCQ) أو صحيح/خطأ مع سلم تنقيط تلقائي.
* **جدار الإعلانات:** نشر تنبيهات عاجلة للتلاميذ وتثبيتها.

### 👨‍🎓 فضاء التلميذ (Student Portal)
* **المكتبة الرقمية:** تصفح وتنظيم الدروس والموارد حسب المواد والوحدات.
* **ركن التكليفات:** إمكانية رفع حلول الواجبات بصيغة صور أو ملفات PDF.
* **اجتياز الاختبارات:** أداء الاختبارات الإلكترونية التفاعلية مع الحصول على النتيجة والملاحظات فوراً.
* **متابعة الأداء:** كشف تفصيلي بالنقط والملاحظات التربوية الموجهة للتلميذ.

---

## 🛠️ التقنيات المستخدمة | Tech Stack

* **Front-end:** HTML5, CSS3, JavaScript (Vanilla JS)
* **Styling Framework:** Tailwind CSS (مع دعم كامل للاتجاه من اليمين إلى اليسار RTL)
* **Hosting / Deployment:** GitHub Pages

---

## 📁 هيكلة المشروع | Project Structure

```text
edu-platform/
│
├── assets/
│   ├── css/
│   │   └── style.css            # Custom styles & RTL overrides
│   ├── js/
│   │   ├── config.js            # General settings & database connection
│   │   ├── teacher.js           # Teacher logic & Quiz engine
│   │   └── student.js           # Student logic & submission
│   └── images/                  # Platform graphics and icons
│
├── teacher/                     # Teacher control panel
│   ├── index.html               # Teacher Home / Feed
│   ├── lessons.html             # Lessons management
│   ├── assignments.html         # Homework management
│   ├── quizzes.html             # Dynamic Quiz builder (10/20/40 Qs)
│   └── results.html             # Student grading & tracking
│
├── student/                     # Student space
│   ├── index.html               # Student Home / Feed
│   ├── library.html             # Digital library for lessons
│   ├── assignments.html         # Assignment submission
│   ├── quiz-view.html           # Quiz interface
│   └── performance.html         # Performance tracking
│
├── index.html                   # Main landing page & Announcements feed
└── README.md                    # Project documentation