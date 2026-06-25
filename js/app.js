let poetryDB = getPoetryDatabase();
let usedVerses = new Set();
let nextRequiredLetter = "";

let userScore = 0;
let appScore = 0;

const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status-text');
const arena = document.getElementById('arena');
const welcomeMsg = document.getElementById('welcome-msg');
const targetLetterBadge = document.getElementById('target-letter-badge');
const targetLetterSpan = document.getElementById('target-letter');
const visualizer = document.getElementById('visualizer');
const userScoreEme = document.getElementById('user-score');
const appScoreEme = document.getElementById('app-score');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        statusText.innerText = "أنا أستمع إليك.. ألقِ البيت";
        statusText.classList.add('text-red-500');
        micBtn.classList.replace('bg-emerald-600', 'bg-red-600');
        visualizer.classList.remove('hidden');
    };

    recognition.onend = () => {
        isListening = false;
        statusText.innerText = "اضغط لبدء الإلقاء";
        statusText.classList.remove('text-red-500');
        micBtn.classList.replace('bg-red-600', 'bg-emerald-600');
        visualizer.classList.add('hidden');
    };

    recognition.onresult = (event) => {
        const userSpeech = event.results[0][0].transcript.trim();
        handleUserTurn(userSpeech);
    };

    recognition.onerror = () => {
        statusText.innerText = "أعد المحاولة بوضوح من فضلك";
    };
} else {
    statusText.innerText = "المتصفح لا يدعم التسجيل الفوري";
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
    // تصفية الحركات والرموز لتحديد العروض الإملائي
    const cleanText = userText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, "").replace(/[ًٌٍَُِّْ]/g, "").trim();
    if (!cleanText) return;

    let firstLetter = cleanText.charAt(0);
    if (cleanText.startsWith("ال") && cleanText.length > 2) {
        firstLetter = cleanText.charAt(2);
    }

    let lastLetter = cleanText.charAt(cleanText.length - 1);
    
    // تفعيل شروط إسقاط حروف المد وهاء الغائب المتفق عليها عروضياً
    if (["ا", "و", "ي"].includes(lastLetter) && cleanText.length > 1) {
        lastLetter = cleanText.charAt(cleanText.length - 2);
    }
    if (lastLetter === "ه" && cleanText.length > 1) {
        lastLetter = cleanText.charAt(cleanText.length - 2);
    }

    if (nextRequiredLetter && firstLetter !== nextRequiredLetter) {
        appendMessage('system', `خطأ في الروي! يجب أن تبدأ بحرف (${nextRequiredLetter}). أنت بدأت بحرف (${firstLetter}).`);
        speakText(`يجب أن تبدأ بحرف ${nextRequiredLetter}`);
        appScore += 1;
        appScoreEme.innerText = appScore;
        return;
    }

    appendMessage('user', userText);
    userScore += 1;
    userScoreEme.innerText = userScore;

    setTimeout(() => {
        appReply(lastLetter);
    }, 1400);
}

function appReply(letter) {
    poetryDB = getPoetryDatabase();
    const match = poetryDB.find(v => v.first === letter && !usedVerses.has(v.id));

    if (match) {
        usedVerses.add(match.id);
        appendMessage('app', match.text);
        speakText(match.text);

        nextRequiredLetter = match.rawiyy;
        targetLetterSpan.innerText = nextRequiredLetter;
        targetLetterBadge.classList.remove('hidden');
    } else {
        appendMessage('app', `لله درّك! لم أجد بيتاً يبدأ بحرف (${letter}). لقد غلبتني في هذه الجولة! 🏆`);
        speakText("ما شاء الله، لقد فزت علي في هذه الجولة");
        userScore += 5;
        userScoreEme.innerText = userScore;
        nextRequiredLetter = "";
        targetLetterBadge.classList.add('hidden');
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3.5 rounded-2xl max-w-[85%] text-sm md:text-base shadow-sm border ${
        sender === 'user' ? 'bg-emerald-50 border-emerald-100 text-emerald-900 self-start' : 
        sender === 'app' ? 'bg-slate-800 border-slate-700 text-slate-100 self-end text-left font-medium tracking-wide' : 
        'bg-rose-50 border-rose-100 text-rose-800 self-center text-center text-xs'
    }`;
    msgDiv.innerText = text;
    arena.appendChild(msgDiv);
    arena.scrollTop = arena.scrollHeight;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const cleanSpeech = text.replace('*', ' ');
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.lang = 'ar-SA';
        utterance.rate = 0.78; // خفض السرعة ليصبح الإلقاء فخماً ورزيناً
        utterance.pitch = 1.0; 
        window.speechSynthesis.speak(utterance);
    }
}