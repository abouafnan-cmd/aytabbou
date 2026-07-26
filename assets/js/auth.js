// Auth State Management (Demo implementation)
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('edu_user'));

    // Check protected routes
    const path = window.location.pathname;
    if (!currentUser && (path.includes('/teacher/') || path.includes('/student/'))) {
        window.location.href = '../login.html';
    }
});

function loginUser(email, role) {
    const user = { email, role, name: role === 'teacher' ? 'الأستاذ عبد المجيد' : 'التلميذ أحمد' };
    localStorage.setItem('edu_user', JSON.stringify(user));
    
    if (role === 'teacher') {
        window.location.href = 'teacher/dashboard.html';
    } else {
        window.location.href = 'student/dashboard.html';
    }
}

function logoutUser() {
    localStorage.removeItem('edu_user');
    window.location.href = '../login.html';
}