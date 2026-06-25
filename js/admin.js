const form = document.getElementById('add-verse-form');
const tableBody = document.getElementById('verses-table-body');
const totalCountSpan = document.getElementById('total-count');
const resetBtn = document.getElementById('reset-db-btn');

const overlay = document.getElementById('password-overlay');
const adminContent = document.getElementById('admin-content');
const passwordInput = document.getElementById('admin-password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function checkAuth() {
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
        overlay.classList.add('hidden');
        adminContent.classList.remove('hidden');
        renderTable();
    }
}

loginBtn.addEventListener('click', () => {
    // تفعيل قفل الحماية بكلمة المرور المشترطة
    if (passwordInput.value === '1982') {
        sessionStorage.setItem('admin_authenticated', 'true');
        loginError.classList.add('hidden');
        checkAuth();
    } else {
        loginError.classList.remove('hidden');
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('admin_authenticated');
    window.location.reload();
});

function renderTable() {
    if (sessionStorage.getItem('admin_authenticated') !== 'true') return;
    const db = getPoetryDatabase();
    totalCountSpan.innerText = db.length;
    tableBody.innerHTML = '';

    db.forEach((verse) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition";
        row.innerHTML = `
            <td class="p-2 font-medium text-slate-700">${verse.text}</td>
            <td class="p-2 text-center text-emerald-700 font-bold">${verse.first}</td>
            <td class="p-2 text-center text-amber-700 font-bold">${verse.rawiyy}</td>
            <td class="p-2 text-center">
                <button onclick="deleteVerse(${verse.id})" class="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded hover:bg-rose-100 transition cursor-pointer">حذف</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const db = getPoetryDatabase();
    const newVerse = {
        id: Date.now(),
        text: document.getElementById('verse-text').value.trim(),
        first: document.getElementById('first-letter').value.trim(),
        rawiyy: document.getElementById('rawiyy-letter').value.trim(),
        poet: document.getElementById('poet-name').value.trim()
    };
    db.push(newVerse);
    savePoetryDatabase(db);
    form.reset();
    renderTable();
});

window.deleteVerse = function(id) {
    let db = getPoetryDatabase();
    db = db.filter(v => v.id !== id);
    savePoetryDatabase(db);
    renderTable();
};

resetBtn.addEventListener('click', () => {
    if(confirm('هل أنت متأكد من العودة للقاعدة الافتراضية؟')) {
        localStorage.removeItem('musajala_db');
        renderTable();
    }
});

checkAuth();