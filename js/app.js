let usedVerses = new Set();
let nextRequiredLetter = "";
let userScore = 0;
let appScore = 0;

const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status-text');
const arena = document.getElementById('arena');
const targetLetterBadge = document.getElementById('target-letter-badge');
const targetLetterSpan = document.getElementById('target-letter');
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
        statusText.innerText = "أنا أنصت إليك بوعي.. ألقِ بيتَك";
        statusText.classList.add('text-red-500');
    };

    recognition.onend = () => {
        isListening = false;
        statusText.innerText = "اضغط لبدء الإلقاء";
        statusText.classList.remove('text-red-500');
    };

    recognition.onresult = (event) => {
        const userSpeech = event.results[0][0].transcript.trim();
        handleUserTurn(userSpeech);
    };
}

if(micBtn) {
    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isListening) recognition.stop();
        else {
            const welcome = document.getElementById('welcome-msg');
            if (welcome) welcome.remove();
            recognition.start();
        }
    });
}

function normalizeLetter(char) {
    if (!char) return "";
    if (["أ", "إ", "آ", "ا", "إِ", "أَ", "إَ"].includes(char)) return "أ";
    if (["ة", "ه"].includes(char)) return "ه";
    return char;
}

function handleUserTurn(userText) {
    let cleanText = userText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, "").replace(/[ًٌٍَُِّْ]/g, "").trim();
    if (!cleanText) return;

    let firstLetter = cleanText.charAt(0);
    if (cleanText.startsWith("ال") && cleanText.length > 2) {
        firstLetter = cleanText.charAt(2);
    }

    if (nextRequiredLetter && normalizeLetter(firstLetter) !== normalizeLetter(nextRequiredLetter)) {
        appendMessage('system', `خطأ! يجب أن تبدأ بحرف (${nextRequiredLetter}). لقد بدأت بـ (${firstLetter}).`);
        speakText(`يجب أَنْ تَبْدَأَ بِحَرْفِ ${nextRequiredLetter}`);
        appScore += 1;
        if(appScoreEme) appScoreEme.innerText = appScore;
        return;
    }

    appendMessage('user', userText);
    userScore += 1;
    if(userScoreEme) userScoreEme.innerText = userScore;

    let lastLetter = cleanText.charAt(cleanText.length - 1);
    if (["ا", "و", "ي"].includes(lastLetter) && cleanText.length > 1) {
        lastLetter = cleanText.charAt(cleanText.length - 2);
    }
    if (lastLetter === "ه" && cleanText.length > 1) {
        lastLetter = cleanText.charAt(cleanText.length - 2);
    }

    setTimeout(() => {
        appReply(normalizeLetter(lastLetter));
    }, 1200);
}

// الرد الذكي المدمج بين ملفات الأحرف ولوحة التحكم
async function appReply(letter) {
    const letterFiles = {
        "أ": "hamza", "ب": "baa", "ت": "taa", "ث": "thaa", "ج": "jeem", "ح": "haa", "خ": "khaa",
        "د": "daal", "ذ": "thaal", "ر": "raa", "ز": "zaay", "س": "seen", "ش": "sheen", "ص": "saad",
        "ض": "daad", "ط": "thaad", "ظ": "zaad", "ع": "ayn", "غ": "ghayn", "ف": "faa", "ق": "qaaf",
        "ك": "kaaf", "ل": "laam", "م": "meem", "ن": "noon", "ه": "haa_v", "و": "waw", "ي": "yaa"
    };

    const fileName = letterFiles[letter];
    if (!fileName) {
        handleAppDefeat(letter);
        return;
    }

    try {
        // 1. استدعاء الأبيات الأصلية الثابتة من ملف الحرف
        const module = await import(`./letters/${fileName}.js`);
        let versesList = [...module.verses];
        
        // 2. جلب الأبيات الإضافية المخصصة من لوحة التحكم (إن وجدت في الذاكرة المحلية)
        const localData = localStorage.getItem('custom_musajala_db');
        if (localData) {
            const customVerses = JSON.parse(localData).filter(v => normalizeLetter(v.first) === letter);
            versesList = [...versesList, ...customVerses]; // دمج المادتين معاً
        }

        const match = versesList.find(v => !usedVerses.has(v.id));

        if (match) {
            usedVerses.add(match.id);
            appendMessage('app', match.text);
            speakText(match.text);

            nextRequiredLetter = match.rawiyy;
            if(targetLetterSpan) targetLetterSpan.innerText = nextRequiredLetter;
            if(targetLetterBadge) targetLetterBadge.classList.remove('hidden');
        } else {
            handleAppDefeat(letter);
        }
    } catch (error) {
        handleAppDefeat(letter);
    }
}

function handleAppDefeat(letter) {
    appendMessage('app', `لله درّك الفصيح! عجزتُ عن إيجاد بيت يبدأ بحرف (${letter}). تفوّقتَ عليّ! 🏆`);
    speakText("لَقَدْ فُزْتَ عَلَيَّ يَا فَصِيحُ، أَحْسَنْتَ النَّظْمَ");
    userScore += 5;
    if(userScoreEme) userScoreEme.innerText = userScore;
    nextRequiredLetter = "";
    if(targetLetterBadge) targetLetterBadge.classList.add('hidden');
}

function appendMessage(sender, text) {
    if(!arena) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3.5 rounded-2xl max-w-[85%] text-sm md:text-base shadow-sm border ${
        sender === 'user' ? 'bg-emerald-50 border-emerald-100 text-emerald-900 self-start' : 
        sender === 'app' ? 'bg-slate-800 border-slate-700 text-slate-100 self-end text-left font-medium' : 
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
        const premiumVoice = voices.find(voice => 
            voice.lang.startsWith('ar') && 
            (voice.name.includes('Natural') || voice.name.includes('Hoda') || voice.name.includes('Maged'))
        );
        if (premiumVoice) utterance.voice = premiumVoice;
        utterance.lang = 'ar-SA';
        utterance.rate = 0.74; 
        utterance.pitch = 1.0; 
        window.speechSynthesis.speak(utterance);
    }
}