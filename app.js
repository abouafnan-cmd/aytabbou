// الأقسام السبعة الافتراضية
const defaultClasses = [
    "جذع مشترك علوم 5", "جذع مشترك علوم 6", "جذع مشترك علوم 7", 
    "جذع مشترك علوم 8", "الأولى علوم 5", "الأولى علوم 6", "الأولى آداب 3"
];

// تهيئة البيانات في LocalStorage (قاعدة بيانات المتصفح)
let db = JSON.parse(localStorage.getItem('schoolDB')) || { classes: defaultClasses, students: {}, records: {} };

// تعيين تاريخ اليوم كافتراضي عند فتح التطبيق
document.getElementById('recordDate').valueAsDate = new Date();
document.getElementById('reportDate').valueAsDate = new Date();

// دالة تهيئة القوائم المنسدلة
function init() {
    const classSelect = document.getElementById('classSelect');
    const manageSelect = document.getElementById('manageClassSelect');
    const reportSelect = document.getElementById('reportClassSelect');
    
    classSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
    manageSelect.innerHTML = '';
    reportSelect.innerHTML = '<option value="">-- اختر القسم --</option>';

    db.classes.forEach(cls => {
        classSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
        manageSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
        reportSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
    });
}

// دالة التنقل بين التبويبات
function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// دالة عرض التلاميذ للقسم المختار
function loadStudents() {
    const selectedDate = document.getElementById('recordDate').value;
    const selectedClass = document.getElementById('classSelect').value;
    const listDiv = document.getElementById('studentsList');
    listDiv.innerHTML = '';

    if (!selectedClass) {
        listDiv.innerHTML = '<p style="text-align: center; color: #777; padding: 20px;">المرجو اختيار القسم لعرض لائحة التلاميذ.</p>';
        return;
    }

    if (!db.students[selectedClass] || db.students[selectedClass].length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; color: #e74c3c; padding: 20px;">لا يوجد تلاميذ مسجلين في هذا القسم. يرجى استيرادهم من شاشة (إدارة الأقسام).</p>';
        return;
    }

    // التحقق مما إذا كانت هناك بيانات محفوظة مسبقاً لهذا اليوم وهذا القسم
    const savedData = (db.records && db.records[selectedDate] && db.records[selectedDate][selectedClass]) 
                      ? db.records[selectedDate][selectedClass] : null;

    db.students[selectedClass].forEach((student, index) => {
        // القيم الافتراضية
        let att = "حاضر";
        let prep = "لم ينجز";

        // إذا كانت هناك بيانات محفوظة، استرجعها
        if (savedData) {
            const studentRecord = savedData.find(s => s.name === student);
            if (studentRecord) {
                att = studentRecord.attendance;
                prep = studentRecord.preparation;
            }
        }

        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <div class="student-name">${student}</div>
            <div class="options-group">
                <strong>الغياب:</strong>
                <label><input type="radio" name="att_${index}" value="حاضر" ${att === 'حاضر' ? 'checked' : ''}> حاضر</label>
                <label><input type="radio" name="att_${index}" value="متأخر" ${att === 'متأخر' ? 'checked' : ''}> متأخر</label>
                <label><input type="radio" name="att_${index}" value="غائب" ${att === 'غائب' ? 'checked' : ''}> غائب</label>
            </div>
            <div class="options-group">
                <strong>الإعداد:</strong>
                <label><input type="radio" name="prep_${index}" value="لم ينجز" ${prep === 'لم ينجز' ? 'checked' : ''}> لم ينجز</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز ضعيف" ${prep === 'إنجاز ضعيف' ? 'checked' : ''}> ضعيف</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز متوسط" ${prep === 'إنجاز متوسط' ? 'checked' : ''}> متوسط</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز جيد" ${prep === 'إنجاز جيد' ? 'checked' : ''}> جيد</label>
            </div>
        `;
        listDiv.appendChild(row);
    });
}

// دالة استيراد الأسماء من ملف txt
function importStudents() {
    const file = document.getElementById('fileInput').files[0];
    const selectedClass = document.getElementById('manageClassSelect').value;

    if (!file) return alert("المرجو اختيار ملف txt أولاً");

    const reader = new FileReader();
    reader.onload = function(e) {
        // تنظيف النصوص، إزالة الفراغات، وتجاهل الأسطر الفارغة
        const lines = e.target.result.split('\n')
                      .map(line => line.replace(/\\s*/g, '').trim()) // تنظيف من علامات المصدر إن وجدت
                      .filter(line => line.length > 0);
        
        db.students[selectedClass] = lines;
        localStorage.setItem('schoolDB', JSON.stringify(db));
        
        alert(`تم استيراد وحفظ ${lines.length} تلميذ بنجاح لقسم ${selectedClass}`);
        document.getElementById('fileInput').value = ""; // تفريغ حقل الملف
        
        // تحديث العرض إذا كان القسم المختار في شاشة التتبع هو نفسه
        if(document.getElementById('classSelect').value === selectedClass) {
            loadStudents();
        }
    };
    reader.readAsText(file);
}

// دالة حفظ الغياب والحضور
function saveData() {
    const selectedDate = document.getElementById('recordDate').value;
    const selectedClass = document.getElementById('classSelect').value;

    if (!selectedDate || !selectedClass) return alert("المرجو اختيار التاريخ والقسم أولاً.");
    if (!db.students[selectedClass] || db.students[selectedClass].length === 0) return alert("لا يوجد تلاميذ لحفظ بياناتهم.");

    if (!db.records) db.records = {};
    if (!db.records[selectedDate]) db.records[selectedDate] = {};

    let classRecord = [];
    
    db.students[selectedClass].forEach((student, index) => {
        // استخراج قيمة الغياب
        const attendanceRadios = document.getElementsByName(`att_${index}`);
        let attendanceValue = "حاضر"; 
        for (let radio of attendanceRadios) { if (radio.checked) { attendanceValue = radio.value; break; } }

        // استخراج قيمة الإعداد
        const prepRadios = document.getElementsByName(`prep_${index}`);
        let prepValue = "لم ينجز"; 
        for (let radio of prepRadios) { if (radio.checked) { prepValue = radio.value; break; } }

        classRecord.push({
            name: student,
            attendance: attendanceValue,
            preparation: prepValue
        });
    });

    db.records[selectedDate][selectedClass] = classRecord;
    localStorage.setItem('schoolDB', JSON.stringify(db));
    alert(`تم حفظ بيانات قسم ${selectedClass} بنجاح!`);
}

// دالة استخراج التقارير (واتساب أو تحميل)
function generateReport(type) {
    const selectedDate = document.getElementById('reportDate').value;
    const selectedClass = document.getElementById('reportClassSelect').value;

    if (!selectedDate || !selectedClass) return alert("المرجو اختيار التاريخ والقسم أولاً.");

    if (!db.records || !db.records[selectedDate] || !db.records[selectedDate][selectedClass]) {
        return alert("لم يتم العثور على بيانات محفوظة لهذا القسم في التاريخ المحدد.");
    }

    const records = db.records[selectedDate][selectedClass];
    
    const absentees = records.filter(s => s.attendance === "غائب").map(s => s.name);
    const late = records.filter(s => s.attendance === "متأخر").map(s => s.name);
    const weakPrep = records.filter(s => s.preparation === "إنجاز ضعيف").map(s => s.name);
    const noPrep = records.filter(s => s.preparation === "لم ينجز").map(s => s.name);
    
    let reportText = `*تقرير حصة ${selectedDate}*\n`;
    reportText += `*القسم:* ${selectedClass}\n`;
    reportText += `=====================\n\n`;
    
    reportText += `📌 *حالة الحضور:*\n`;
    reportText += `- الغياب (${absentees.length}): ${absentees.length > 0 ? absentees.join('، ') : 'لا يوجد'}\n`;
    reportText += `- التأخر (${late.length}): ${late.length > 0 ? late.join('، ') : 'لا يوجد'}\n\n`;
    
    reportText += `📌 *الإعداد القبلي (تعثرات):*\n`;
    reportText += `- لم ينجز (${noPrep.length}): ${noPrep.length > 0 ? noPrep.join('، ') : 'لا يوجد'}\n`;
    reportText += `- إنجاز ضعيف (${weakPrep.length}): ${weakPrep.length > 0 ? weakPrep.join('، ') : 'لا يوجد'}\n`;

    if (type === 'whatsapp') {
        const encodedText = encodeURIComponent(reportText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    } else if (type === 'download') {
        // تنظيف النص من نجوم الواتساب للتحميل
        const cleanText = reportText.replace(/\*/g, '');
        const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `تقرير_${selectedClass}_${selectedDate}.txt`;
        link.click();
    }
}

// تشغيل دالة التهيئة عند تحميل الصفحة
init();