import { Language } from './types';

export const translations = {
  en: {
    appName: 'KisanConnect',
    tagline: 'Farmer Equipment & Labor Network',
    pwaReady: 'PWA Mobile App',
    needAction: 'I Need Equipment / Labor',
    haveAction: 'I Have Equipment / Labor',
    needActionSub: 'Find tractors, harvesters, seeders & skilled workers nearby',
    haveActionSub: 'Earn by renting out your farm machines or labor team',
    
    // Nav & Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    farmerId: 'Kisan ID',
    welcome: 'Namaste',
    guest: 'Guest Farmer',

    // Modal Login/Register
    loginTitle: 'Farmer Login',
    registerTitle: 'New Farmer Registration',
    mobileNumber: 'Mobile Number (10 Digits)',
    mobilePlaceholder: 'e.g., 9876543210',
    pinCode: '4-Digit PIN',
    pinPlaceholder: '••••',
    fullName: 'Full Name',
    namePlaceholder: 'e.g., Ramesh Kumar',
    villageName: 'Village Name',
    villagePlaceholder: 'e.g., Rampur',
    districtName: 'District Name',
    districtPlaceholder: 'e.g., Karnal',
    submitLogin: 'Login with PIN',
    submitRegister: 'Create Account',
    noAccount: "Don't have a Kisan Account?",
    haveAccount: 'Already registered? Login here',

    // Action Headers & Tabs
    browseListings: 'Available Equipment & Labor',
    browseRequests: 'Farmers Needing Support',
    categoryAll: 'All Categories',
    categoryTractor: 'Tractors',
    categoryHarvester: 'Harvesters',
    categorySeeder: 'Seeders',
    categoryLabor: 'Farm Laborers',
    categorySprayer: 'Sprayers',
    categoryDrone: 'Agri Drones',
    categoryIrrigation: 'Pumps & Irrigation',

    // Dynamic Database Title Mappings
    titleHave: 'Available',
    titleNeed: 'Required',
    tractor: 'Tractor',
    harvester: 'Harvester',
    seeder: 'Seeder',
    labor: 'Labor',
    sprayer: 'Sprayer',

    // Search & Filter
    searchPlaceholder: 'Search by village, machine name or district...',
    filterCategory: 'Filter Category',
    rate: 'Rate',
    perHour: '/ hour',
    perAcre: '/ acre',
    perDay: '/ day',
    village: 'Village',
    district: 'District',
    callNow: 'Call Farmer',
    bookNow: 'Book Now',
    postRequirement: 'Post My Requirement',
    postEquipment: 'List My Equipment',

    // Modal Forms
    postNeedTitle: 'Post What Equipment or Labor You Need',
    postHaveTitle: 'List Your Equipment or Labor Team for Rent',
    titleLabel: 'Title / Equipment Name',
    titlePlaceholderNeed: 'e.g., Need Paddy Harvester for 4 acres',
    titlePlaceholderHave: 'e.g., Mahindra 575 DI Tractor with Rotavator',
    descriptionLabel: 'Additional Details / Work Specs',
    descriptionPlaceholder: 'e.g., Land is ready, field near main highway...',
    rateLabel: 'Rate (₹)',
    unitTypeLabel: 'Billing Unit',
    dateLabel: 'Work Date',
    
    // Status & Badges
    available: 'Available Now',
    openRequest: 'Active Requirement',
    matched: 'Matched',
    offlineNotice: 'Works offline in rural areas. Fast low-bandwidth mode.',
    successMessage: 'Successfully Saved in Database!',
    callPrompt: 'Connect directly with farmer via phone call:',
    close: 'Close',
    cancel: 'Cancel',
    confirmBooking: 'Confirm Booking',
    sunlightMode: 'Sunlight High Contrast Active'
  },
  hi: {
    appName: 'किसान कनेक्ट',
    tagline: 'किसान उपकरण और श्रमिक नेटवर्क',
    pwaReady: 'PWA मोबाइल ऐप',
    needAction: 'मुझे उपकरण / श्रमिक चाहिए',
    haveAction: 'मेरे पास उपकरण / श्रमिक हैं',
    needActionSub: 'पास के ट्रैक्टर, हार्वेस्टर, सीडर और कुशल मजदूर खोजें',
    haveActionSub: 'अपनी कृषि मशीनरी या मजदूरों को किराए पर देकर कमाएं',
    
    // Nav & Auth
    login: 'लॉगिन करें',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    farmerId: 'किसान आईडी',
    welcome: 'नमस्ते',
    guest: 'अतिथि किसान',

    // Modal Login/Register
    loginTitle: 'किसान लॉगिन',
    registerTitle: 'नया किसान पंजीकरण',
    mobileNumber: 'मोबाइल नंबर (10 अंक)',
    mobilePlaceholder: 'जैसे 9876543210',
    pinCode: '4-अंकों का पिन (PIN)',
    pinPlaceholder: '••••',
    fullName: 'पूरा नाम',
    namePlaceholder: 'जैसे रमेश कुमार',
    villageName: 'गांव का नाम',
    villagePlaceholder: 'जैसे रामपुर',
    districtName: 'जिला',
    districtPlaceholder: 'जैसे करनाल',
    submitLogin: 'पिन के साथ लॉगिन करें',
    submitRegister: 'खाता बनाएं',
    noAccount: 'क्या किसान खाता नहीं है? पंजीकरण करें',
    haveAccount: 'पहले से पंजीकृत हैं? यहां लॉगिन करें',

    // Action Headers & Tabs
    browseListings: 'उपलब्ध उपकरण और मजदूर',
    browseRequests: 'किसानों की आवश्यकताएं',
    categoryAll: 'सभी श्रेणियां',
    categoryTractor: 'ट्रैक्टर',
    categoryHarvester: 'हार्वेस्टर',
    categorySeeder: 'सीडर (बुवाई मशीन)',
    categoryLabor: 'खेत मजदूर',
    categorySprayer: 'स्प्रेयर (छिड़काव)',
    categoryDrone: 'कृषि ड्रोन',
    categoryIrrigation: 'पंप और सिंचाई',

    // Dynamic Database Title Mappings
    titleHave: 'उपलब्ध',
    titleNeed: 'आवश्यकता',
    tractor: 'ट्रैक्टर',
    harvester: 'हार्वेस्टर',
    seeder: 'सीडर',
    labor: 'मजदूर',
    sprayer: 'स्प्रेयर',

    // Search & Filter
    searchPlaceholder: 'गांव, मशीन का नाम या जिला खोजें...',
    filterCategory: 'श्रेणी चुनें',
    rate: 'किराया rate',
    perHour: '/ घंटा',
    perAcre: '/ एकड़',
    perDay: '/ दिन',
    village: 'गांव',
    district: 'जिला',
    callNow: 'किसान को कॉल करें',
    bookNow: 'बुक करें',
    postRequirement: 'अपनी आवश्यकता पोस्ट करें',
    postEquipment: 'अपना उपकरण सूचीबद्ध करें',

    // Modal Forms
    postNeedTitle: 'आपको क्या उपकरण या मजदूर चाहिए?',
    postHaveTitle: 'किराए के लिए अपना उपकरण या मजदूर टीम जोड़ें',
    titleLabel: 'शीर्षक / मशीन का नाम',
    titlePlaceholderNeed: 'जैसे 4 एकड़ के लिए धान हार्वेस्टर चाहिए',
    titlePlaceholderHave: 'जैसे महिंद्रा 575 ट्रैक्टर रोटावेटर के साथ',
    descriptionLabel: 'अतिरिक्त विवरण',
    descriptionPlaceholder: 'जैसे खेत तैयार है, मुख्य सड़क के पास...',
    rateLabel: 'दर (₹)',
    unitTypeLabel: 'इकाई (Unit)',
    dateLabel: 'कार्य तिथि',

    // Status & Badges
    available: 'अभी उपलब्ध',
    openRequest: 'सक्रिय मांग',
    matched: 'मिला हुआ',
    offlineNotice: 'ग्रामीण क्षेत्रों में ऑफलाइन काम करता है। कम इंटरनेट मोड।',
    successMessage: 'डेटाबेस में सफलतापूर्वक सहेजा गया!',
    callPrompt: 'फोन कॉल द्वारा किसान से सीधे जुड़ें:',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    confirmBooking: 'बुकिंग की पुष्टि करें',
    sunlightMode: 'धूप में स्पष्ट दिखने वाला मोड सक्रिय'
  },
  te: {
    appName: 'కిసాన్ కనెక్ట్',
    tagline: 'రైతుల యంత్రాలు & శ్రామికుల నెట్‌వర్క్',
    pwaReady: 'PWA మొబైల్ యాప్',
    needAction: 'నాకు పరికరాలు / శ్రామికులు కావాలి',
    haveAction: 'నా వద్ద పరికరాలు / శ్రామికులు ఉన్నారు',
    needActionSub: 'సమీపంలోని ట్రాక్టర్లు, హార్వెస్టర్లు, విత్తన యంత్రాలు & కూలీలను పొందండి',
    haveActionSub: 'మీ వ్యవసాయ యంత్రాలు లేదా కూలీల బృందాన్ని అద్దెకు ఇచ్చి సంపాదించండి',
    
    // Nav & Auth
    login: 'లాగిన్',
    register: 'నమోదు',
    logout: 'లాగౌట్',
    farmerId: 'రైతు ID',
    welcome: 'నమస్కారం',
    guest: 'రైతు సోదరుడు',

    // Modal Login/Register
    loginTitle: 'రైతు లాగిన్',
    registerTitle: 'కొత్త రైతు నమోదు',
    mobileNumber: 'మొబైల్ సంఖ్య (10 అంకెలు)',
    mobilePlaceholder: 'ఉదా: 9876543210',
    pinCode: '4-అంకెల పిన్ (PIN)',
    pinPlaceholder: '••••',
    fullName: 'పూర్తి పేరు',
    namePlaceholder: 'ఉదా: రమేష్ కుమార్',
    villageName: 'గ్రామం పేరు',
    villagePlaceholder: 'ఉదా: రాంపూర్',
    districtName: 'జిల్లా',
    districtPlaceholder: 'ఉదా: కర్నూలు',
    submitLogin: 'పిన్‌తో లాగిన్ అవ్వండి',
    submitRegister: 'ఖాతా సృష్టించండి',
    noAccount: 'రైతు ఖాతా లేదా? ఇక్కడ నమోదు చేసుకోండి',
    haveAccount: 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి',

    // Action Headers & Tabs
    browseListings: 'అందుబాటులో ఉన్న యంత్రాలు & కూలీలు',
    browseRequests: 'రైతుల అవసరాలు',
    categoryAll: 'అన్ని రకాలు',
    categoryTractor: 'ట్రాక్టర్లు',
    categoryHarvester: 'హార్వెస్టర్లు',
    categorySeeder: 'విత్తన యంత్రాలు',
    categoryLabor: 'వ్యవసాయ కూలీలు',
    categorySprayer: 'స్ప్రేయర్లు',
    categoryDrone: 'వ్యవసాయ డ్రోన్లు',
    categoryIrrigation: 'పంప్‌సెట్లు & నీటిపారుదల',

    // Dynamic Database Title Mappings
    titleHave: 'అందుబాటులో ఉంది',
    titleNeed: 'కావాలి',
    tractor: 'ట్రాక్టర్',
    harvester: 'హార్వెస్టర్',
    seeder: 'సీడర్',
    labor: 'కూలీలు',
    sprayer: 'స్ప్రేయర్',

    // Search & Filter
    searchPlaceholder: 'గ్రామం, యంత్రం పేరు లేదా జిల్లా వెతకండి...',
    filterCategory: 'రకం ఎంచుకోండి',
    rate: 'ధర',
    perHour: '/ గంటకు',
    perAcre: '/ ఎకరాకు',
    perDay: '/ రోజుకు',
    village: 'గ్రామం',
    district: 'జిల్లా',
    callNow: 'రైతుకి కాల్ చేయండి',
    bookNow: 'బుక్ చేయండి',
    postRequirement: 'నా అవసరాన్ని నమోదు చేయండి',
    postEquipment: 'నా యంత్రాన్ని జాబితా చేయండి',

    // Modal Forms
    postNeedTitle: 'మీకు ఏ పరికరాలు లేదా శ్రామికులు కావాలి?',
    postHaveTitle: 'అద్దెకు మీ యంత్రం లేదా కూలీల బృందాన్ని చేర్చండి',
    titleLabel: 'శీర్షిక / యంత్రం పేరు',
    titlePlaceholderNeed: 'ఉదా: 4 ఎకరాలకు వరి కోత మిషన్ కావాలి',
    titlePlaceholderHave: 'ఉదా: రోటవేటర్‌తో మహీంద్రా 575 ట్రాక్టర్',
    descriptionLabel: 'అదనపు వివరాలు',
    descriptionPlaceholder: 'ఉదా: పొలం సిద్ధంగా ఉంది, ప్రధాన రహదారి వద్ద...',
    rateLabel: 'ధర (₹)',
    unitTypeLabel: 'కొలమానం',
    dateLabel: 'పని తేదీ',

    // Status & Badges
    available: 'ఇప్పుడు అందుబాటులో ఉంది',
    openRequest: 'క్రియాశీల అవసరం',
    matched: 'జతచేయబడింది',
    offlineNotice: 'నెట్‌వర్క్ లేకపోయినా పనిచేస్తుంది.',
    successMessage: 'డేటాబేస్‌లో విజయవంతంగా సేవ్ చేయబడింది!',
    callPrompt: 'ఫోన్ కాల్ ద్వారా రైతుతో నేరుగా మాట్లాడండి:',
    close: 'మూసివేయి',
    cancel: 'రద్దు చేయి',
    confirmBooking: 'బుకింగ్‌ను నిర్ధారించండి',
    sunlightMode: 'ఎండలో స్పష్టంగా కనిపించే మోడ్ క్రియాశీలంలో ఉంది'
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations['en']): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || String(key);
}