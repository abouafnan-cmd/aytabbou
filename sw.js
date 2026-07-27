const CACHE_NAME = 'arabic-edu-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './student/dashboard.html',
  './assets/css/style.css'
];

// تثبيت ملفات الكاش الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// جلب الملفات للعمل حتى لو كان الإنترنت ضعيفاً
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});