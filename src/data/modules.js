/**
 * EduArabic — Module Data
 * Supporting tools for book modules.
 *
 * Each module → units → dialogues + pronunciation exercises
 */

export const MODULES = [
  {
    id: 'comm1',
    title: 'Arabic Communication for Beginners',
    titleAr: 'التواصل باللغة العربية للمبتدئين',
    level: 'Beginner',
    icon: 'bubble-chat',
    cover: 'linear-gradient(150deg,#2FC49F,#17756A)',
    description: 'Start speaking Arabic from day one with practical, everyday conversations.',
    units: [
      {
        id: 'comm1-u1',
        title: 'Greetings & Introductions',
        titleAr: 'التحيات والتعريف',
        dialogues: [
          {
            id: 'comm1-u1-d1',
            speakerA: { name: 'Ahmad', text: 'السلام عليكم، كيف حالك؟', translation: 'Peace be upon you, how are you?' },
            speakerB: { name: 'Fatimah', text: 'وعليكم السلام، بخير الحمد لله', translation: 'And upon you peace, I am fine, praise God.' },
          },
          {
            id: 'comm1-u1-d2',
            speakerA: { name: 'Ahmad', text: 'ما اسمك؟', translation: 'What is your name?' },
            speakerB: { name: 'Fatimah', text: 'اسمي فاطمة، وأنت؟', translation: 'My name is Fatimah, and you?' },
          },
          {
            id: 'comm1-u1-d3',
            speakerA: { name: 'Ahmad', text: 'اسمي أحمد، تشرفنا', translation: 'My name is Ahmad, nice to meet you.' },
            speakerB: { name: 'Fatimah', text: 'تشرفنا أيضاً', translation: 'Nice to meet you too.' },
          },
        ],
        pronunciation: [
          { id: 'comm1-u1-p1', word: 'السلام', transliteration: 'As-salām', meaning: 'Peace', audioHint: 'al-sa-LAAM' },
          { id: 'comm1-u1-p2', word: 'عليكم', transliteration: 'ʿAlaykum', meaning: 'Upon you', audioHint: 'a-LAY-kum' },
          { id: 'comm1-u1-p3', word: 'حالك', transliteration: 'Ḥālak', meaning: 'Your situation', audioHint: 'HAA-lak' },
          { id: 'comm1-u1-p4', word: 'اسمح لي', transliteration: 'Ismaḥ lī', meaning: 'Allow me', audioHint: 'is-MAH lee' },
        ],
      },
      {
        id: 'comm1-u2',
        title: 'Numbers & Days',
        titleAr: 'الأرقام والأيام',
        dialogues: [
          {
            id: 'comm1-u2-d1',
            speakerA: { name: 'Seller', text: 'كم تريد؟', translation: 'How many do you want?' },
            speakerB: { name: 'Buyer', text: 'أريد ثلاثة من فضلك', translation: 'I want three, please.' },
          },
          {
            id: 'comm1-u2-d2',
            speakerA: { name: 'Seller', text: 'كم يكلف؟', translation: 'How much does it cost?' },
            speakerB: { name: 'Buyer', text: 'الخمسون درهم', translation: 'Fifty dirhams.' },
          },
        ],
        pronunciation: [
          { id: 'comm1-u2-p1', word: 'واحد', transliteration: 'Wāḥid', meaning: 'One', audioHint: 'WAA-hid' },
          { id: 'comm1-u2-p2', word: 'اثنان', transliteration: 'Ithnān', meaning: 'Two', audioHint: 'ith-NAAN' },
          { id: 'comm1-u2-p3', word: 'ثلاثة', transliteration: 'Thalāthah', meaning: 'Three', audioHint: 'tha-LAA-thah' },
          { id: 'comm1-u2-p4', word: 'السبت', transliteration: 'As-Sabt', meaning: 'Saturday', audioHint: 'as-SABT' },
        ],
      },
      {
        id: 'comm1-u3',
        title: 'At the Shop',
        titleAr: 'في المتجر',
        dialogues: [
          {
            id: 'comm1-u3-d1',
            speakerA: { name: 'Shopkeeper', text: 'مرحباً، كيف أستطيع مساعدتك؟', translation: 'Hello, how can I help you?' },
            speakerB: { name: 'Customer', text: 'أبحث عن كتاب عربي', translation: 'I am looking for an Arabic book.' },
          },
          {
            id: 'comm1-u3-d2',
            speakerA: { name: 'Shopkeeper', text: 'هذا الكتاب جيد للمبتدئين', translation: 'This book is good for beginners.' },
            speakerB: { name: 'Customer', text: 'كم سعره؟', translation: 'How much is it?' },
          },
        ],
        pronunciation: [
          { id: 'comm1-u3-p1', word: 'أبحث', transliteration: 'Abḥath', meaning: 'I search', audioHint: 'ab-HETH' },
          { id: 'comm1-u3-p2', word: 'كتاب', transliteration: 'Kitāb', meaning: 'Book', audioHint: 'ki-TAAB' },
          { id: 'comm1-u3-p3', word: 'سعر', transliteration: 'Siʿr', meaning: 'Price', audioHint: 'si-IQR' },
          { id: 'comm1-u3-p4', word: 'مجاناً', transliteration: 'Majānan', meaning: 'Free', audioHint: 'ma-JAA-nan' },
        ],
      },
    ],
  },
  {
    id: 'nahw1',
    title: 'Nahw Foundations',
    titleAr: 'أساسيات النحو',
    level: 'Beginner',
    icon: 'book-open-01',
    cover: 'linear-gradient(150deg,#17756A,#0C3A33)',
    description: 'Master the building blocks of Arabic grammar — nouns, verbs, and sentence structure.',
    units: [
      {
        id: 'nahw1-u1',
        title: 'The Nominal Sentence',
        titleAr: 'الجملة الاسمية',
        dialogues: [
          {
            id: 'nahw1-u1-d1',
            speakerA: { name: 'Ustaz', text: 'الكتاب جديد، ماذا نقول عن الكتاب؟', translation: 'The book is new — what do we say about the book?' },
            speakerB: { name: 'Student', text: 'الكتاب مبتدأ وجديد خبر', translation: 'The book is mubtada and "new" is khabar.' },
          },
          {
            id: 'comm1-u1-d4',
            speakerA: { name: 'Teacher', text: 'كيف حالك اليوم؟', translation: 'How are you today?' },
            speakerB: { name: 'Student', text: 'أنا بخير شكراً', translation: 'I am fine, thank you.' },
          },
        ],
        pronunciation: [
          { id: 'nahw1-u1-p1', word: 'مبتدا', transliteration: 'Mubtada', meaning: 'Subject', audioHint: 'mub-TA-da' },
          { id: 'nahw1-u1-p2', word: 'خبر', transliteration: 'Khabar', meaning: 'Predicate', audioHint: 'kha-BAR' },
          { id: 'nahw1-u1-p3', word: 'فعل', transliteration: 'Fiʿl', meaning: 'Verb', audioHint: 'fi-IQL' },
          { id: 'nahw1-u1-p4', word: 'اسم', transliteration: 'Ism', meaning: 'Noun', audioHint: 'ism' },
        ],
      },
      {
        id: 'nahw1-u2',
        title: 'The Verbal Sentence',
        titleAr: 'الجملة الفعلية',
        dialogues: [
          {
            id: 'nahw1-u2-d1',
            speakerA: { name: 'Teacher', text: 'جَلَسَ الطالبُ في الفصل', translation: 'The student sat in the class.' },
            speakerB: { name: 'Student', text: 'فعل ماضٍ + فاعل + ظرف مكان', translation: 'Past verb + subject + place adverb.' },
          },
        ],
        pronunciation: [
          { id: 'nahw1-u2-p1', word: 'جلس', transliteration: 'Jalasa', meaning: 'He sat', audioHint: 'JA-la-sa' },
          { id: 'nahw1-u2-p2', word: 'فهم', transliteration: 'Fahima', meaning: 'He understood', audioHint: 'fa-HI-ma' },
        ],
      },
    ],
  },
  {
    id: 'sarf1',
    title: 'Sarf Essentials',
    titleAr: 'علم الصرف',
    level: 'Beginner',
    icon: 'language-square',
    cover: 'linear-gradient(150deg,#8C6A1E,#4A3607)',
    description: 'Learn how Arabic words are built from three-letter roots.',
    units: [
      {
        id: 'sarf1-u1',
        title: 'The Three-Letter Root',
        titleAr: 'الجذر الثلاثي',
        dialogues: [
          {
            id: 'sarf1-u1-d1',
            speakerA: { name: 'Teacher', text: 'الجذر كَتَبَ — ما مشتقاته؟', translation: 'The root is k-t-b — what are its derivatives?' },
            speakerB: { name: 'Student', text: 'كتاب، كاتب، مكتبة، مكتوب', translation: 'Book, writer, library, written.' },
          },
        ],
        pronunciation: [
          { id: 'sarf1-u1-p1', word: 'كَتَبَ', transliteration: 'Kataba', meaning: 'He wrote', audioHint: 'ka-TA-ba' },
          { id: 'sarf1-u1-p2', word: 'كتاب', transliteration: 'Kitāb', meaning: 'Book', audioHint: 'ki-TAAB' },
          { id: 'sarf1-u1-p3', word: 'كاتب', transliteration: 'Kātib', meaning: 'Writer', audioHint: 'KAA-tib' },
          { id: 'sarf1-u1-p4', word: 'مكتبة', transliteration: 'Maktabah', meaning: 'Library', audioHint: 'mak-TA-bah' },
        ],
      },
    ],
  },
]

export function getModuleById(id) {
  return MODULES.find(m => m.id === id)
}

export function getUnitById(moduleId, unitId) {
  const mod = getModuleById(moduleId)
  return mod?.units.find(u => u.id === unitId)
}
