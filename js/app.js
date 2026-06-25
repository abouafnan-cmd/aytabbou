let poetryDB = getPoetryDatabase();
let usedVerses = new Set();
let nextRequiredLetter = "";

const micBtn = document.getElementById('mic-btn');
const micIcon = document.getElementById('mic-icon');
const statusText = document.getElementById('status-text');
const arena = document.getElementById('arena');
const welcomeMsg = document.getElementById('welcome-msg');
const targetLetterBadge = document.getElementById('target-letter-badge');
const targetLetterSpan = document.getElementById('target-letter');

// ضبط محرك التعرف على الصوت
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        statusText.innerText = "جاري الاستماع... ألقِ بيتك الآن";
        micBtn.classList.replace('bg-emerald-600', 'bg-red-600');
    };

    recognition.onend = () => {
        isListening = false;
        statusText.innerText = "اضغط للتحدث";
        micBtn.classList.replace('bg-red-600', 'bg-emerald-600');
    };

    recognition.onresult = (event) => {
        const userSpeech = event.results[0][0].transcript.trim();
        handleUserTurn(userSpeech);
    };

    recognition.onerror = () => {
        statusText.innerText = "تعذر التقاط الصوت، حاول مجدداً";
    };
} else {
    statusText.innerText = "المتصفح لا يدعم ميزة التعرف على الصوت الفوري.";
    micBtn.disabled = true;
}

micBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (isListening) {
        recognition.stop();
    } else {
        if (welcomeMsg) welcomeMsg.remove();
        recognition.start();
    }
});

function handleUserTurn(userText) {
    const cleanText = userText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, "").trim();
    if (!cleanText) return;

    const firstLetter = cleanText.charAt(0);
    const lastLetter = cleanText.charAt(cleanText.length - 1);

    if (nextRequiredLetter && firstLetter !== nextRequiredLetter) {
        appendMessage('system', `خطأ! يجب أن تبدأ بحرف (${nextRequiredLetter}). لقد بدأت بحرف (${firstLetter}).`);
        speakText(`عذراً، يجب أن تبدأ بحرف ${nextRequiredLetter}`);
        return;
    }

    appendMessage('user', userText);

    setTimeout(() => {
        appReply(lastLetter);
    }, 1200);
}

function appReply(letter) {
    // تحديث قاعدة البيانات في حال تمت إضافات من لوحة التحكم
    poetryDB = getPoetryDatabase();
    
    const match = poetryDB.find(v => v.first === letter && !usedVerses.has(v.id));

    if (match) {
        usedVerses.add(match.id);
        const poetInfo = match.poet ? ` [${match.poet}]` : '';
        appendMessage('app', match.text + poetInfo);
        speakText(match.text);

        nextRequiredLetter = match.rawiyy;
        targetLetterSpan.innerText = nextRequiredLetter;
        targetLetterBadge.classList.remove('hidden');
    } else {
        appendMessage('app', `ما شاء الله! لم أجد بيتاً يبدأ بحرف (${letter}). تفوّقت عليّ! 🏆`);
        speakText("أحسنت، لقد فزت في هذه الجولة");
        nextRequiredLetter = "";
        targetLetterBadge.classList.add('hidden');
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3 rounded-xl max-w-[85%] text-sm md:text-base ${
        sender === 'user' ? 'bg-emerald-100 text-emerald-900 self-start' : 
        sender === 'app' ? 'bg-blue-100 text-blue-900 self-end text-left font-bold' : 
        'bg-rose-100 text-rose-900 self-center text-center text-xs'
    }`;
    msgDiv.innerText = text;
    arena.appendChild(msgDiv);
    arena.scrollTop = arena.scrollHeight;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const cleanSpeech = text.split('[')[0].replace('*', ' '); // عزل اسم الشاعر عن النطق
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = 'ar-EG'; 
        window.speechSynthesis.speak(utterance);
    }
}