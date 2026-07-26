// Teacher Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    // Handle Announcement Posting
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = announcementForm.querySelector('textarea').value;
            if (text.trim()) {
                showNotification('تم نشر الإعلان بنجاح للقسم');
                announcementForm.reset();
            }
        });
    }
});