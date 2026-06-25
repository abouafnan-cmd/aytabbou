// الأبيات الافتراضية المتنوعة لبدء التطبيق
const defaultVerses = [
    { id: 1, text: "مَا كُلُّ مَا يَتَمَنَّى الْمَرْءُ يُدْرِكُهُ * تَجْرِي الرِّيَاحُ بِمَا لا تَشْتَهِي السُّفُنُ", first: "م", rawiyy: "ن", poet: "المتنبي" },
    { id: 2, text: "نَقِّلْ فُؤَادَكَ حَيْثُ شِئْتَ مِنَ الْهَوَى * مَا الْحُبُّ إِلا لِلْحَبِيبِ الأَوَّلِ", first: "ن", rawiyy: "ل", poet: "أبو تمام" },
    { id: 3, text: "لِكُلِّ شَيْءٍ إِذَا مَا تَمَّ نُقْصَانُ * فَلَا يُغَرَّ بِطِيبِ الْعَيْشِ إِنْسَانُ", first: "ل", rawiyy: "ن", poet: "أبو البقاء الرندي" },
    { id: 4, text: "دَعِ الأَيَّامَ تَفْعَلُ مَا تَشَاءُ * وَطِبْ نَفْسًا إِذَا حَكَمَ الْقَضَاءُ", first: "د", rawiyy: "أ", poet: "الإمام الشافعي" },
    { id: 5, text: "أَعَزُّ مَكَانٍ فِي الدُّنَى سَرْجُ سَابِحٍ * وَخَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ", first: "أ", rawiyy: "ب", poet: "المتنبي" },
    { id: 6, text: "بِقَدْرِ الْكَدِّ تُكْسَبُ الْمَعَالِي * وَمَنْ طَلَبَ الْعُلَا سَهِرَ اللَّيَالِي", first: "ب", rawiyy: "ي", poet: "الإمام الشافعي" },
    { id: 7, text: "يُخَاطِبُنِي السَّفِيهُ بِكُلِّ قُبْحٍ * فَأَكْرَهُ أَنْ أَكُونَ لَهُ مُجِيبَا", first: "ي", rawiyy: "أ", poet: "الإمام الشافعي" }
];

// وظيفة جلب البيانات الحالية من المتصفح
function getPoetryDatabase() {
    const localData = localStorage.getItem('musajala_db');
    if (!localData) {
        localStorage.setItem('musajala_db', JSON.stringify(defaultVerses));
        return defaultVerses;
    }
    return JSON.parse(localData);
}

// وظيفة حفظ التعديلات أو الإضافات الجديدة
function savePoetryDatabase(data) {
    localStorage.setItem('musajala_db', JSON.stringify(data));
}