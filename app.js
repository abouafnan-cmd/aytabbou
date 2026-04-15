/* ================== إعدادات Firebase والبيانات ================== */
const firebaseConfig = {
    apiKey: "AIzaSyCRTTSh0dw0IgY1dLGVeJ2HONH_UmB1Vco",
    authDomain: "tilmid-c43c6.firebaseapp.com",
    databaseURL: "https://tilmid-c43c6-default-rtdb.firebaseio.com",
    projectId: "tilmid-c43c6",
    storageBucket: "tilmid-c43c6.firebasestorage.app",
    messagingSenderId: "971380157589",
    appId: "1:971380157589:web:cae37710ea282c70c97f9c"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dbRef = database.ref('schoolDB_Cloud');

const defaultClasses = ["جذع مشترك علوم 5", "جذع مشترك علوم 6", "جذع مشترك علوم 7", "جذع مشترك علوم 8", "الأولى علوم 5", "الأولى علوم 6", "الأولى آداب 3"];
let db = JSON.parse(localStorage.getItem('schoolDB')) || {};
let isInitialLoad = true;
let currentReportText = ""; 
const today = new Date();

function initDBStructure() {
    if (!db.classes) db.classes = defaultClasses;
    if (!db.students) db.students = {};
    if (!db.records) db.records = {};
    if (!db.notes) db.notes = {}; 
    if (!db.grades) db.grades = {}; 
    if (!db.miniExams) db.miniExams = {}; 
    if (!db.lessonLog) db.lessonLog = {};
    if (!db.randomTopics) db.randomTopics = {};
    if (!db.disciplinary) db.disciplinary = {};
    if (!db.bonusPoints) db.bonusPoints = {};
    if (!db.seatingMaps) db.seatingMaps = {}; 
    if (!db.sessionMeta) db.sessionMeta = {}; 
}
initDBStructure();

/* ================== الإشعارات والوضع الليلي والقفل ومحرك البحث ================== */
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function updateThemeIcon() {
    const html = document.documentElement;
    const btn = document.getElementById('themeBtn');
    if (html.getAttribute('data-theme') === 'dark') { btn.innerText = '☀️'; } 
    else { btn.innerText = '🌙'; }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('appTheme', newTheme);
    updateThemeIcon();
}

if(localStorage.getItem('appTheme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
updateThemeIcon();

let savedPin = localStorage.getItem('appPin');
function initPinSystem() {
    const pinScreen = document.getElementById('pinScreen');
    if(sessionStorage.getItem('pinUnlocked')) { pinScreen.style.display = 'none'; return; }
    if(!savedPin) {
        document.getElementById('pinTitle').innerText = "🔑 إعداد الحماية لأول مرة";
        document.getElementById('pinHint').innerText = "اختر رمزاً من 4 أرقام لحماية تطبيقك";
    }
}
function checkPinLength() {
    const input = document.getElementById('pinCode').value;
    if(input.length === 4 && savedPin) processPin();
}
function processPin() {
    const input = document.getElementById('pinCode').value;
    if(input.length < 4) return alert("الرمز يجب أن يكون 4 أرقام");
    if(!savedPin) {
        localStorage.setItem('appPin', input);
        savedPin = input;
        document.getElementById('pinScreen').style.display = 'none';
        sessionStorage.setItem('pinUnlocked', 'true');
        showToast("تم تعيين رمز الحماية بنجاح!");
    } else {
        if(input === savedPin) {
            document.getElementById('pinScreen').style.display = 'none';
            sessionStorage.setItem('pinUnlocked', 'true');
        } else {
            alert("الرمز السري خاطئ!");
            document.getElementById('pinCode').value = '';
        }
    }
}
initPinSystem();

function filterList(inputId, listId) {
    const filter = document.getElementById(inputId).value.toLowerCase();
    const rows = document.getElementById(listId).getElementsByClassName('student-row');
    for (let i = 0; i < rows.length; i++) {
        const name = rows[i].getElementsByClassName('student-name')[0].innerText.toLowerCase();
        if (name.indexOf(filter) > -1) { rows[i].style.display = "flex"; } 
        else { rows[i].style.display = "none"; }
    }
}

function filterDropdown(inputId, selectId, classSelectId) {
    const filter = document.getElementById(inputId).value.toLowerCase();
    const select = document.getElementById(selectId);
    const cls = document.getElementById(classSelectId).value;
    const currentVal = select.value;
    
    if(!cls || !db.students[cls]) return;
    
    select.innerHTML = '<option value="">-- اختر التلميذ --</option>';
    db.students[cls].forEach((s, i) => {
        if(s.toLowerCase().includes(filter)) {
            const isSelected = (s === currentVal) ? 'selected' : '';
            select.innerHTML += `<option value="${s}" ${isSelected}>${i+1} - ${s}</option>`;
        }
    });
    select.style.display = 'block';
}

/* ================== المزامنة السحابية ================== */
dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        db = data; initDBStructure();
        localStorage.setItem('schoolDB', JSON.stringify(db)); 
        const statusEl = document.getElementById('cloudStatus');
        statusEl.innerText = "☁️ متصل ومُحَدَّث"; statusEl.style.color = "#a8e6cf";
        if(isInitialLoad) { init(); refreshCurrentView(); isInitialLoad = false; } 
        else { refreshCurrentView(); }
    } else { saveToCloud(false); }
});

function saveToCloud(showAlert = true, silent = false) {
    localStorage.setItem('schoolDB', JSON.stringify(db)); 
    const statusEl = document.getElementById('cloudStatus');
    statusEl.innerText = "⏳ جاري الحفظ..."; statusEl.style.color = "#f1c40f";
    dbRef.set(db).then(() => {
        statusEl.innerText = "☁️ تم الحفظ بنجاح"; statusEl.style.color = "#a8e6cf";
        if(showAlert && !silent) showToast("تم الحفظ بنجاح!");
    }).catch((error) => {
        statusEl.innerText = "⚠️ مخزن محلياً فقط"; statusEl.style.color = "#e74c3c";
        if(showAlert && !silent) alert("تم الحفظ محلياً، وسيتم الرفع عند توفر الإنترنت.");
    });
}

function refreshCurrentView() {
    loadDashboard();
    const activeSection = document.querySelector('.section.active').id;
    if(activeSection === 'tracking') loadStudents();
    else if(activeSection === 'lessonLogTab') viewLessonLog();
    else if(activeSection === 'notesTab') {
        const student = document.getElementById('noteStudentSelect').value;
        if(student) loadStudentHistory();
        else if (document.getElementById('classNotesArea').style.display === 'block') viewClassNotes();
    }
    else if(activeSection === 'miniExamsTab') loadMiniExams();
    else if(activeSection === 'gradesTab') loadGrades();
    else if(activeSection === 'reports') viewReport();
    else if(activeSection === 'management') renderStudentManagement();
    else if(activeSection === 'randomizerTab') loadRandomizerData();
    else if(activeSection === 'disciplinaryTab') viewDisciplinary();
    else if(activeSection === 'portfolioTab') viewPortfolio();
    else if(activeSection === 'seatingTab') loadSeatingMap();
}

function init() {
    const selects = ['classSelect', 'manageClassSelect', 'reportClassSelect', 'noteClassSelect', 'gradesClassSelect', 'miniExamsClassSelect', 'lessonClassSelect', 'randClassSelect', 'discClassSelect', 'discFilterClass', 'portClassSelect', 'seatingClassSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        const currVal = el.value;
        if(id === 'discFilterClass') el.innerHTML = `<option value="">-- عرض جميع الأقسام --</option>`;
        else el.innerHTML = `<option value="">-- اختر القسم --</option>`;
        db.classes.forEach(cls => el.innerHTML += `<option value="${cls}">${cls}</option>`);
        el.value = currVal;
    });
    const dateInputs = ['recordDate', 'reportDate', 'noteDate', 'gradesDate', 'miniExamsDate', 'lessonDate', 'discDate', 'seatingDate'];
    dateInputs.forEach(id => { if(document.getElementById(id)) document.getElementById(id).valueAsDate = today; });
    
    const currentMonthStr = today.toISOString().substring(0, 7);
    document.getElementById('reportMonth').value = currentMonthStr;
    loadDashboard();
}

function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    refreshCurrentView();
}

/* ================== لوحة التحكم ================== */
function loadDashboard() {
    let totalStudents = 0; let classesCount = db.classes.length; let todayAbsences = 0;
    Object.values(db.students).forEach(arr => totalStudents += arr.length);
    const dStr = today.toISOString().split('T')[0];
    if(db.records[dStr]) {
        Object.values(db.records[dStr]).forEach(classRec => { todayAbsences += classRec.filter(s => s.attendance === 'غائب').length; });
    }
    document.getElementById('dashGrid').innerHTML = `<div class="dash-card blue"><h2>${totalStudents}</h2><p>إجمالي التلاميذ</p></div><div class="dash-card" style="background:var(--secondary);"><h2>${classesCount}</h2><p>الأقسام المسجلة</p></div><div class="dash-card red"><h2>${todayAbsences}</h2><p>غيابات اليوم</p></div>`;
}

/* ================== خريطة المراقبة ================== */
function loadSeatingMap() {
    const date = document.getElementById('seatingDate').value;
    const cls = document.getElementById('seatingClassSelect').value;
    const container = document.getElementById('classroomMap');
    const msg = document.getElementById('seatingEmptyMsg');
    const desksContainer = document.getElementById('desksContainer');
    
    if (!date || !cls || !db.students[cls] || db.students[cls].length === 0) {
        container.style.display = 'none'; msg.style.display = 'block'; return;
    }
    container.style.display = 'block'; msg.style.display = 'none';
    
    const totalSeats = 48; const totalDesks = 24;
    if (!db.seatingMaps[date]) db.seatingMaps[date] = {};
    if (!db.seatingMaps[date][cls]) db.seatingMaps[date][cls] = [];
    while (db.seatingMaps[date][cls].length < totalSeats) {
        db.seatingMaps[date][cls].push({ student: "", isEmpty: false, phone: 0, warnings: 0 });
    }
    
    const mapData = db.seatingMaps[date][cls];
    desksContainer.innerHTML = '';
    
    let seatIndex = 0;
    for (let d = 0; d < totalDesks; d++) {
        let deskHtml = `<div class="desk">`;
        for (let s = 0; s < 2; s++) {
            const seat = mapData[seatIndex];
            const emptyClass = seat.isEmpty ? 'empty' : '';
            const phoneIcons = ['📱؟', '📱', '📵'];
            const phoneColors = ['#7f8c8d', '#f39c12', '#e74c3c'];
            
            deskHtml += `
            <div class="seat ${emptyClass}" id="seat_${seatIndex}">
                ${seat.warnings > 0 ? `<div class="warning-badge" onclick="changeSeatProp(${seatIndex}, 'warn', -1)">${seat.warnings}</div>` : ''}
                <select onchange="changeSeatProp(${seatIndex}, 'student', this.value)" class="seat-student-select" style="white-space: normal; text-overflow: ellipsis;">
                    <option value="">-- مقعد --</option>
                    ${generateSeatOptions(cls, seat.student, mapData)}
                </select>
                <div class="seat-actions">
                    <button class="seat-btn" onclick="changeSeatProp(${seatIndex}, 'empty')" title="مقعد شاغر">🪑</button>
                    <button class="seat-btn" style="color:${phoneColors[seat.phone]}" onclick="changeSeatProp(${seatIndex}, 'phone')" title="حالة الهاتف">${phoneIcons[seat.phone]}</button>
                    <button class="seat-btn" onclick="changeSeatProp(${seatIndex}, 'warn', 1)" title="إضافة تنبيه/مخالفة">⚠️</button>
                </div>
            </div>`;
            seatIndex++;
        }
        deskHtml += `</div>`;
        desksContainer.innerHTML += deskHtml;
    }
}
function generateSeatOptions(cls, currentStudent, mapData) {
    const allStudents = db.students[cls];
    const seatedStudents = mapData.map(s => s.student).filter(s => s !== "");
    let options = '';
    allStudents.forEach(s => {
        if (s === currentStudent) options += `<option value="${s}" selected>${s}</option>`;
        else if (!seatedStudents.includes(s)) options += `<option value="${s}">${s}</option>`;
    });
    return options;
}
function changeSeatProp(seatIndex, prop, val = null) {
    const date = document.getElementById('seatingDate').value;
    const cls = document.getElementById('seatingClassSelect').value;
    const seat = db.seatingMaps[date][cls][seatIndex];
    if (prop === 'student') { seat.student = val; if(val !== "") seat.isEmpty = false; } 
    else if (prop === 'empty') { seat.isEmpty = !seat.isEmpty; if(seat.isEmpty) seat.student = ""; } 
    else if (prop === 'phone') { seat.phone = (seat.phone + 1) % 3; } 
    else if (prop === 'warn') { seat.warnings += val; if(seat.warnings < 0) seat.warnings = 0; }
    saveToCloud(false, true); loadSeatingMap(); 
}
function saveSeatingMap() { saveToCloud(true); }


/* ================== تتبع الأداء وبنك النقط والحالة ================== */
function updateBonus(cls, student, val) {
    if(!db.bonusPoints[cls]) db.bonusPoints[cls] = {};
    if(!db.bonusPoints[cls][student]) db.bonusPoints[cls][student] = 0;
    db.bonusPoints[cls][student] += val;
    if(db.bonusPoints[cls][student] < 0) db.bonusPoints[cls][student] = 0; 
    saveToCloud(false, true); loadStudents();
}

function changeSessionStatus() {
    const date = document.getElementById('recordDate').value;
    const cls = document.getElementById('classSelect').value;
    if(!date || !cls) return;
    const status = document.querySelector('input[name="sessionStatus"]:checked').value;
    if (!db.sessionMeta) db.sessionMeta = {};
    if (!db.sessionMeta[date]) db.sessionMeta[date] = {};
    db.sessionMeta[date][cls] = status;
    saveToCloud(false, true);
    loadStudents();
}

function autoSaveTracking() {
    const date = document.getElementById('recordDate').value;
    const cls = document.getElementById('classSelect').value;
    if (!date || !cls || !db.students[cls]) return;
    if (!db.records[date]) db.records[date] = {}; 
    let rec = [];
    
    let sessionType = 'normal';
    if(db.sessionMeta && db.sessionMeta[date] && db.sessionMeta[date][cls]) {
        sessionType = db.sessionMeta[date][cls];
    }
    const disablePrep = (sessionType !== 'normal');

    db.students[cls].forEach((student, i) => { 
        let prepVal = 'لم ينجز';
        const prepNode = document.querySelector(`input[name="prep_${i}"]:checked`);
        if(!disablePrep && prepNode) {
            prepVal = prepNode.value;
        }
        
        const attNode = document.querySelector(`input[name="att_${i}"]:checked`);
        let attVal = attNode ? attNode.value : 'حاضر';

        rec.push({ 
            number: i + 1, 
            name: student, 
            attendance: attVal, 
            preparation: prepVal
        }); 
    });
    db.records[date][cls] = rec;
    saveToCloud(false, true); 
}

function handleAttendanceChange(index) {
    const attNode = document.querySelector(`input[name="att_${index}"]:checked`);
    if(!attNode) return;
    const att = attNode.value;
    
    const prepRadios = document.querySelectorAll(`input[name="prep_${index}"]`);
    if(prepRadios.length > 0) {
        const prepContainer = prepRadios[0].parentElement.parentElement; 
        
        const date = document.getElementById('recordDate').value;
        const cls = document.getElementById('classSelect').value;
        let sessionType = 'normal';
        if(db.sessionMeta && db.sessionMeta[date] && db.sessionMeta[date][cls]) {
            sessionType = db.sessionMeta[date][cls];
        }

        if (att === 'غائب' || sessionType !== 'normal') {
            prepContainer.classList.add('disabled-prep');
            prepRadios.forEach(r => { r.checked = false; });
        } else {
            prepContainer.classList.remove('disabled-prep');
            if(!document.querySelector(`input[name="prep_${index}"]:checked`)) {
                document.querySelector(`input[name="prep_${index}"][value="لم ينجز"]`).checked = true;
            }
        }
    }
    autoSaveTracking();
}

function loadStudents() {
    const date = document.getElementById('recordDate').value;
    const cls = document.getElementById('classSelect').value;
    const list = document.getElementById('studentsList');
    const sessionStatusContainer = document.getElementById('sessionStatusContainer');
    document.getElementById('searchTracking').value = ''; 
    list.innerHTML = '';
    
    if (!cls || !db.students[cls] || db.students[cls].length === 0) {
        if(sessionStatusContainer) sessionStatusContainer.style.display = 'none';
        return list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">لا يوجد تلاميذ.</p>';
    }
    
    if(sessionStatusContainer) sessionStatusContainer.style.display = 'flex';
    let sessionType = 'normal';
    if (db.sessionMeta && db.sessionMeta[date] && db.sessionMeta[date][cls]) {
        sessionType = db.sessionMeta[date][cls];
    }
    document.querySelector(`input[name="sessionStatus"][value="${sessionType}"]`).checked = true;

    const globalPrepDisabled = (sessionType !== 'normal');
    const saved = (db.records[date] && db.records[date][cls]) ? db.records[date][cls] : null;
    
    let html = '';
    db.students[cls].forEach((student, index) => {
        let att = "حاضر", prep = "لم ينجز";
        if (saved) { const rec = saved.find(s => s.name === student); if (rec) { att = rec.attendance; prep = rec.preparation; } }
        let bonus = (db.bonusPoints[cls] && db.bonusPoints[cls][student]) ? db.bonusPoints[cls][student] : 0;
        let disabledClass = (att === 'غائب' || globalPrepDisabled) ? 'disabled-prep' : '';

        html += `<div class="student-row">
            <div class="student-name">
                <span class="student-number">${index + 1}</span> ${student}
                <div style="margin-right:auto; display:flex; align-items:center; background:rgba(39, 174, 96, 0.1); padding:2px 8px; border-radius:15px; font-size:0.9rem;">
                    ⭐ نقط: <strong style="margin:0 5px; color:var(--accent); font-size:1.1rem;">${bonus}</strong>
                    <button style="background:var(--accent); color:white; border:none; border-radius:50%; width:25px; height:25px; margin:0 2px;" onclick="updateBonus('${cls}', '${student}', 1)">+</button>
                    <button style="background:var(--danger); color:white; border:none; border-radius:50%; width:25px; height:25px; margin:0 2px;" onclick="updateBonus('${cls}', '${student}', -1)">-</button>
                </div>
            </div>
            <div class="options-group"><strong>الغياب:</strong>
                <label><input type="radio" name="att_${index}" value="حاضر" onchange="handleAttendanceChange(${index})" ${att==='حاضر'?'checked':''}> حاضر</label>
                <label><input type="radio" name="att_${index}" value="متأخر" onchange="handleAttendanceChange(${index})" ${att==='متأخر'?'checked':''}> متأخر</label>
                <label><input type="radio" name="att_${index}" value="غائب" onchange="handleAttendanceChange(${index})" ${att==='غائب'?'checked':''}> غائب</label>
            </div>
            <div class="options-group ${disabledClass}"><strong>الإعداد:</strong>
                <label><input type="radio" name="prep_${index}" value="لم ينجز" onchange="autoSaveTracking()" ${prep==='لم ينجز'?'checked':''}> لم ينجز</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز ضعيف" onchange="autoSaveTracking()" ${prep==='إنجاز ضعيف'?'checked':''}> إنجاز ضعيف</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز متوسط" onchange="autoSaveTracking()" ${prep==='إنجاز متوسط'?'checked':''}> إنجاز متوسط</label>
                <label><input type="radio" name="prep_${index}" value="إنجاز جيد" onchange="autoSaveTracking()" ${prep==='إنجاز جيد'?'checked':''}> إنجاز جيد</label>
            </div></div>`;
    });
    
    html += `<button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; margin-top: 10px;" onclick="saveData()">✅ تأكيد الحفظ النهائي للحصة</button>`;
    list.innerHTML = html;
}
function saveData() { autoSaveTracking(); showToast("تم تأكيد حفظ نتائج التتبع بنجاح!"); }

/* ================== الملف الشامل ================== */
function loadPortfolioStudents() {
    const cls = document.getElementById('portClassSelect').value;
    const select = document.getElementById('portStudentSelect');
    const searchInput = document.getElementById('searchPortfolio');
    document.getElementById('portfolioDisplay').style.display = 'none';
    searchInput.value = '';
    if(!cls) { select.style.display = 'none'; searchInput.style.display = 'none'; return; }
    select.innerHTML = '<option value="">-- اختر التلميذ --</option>';
    db.students[cls].forEach((s, i) => select.innerHTML += `<option value="${s}">${i+1} - ${s}</option>`);
    select.style.display = 'block'; searchInput.style.display = 'block';
}

function viewPortfolio() {
    const cls = document.getElementById('portClassSelect').value;
    const student = document.getElementById('portStudentSelect').value;
    const display = document.getElementById('portfolioDisplay');
    if(!cls || !student) { display.style.display = 'none'; return; }
    
    let totalAbsences = 0; let totalLates = 0;
    Object.values(db.records).forEach(dayRec => {
        if(dayRec[cls]) {
            const sRec = dayRec[cls].find(s => s.name === student);
            if(sRec && sRec.attendance === 'غائب') totalAbsences++;
            if(sRec && sRec.attendance === 'متأخر') totalLates++;
        }
    });

    let bonus = (db.bonusPoints[cls] && db.bonusPoints[cls][student]) ? db.bonusPoints[cls][student] : 0;
    let discHtml = '';
    Object.values(db.disciplinary).forEach(log => { if(log.class === cls && log.student === student) discHtml += `<div class="note-item">📅 ${log.date} - إجراء مسجل</div>`; });

    let html = `<h2 style="color:var(--title-color); border-bottom:2px solid var(--accent); padding-bottom:10px;">🎓 بطاقة التلميذ(ة): ${student}</h2>`;
    html += `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        <div style="background:var(--danger); color:white; padding:10px; border-radius:5px; flex-grow:1; text-align:center;">🚫 غيابات: ${totalAbsences}</div>
        <div style="background:#f39c12; color:white; padding:10px; border-radius:5px; flex-grow:1; text-align:center;">⏳ تأخرات: ${totalLates}</div>
        <div style="background:var(--accent); color:white; padding:10px; border-radius:5px; flex-grow:1; text-align:center;">⭐ نقط تحفيزية: ${bonus}</div>
    </div>`;

    if(discHtml !== '') html += `<h4 style="color:var(--danger);">⚖️ الإجراءات التأديبية:</h4>${discHtml}`;

    html += `<h4 style="color:var(--title-color);">📝 الملاحظات السلوكية:</h4>`;
    let hasNotes = false;
    if (db.notes[cls] && db.notes[cls][student]) {
        Object.keys(db.notes[cls][student]).sort((a,b) => new Date(b) - new Date(a)).forEach(d => {
            const notes = db.notes[cls][student][d];
            if(notes.length > 0) {
                hasNotes = true;
                const isPos = notes.includes("تقديم مشاركة متميزة") || notes.includes("استحقاق نقطة حسنة");
                html += `<div class="note-item ${isPos ? 'positive':''}"><strong>${d}:</strong> ${notes.join('، ')}</div>`;
            }
        });
    }
    if(!hasNotes) html += `<p style="color:var(--text-muted);">لا توجد ملاحظات مسجلة.</p>`;
    display.innerHTML = html; display.style.display = 'block';
}

/* ================== الملاحظات الخاصة والحذف ================== */
function loadNoteStudents() {
    const cls = document.getElementById('noteClassSelect').value;
    const select = document.getElementById('noteStudentSelect');
    const searchInput = document.getElementById('searchNotes');
    
    document.getElementById('noteCheckboxesArea').style.display = 'none';
    document.getElementById('noteHistoryArea').style.display = 'none';
    document.getElementById('classNotesArea').style.display = 'none';
    searchInput.value = '';
    
    if (!cls || !db.students[cls]) { select.style.display = 'none'; searchInput.style.display = 'none'; return; }
    
    select.innerHTML = '<option value="">-- اختر التلميذ --</option>';
    db.students[cls].forEach((s, i) => select.innerHTML += `<option value="${s}">${i+1} - ${s}</option>`);
    select.style.display = 'block'; searchInput.style.display = 'block';
}

function loadStudentHistory() {
    const date = document.getElementById('noteDate').value;
    const cls = document.getElementById('noteClassSelect').value;
    const student = document.getElementById('noteStudentSelect').value;
    const cbArea = document.getElementById('noteCheckboxesArea');
    document.getElementById('classNotesArea').style.display = 'none'; 
    if (!student) { cbArea.style.display = 'none'; document.getElementById('noteHistoryArea').style.display = 'none'; return; }
    
    document.querySelectorAll('#noteCheckboxesArea input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (db.notes[cls] && db.notes[cls][student] && db.notes[cls][student][date]) {
        const todayNotes = db.notes[cls][student][date];
        document.querySelectorAll('#noteCheckboxesArea input[type="checkbox"]').forEach(cb => { if (todayNotes.includes(cb.value)) cb.checked = true; });
    }
    
    cbArea.style.display = 'block';
    const histDiv = document.getElementById('noteHistory');
    histDiv.innerHTML = '';
    let hasHistory = false;
    
    if (db.notes[cls] && db.notes[cls][student]) {
        Object.keys(db.notes[cls][student]).sort((a,b) => new Date(b) - new Date(a)).forEach(d => {
            const notes = db.notes[cls][student][d];
            if (notes.length > 0) {
                hasHistory = true;
                const isPos = notes.includes("تقديم مشاركة متميزة") || notes.includes("استحقاق نقطة حسنة");
                histDiv.innerHTML += `
                <div class="note-item ${isPos ? 'positive' : ''}">
                    <button class="btn-delete-note" title="حذف الملاحظة" onclick="deleteNoteRecord('${cls}', '${student}', '${d}')">🗑️</button>
                    <strong style="margin-right: 25px; color:var(--title-color);">📅 ${d}</strong><br>
                    <div style="margin-right: 25px; color:var(--text);">- ${notes.join('<br>- ')}</div>
                </div>`;
            }
        });
    }
    document.getElementById('studentArchiveTitle').innerText = `أرشيف ملاحظات: ${student}`;
    document.getElementById('noteHistoryArea').style.display = hasHistory ? 'block' : 'none';
}

function saveNotes() {
    const date = document.getElementById('noteDate').value;
    const cls = document.getElementById('noteClassSelect').value;
    const student = document.getElementById('noteStudentSelect').value;
    if (!date || !cls || !student) return alert("المرجو إكمال الاختيارات.");
    const selectedNotes = Array.from(document.querySelectorAll('#noteCheckboxesArea input[type="checkbox"]:checked')).map(cb => cb.value);
    if (!db.notes[cls]) db.notes[cls] = {};
    if (!db.notes[cls][student]) db.notes[cls][student] = {};
    db.notes[cls][student][date] = selectedNotes;
    saveToCloud(true);
    loadStudentHistory(); 
}

function deleteNoteRecord(cls, student, date) {
    if(confirm(`هل أنت متأكد من حذف الملاحظات المسجلة بتاريخ ${date}؟`)) {
        delete db.notes[cls][student][date];
        saveToCloud(false, true);
        showToast("تم حذف الملاحظة بنجاح");
        if(document.getElementById('classNotesArea').style.display === 'block') viewClassNotes();
        else loadStudentHistory();
    }
}

function viewClassNotes() {
    const cls = document.getElementById('noteClassSelect').value;
    const classArea = document.getElementById('classNotesArea');
    const classDiv = document.getElementById('classNotesDisplay');
    if (!cls) return alert("المرجو اختيار القسم أولاً.");
    classDiv.innerHTML = '';
    let hasClassNotes = false;
    
    if (db.notes[cls]) {
        for (let student in db.notes[cls]) {
            let studentHtml = `<div style="background: rgba(128,128,128,0.05); padding: 10px; border-radius: 5px; margin-bottom: 10px; border-right: 4px solid var(--primary);">`;
            studentHtml += `<h4 style="margin: 0 0 10px 0; color: var(--title-color);">👤 ${student}</h4>`;
            let hasStudentNotes = false;
            
            Object.keys(db.notes[cls][student]).sort((a,b) => new Date(b) - new Date(a)).forEach(d => {
                const notes = db.notes[cls][student][d];
                if (notes.length > 0) {
                    hasClassNotes = true; hasStudentNotes = true;
                    const isPos = notes.includes("تقديم مشاركة متميزة") || notes.includes("استحقاق نقطة حسنة");
                    studentHtml += `
                    <div class="note-item ${isPos ? 'positive' : ''}" style="margin-left: 10px; margin-right: 10px;">
                        <button class="btn-delete-note" title="حذف الملاحظة" onclick="deleteNoteRecord('${cls}', '${student}', '${d}')">🗑️</button>
                        <strong style="margin-right: 25px; color:var(--title-color);">📅 ${d}</strong><br>
                        <div style="margin-right: 25px; color:var(--text);">- ${notes.join('<br>- ')}</div>
                    </div>`;
                }
            });
            studentHtml += `</div>`;
            if (hasStudentNotes) classDiv.innerHTML += studentHtml;
        }
    }
    if (!hasClassNotes) classDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد ملاحظات مسجلة لتلاميذ هذا القسم.</p>';
    classArea.style.display = 'block';
    document.getElementById('noteCheckboxesArea').style.display = 'none';
    document.getElementById('noteHistoryArea').style.display = 'none';
    document.getElementById('noteStudentSelect').value = ""; 
}

/* ================== الفروض المصغرة وتصحيح الدفاتر ================== */
function loadMiniExams() {
    const date = document.getElementById('miniExamsDate').value;
    const cls = document.getElementById('miniExamsClassSelect').value;
    const type = document.getElementById('miniExamTypeSelect').value;
    const list = document.getElementById('miniExamsList');
    document.getElementById('searchMiniExams').value = '';
    list.innerHTML = '';
    
    if (!date || !cls || !type || !db.students[cls] || db.students[cls].length === 0) {
        return list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">المرجو إكمال الاختيارات أعلاه.</p>';
    }

    const saved = (db.miniExams[date] && db.miniExams[date][cls] && db.miniExams[date][cls][type]) ? db.miniExams[date][cls][type] : {};

    let html = '';
    db.students[cls].forEach((student, index) => {
        let val = saved[student] || '';
        let controlsHtml = '';
        
        if (type === 'تصحيح الدفتر') {
            let grade = '', status = 'دفتر أنيق مرتب';
            if (val && val.includes('|')) {
                [grade, status] = val.split('|').map(s => s.trim());
            } else if (val) {
                status = val;
            }
            controlsHtml = `
                <div style="display:flex; gap:10px; align-items:center; width:100%;">
                    <input type="number" id="mx_grade_${index}" value="${grade}" min="1" max="10" step="0.5" placeholder="نقطة /10" style="width: 100px; padding: 8px;">
                    <select id="mx_status_${index}" style="flex-grow:1; padding:8px;">
                        <option value="دفتر أنيق مرتب" ${status==='دفتر أنيق مرتب'?'selected':''}>دفتر أنيق مرتب</option>
                        <option value="دفتر غير مرتب" ${status==='دفتر غير مرتب'?'selected':''}>دفتر غير مرتب</option>
                        <option value="لم يحضر الدفتر" ${status==='لم يحضر الدفتر'?'selected':''}>لم يحضر الدفتر</option>
                    </select>
                </div>
            `;
        } else {
            val = val || 'لم ينجز';
            controlsHtml = `
                <label><input type="radio" name="mx_${index}" value="لم ينجز" ${val==='لم ينجز'?'checked':''}> لم ينجز</label>
                <label><input type="radio" name="mx_${index}" value="ضعيف" ${val==='ضعيف'?'checked':''}> ضعيف</label>
                <label><input type="radio" name="mx_${index}" value="متوسط" ${val==='متوسط'?'checked':''}> متوسط</label>
                <label><input type="radio" name="mx_${index}" value="جيد" ${val==='جيد'?'checked':''}> جيد</label>
            `;
        }

        html += `
            <div class="student-row">
                <div class="student-name"><span class="student-number">${index + 1}</span> ${student}</div>
                <div class="options-group">
                    ${controlsHtml}
                </div>
            </div>`;
    });
    
    html += `<button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; margin-top: 10px;" onclick="saveMiniExams()">💾 حفظ نتائج هذا النشاط</button>`;
    list.innerHTML = html;
}

function saveMiniExams() {
    const date = document.getElementById('miniExamsDate').value;
    const cls = document.getElementById('miniExamsClassSelect').value;
    const type = document.getElementById('miniExamTypeSelect').value;
    if (!date || !cls || !type) return alert("المرجو إكمال جميع الاختيارات.");

    if (!db.miniExams[date]) db.miniExams[date] = {};
    if (!db.miniExams[date][cls]) db.miniExams[date][cls] = {};
    db.miniExams[date][cls][type] = {}; 

    db.students[cls].forEach((student, index) => {
        let val = '';
        if (type === 'تصحيح الدفتر') {
            const grade = document.getElementById(`mx_grade_${index}`).value;
            const status = document.getElementById(`mx_status_${index}`).value;
            val = grade ? `${grade} | ${status}` : status;
        } else {
            const node = document.querySelector(`input[name="mx_${index}"]:checked`);
            val = node ? node.value : 'لم ينجز';
        }
        db.miniExams[date][cls][type][student] = val;
    });
    saveToCloud(true);
}

/* ================== المراقبة المستمرة ================== */
function loadGrades() {
    const date = document.getElementById('gradesDate').value;
    const cls = document.getElementById('gradesClassSelect').value;
    const list = document.getElementById('gradesList');
    const actions = document.getElementById('gradesActions');
    document.getElementById('searchGrades').value = '';
    list.innerHTML = '';
    
    if (!cls || !db.students[cls] || db.students[cls].length === 0) { 
        actions.style.display = 'none'; 
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">المرجو اختيار التاريخ والقسم.</p>'; 
        return; 
    }
    
    actions.style.display = 'flex';
    const saved = (db.grades[date] && db.grades[date][cls]) ? db.grades[date][cls] : {};
    
    let html = '';
    db.students[cls].forEach((student, index) => {
        const stdData = saved[student] || { e1: '', e2: '', act: '', avg: '-' };
        const bonus = (db.bonusPoints[cls] && db.bonusPoints[cls][student]) ? db.bonusPoints[cls][student] : 0;
        
        let bgStyle = "background: var(--secondary); color:white;";
        let numAvg = parseFloat(stdData.avg);
        if (!isNaN(numAvg)) {
            bgStyle = numAvg < 10 ? "background: var(--danger); color: white;" : "background: var(--accent); color: white;";
        }
        
        html += `
        <div class="student-row">
            <div class="student-name">
                ${index + 1}- ${student} 
                <span style="font-size:0.8rem; background:rgba(241, 196, 15, 0.2); color:var(--text); padding:2px 5px; border-radius:3px;">بونص: +${bonus}</span>
            </div>
            <div class="grades-grid">
                <div>
                    <label>الفرض الأول</label>
                    <input type="number" id="e1_${index}" value="${stdData.e1}" min="0" max="20" step="0.25" oninput="calcAvg(${index})">
                </div>
                <div>
                    <label>الفرض الثاني</label>
                    <input type="number" id="e2_${index}" value="${stdData.e2}" min="0" max="20" step="0.25" oninput="calcAvg(${index})">
                </div>
                <div>
                    <label>الأنشطة</label>
                    <input type="number" id="act_${index}" value="${stdData.act}" min="0" max="20" step="0.25" oninput="calcAvg(${index})">
                </div>
                <div>
                    <label>المعدل العام</label>
                    <div class="avg-box" id="avg_${index}" style="${bgStyle}">${stdData.avg}</div>
                </div>
            </div>
        </div>`;
    });
    
    html += `<button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; margin-top: 10px;" onclick="saveGrades()">💾 حفظ نتائج المراقبة المستمرة</button>`;
    list.innerHTML = html;
}

function calcAvg(index) { 
    const e1 = parseFloat(document.getElementById(`e1_${index}`).value) || 0; 
    const e2 = parseFloat(document.getElementById(`e2_${index}`).value) || 0; 
    const act = parseFloat(document.getElementById(`act_${index}`).value) || 0; 
    const avg = (((e1 + e2) / 2) * 0.75) + (act * 0.25); 
    const box = document.getElementById(`avg_${index}`); 
    box.innerText = avg.toFixed(2); 
    box.style.background = avg < 10 ? 'var(--danger)' : 'var(--accent)'; 
}

function saveGrades() { 
    const date = document.getElementById('gradesDate').value; 
    const cls = document.getElementById('gradesClassSelect').value; 
    if (!date || !cls) return alert("المرجو اختيار التاريخ والقسم."); 
    
    if (!db.grades[date]) db.grades[date] = {}; 
    db.grades[date][cls] = {}; 
    
    db.students[cls].forEach((student, index) => { 
        db.grades[date][cls][student] = { 
            e1: document.getElementById(`e1_${index}`).value, 
            e2: document.getElementById(`e2_${index}`).value, 
            act: document.getElementById(`act_${index}`).value, 
            avg: document.getElementById(`avg_${index}`).innerText 
        }; 
    }); 
    saveToCloud(true); 
}

function shareGrades(type) { 
    const date = document.getElementById('gradesDate').value;
    const cls = document.getElementById('gradesClassSelect').value;
    if (!db.grades[date] || !db.grades[date][cls]) return alert("المرجو حفظ النقط أولاً.");
    const data = db.grades[date][cls];
    let txt = `*لائحة المراقبة المستمرة*\n*القسم:* ${cls}\n*التاريخ:* ${date}\n\n`;
    let csvContent = "\uFEFFالرقم,الاسم الكامل,الفرض الأول,الفرض الثاني,الأنشطة المندمجة,المعدل العام\n";
    db.students[cls].forEach((student, index) => {
        const d = data[student];
        txt += `${index+1}- ${student}: ${d.avg}\n`;
        csvContent += `${index+1},${student},${d.e1},${d.e2},${d.act},${d.avg}\n`;
    });
    if (type === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
    else if (type === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(txt)}`, '_blank');
    else if (type === 'excel') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
        link.download = `نقط_${cls}_${date}.csv`; link.click();
    }
}

/* ================== التقارير الشاملة ================== */
function toggleReportInputs() {
    const rType = document.getElementById('reportTypeSelect').value;
    const tFrame = document.getElementById('reportTimeframeSelect').value;
    const tfSelect = document.getElementById('reportTimeframeSelect');
    const dInput = document.getElementById('reportDate');
    const mInput = document.getElementById('reportMonth');

    if (rType === 'tracking' || rType === 'miniExams') {
        tfSelect.style.display = 'block';
        if (tFrame === 'daily') { dInput.style.display = 'block'; mInput.style.display = 'none'; } 
        else if (tFrame === 'monthly') { dInput.style.display = 'none'; mInput.style.display = 'block'; } 
        else { dInput.style.display = 'none'; mInput.style.display = 'none'; }
    } else {
        tfSelect.style.display = 'none'; dInput.style.display = 'none'; mInput.style.display = 'none';
    }
    viewReport(); 
}

function viewReport() {
    const reportType = document.getElementById('reportTypeSelect').value;
    const tFrame = document.getElementById('reportTimeframeSelect').value;
    const selClass = document.getElementById('reportClassSelect').value;
    const display = document.getElementById('reportDisplay');
    const actions = document.getElementById('reportActions');

    if (!selClass || !reportType) { display.style.display = 'none'; actions.style.display = 'none'; return; }
    display.innerHTML = ''; currentReportText = '';

    if (reportType === 'tracking') {
        let datesToProcess = [];
        let reportTitle = "";
        
        if (tFrame === 'daily') {
            const date = document.getElementById('reportDate').value;
            if(date && db.records[date] && db.records[date][selClass]) datesToProcess.push(date);
            reportTitle = `تتبع الحضور والإعداد: ${selClass} (${date})`;
        } else if (tFrame === 'monthly') {
            const month = document.getElementById('reportMonth').value;
            if(month) Object.keys(db.records).forEach(d => { if(d.startsWith(month) && db.records[d][selClass]) datesToProcess.push(d); });
            reportTitle = `التقرير الشهري (حضور وإعداد): ${selClass} (${month})`;
        } else {
            Object.keys(db.records).forEach(d => { if(db.records[d][selClass]) datesToProcess.push(d); });
            reportTitle = `التقرير الشامل (حضور وإعداد): ${selClass}`;
        }

        if (datesToProcess.length === 0) { 
            display.innerHTML = '<p style="text-align:center; color:var(--danger);">لا توجد بيانات محفوظة لهذه الفترة.</p>';
            display.style.display = 'block'; actions.style.display = 'none'; return; 
        }

        if(tFrame === 'daily') {
            const date = datesToProcess[0];
            const records = db.records[date][selClass];
            let sessionType = 'normal';
            if(db.sessionMeta && db.sessionMeta[date] && db.sessionMeta[date][selClass]) sessionType = db.sessionMeta[date][selClass];

            const formatName = s => `(${s.number || (db.students[selClass].indexOf(s.name) + 1)}) ${s.name}`;
            const prepGood = records.filter(s => s.preparation === "إنجاز جيد" && s.attendance !== "غائب").map(formatName);
            const prepMed = records.filter(s => s.preparation === "إنجاز متوسط" && s.attendance !== "غائب").map(formatName);
            const prepWeak = records.filter(s => s.preparation === "إنجاز ضعيف" && s.attendance !== "غائب").map(formatName);
            const noPrep = records.filter(s => s.preparation === "لم ينجز" && s.attendance !== "غائب").map(formatName);
            const absentees = records.filter(s => s.attendance === "غائب").map(formatName);
            const late = records.filter(s => s.attendance === "متأخر").map(formatName);

            let html = `<h4 style="color:var(--title-color);">🗓️ ${reportTitle}</h4><ul style="color:var(--text);">`;
            let txt = `*${reportTitle}*\n\n`;

            if (sessionType === 'normal') {
                html += `<li><strong>إنجاز جيد (${prepGood.length}):</strong> ${prepGood.join('، ') || '-'}</li>`;
                html += `<li><strong>إنجاز متوسط (${prepMed.length}):</strong> ${prepMed.join('، ') || '-'}</li>`;
                html += `<li><strong>إنجاز ضعيف (${prepWeak.length}):</strong> ${prepWeak.join('، ') || '-'}</li></ul>`;
                html += `<strong style="color:var(--danger);">❌ لم ينجزوا (${noPrep.length}):</strong><br> <span style="color:var(--text);">${noPrep.join('، ') || '-'}</span><br><br>`;
                txt += `*المنجزون للإعداد:*\n- جيد: ${prepGood.join('، ') || '-'}\n- متوسط: ${prepMed.join('، ') || '-'}\n- ضعيف: ${prepWeak.join('، ') || '-'}\n\n*لم ينجزوا:*\n${noPrep.join('، ') || 'لا يوجد'}\n\n`;
            } else if (sessionType === 'no_prep') {
                html += `</ul><p style="color:var(--secondary); background: rgba(0,0,0,0.05); padding:10px; border-radius:5px;">ℹ️ لم يتم تكليف التلاميذ بواجبات لينجزوها في هذه الحصة.</p>`;
                txt += `ℹ️ لم يتم تكليف التلاميذ بواجبات لينجزوها في هذه الحصة.\n\n`;
            } else if (sessionType === 'exam') {
                html += `</ul><p style="color:var(--danger); background: rgba(231, 76, 60, 0.1); padding:10px; border-radius:5px;">📝 تم تخصيص هذه الحصة لإجراء فرض محروس.</p>`;
                txt += `📝 تم تخصيص هذه الحصة لإجراء فرض محروس.\n\n`;
            }

            html += `<strong style="color:var(--danger);">🚫 المتغيبون (${absentees.length}):</strong><br> <span style="color:var(--text);">${absentees.join('، ') || '-'}</span><br><br>`;
            html += `<strong style="color:#f39c12;">⏳ المتأخرون (${late.length}):</strong><br> <span style="color:var(--text);">${late.join('، ') || '-'}</span>`;
            txt += `*الغياب:*\n${absentees.join('، ') || 'لا يوجد'}\n\n*التأخر:*\n${late.join('، ') || 'لا يوجد'}`;

            display.innerHTML = html; currentReportText = txt;
        } else {
            let stats = {};
            db.students[selClass].forEach(s => { stats[s] = { present:0, late:0, absent:0, good:0, med:0, weak:0, noPrep:0 }; });

            datesToProcess.forEach(d => {
                let sessionType = 'normal';
                if(db.sessionMeta && db.sessionMeta[d] && db.sessionMeta[d][selClass]) sessionType = db.sessionMeta[d][selClass];
                
                db.records[d][selClass].forEach(rec => {
                    const sName = rec.name;
                    if(stats[sName]) {
                        if(rec.attendance === 'حاضر') stats[sName].present++;
                        if(rec.attendance === 'متأخر') stats[sName].late++;
                        if(rec.attendance === 'غائب') stats[sName].absent++;

                        if(sessionType === 'normal' && rec.attendance !== 'غائب') {
                            if(rec.preparation === 'إنجاز جيد') stats[sName].good++;
                            if(rec.preparation === 'إنجاز متوسط') stats[sName].med++;
                            if(rec.preparation === 'إنجاز ضعيف') stats[sName].weak++;
                            if(rec.preparation === 'لم ينجز') stats[sName].noPrep++;
                        }
                    }
                });
            });

            let html = `<h4 style="color:var(--title-color); margin-bottom:15px;">📊 ${reportTitle}</h4>`;
            html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; color:var(--text); text-align:center; font-size:0.9rem;">`;
            html += `<tr style="background:var(--primary); color:white;">
                        <th style="padding:10px; border:1px solid var(--border);">التلميذ</th>
                        <th style="padding:10px; border:1px solid var(--border);">غائب</th>
                        <th style="padding:10px; border:1px solid var(--border);">تأخر</th>
                        <th style="padding:10px; border:1px solid var(--border); background:var(--accent);">جيد</th>
                        <th style="padding:10px; border:1px solid var(--border); background:#f39c12;">متوسط</th>
                        <th style="padding:10px; border:1px solid var(--border); background:#e67e22;">ضعيف</th>
                        <th style="padding:10px; border:1px solid var(--border); background:var(--danger);">لم ينجز</th>
                     </tr>`;
            
            let txt = `*${reportTitle}*\n\n`;

            db.students[selClass].forEach((s, idx) => {
                const st = stats[s];
                html += `<tr>
                    <td style="padding:8px; border:1px solid var(--border); font-weight:bold; text-align:right;">${idx+1}- ${s}</td>
                    <td style="padding:8px; border:1px solid var(--border); color:var(--danger); font-weight:bold;">${st.absent}</td>
                    <td style="padding:8px; border:1px solid var(--border); color:#f39c12;">${st.late}</td>
                    <td style="padding:8px; border:1px solid var(--border); color:var(--accent); font-weight:bold;">${st.good}</td>
                    <td style="padding:8px; border:1px solid var(--border);">${st.med}</td>
                    <td style="padding:8px; border:1px solid var(--border);">${st.weak}</td>
                    <td style="padding:8px; border:1px solid var(--border); color:var(--danger);">${st.noPrep}</td>
                </tr>`;
                txt += `${idx+1}- ${s} | غياب:${st.absent} | تأخر:${st.late} | جيد:${st.good} | متوسط:${st.med} | ضعيف:${st.weak} | لم ينجز:${st.noPrep}\n`;
            });
            html += `</table></div>`;
            display.innerHTML = html; currentReportText = txt;
        }
        display.style.display = 'block'; actions.style.display = 'flex';
    } 

    else if (reportType === 'miniExams') {
        let datesToProcess = [];
        let reportTitle = "";
        
        if (tFrame === 'daily') {
            const date = document.getElementById('reportDate').value;
            if(date && db.miniExams[date] && db.miniExams[date][selClass]) datesToProcess.push(date);
            reportTitle = `تقرير الأنشطة والفروض: ${selClass} (${date})`;
        } else if (tFrame === 'monthly') {
            const month = document.getElementById('reportMonth').value;
            if(month) Object.keys(db.miniExams).forEach(d => { if(d.startsWith(month) && db.miniExams[d][selClass]) datesToProcess.push(d); });
            reportTitle = `التقرير الشهري للأنشطة والفروض: ${selClass} (${month})`;
        } else {
            Object.keys(db.miniExams).forEach(d => { if(db.miniExams[d][selClass]) datesToProcess.push(d); });
            reportTitle = `التقرير الشامل للأنشطة والفروض: ${selClass}`;
        }

        if (datesToProcess.length === 0) { 
            display.innerHTML = '<p style="text-align:center; color:var(--danger);">لا توجد بيانات محفوظة لهذه الفترة.</p>';
            display.style.display = 'block'; actions.style.display = 'none'; return; 
        }

        datesToProcess.sort((a,b) => new Date(b) - new Date(a));

        let html = `<h4 style="color:var(--title-color);">📝 ${reportTitle}</h4>`;
        let txt = `*${reportTitle}*\n\n`;

        datesToProcess.forEach(date => {
            const dayExams = db.miniExams[date][selClass];
            for(let type in dayExams) {
                html += `<div style="background:rgba(128,128,128,0.05); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--border);">`;
                html += `<h5 style="color:var(--accent); margin:0 0 10px 0;">📅 ${date} | 📌 نشاط: ${type}</h5>`;
                html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; color:var(--text);">`;
                html += `<tr style="background:var(--primary); color:white;"><th style="padding:8px; border:1px solid var(--border);">التلميذ</th><th style="padding:8px; border:1px solid var(--border);">التقييم / النقطة</th></tr>`;
                txt += `📅 التاريخ: ${date} | 📌 نشاط: ${type}\n`;
                
                db.students[selClass].forEach((student, idx) => {
                    const grade = dayExams[type][student];
                    if(grade) {
                        html += `<tr><td style="padding:8px; border:1px solid var(--border);">${idx+1}- ${student}</td><td style="padding:8px; border:1px solid var(--border); text-align:center; font-weight:bold;">${grade}</td></tr>`;
                        txt += `${idx+1}- ${student} | ${grade}\n`;
                    }
                });
                html += `</table></div></div>`;
                txt += `-------------------\n`;
            }
        });
        
        display.innerHTML = html; currentReportText = txt;
        display.style.display = 'block'; actions.style.display = 'flex';
    }

    else if (reportType === 'notes') {
        if (!db.notes[selClass] || Object.keys(db.notes[selClass]).length === 0) {
            display.innerHTML = '<p style="text-align:center; color:var(--text-muted);">لا توجد ملاحظات مسجلة لتلاميذ هذا القسم.</p>';
            display.style.display = 'block'; actions.style.display = 'none'; return;
        } 
        let html = `<h4 style="color:var(--title-color);">📝 تقرير الملاحظات الخاصة: ${selClass}</h4>`;
        let txt = `*تقرير الملاحظات الخاصة*\n*القسم:* ${selClass}\n\n`;
        for (let student in db.notes[selClass]) {
            let studentHtml = `<div style="margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;"><strong style="color:var(--title-color);">👤 ${student}:</strong><ul style="color:var(--text);">`;
            let hasNotes = false;
            Object.keys(db.notes[selClass][student]).sort((a,b) => new Date(b) - new Date(a)).forEach(d => {
                const notes = db.notes[selClass][student][d];
                if(notes.length > 0) { hasNotes = true; studentHtml += `<li><em>${d}:</em> ${notes.join('، ')}</li>`; txt += `👤 *${student}* (${d}):\n- ${notes.join('\n- ')}\n`; }
            });
            studentHtml += `</ul></div>`;
            if(hasNotes) { html += studentHtml; txt += '\n'; }
        }
        display.innerHTML = html; currentReportText = txt;
        display.style.display = 'block'; actions.style.display = 'flex';
    }

    else if (reportType === 'lessons') {
        let allLogs = [];
        for(let d in db.lessonLog) { if(db.lessonLog[d][selClass]) { db.lessonLog[d][selClass].forEach(log => allLogs.push({ date: d, ...log })); } }
        if (allLogs.length === 0) { 
            display.innerHTML = '<p style="text-align:center; color:var(--text-muted);">لا توجد دروس مسجلة لهذا القسم.</p>'; 
            display.style.display = 'block'; actions.style.display = 'none'; return;
        } 
        allLogs.sort((a,b) => new Date(b.date) - new Date(a.date));
        let html = `<h4 style="color:var(--title-color);">📘 دفتر النصوص التراكمي: ${selClass}</h4>`;
        let txt = `*دفتر النصوص التراكمي*\n*القسم:* ${selClass}\n\n`;
        allLogs.forEach(log => {
            html += `<div style="border-right: 4px solid var(--primary); background:rgba(128,128,128,0.05); padding: 10px; margin-bottom: 10px; color:var(--text);">`;
            html += `<strong style="color:var(--accent);">📅 ${log.date} | ${log.component}</strong><br>`;
            txt += `📅 *${log.date}* | ${log.component}\n`;
            if (log.component === 'النصوص') {
                if(log.details.title) { html += `<em>العنوان:</em> ${log.details.title}<br>`; txt += `العنوان: ${log.details.title}\n`; }
                if(log.details.session1 && log.details.session1.length > 0) { html += `<em>الحصة 1:</em> ${log.details.session1.join('، ')}<br>`; txt += `الحصة 1: ${log.details.session1.join('، ')}\n`; }
                if(log.details.analysis && log.details.analysis.length > 0) { html += `<em>تحليل:</em> ${log.details.analysis.join('، ')}<br>`; txt += `تحليل: ${log.details.analysis.join('، ')}\n`; }
                if(log.details.session2_end && log.details.session2_end.length > 0) { html += `<em>خواتيم:</em> ${log.details.session2_end.join('، ')}<br>`; txt += `خواتيم: ${log.details.session2_end.join('، ')}\n`; }
            } else if (log.component === 'الدرس اللغوي') {
                html += `<em>الظاهرة:</em> ${log.details.title || 'لم يحدد'}<br>`; txt += `الظاهرة: ${log.details.title || 'لم يحدد'}\n`;
            } else if (log.component === 'التعبير والإنشاء') {
                if(log.details.title) { html += `<em>المهارة:</em> ${log.details.title}<br>`; txt += `المهارة: ${log.details.title}\n`; }
                if(log.details.steps && log.details.steps.length > 0) { html += `<em>النشاط:</em> ${log.details.steps.join('، ')}<br>`; txt += `النشاط: ${log.details.steps.join('، ')}\n`; }
            } else if (log.component === 'المؤلفات') {
                if(log.details.steps && log.details.steps.length > 0) { html += `<em>القراءة:</em> ${log.details.steps.join('، ')}<br>`; txt += `القراءة: ${log.details.steps.join('، ')}\n`; }
                if(log.details.content) { html += `<em>المحتوى:</em> ${log.details.content}<br>`; txt += `المحتوى: ${log.details.content}\n`; }
            }
            html += `</div>`; txt += `-------------------\n`;
        });
        display.innerHTML = html; currentReportText = txt;
        display.style.display = 'block'; actions.style.display = 'flex';
    }
}

function shareReport(type) {
    if (!currentReportText) return;
    if (type === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(currentReportText)}`, '_blank');
    else if (type === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(currentReportText)}`, '_blank');
    else if (type === 'download') {
        const cleanText = currentReportText.replace(/\*/g, '');
        const blob = new Blob(['\uFEFF' + cleanText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
        const repType = document.getElementById('reportTypeSelect').options[document.getElementById('reportTypeSelect').selectedIndex].text;
        link.download = `تقرير_${repType}_${document.getElementById('reportClassSelect').value}.txt`; link.click();
    }
}
function printPDFReport() {
    const printArea = document.getElementById('printArea');
    if(printArea.innerHTML.trim() === '' || document.getElementById('reportDisplay').style.display === 'none') {
        return alert("لا يوجد تقرير لطباعته. المرجو استخراج التقرير أولاً.");
    }
    window.print();
}

/* ================== دوال فرعية لا تتأثر (القرعة، الإجراءات، دفتر النصوص) ================== */
function loadDiscStudents() { const cls = document.getElementById('discClassSelect').value; const sel = document.getElementById('discStudentSelect'); const up = document.getElementById('discUploadArea'); if (!cls || !db.students[cls]) { sel.style.display = 'none'; up.style.display = 'none'; return; } sel.innerHTML = '<option value="">-- اختر التلميذ --</option>'; db.students[cls].forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`); sel.style.display = 'block'; sel.onchange = () => { up.style.display = sel.value ? 'block' : 'none'; }; }
function saveDisciplinary() { const date = document.getElementById('discDate').value; const cls = document.getElementById('discClassSelect').value; const student = document.getElementById('discStudentSelect').value; const fileInput = document.getElementById('discPdfFile'); if (!date || !cls || !student || !fileInput.files.length) return alert("أكمل البيانات المرفقة."); const file = fileInput.files[0]; if (file.size > 2 * 1024 * 1024) return alert("الـ PDF يتجاوز 2 ميغابايت."); const reader = new FileReader(); reader.onload = function(e) { db.disciplinary[Date.now()] = { date: date, class: cls, student: student, pdfData: e.target.result }; saveToCloud(true); document.getElementById('discStudentSelect').value = ''; fileInput.value = ''; document.getElementById('discUploadArea').style.display = 'none'; viewDisciplinary(); }; reader.readAsDataURL(file); }
function viewDisciplinary() { const filterCls = document.getElementById('discFilterClass').value; const display = document.getElementById('discArchiveDisplay'); display.innerHTML = ''; if (!db.disciplinary || Object.keys(db.disciplinary).length === 0) return display.innerHTML = '<p style="color:var(--text-muted); text-align:center;">لا توجد إجراءات.</p>'; let logs = Object.values(db.disciplinary).sort((a,b) => new Date(b.date) - new Date(a.date)); if (filterCls) logs = logs.filter(l => l.class === filterCls); logs.forEach(log => { const id = Object.keys(db.disciplinary).find(k => db.disciplinary[k] === log); display.innerHTML += `<div class="log-entry" style="border-color:var(--danger);"><button class="delete-log" onclick="deleteDisciplinary('${id}')">حذف</button><h4 style="color:var(--danger);">👤 ${log.student}</h4><p style="color:var(--text);">القسم: ${log.class} | التاريخ: ${log.date}</p><button class="btn-primary" onclick="downloadPDF('${id}')">📄 تحميل التقرير</button></div>`; }); }
function deleteDisciplinary(id) { if(confirm("حذف الإجراء نهائياً؟")) { delete db.disciplinary[id]; saveToCloud(false); viewDisciplinary(); } }
function downloadPDF(id) { const link = document.createElement('a'); link.href = db.disciplinary[id].pdfData; link.download = `تقرير_${db.disciplinary[id].student}.pdf`; link.click(); }

function loadRandomizerData() { const catSelect = document.getElementById('randCatSelect'); const catList = document.getElementById('randCatList'); const currentVal = catSelect.value; catSelect.innerHTML = '<option value="">-- اختر مجموعة الموضوعات --</option>'; catList.innerHTML = ''; Object.keys(db.randomTopics).forEach(cat => { catSelect.innerHTML += `<option value="${cat}">${cat}</option>`; catList.innerHTML += `<li><span style="color:var(--text);">📁 ${cat} (${db.randomTopics[cat].length} موضوع)</span><button class="btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteTopicCategory('${cat}')">حذف</button></li>`; }); catSelect.value = currentVal; }
function addTopicCategory() { const catName = document.getElementById('newRandCatName').value.trim(); const file = document.getElementById('randFileInput').files[0]; if (!catName || !file) return alert("المرجو إدخال البيانات"); const reader = new FileReader(); reader.onload = function(e) { db.randomTopics[catName] = e.target.result.split('\n').map(l => l.trim()).filter(l => l.length > 0); document.getElementById('newRandCatName').value = ''; document.getElementById('randFileInput').value = ''; saveToCloud(true); loadRandomizerData(); }; reader.readAsText(file); }
function deleteTopicCategory(catName) { if(confirm(`تأكيد حذف "${catName}"؟`)) { delete db.randomTopics[catName]; saveToCloud(false); loadRandomizerData(); } }
function drawRandom(type) { const cls = document.getElementById('randClassSelect').value; const cat = document.getElementById('randCatSelect').value; const resDiv = document.getElementById('drawResult'); let resultHtml = ''; if ((type === 'both' || type === 'student') && (!cls || !db.students[cls] || db.students[cls].length === 0)) return alert("المرجو اختيار قسم."); if ((type === 'both' || type === 'topic') && (!cat || !db.randomTopics[cat] || db.randomTopics[cat].length === 0)) return alert("المرجو اختيار مجموعة."); resDiv.style.display = 'block'; resDiv.innerHTML = '<h2 style="color: var(--text-muted);">⏳ جاري السحب...</h2>'; setTimeout(() => { if (type === 'both' || type === 'student') resultHtml += `<h2 style="color: var(--primary);">👤 التلميذ: ${db.students[cls][Math.floor(Math.random() * db.students[cls].length)]}</h2>`; if (type === 'both' || type === 'topic') resultHtml += `<h3 style="color: #e67e22;">🎯 الموضوع: ${db.randomTopics[cat][Math.floor(Math.random() * db.randomTopics[cat].length)]}</h3>`; resDiv.innerHTML = resultHtml; }, 800); }

function toggleCompFields() { const c = document.getElementById('compSelect').value; ['texts','lang','expr','lit'].forEach(x => document.getElementById('comp_'+x).style.display = (c.includes(x==='texts'?'النصوص':x==='lang'?'اللغوي':x==='expr'?'الإنشاء':'المؤلفات')) ? 'block' : 'none'); }
function saveLessonLog() { const date = document.getElementById('lessonDate').value; const cls = document.getElementById('lessonClassSelect').value; const comp = document.getElementById('compSelect').value; if (!date || !cls || !comp) return alert("المرجو إكمال الاختيارات."); let entry = { id: Date.now(), component: comp, details: {} }; if (comp === 'النصوص') { entry.details.title = document.getElementById('texts_title').value; entry.details.session1 = Array.from(document.querySelectorAll('input[name="texts_s1"]:checked')).map(cb => cb.value); entry.details.analysis = Array.from(document.querySelectorAll('input[name="texts_s2_analysis"]:checked')).map(cb => cb.value); entry.details.session2_end = Array.from(document.querySelectorAll('input[name="texts_s2_end"]:checked')).map(cb => cb.value); } else if (comp === 'الدرس اللغوي') { entry.details.title = document.getElementById('lang_title').value; } else if (comp === 'التعبير والإنشاء') { entry.details.title = document.getElementById('expr_title').value; entry.details.steps = Array.from(document.querySelectorAll('input[name="expr_steps"]:checked')).map(cb => cb.value); } else if (comp === 'المؤلفات') { entry.details.steps = Array.from(document.querySelectorAll('input[name="lit_steps"]:checked')).map(cb => cb.value); entry.details.content = document.getElementById('lit_content').value; } if (!db.lessonLog[date]) db.lessonLog[date] = {}; if (!db.lessonLog[date][cls]) db.lessonLog[date][cls] = []; db.lessonLog[date][cls].push(entry); document.querySelectorAll('#lessonLogTab input[type="text"], #lessonLogTab textarea').forEach(el => el.value = ''); document.querySelectorAll('#lessonLogTab input[type="checkbox"]').forEach(el => el.checked = false); document.getElementById('compSelect').value = ''; toggleCompFields(); saveToCloud(true); viewLessonLog(); }
function viewLessonLog() { const date = document.getElementById('lessonDate').value; const cls = document.getElementById('lessonClassSelect').value; const area = document.getElementById('lessonDisplayArea'); const display = document.getElementById('lessonLogDisplay'); if (!date || !cls || !db.lessonLog[date] || !db.lessonLog[date][cls] || db.lessonLog[date][cls].length === 0) { area.style.display = 'none'; return; } const logs = db.lessonLog[date][cls]; let html = ''; logs.forEach(log => { html += `<div class="log-entry"><button class="delete-log" onclick="deleteLessonLog(${log.id})">حذف</button><h4 style="color:var(--title-color);">📘 المكون: ${log.component}</h4>`; if (log.component === 'النصوص') { if(log.details.title) html += `<strong style="color:var(--text);">العنوان:</strong> <span style="color:var(--text);">${log.details.title}</span><br>`; if(log.details.session1 && log.details.session1.length > 0) html += `<strong style="color:var(--text);">الحصة الأولى:</strong><ul style="color:var(--text);"><li>${log.details.session1.join('</li><li>')}</li></ul>`; if(log.details.analysis && log.details.analysis.length > 0) html += `<strong style="color:var(--text);">الحصة الثانية (تحليل):</strong><ul style="color:var(--text);"><li>${log.details.analysis.join('</li><li>')}</li></ul>`; if(log.details.session2_end && log.details.session2_end.length > 0) html += `<strong style="color:var(--text);">خواتيم:</strong><ul style="color:var(--text);"><li>${log.details.session2_end.join('</li><li>')}</li></ul>`; } else if (log.component === 'الدرس اللغوي') { html += `<strong style="color:var(--text);">الظاهرة اللغوية:</strong> <span style="color:var(--text);">${log.details.title || 'لم يحدد'}</span><br>`; } else if (log.component === 'التعبير والإنشاء') { if(log.details.title) html += `<strong style="color:var(--text);">المهارة:</strong> <span style="color:var(--text);">${log.details.title}</span><br>`; if(log.details.steps && log.details.steps.length > 0) html += `<strong style="color:var(--text);">النشاط:</strong><ul style="color:var(--text);"><li>${log.details.steps.join('</li><li>')}</li></ul>`; } else if (log.component === 'المؤلفات') { if(log.details.steps && log.details.steps.length > 0) html += `<strong style="color:var(--text);">القراءة:</strong><ul style="color:var(--text);"><li>${log.details.steps.join('</li><li>')}</li></ul>`; if(log.details.content) html += `<strong style="color:var(--text);">المحتوى المنجز:</strong><p style="margin-top:5px; background:var(--card-bg); color:var(--text); padding:10px; border-radius:4px;">${log.details.content}</p>`; } html += `</div>`; }); display.innerHTML = html; area.style.display = 'block'; }
function deleteLessonLog(id) { if(!confirm("حذف هذا السجل؟")) return; const date = document.getElementById('lessonDate').value; const cls = document.getElementById('lessonClassSelect').value; db.lessonLog[date][cls] = db.lessonLog[date][cls].filter(log => log.id !== id); saveToCloud(false); viewLessonLog(); }

function addClass() { const name = document.getElementById('newClassName').value.trim(); if (!name) return alert("المرجو إدخال اسم القسم."); if (db.classes.includes(name)) return alert("موجود مسبقاً!"); db.classes.push(name); db.students[name] = []; document.getElementById('newClassName').value = ""; init(); saveToCloud(true); }
function deleteClass() { const selClass = document.getElementById('manageClassSelect').value; if (!selClass) return alert("المرجو اختيار قسم."); if (confirm(`حذف قسم "${selClass}" بالكامل؟`)) { db.classes = db.classes.filter(c => c !== selClass); delete db.students[selClass]; init(); document.getElementById('studentManagementArea').style.display = 'none'; saveToCloud(true); } }
function renderStudentManagement() { const selClass = document.getElementById('manageClassSelect').value; const area = document.getElementById('studentManagementArea'); const list = document.getElementById('manageStudentList'); if (!selClass) { area.style.display = 'none'; return; } area.style.display = 'block'; list.innerHTML = ''; if (!db.students[selClass]) db.students[selClass] = []; db.students[selClass].forEach((student, index) => { list.innerHTML += `<li><span style="color:var(--text);"><span class="student-number">${index + 1}</span> - ${student}</span><button class="btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteStudent('${selClass}', ${index})">حذف</button></li>`; }); }
function addStudent() { const selClass = document.getElementById('manageClassSelect').value; const name = document.getElementById('newStudentName').value.trim(); if (!name || !selClass) return; db.students[selClass].push(name); document.getElementById('newStudentName').value = ""; renderStudentManagement(); saveToCloud(false); }
function deleteStudent(className, studentIndex) { if (confirm("حذف هذا التلميذ؟")) { db.students[className].splice(studentIndex, 1); renderStudentManagement(); saveToCloud(false); } }
function importStudents() { const file = document.getElementById('fileInput').files[0]; const selectedClass = document.getElementById('manageClassSelect').value; if (!selectedClass || !file) return; const reader = new FileReader(); reader.onload = function(e) { db.students[selectedClass] = e.target.result.split('\n').map(line => line.replace(/\\s*/g, '').trim()).filter(line => line.length > 0); document.getElementById('fileInput').value = ""; renderStudentManagement(); saveToCloud(true); }; reader.readAsText(file); }
