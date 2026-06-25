const form = document.getElementById('add-verse-form');
const tableBody = document.getElementById('verses-table-body');
const totalCountSpan = document.getElementById('total-count');
const resetBtn = document.getElementById('reset-db-btn');

// تحديث وعرض الجدول عند فتح الصفحة
function renderTable() {
    const db = getPoetryDatabase();
    totalCountSpan.innerText = db.length;
    tableBody.innerHTML = '';

    db.forEach((verse) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition";
        row.innerHTML = `
            <td class="p-2 font-medium text-slate-700">${verse.text} <span class="text-xs text-slate-400">(${verse.poet || 'غير معروف'})</span></td>
            <td class="p-2 text-center text-emerald-700 font-bold">${verse.first}</td>
            <td class="p-2 text-center text-amber-700 font-bold">${verse.rawiyy}</td>
            <td class="p-2 text-center">
                <button onclick="deleteVerse(${verse.id})" class="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded hover:bg-rose-100 transition cursor-pointer">حذف</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// معالجة نموذج إضافة بيت جديد
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const db = getPoetryDatabase();

    const newVerse = {
        id: Date.now(), // استخدام التوقيت الحالي كـ ID فريد
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

// وظيفة حذف بيت محدد
window.deleteVerse = function(id) {
    let db = getPoetryDatabase();
    db = db.filter(v => v.id !== id);
    savePoetryDatabase(db);
    renderTable();
};

// زر إعادة ضبط المصنع للبيانات الأولية
resetBtn.addEventListener('click', () => {
    if(confirm('هل أنت متأكد من مسح جميع الإضافات والعودة للقاعدة الافتراضية الأولى؟')) {
        localStorage.removeItem('musajala_db');
        renderTable();
    }
});

// التشغيل الأولي للجدول عند التحميل
renderTable();