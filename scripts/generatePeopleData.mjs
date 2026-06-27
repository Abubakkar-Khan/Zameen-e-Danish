import fs from "node:fs/promises";

const entries = [
  ["Muhammad_Iqbal", "Allama Muhammad Iqbal", "Poet", "Punjab", "Sialkot", [32.4945, 74.5229], 99, "Pre-1947", "علامہ محمد اقبال"],
  ["Abdus_Salam", "Abdus Salam", "Scientist", "Punjab", "Jhang", [31.2681, 72.3181], 98, "1947-1970", "عبد السلام"],
  ["Abdul_Sattar_Edhi", "Abdul Sattar Edhi", "Humanitarian", "Sindh", "Karachi", [24.8607, 67.0011], 97, "1971-2000", "عبد الستار ایدھی"],
  ["Fatima_Jinnah", "Fatima Jinnah", "Political Leader", "Sindh", "Karachi", [24.8849, 67.0444], 94, "Pre-1947", "فاطمہ جناح"],
  ["Faiz_Ahmad_Faiz", "Faiz Ahmed Faiz", "Poet", "Punjab", "Lahore", [31.5204, 74.3587], 93, "1947-1970", "فیض احمد فیض"],
  ["Benazir_Bhutto", "Benazir Bhutto", "Political Leader", "Sindh", "Larkana", [27.557, 68.2028], 92, "1971-2000", "بینظیر بھٹو"],
  ["Malala_Yousafzai", "Malala Yousafzai", "Educator", "Khyber Pakhtunkhwa", "Mingora", [34.7717, 72.3602], 91, "2001-Present", "ملالہ یوسفزئی"],
  ["Nusrat_Fateh_Ali_Khan", "Nusrat Fateh Ali Khan", "Musician", "Punjab", "Faisalabad", [31.4504, 73.135], 90, "1971-2000", "نصرت فتح علی خان"],
  ["Saadat_Hasan_Manto", "Saadat Hasan Manto", "Writer", "Punjab", "Lahore", [31.5601, 74.3139], 89, "1947-1970", "سعادت حسن منٹو"],
  ["Noor_Jehan", "Noor Jehan", "Musician", "Punjab", "Kasur", [31.1156, 74.4467], 88, "1947-1970", "نور جہاں"],
  ["Sadequain", "Sadequain", "Artist", "Sindh", "Karachi", [24.8459, 67.0344], 86, "1947-1970", "صادقین"],
  ["Abida_Parveen", "Abida Parveen", "Musician", "Sindh", "Larkana", [27.557, 68.2028], 84, "1971-2000", "عابدہ پروین"],
  ["Abdul_Qadeer_Khan", "Abdul Qadeer Khan", "Scientist", "Islamabad", "Islamabad", [33.6844, 73.0479], 83, "1971-2000", "عبد القدیر خان"],
  ["Asma_Jahangir", "Asma Jahangir", "Jurist", "Punjab", "Lahore", [31.515, 74.327], 82, "1971-2000", "عاصمہ جہانگیر"],
  ["Atta-ur-Rahman_(chemist)", "Atta-ur-Rahman", "Scientist", "Sindh", "Karachi", [24.9411, 67.1206], 82, "1971-2000", "عطا الرحمٰن"],
  ["Mehdi_Hassan", "Mehdi Hassan", "Musician", "Sindh", "Karachi", [24.8138, 67.0322], 81, "1947-1970", "مہدی حسن"],
  ["Ahmed_Faraz", "Ahmed Faraz", "Poet", "Khyber Pakhtunkhwa", "Kohat", [33.5869, 71.4429], 80, "1947-1970", "احمد فراز"],
  ["Akhtar_Hameed_Khan", "Akhtar Hameed Khan", "Social Reformer", "Sindh", "Karachi", [24.934, 67.082], 80, "1971-2000", "اختر حمید خان"],
  ["Ruth_Pfau", "Ruth Pfau", "Humanitarian", "Sindh", "Karachi", [24.8949, 67.0281], 79, "1971-2000", "رتھ فاؤ"],
  ["Jahangir_Khan", "Jahangir Khan", "Athlete", "Khyber Pakhtunkhwa", "Peshawar", [34.0151, 71.5249], 78, "1971-2000", "جہانگیر خان"],
  ["Yasmeen_Lari", "Yasmeen Lari", "Architect", "Sindh", "Karachi", [24.855, 67.02], 77, "1971-2000", "یاسمین لاری"],
  ["Nayyar_Ali_Dada", "Nayyar Ali Dada", "Architect", "Punjab", "Lahore", [31.5204, 74.3587], 76, "1971-2000", "نیئر علی دادا"],
  ["Hakim_Said", "Hakeem Muhammad Saeed", "Educator", "Sindh", "Karachi", [24.927, 67.052], 75, "1947-1970", "حکیم محمد سعید"],
  ["Khawaja_Ghulam_Farid", "Khawaja Ghulam Farid", "Poet", "Punjab", "Kot Mithan", [28.9667, 70.3833], 74, "Pre-1947", "خواجہ غلام فرید"],
  ["Habib_Jalib", "Habib Jalib", "Poet", "Punjab", "Lahore", [31.569, 74.305], 74, "1947-1970", "حبیب جالب"],
  ["Bapsi_Sidhwa", "Bapsi Sidhwa", "Writer", "Punjab", "Lahore", [31.5497, 74.3436], 73, "1971-2000", "باپسی سدھوا"],
  ["Intizar_Hussain", "Intizar Hussain", "Writer", "Punjab", "Lahore", [31.528, 74.32], 73, "1947-1970", "انتظار حسین"],
  ["Bano_Qudsia", "Bano Qudsia", "Writer", "Punjab", "Lahore", [31.49, 74.31], 72, "1947-1970", "بانو قدسیہ"],
  ["Ashfaq_Ahmed", "Ashfaq Ahmed", "Writer", "Punjab", "Lahore", [31.5, 74.33], 71, "1947-1970", "اشفاق احمد"],
  ["Arfa_Karim", "Arfa Karim", "Scientist", "Punjab", "Faisalabad", [31.418, 73.079], 70, "2001-Present", "ارفع کریم"],
  ["Fahmida_Riaz", "Fehmida Riaz", "Poet", "Sindh", "Karachi", [24.875, 67.03], 69, "1971-2000", "فہمیدہ ریاض"],
  ["Patras_Bokhari", "Patras Bokhari", "Writer", "Khyber Pakhtunkhwa", "Peshawar", [34.0124, 71.5785], 68, "Pre-1947", "پطرس بخاری"],
  ["Kishwar_Naheed", "Kishwar Naheed", "Poet", "Punjab", "Lahore", [31.58, 74.38], 68, "1971-2000", "کشور ناہید"],
  ["Amjad_Islam_Amjad", "Amjad Islam Amjad", "Poet", "Punjab", "Lahore", [31.59, 74.29], 67, "1971-2000", "امجد اسلام امجد"],
  ["Amjad_Sabri", "Amjad Sabri", "Musician", "Sindh", "Karachi", [24.905, 67.08], 66, "2001-Present", "امجد صابری"],
  ["Pervez_Hoodbhoy", "Pervez Hoodbhoy", "Scientist", "Islamabad", "Islamabad", [33.729, 73.093], 66, "1971-2000", "پرویز ہودبھائی"],
  ["Najam_Sethi", "Najam Sethi", "Journalist", "Punjab", "Lahore", [31.54, 74.34], 65, "1971-2000", "نجم سیٹھی"],
  ["Shahid_Afridi", "Shahid Afridi", "Athlete", "Khyber Pakhtunkhwa", "Khyber Agency", [34.11, 71.13], 64, "2001-Present", "شاہد آفریدی"],
  ["Imran_Khan", "Imran Khan", "Political Leader", "Punjab", "Lahore", [31.5497, 74.3436], 86, "1971-2000", "عمران خان"],
  ["Wasim_Akram", "Wasim Akram", "Athlete", "Punjab", "Lahore", [31.5204, 74.3587], 73, "1971-2000", "وسیم اکرم"],
  ["Javed_Miandad", "Javed Miandad", "Athlete", "Sindh", "Karachi", [24.8607, 67.0011], 70, "1971-2000", "جاوید میانداد"],
  ["Shoaib_Akhtar", "Shoaib Akhtar", "Athlete", "Punjab", "Rawalpindi", [33.5651, 73.0169], 63, "2001-Present", "شعیب اختر"],
  ["Samar_Mubarakmand", "Samar Mubarakmand", "Scientist", "Punjab", "Rawalpindi", [33.5651, 73.0169], 64, "1971-2000", "ثمر مبارک مند"],
  ["Munir_Ahmad_Khan", "Munir Ahmad Khan", "Scientist", "Punjab", "Kasur", [31.1156, 74.4467], 63, "1947-1970", "منیر احمد خان"],
  ["Ishfaq_Ahmad", "Ishfaq Ahmad", "Scientist", "Punjab", "Gurdaspur/Lahore", [31.5204, 74.3587], 62, "1947-1970", "اشفاق احمد"],
  ["Riazuddin_(physicist)", "Riazuddin", "Scientist", "Punjab", "Ludhiana/Lahore", [31.5204, 74.3587], 61, "1947-1970", "ریاض الدین"],
  ["Salimuzzaman_Siddiqui", "Salimuzzaman Siddiqui", "Scientist", "Sindh", "Karachi", [24.8607, 67.0011], 65, "1947-1970", "سلیم الزمان صدیقی"],
  ["Muhammad_Atta-ur-Rahman", "Muhammad Atta-ur-Rahman", "Scientist", "Sindh", "Karachi", [24.9411, 67.1206], 55, "1971-2000", "محمد عطا الرحمٰن"],
  ["Umar_Saif", "Umar Saif", "Scientist", "Punjab", "Lahore", [31.5204, 74.3587], 60, "2001-Present", "عمر سیف"],
  ["Nergis_Mavalvala", "Nergis Mavalvala", "Scientist", "Sindh", "Karachi", [24.8607, 67.0011], 66, "2001-Present", "نرگس ماول والا"],
  ["Sharmeen_Obaid-Chinoy", "Sharmeen Obaid-Chinoy", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 72, "2001-Present", "شرمین عبید چنائے"],
  ["Mariam_Sultana", "Mariam Sultana", "Scientist", "Sindh", "Karachi", [24.8607, 67.0011], 53, "2001-Present", "مریم سلطانہ"],
  ["Samina_Baig", "Samina Baig", "Athlete", "Gilgit-Baltistan", "Shimshal", [36.43, 75.34], 58, "2001-Present", "ثمینہ بیگ"],
  ["Nazir_Sabir", "Nazir Sabir", "Athlete", "Gilgit-Baltistan", "Hunza", [36.3167, 74.65], 55, "2001-Present", "نذیر صابر"],
  ["Ali_Sadpara", "Ali Sadpara", "Athlete", "Gilgit-Baltistan", "Skardu", [35.2971, 75.6333], 59, "2001-Present", "علی سدپارہ"],
  ["Muhammad_Ali_Sadpara", "Muhammad Ali Sadpara", "Athlete", "Gilgit-Baltistan", "Skardu", [35.2971, 75.6333], 60, "2001-Present", "محمد علی سدپارہ"],
  ["Ali_Moeen_Nawazish", "Ali Moeen Nawazish", "Educator", "Punjab", "Rawalpindi", [33.5651, 73.0169], 50, "2001-Present", "علی معین نوازش"],
  ["Javed_Ahmad_Ghamidi", "Javed Ahmad Ghamidi", "Educator", "Punjab", "Sahiwal", [30.6682, 73.1114], 62, "2001-Present", "جاوید احمد غامدی"],
  ["Tariq_Jamil", "Tariq Jamil", "Educator", "Punjab", "Mian Channu", [30.44, 72.35], 61, "2001-Present", "طارق جمیل"],
  ["Raza_Rumi", "Raza Rumi", "Journalist", "Punjab", "Lahore", [31.5204, 74.3587], 52, "2001-Present", "رضا رومی"],
  ["Hamid_Mir", "Hamid Mir", "Journalist", "Punjab", "Lahore", [31.5204, 74.3587], 58, "2001-Present", "حامد میر"],
  ["Muniba_Mazari", "Muniba Mazari", "Artist", "Punjab", "Rahim Yar Khan", [28.4202, 70.2952], 58, "2001-Present", "منیبہ مزاری"],
  ["Ali_Zafar", "Ali Zafar", "Musician", "Punjab", "Lahore", [31.5204, 74.3587], 57, "2001-Present", "علی ظفر"],
  ["Atif_Aslam", "Atif Aslam", "Musician", "Punjab", "Wazirabad/Lahore", [31.5204, 74.3587], 59, "2001-Present", "عاطف اسلم"],
  ["Rahat_Fateh_Ali_Khan", "Rahat Fateh Ali Khan", "Musician", "Punjab", "Faisalabad", [31.4504, 73.135], 62, "2001-Present", "راحت فتح علی خان"],
  ["Farida_Khanum", "Farida Khanum", "Musician", "Punjab", "Lahore", [31.5204, 74.3587], 64, "1947-1970", "فریدہ خانم"],
  ["Reshma", "Reshma", "Musician", "Punjab", "Lahore", [31.5204, 74.3587], 63, "1971-2000", "ریشماں"],
  ["Alamgir_(singer)", "Alamgir", "Musician", "Sindh", "Karachi", [24.8607, 67.0011], 54, "1971-2000", "عالمگیر"],
  ["Nazir_Akbarabadi", "Nazir Akbarabadi", "Poet", "Punjab", "Delhi/Lahore", [31.5204, 74.3587], 50, "Pre-1947", "نظیر اکبر آبادی"],
  ["Josh_Malihabadi", "Josh Malihabadi", "Poet", "Sindh", "Karachi", [24.8607, 67.0011], 62, "1947-1970", "جوش ملیح آبادی"],
  ["Iftikhar_Arif", "Iftikhar Arif", "Poet", "Islamabad", "Islamabad", [33.6844, 73.0479], 56, "1971-2000", "افتخار عارف"],
  ["Parveen_Shakir", "Parveen Shakir", "Poet", "Sindh", "Karachi", [24.8607, 67.0011], 64, "1971-2000", "پروین شاکر"],
  ["Mustansar_Hussain_Tarar", "Mustansar Hussain Tarar", "Writer", "Punjab", "Lahore", [31.5204, 74.3587], 55, "1971-2000", "مستنصر حسین تارڑ"],
  ["Mohsin_Hamid", "Mohsin Hamid", "Writer", "Punjab", "Lahore", [31.5204, 74.3587], 60, "2001-Present", "محسن حامد"],
  ["Kamila_Shamsie", "Kamila Shamsie", "Writer", "Sindh", "Karachi", [24.8607, 67.0011], 61, "2001-Present", "کامیلا شمسی"],
  ["Nadeem_Aslam", "Nadeem Aslam", "Writer", "Punjab", "Gujranwala", [32.1877, 74.1945], 54, "2001-Present", "ندیم اسلم"],
  ["Hanif_Kureishi", "Hanif Kureishi", "Writer", "Sindh", "Karachi", [24.8607, 67.0011], 52, "2001-Present", "حنیف قریشی"],
  ["Omar_Shahid_Hamid", "Omar Shahid Hamid", "Writer", "Sindh", "Karachi", [24.8607, 67.0011], 49, "2001-Present", "عمر شاہد حامد"],
  ["Daniyal_Mueenuddin", "Daniyal Mueenuddin", "Writer", "Punjab", "Lahore", [31.5204, 74.3587], 51, "2001-Present", "دانیال معین الدین"],
  ["Ayesha_Jalal", "Ayesha Jalal", "Historian", "Punjab", "Lahore", [31.5204, 74.3587], 63, "2001-Present", "عائشہ جلال"],
  ["Mubarak_Ali", "Mubarak Ali", "Historian", "Punjab", "Lahore", [31.5204, 74.3587], 52, "2001-Present", "مبارک علی"],
  ["Ibn-e-Insha", "Ibn-e-Insha", "Writer", "Punjab", "Lahore", [31.5204, 74.3587], 65, "1947-1970", "ابن انشا"],
  ["Mustafa_Zaidi", "Mustafa Zaidi", "Poet", "Sindh", "Karachi", [24.8607, 67.0011], 50, "1947-1970", "مصطفیٰ زیدی"],
  ["Muneer_Niazi", "Muneer Niazi", "Poet", "Punjab", "Lahore", [31.5204, 74.3587], 57, "1971-2000", "منیر نیازی"],
  ["Ata-ul-Haq_Qasmi", "Ata-ul-Haq Qasmi", "Writer", "Punjab", "Lahore", [31.5204, 74.3587], 50, "1971-2000", "عطاء الحق قاسمی"],
  ["Anwar_Maqsood", "Anwar Maqsood", "Writer", "Sindh", "Karachi", [24.8607, 67.0011], 61, "1971-2000", "انور مقصود"],
  ["Moin_Akhtar", "Moin Akhtar", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 63, "1971-2000", "معین اختر"],
  ["Umer_Sharif", "Umer Sharif", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 62, "1971-2000", "عمر شریف"],
  ["Zia_Mohyeddin", "Zia Mohyeddin", "Artist", "Punjab", "Faisalabad", [31.4504, 73.135], 66, "1971-2000", "ضیا محی الدین"],
  ["Talat_Hussain_(actor)", "Talat Hussain", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 55, "1971-2000", "طلعت حسین"],
  ["Nazia_Hassan", "Nazia Hassan", "Musician", "Sindh", "Karachi", [24.8607, 67.0011], 65, "1971-2000", "نازیہ حسن"],
  ["Junoon_(band)", "Junoon", "Musician", "Punjab", "Lahore", [31.5204, 74.3587], 58, "2001-Present", "جنون"],
  ["Vital_Signs_(band)", "Vital Signs", "Musician", "Punjab", "Islamabad", [33.6844, 73.0479], 57, "1971-2000", "وائٹل سائنز"],
  ["Junaid_Jamshed", "Junaid Jamshed", "Musician", "Sindh", "Karachi", [24.8607, 67.0011], 60, "1971-2000", "جنید جمشید"],
  ["Noori", "Noori", "Musician", "Punjab", "Lahore", [31.5204, 74.3587], 49, "2001-Present", "نوری"],
  ["Strings_(band)", "Strings", "Musician", "Sindh", "Karachi", [24.8607, 67.0011], 56, "2001-Present", "سٹرنگز"],
  ["Shoaib_Mansoor", "Shoaib Mansoor", "Artist", "Punjab", "Lahore", [31.5204, 74.3587], 58, "2001-Present", "شعیب منصور"],
  ["Mehreen_Jabbar", "Mehreen Jabbar", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 52, "2001-Present", "مہرین جبار"],
  ["Sabiha_Khanum", "Sabiha Khanum", "Artist", "Punjab", "Gujrat", [32.5731, 74.0754], 55, "1947-1970", "صبیحہ خانم"],
  ["Waheed_Murad", "Waheed Murad", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 61, "1971-2000", "وحید مراد"],
  ["Mohammad_Ali_(actor)", "Mohammad Ali", "Artist", "Punjab", "Rampur/Lahore", [31.5204, 74.3587], 59, "1971-2000", "محمد علی"],
  ["Nadeem_Baig", "Nadeem Baig", "Artist", "Sindh", "Karachi", [24.8607, 67.0011], 57, "1971-2000", "ندیم بیگ"],
  ["Abdul_Samad_Khan_Achakzai", "Abdul Samad Khan Achakzai", "Social Reformer", "Balochistan", "Quetta", [30.1798, 66.975], 58, "Pre-1947", "عبدالصمد خان اچکزئی"],
  ["Ghaus_Bakhsh_Bizenjo", "Ghaus Bakhsh Bizenjo", "Political Leader", "Balochistan", "Khuzdar", [27.8, 66.6167], 57, "1947-1970", "غوث بخش بزنجو"],
  ["Ataullah_Mengal", "Ataullah Mengal", "Political Leader", "Balochistan", "Wadh", [27.35, 66.62], 56, "1971-2000", "عطاء اللہ مینگل"],
  ["Akbar_Bugti", "Akbar Bugti", "Political Leader", "Balochistan", "Dera Bugti", [29.0362, 69.1585], 59, "1971-2000", "اکبر بگٹی"],
  ["Mir_Gul_Khan_Nasir", "Mir Gul Khan Nasir", "Poet", "Balochistan", "Nushki", [29.55, 66.02], 54, "1947-1970", "میر گل خان نصیر"],
  ["Zafarullah_Khan_Jamali", "Zafarullah Khan Jamali", "Political Leader", "Balochistan", "Dera Murad Jamali", [28.5466, 68.2231], 55, "2001-Present", "ظفر اللہ خان جمالی"],
  ["Sardar_Muhammad_Abdul_Qayyum_Khan", "Sardar Muhammad Abdul Qayyum Khan", "Political Leader", "Azad Kashmir", "Ghaziabad", [34.05, 73.75], 55, "1971-2000", "سردار محمد عبدالقیوم خان"],
  ["Sardar_Ibrahim_Khan", "Sardar Ibrahim Khan", "Political Leader", "Azad Kashmir", "Rawalakot", [33.8578, 73.7604], 54, "1947-1970", "سردار ابراہیم خان"],
  ["Masood_Khan", "Masood Khan", "Political Leader", "Azad Kashmir", "Rawalakot", [33.8578, 73.7604], 53, "2001-Present", "مسعود خان"],
  ["Sultan_Mahmood_Chaudhry", "Sultan Mahmood Chaudhry", "Political Leader", "Azad Kashmir", "Mirpur", [33.1482, 73.7518], 52, "2001-Present", "سلطان محمود چوہدری"],
  ["Raja_Farooq_Haider", "Raja Farooq Haider", "Political Leader", "Azad Kashmir", "Muzaffarabad", [34.37, 73.4711], 51, "2001-Present", "راجہ فاروق حیدر"],
];

const fallbackBio = (name, category, city) =>
  `${name} is included as a ${category.toLowerCase()} connected to ${city}, with a source-backed profile prepared from public reference data.`;

const sourceFor = (title) => `https://en.wikipedia.org/wiki/${title}`;

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Zameen-e-Danish local prototype data generator",
    },
  });
  if (!response.ok) return null;
  return response.json();
}

const people = [];
for (const [title, name, category, province, city, coordinates, impactScore, era, urduName] of entries) {
  const summary = await fetchSummary(title);
  const lifeDates = summary?.description?.match(/\(([^)]*(?:19|20|18)[^)]*)\)/)?.[1] ?? "";
  const bio = summary?.extract
    ? summary.extract.split(". ").slice(0, 2).join(". ").replace(/\.$/, "") + "."
    : fallbackBio(name, category, city);
  people.push({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    urduName,
    category,
    province,
    city,
    coordinates,
    lifeDates: lifeDates || "See source",
    impactScore,
    era,
    portrait:
      summary?.thumbnail?.source ??
      summary?.originalimage?.source ??
      "",
    bio,
    achievements: [
      summary?.description ? summary.description.replace(/^Pakistani /i, "Pakistani ") : `${category} associated with ${city}`,
      `Connected to ${city}, ${province}`,
      `Public reference profile available through Wikipedia`,
    ],
    sources: [{ label: "Wikipedia", url: sourceFor(title) }],
    relatedPeople: [],
  });
}

const byCategory = new Map();
for (const person of people) {
  const list = byCategory.get(person.category) ?? [];
  list.push(person.name);
  byCategory.set(person.category, list);
}

for (const person of people) {
  person.relatedPeople = (byCategory.get(person.category) ?? [])
    .filter((name) => name !== person.name)
    .slice(0, 3);
}

const categories = [...new Set(people.map((person) => person.category))].sort();
const provinces = [...new Set(people.map((person) => person.province))].sort();
const eras = ["Pre-1947", "1947-1970", "1971-2000", "2001-Present"];

const output = `export const categories = ${JSON.stringify(categories, null, 2)};\n\nexport const provinces = ${JSON.stringify(provinces, null, 2)};\n\nexport const eras = ${JSON.stringify(eras, null, 2)};\n\nexport const personalities = ${JSON.stringify(people, null, 2)};\n\nexport function minimumScoreForZoom(zoom) {\n  if (zoom < 5) return 90;\n  if (zoom < 6.5) return 75;\n  if (zoom < 8) return 60;\n  if (zoom < 9.5) return 50;\n  return 0;\n}\n\nexport function tierForScore(score) {\n  if (score >= 90) return \"legendary\";\n  if (score >= 75) return \"major\";\n  if (score >= 60) return \"regional\";\n  return \"local\";\n}\n`;

await fs.writeFile("src/data.js", output);
console.log(`Wrote ${people.length} people to src/data.js`);
