// Utility functions for the educational platform

// Format Date to Arabic Locale
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-MA', options);
}

// Show Toast Notification
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    toast.className = `fixed bottom-5 left-5 ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-bold transition-all duration-300 transform translate-y-10 opacity-0`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 100);

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}