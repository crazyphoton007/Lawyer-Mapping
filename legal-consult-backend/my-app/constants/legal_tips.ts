// my-app/constants/legal_tips.ts
export type LegalLang = 'en' | 'hi';
export interface LegalTip {
  en: { title: string; body: string; consider: string[] };
  hi: { title: string; body: string; consider: string[] };
}

export const INFO_TOPICS: LegalTip[] = [
  {
    en: {
      title: "What is an FIR (First Information Report)?",
      body: "An FIR is the first report recorded by police when a cognizable offence is reported. It captures key facts and triggers investigation.",
      consider: [
        "Report as soon as possible after the incident.",
        "Clearly mention date, time, and place; keep facts concise.",
        "Collect and preserve any available evidence; keep a copy of the FIR."
      ]
    },
    hi: {
      title: "FIR (प्रथम सूचना रिपोर्ट) क्या है?",
      body: "FIR वह पहली रिपोर्ट है जो पुलिस किसी संज्ञेय अपराध की सूचना मिलने पर दर्ज करती है। यह केस की शुरुआत कर जांच शुरू कराती है।",
      consider: [
        "घटना के तुरंत बाद FIR दर्ज कराएँ।",
        "तारीख, समय और स्थान स्पष्ट रूप से दर्ज करें।",
        "उपलब्ध सबूत सुरक्षित रखें और FIR की प्रति लें।"
      ]
    }
  },
  {
    en: {
      title: "If police refuse to file an FIR",
      body: "You may approach a senior officer in writing or file an application before the Magistrate under Section 175(3) BNSS to direct registration.",
      consider: [
        "Keep written/email proof of refusal and your complaint.",
        "Escalate to SP/DSP or use online grievance portals.",
        "Magistrate can order registration and monitoring of investigation."
      ]
    },
    hi: {
      title: "अगर पुलिस FIR दर्ज करने से मना करे",
      body: "आप उच्च अधिकारी को लिखित शिकायत दें या मजिस्ट्रेट के समक्ष BNSS धारा 175(3) के तहत आवेदन करें ताकि FIR दर्ज करने का निर्देश दिया जा सके।",
      consider: [
        "शिकायत/अस्वीकार का लिखित सबूत रखें।",
        "SP/डीएसपी तक मामला बढ़ाएँ या ऑनलाइन पोर्टल का उपयोग करें।",
        "मजिस्ट्रेट FIR दर्ज कराने और जांच की निगरानी का आदेश दे सकते हैं।"
      ]
    }
  },
  {
    en: {
      title: "Cognizable vs Non‑Cognizable Offence",
      body: "In cognizable offences, police may register FIR and arrest without warrant; in non‑cognizable offences, police need court permission to investigate.",
      consider: [
        "Cognizable: serious nature (e.g., murder, rape, kidnapping).",
        "Non‑cognizable: police require Magistrate's order.",
        "Understand your case type to choose the right remedy."
      ]
    },
    hi: {
      title: "संज्ञेय बनाम असंज्ञेय अपराध",
      body: "संज्ञेय अपराधों में पुलिस बिना वारंट FIR दर्ज कर गिरफ्तारी कर सकती है; असंज्ञेय में जांच हेतु कोर्ट अनुमति आवश्यक होती है।",
      consider: [
        "संज्ञेय: गंभीर प्रकृति (जैसे हत्या, बलात्कार, अपहरण)।",
        "असंज्ञेय: मजिस्ट्रेट की अनुमति जरूरी।",
        "मामले की प्रकृति समझना उचित उपचार चुनने में मदद करता है।"
      ]
    }
  },
  {
    en: {
      title: "What happens after arrest",
      body: "The arrested person must be produced before a Magistrate within 24 hours. The accused has the right to legal counsel and to inform a relative/friend.",
      consider: [
        "Ask to contact a lawyer; exercise the right to silence.",
        "Request medical examination if needed.",
        "Any illegal detention violates constitutional safeguards."
      ]
    },
    hi: {
      title: "गिरफ्तारी के बाद प्रक्रिया",
      body: "गिरफ्तार व्यक्ति को 24 घंटे के भीतर मजिस्ट्रेट के समक्ष पेश करना आवश्यक है। आरोपी को वकील से मिलने और परिजन को सूचना देने का अधिकार है।",
      consider: [
        "वकील से संपर्क करें; चुप रहने का अधिकार प्रयोग करें।",
        "जरूरत हो तो चिकित्सकीय परीक्षण कराएँ।",
        "गैरकानूनी हिरासत संवैधानिक अधिकारों का उल्लंघन है।"
      ]
    }
  },
  {
    en: {
      title: "Types of Bail",
      body: "Regular bail (post‑arrest), anticipatory bail (pre‑arrest), and interim bail (temporary) are granted subject to conditions ensuring cooperation.",
      consider: [
        "Regular bail: Sections 480/483 BNSS.",
        "Anticipatory bail: Section 482 BNSS, before arrest.",
        "Comply with conditions; violation can cancel bail."
      ]
    },
    hi: {
      title: "जमानत के प्रकार",
      body: "नियमित, अग्रिम और अंतरिम जमानत—कोर्ट सहयोग सुनिश्चित करने हेतु शर्तों के साथ देती है।",
      consider: [
        "नियमित जमानत: धारा 480/483 BNSS।",
        "अग्रिम जमानत: धारा 482 BNSS, गिरफ्तारी से पहले।",
        "शर्तों का पालन करें; उल्लंघन पर जमानत रद्द हो सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Bailable vs Non‑Bailable Offence",
      body: "Bailable: bail is a right upon furnishing bond. Non‑bailable: bail is discretionary, depending on gravity, antecedents, and risk factors.",
      consider: [
        "Bailable offences are generally less serious.",
        "Non‑bailable require stronger grounds for release.",
        "Courts weigh risk of absconding or tampering."
      ]
    },
    hi: {
      title: "जमानती बनाम गैर‑जमानती अपराध",
      body: "जमानती मामलों में जमानत अधिकार है; गैर‑जमानती में कोर्ट के विवेक पर निर्भर करती है—गंभीरता और जोखिम कारक देखे जाते हैं।",
      consider: [
        "जमानती अपराध सामान्यतः कम गंभीर होते हैं।",
        "गैर‑जमानती में मज़बूत आधार चाहिए।",
        "भागने/साक्ष्य से छेड़छाड़ का जोखिम आंका जाता है।"
      ]
    }
  },
  {
    en: {
      title: "Charge Sheet",
      body: "Police file a charge sheet under Section 193(2) BNSS after investigation, enclosing evidence and witness lists; it kick‑starts trial proceedings.",
      consider: [
        "Accused is entitled to a copy for defence.",
        "Supplementary charge sheets may follow new evidence.",
        "Defects can be challenged during trial."
      ]
    },
    hi: {
      title: "चार्जशीट",
      body: "पुलिस जांच पूरी कर BNSS धारा 193(2) के तहत चार्जशीट दाखिल करती है, जिसमें साक्ष्य/गवाह होते हैं; इससे ट्रायल शुरू होता है।",
      consider: [
        "आरोपी को प्रति मिलती है।",
        "नए साक्ष्य पर पूरक चार्जशीट संभव।",
        "दोषों को ट्रायल में चुनौती दी जा सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Section 35 BNSS Notice",
      body: "Police may issue a notice for appearance instead of arrest in certain cases. Non‑compliance can lead to arrest with recorded reasons.",
      consider: [
        "Cooperate and appear as directed.",
        "Seek legal advice before statements.",
        "Ask for a copy of the notice and keep it safe."
      ]
    },
    hi: {
      title: "धारा 35 BNSS नोटिस",
      body: "कुछ मामलों में पुलिस गिरफ्तारी की बजाय उपस्थिति नोटिस जारी करती है। अनुपालन न करने पर कारण दर्ज कर गिरफ्तारी हो सकती है।",
      consider: [
        "निर्दिष्ट समय पर सहयोगपूर्वक उपस्थित हों।",
        "बयान देने से पहले कानूनी सलाह लें।",
        "नोटिस की प्रति लें और सुरक्षित रखें।"
      ]
    }
  },
  {
    en: {
      title: "Section 183 BNSS Statement",
      body: "Victim/witness statements may be recorded before a Magistrate under Section 183 BNSS (replacing Section 164 CrPC) to ensure voluntariness and evidentiary value; retraction can be scrutinized.",
      consider: [
        "Read carefully before signing; ensure voluntariness.",
        "Request interpreter if needed.",
        "False statements can invite perjury consequences."
      ]
    },
    hi: {
      title: "धारा 183 BNSS बयान",
      body: "पीड़ित/गवाह का बयान BNSS धारा 183 (जो CrPC की धारा 164 का स्थान लेती है) के तहत मजिस्ट्रेट के समक्ष दर्ज हो सकता है ताकि स्वैच्छिकता और प्रमाणिकता सुनिश्चित हो।",
      consider: [
        "हस्ताक्षर से पहले ध्यान से पढ़ें।",
        "आवश्यकता पर अनुवादक माँगें।",
        "झूठे बयान पर perjury की कार्यवाही हो सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Compounding of Offences",
      body: "Certain offences can be compounded (settled) by parties with or without court permission under Section 359 BNSS; it results in acquittal.",
      consider: [
        "Check if the offence is compoundable.",
        "Ensure free consent; record terms clearly.",
        "Court verifies voluntariness in appropriate cases."
      ]
    },
    hi: {
      title: "अपराधों का समझौता (Compounding)",
      body: "कुछ अपराध BNSS धारा 359 के तहत पक्षकारों के बीच समझौते से समाप्त किए जा सकते हैं, जिससे बरी हो जाता है।",
      consider: [
        "देखें अपराध समंज्ञ है या नहीं।",
        "स्वेच्छा सुनिश्चित करें; शर्तें लिखित रखें।",
        "उचित मामलों में कोर्ट स्वैच्छिकता जांचती है।"
      ]
    }
  },
  {
    en: {
      title: "Electronic Evidence Basics",
      body: "Electronic records (emails, CCTV, chats) are admissible if authenticity is proved. A Section 63 BSA (Bharatiya Sakshya Adhiniyam) certificate may be necessary for secondary electronic evidence.",
      consider: [
        "Preserve original devices when possible.",
        "Maintain chain of custody and logs.",
        "Obtain Section 63 BSA certificate for secondary electronic evidence."
      ]
    },
    hi: {
      title: "इलेक्ट्रॉनिक साक्ष्य के मूल सिद्धांत",
      body: "ईमेल, CCTV, चैट जैसे इलेक्ट्रॉनिक रिकॉर्ड प्रमाणिकता सिद्ध होने पर स्वीकार्य हैं। सेकेंडरी साक्ष्य हेतु धारा 63 BSA (भारतीय साक्ष्य अधिनियम) प्रमाणपत्र आवश्यक हो सकता है।",
      consider: [
        "संभव हो तो मूल डिवाइस सुरक्षित रखें।",
        "कस्टडी और लॉग्स का रिकॉर्ड रखें।",
        "सेकेंडरी डेटा के लिए धारा 63 BSA प्रमाणपत्र लें।"
      ]
    }
  },
  {
    en: {
      title: "Cybercrime Complaint",
      body: "Report cybercrimes at the nearest police station or via national cyber portal. Preserve screenshots, emails, transaction IDs as evidence.",
      consider: [
        "Immediately change passwords and enable 2FA.",
        "Block/report suspicious accounts and numbers.",
        "Inform bank quickly in fraud/UPI cases."
      ]
    },
    hi: {
      title: "साइबर अपराध शिकायत",
      body: "साइबर अपराध नज़दीकी थाने या राष्ट्रीय पोर्टल पर रिपोर्ट करें। स्क्रीनशॉट, ईमेल, लेनदेन ID जैसे साक्ष्य सुरक्षित रखें।",
      consider: [
        "पासवर्ड तुरंत बदलें; 2FA सक्षम करें।",
        "संदिग्ध अकाउंट/नंबर ब्लॉक और रिपोर्ट करें।",
        "धोखाधड़ी/UPI मामलों में बैंक को तुरंत सूचित करें।"
      ]
    }
  },
  {
    en: {
      title: "Consumer Complaint Basics",
      body: "Under Consumer Protection laws, you can complain against defective goods or deficient services before Consumer Commissions based on claim value.",
      consider: [
        "Keep invoices, service contracts, emails as proof.",
        "Send a legal notice before filing, if appropriate.",
        "Claim refund, replacement, or compensation."
      ]
    },
    hi: {
      title: "उपभोक्ता शिकायत के मूल बातें",
      body: "उपभोक्ता संरक्षण कानून के तहत ख़राब वस्तु/सेवा पर उपभोक्ता आयोग में शिकायत की जा सकती है, दावा मूल्य के अनुसार मंच तय होता है।",
      consider: [
        "इनवॉइस, अनुबंध, ईमेल आदि सबूत रखें।",
        "उचित हो तो पहले लीगल नोटिस भेजें।",
        "रिफंड/रिप्लेसमेंट/मुआवज़े की मांग करें।"
      ]
    }
  },
  {
    en: {
      title: "Cheque Bounce (Section 138 NI Act)",
      body: "Dishonour of cheque for insufficiency of funds can lead to criminal complaint if statutory notice is sent within time and dues remain unpaid.",
      consider: [
        "Send demand notice within 30 days of bank memo.",
        "Wait 15 days after notice; then file complaint within limitation.",
        "Maintain proof of service and bank documents."
      ]
    },
    hi: {
      title: "चेक बाउंस (धारा 138, एनआई एक्ट)",
      body: "पर्याप्त धन न होने पर चेक अनादर पर समय सीमा में नोटिस भेजकर और भुगतान न होने पर आपराधिक शिकायत दायर की जा सकती है।",
      consider: [
        "बैंक मेमो से 30 दिन में नोटिस भेजें।",
        "15 दिन प्रतीक्षा के बाद समय सीमा में केस दायर करें।",
        "नोटिस की सेवा और बैंक दस्तावेज़ों का सबूत रखें।"
      ]
    }
  },
  {
    en: {
      title: "Banking Fraud Immediate Steps",
      body: "In unauthorized transactions, inform the bank immediately, lodge a complaint, and file a cyber report. Quick action improves recovery chances.",
      consider: [
        "Hotlist/block cards and UPI immediately.",
        "Get written acknowledgment of complaint.",
        "Track chargeback or reversal timelines."
      ]
    },
    hi: {
      title: "बैंकिंग धोखाधड़ी: तुरंत कदम",
      body: "अनधिकृत लेनदेन पर बैंक को तुरंत सूचित करें, शिकायत दर्ज करें और साइबर रिपोर्ट करें। जल्दी कार्रवाई से वसूली की संभावना बढ़ती है।",
      consider: [
        "कार्ड/UPI तुरंत ब्लॉक कराएँ।",
        "शिकायत की लिखित रसीद लें।",
        "चार्जबैक/रिवर्सल समय-सीमा ट्रैक करें।"
      ]
    }
  },
  {
    en: {
      title: "Domestic Violence Complaint",
      body: "Victims can seek protection orders, residence orders, and monetary relief under the Protection of Women from Domestic Violence Act, 2005.",
      consider: [
        "Approach Protection Officer or police station.",
        "Preserve medical records, photos, messages.",
        "Emergency reliefs can be granted quickly."
      ]
    },
    hi: {
      title: "घरेलू हिंसा शिकायत",
      body: "घरेलू हिंसा से पीड़ित महिला सुरक्षा आदेश, निवास आदेश और आर्थिक सहायता DV Act, 2005 के तहत प्राप्त कर सकती है।",
      consider: [
        "प्रोटेक्शन ऑफिसर/थाने से संपर्क करें।",
        "चिकित्सा रिकॉर्ड, फोटो, संदेश सुरक्षित रखें।",
        "आपातकालीन राहत शीघ्र मिल सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Maintenance Rights",
      body: "Spouses/children/parents may claim maintenance under various laws. Courts consider needs and paying capacity to fix a fair amount.",
      consider: [
        "Provide income/expense details and proof.",
        "Interim maintenance can be sought early.",
        "Non‑payment can lead to enforcement steps."
      ]
    },
    hi: {
      title: "भरण‑पोषण अधिकार",
      body: "पति/पत्नी, बच्चे या माता‑पिता विभिन्न कानूनों के तहत भरण‑पोषण पा सकते हैं। अदालत आवश्यकता और क्षमता देखकर राशि तय करती है।",
      consider: [
        "आय/व्यय के प्रमाण प्रस्तुत करें।",
        "अंतरिम भरण‑पोषण जल्दी मांगा जा सकता है।",
        "अदायगी न होने पर प्रवर्तन कार्रवाई संभव।"
      ]
    }
  },
  {
    en: {
      title: "Mutual Consent Divorce",
      body: "Spouses may jointly petition for divorce with mutual consent, typically requiring separation period and two motions before decree.",
      consider: [
        "Record settlement on alimony/custody/property.",
        "Cooling‑off period may be waived in some cases.",
        "Lawyer helps in drafting fair terms."
      ]
    },
    hi: {
      title: "आपसी सहमति से तलाक",
      body: "पति‑पत्नी आपसी सहमति से तलाक के लिए संयुक्त याचिका दे सकते हैं; आमतौर पर अलगाव अवधि और दो चरण होते हैं।",
      consider: [
        "भरण‑पोषण/हिफ़ाज़त/संपत्ति का समझौता लिखित करें।",
        "कई मामलों में कूल‑ऑफ अवधि माफ़ हो सकती है।",
        "उचित शर्तें तय करने में वकील मदद करता है।"
      ]
    }
  },
  {
    en: {
      title: "Child Custody Basics",
      body: "Courts decide custody based on the child's best interests, considering age, welfare, and the capacity of each parent to provide care.",
      consider: [
        "Demonstrate stable, supportive environment.",
        "Respect visitation schedules; avoid alienation.",
        "Children's wishes may be considered at suitable age."
      ]
    },
    hi: {
      title: "बाल अभिरक्षा के मूल सिद्धांत",
      body: "कोर्ट बच्चे के सर्वोत्तम हितों के आधार पर अभिरक्षा तय करता है—आयु, भलाई और माता‑पिता की देखभाल क्षमता देखी जाती है।",
      consider: [
        "स्थिर और सहायक माहौल दिखाएँ।",
        "मुलाक़ात समय का सम्मान करें; दूरी न बनाएं।",
        "उचित आयु में बच्चे की इच्छा भी देखी जा सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Property Registration",
      body: "Registering sale deeds protects ownership and ensures legal validity. Stamp duty and registration charges vary by state.",
      consider: [
        "Conduct title search and encumbrance check.",
        "Verify identities and property boundaries.",
        "Keep certified copies of registered documents."
      ]
    },
    hi: {
      title: "संपत्ति पंजीकरण",
      body: "सेल डीड पंजीकरण से स्वामित्व सुरक्षित होता है और वैधता मिलती है। स्टाम्प ड्यूटी/रजिस्ट्रेशन शुल्क राज्य अनुसार भिन्न होते हैं।",
      consider: [
        "टाइटल सर्च और भार (encumbrance) जाँच करें।",
        "पहचान और सीमाएँ सत्यापित करें।",
        "प्रमाणित प्रतियाँ सुरक्षित रखें।"
      ]
    }
  },
  {
    en: {
      title: "Power of Attorney (PoA)",
      body: "PoA authorizes someone to act on your behalf. A Special PoA is limited to specific acts; a General PoA is broader but must be used carefully.",
      consider: [
        "Define scope precisely; avoid over‑broad powers.",
        "Notarize/registered PoA as required by local law.",
        "Revoke PoA in writing and notify stakeholders."
      ]
    },
    hi: {
      title: "पॉवर ऑफ अटॉर्नी (PoA)",
      body: "PoA द्वारा आप किसी को अपनी ओर से कार्य करने की अनुमति देते हैं। स्पेशल PoA सीमित कार्यों हेतु; जनरल PoA व्यापक होता है—सावधानी जरूरी।",
      consider: [
        "कार्यक्षेत्र स्पष्ट परिभाषित करें।",
        "आवश्यकता अनुसार नोटरी/पंजीकरण कराएँ।",
        "लिखित रूप में PoA रद्द कर सूचना दें।"
      ]
    }
  },
  {
    en: {
      title: "Gift Deed vs Sale Deed",
      body: "Gift deed transfers property without consideration; sale deed transfers for a price. Tax and stamp implications differ; registration is vital.",
      consider: [
        "Check eligibility to gift and acceptance by donee.",
        "Calculate stamp duty and tax liabilities.",
        "Register the deed and mutate land records."
      ]
    },
    hi: {
      title: "गिफ्ट डीड बनाम सेल डीड",
      body: "गिफ्ट डीड बिना मूल्य के संपत्ति हस्तांतरित करती है; सेल डीड कीमत पर। कर/स्टाम्प प्रावधान अलग होते हैं; पंजीकरण आवश्यक है।",
      consider: [
        "दान देने की पात्रता और स्वीकार सुनिश्चित करें।",
        "स्टाम्प ड्यूटी/कर दायित्व समझें।",
        "डीड रजिस्टर करें और रिकॉर्ड अपडेट कराएँ।"
      ]
    }
  },
  {
    en: {
      title: "Encroachment & Injunction",
      body: "In encroachment disputes, you can seek temporary or permanent injunctions to restrain illegal occupation or construction on your property.",
      consider: [
        "Gather maps, survey, photos as evidence.",
        "File civil suit promptly to avoid complications.",
        "Police aid may be sought to enforce orders."
      ]
    },
    hi: {
      title: "अतिक्रमण और निषेधाज्ञा",
      body: "अतिक्रमण में आप अस्थायी/स्थायी निषेधाज्ञा लेकर अवैध कब्ज़ा/निर्माण रोक सकते हैं।",
      consider: [
        "नक्शे, सर्वे, फोटो जैसे साक्ष्य जुटाएँ।",
        "जटिलताओं से बचने को शीघ्र सिविल वाद दायर करें।",
        "आदेश पालन हेतु पुलिस सहायता मांगी जा सकती है।"
      ]
    }
  },
  {
    en: {
      title: "Employment Termination Rights",
      body: "Check your employment contract and local labour laws. Wrongful termination can be challenged before labour authorities or civil courts.",
      consider: [
        "Maintain emails, contracts, performance records.",
        "Follow internal grievance and appeal steps.",
        "Seek settlement or legal remedy timely."
      ]
    },
    hi: {
      title: "रोज़गार समाप्ति पर अधिकार",
      body: "रोज़गार अनुबंध और श्रम कानून देखें। अवैध समाप्ति को श्रम प्राधिकारी/सिविल कोर्ट में चुनौती दी जा सकती है।",
      consider: [
        "ईमेल/अनुबंध/प्रदर्शन रेकॉर्ड सुरक्षित रखें।",
        "आंतरिक शिकायत/अपील प्रक्रिया अपनाएँ।",
        "समय पर समझौता या कानूनी उपाय तलाशें।"
      ]
    }
  },
  {
    en: {
      title: "Basic Contract Essentials",
      body: "A valid contract needs offer, acceptance, lawful consideration, free consent, and competent parties. Ambiguity invites disputes.",
      consider: [
        "Write clearly: scope, timelines, payments, remedies.",
        "Add dispute resolution: arbitration/venue/law.",
        "Get signatures/witnesses; keep originals."
      ]
    },
    hi: {
      title: "अनुबंध के मूल तत्व",
      body: "वैध अनुबंध हेतु प्रस्ताव, स्वीकृति, विधिसम्मत प्रतिफल, स्वतंत्र सहमति और सक्षम पक्ष जरूरी हैं। अस्पष्टता से विवाद बढ़ते हैं।",
      consider: [
        "स्पष्ट लिखें: दायरा, समय, भुगतान, उपचार।",
        "विवाद समाधान: आर्बिट्रेशन/स्थल/लागू कानून जोड़ें।",
        "हस्ताक्षर/गवाह लें; मूल दस्तावेज़ रखें।"
      ]
    }
  },
  {
    en: {
      title: "Non‑Disclosure Agreement (NDA)",
      body: "NDAs protect confidential information shared for business. Define what is confidential, term, permitted use, and penalties for breach.",
      consider: [
        "Exclude publicly known information from scope.",
        "Add injunctive relief and damages clause.",
        "Specify jurisdiction and dispute method."
      ]
    },
    hi: {
      title: "गोपनीयता समझौता (NDA)",
      body: "NDA व्यावसायिक गोपनीय जानकारी की रक्षा करता है। गोपनीय सामग्री, अवधि, उपयोग और उल्लंघन पर दंड स्पष्ट करें।",
      consider: [
        "सार्वजनिक जानकारी को दायरे से बाहर रखें।",
        "निषेधाज्ञा और क्षतिपूर्ति प्रावधान जोड़ें।",
        "क्षेत्राधिकार और विवाद विधि तय करें।"
      ]
    }
  },
  {
    en: {
      title: "Summons vs Warrant",
      body: "A summons directs appearance; a warrant authorizes arrest. Non‑appearance after summons may lead to a warrant at court's discretion.",
      consider: [
        "Always respond to summons on time.",
        "Request adjournment in writing if required.",
        "Consult a lawyer if a warrant is issued."
      ]
    },
    hi: {
      title: "समन बनाम वारंट",
      body: "समन उपस्थिति का निर्देश है; वारंट गिरफ्तारी का। समन की अवहेलना पर कोर्ट वारंट जारी कर सकता है।",
      consider: [
        "समन का समय पर पालन करें।",
        "ज़रूरत पर लिखित स्थगन माँगें।",
        "वारंट पर तुरंत वकील से सलाह लें।"
      ]
    }
  },
  {
    en: {
      title: "Public Interest Litigation (PIL)",
      body: "PIL allows individuals/NGOs to seek remedies for larger public causes where fundamental rights or public duties are involved.",
      consider: [
        "Ensure genuine public interest and maintain locus.",
        "Support with credible data and documentation.",
        "Avoid frivolous or publicity‑oriented filings."
      ]
    },
    hi: {
      title: "जनहित याचिका (PIL)",
      body: "PIL में व्यक्ति/संस्था जनहित के मुद्दों पर न्यायालय से राहत मांग सकती है, जहाँ मौलिक अधिकार/लोक कर्तव्य शामिल हों।",
      consider: [
        "वास्तविक जनहित और पात्रता सुनिश्चित करें।",
        "विश्वसनीय आँकड़े/दस्तावेज़ संलग्न करें।",
        "तुच्छ/प्रचार आधारित याचिकाओं से बचें।"
      ]
    }
  },
  {
    en: {
      title: "Right to Information (RTI)",
      body: "RTI empowers citizens to seek information from public authorities within timelines. Appeals lie to First Appellate Authority and Information Commission.",
      consider: [
        "Draft precise queries; avoid vague requests.",
        "Track 30‑day response period (48 hours for life/liberty).",
        "Use appeals if information is denied/delayed."
      ]
    },
    hi: {
      title: "सूचना का अधिकार (RTI)",
      body: "RTI के तहत नागरिक सार्वजनिक प्राधिकारियों से समयबद्ध सूचना पा सकते हैं। अस्वीकृति/विलंब पर अपील संभव है।",
      consider: [
        "स्पष्ट प्रश्न पूछें; अस्पष्टता न रखें।",
        "30 दिन की समय सीमा (जीवन/स्वतंत्रता पर 48 घंटे) ध्यान रखें।",
        "सूचना न मिलने पर अपील करें।"
      ]
    }
  },
  {
    en: {
      title: "Traffic Challan Rights",
      body: "You can ask for the officer's name, ID, and offence details. E‑challans can be checked/paid online; you may contest before authority/court.",
      consider: [
        "Carry valid documents or DigiLocker copies.",
        "Do not argue on road; record details calmly.",
        "Contest wrong challans with proof."
      ]
    },
    hi: {
      title: "ट्रैफिक चालान अधिकार",
      body: "आप अधिकारी का नाम/ID और उल्लंघन विवरण पूछ सकते हैं। ई‑चालान ऑनलाइन देख/भर सकते हैं; आपत्ति प्राधिकरण/कोर्ट में कर सकते हैं।",
      consider: [
        "वैध दस्तावेज़/डिजीLocker प्रतियाँ रखें।",
        "सड़क पर बहस न करें; शांतिपूर्वक विवरण नोट करें।",
        "गलत चालान को प्रमाणों के साथ चुनौती दें।"
      ]
    }
  },
  {
    en: {
      title: "Police Verification for Tenants",
      body: "Landlords should complete tenant verification to avoid liability. Forms are available at local police stations or state portals.",
      consider: [
        "Keep ID/address proof copies and contract.",
        "Submit photographs and references as asked.",
        "Update verification upon tenancy renewal."
      ]
    },
    hi: {
      title: "किरायेदार के लिए पुलिस वेरिफिकेशन",
      body: "मकान मालिक दायित्व से बचने हेतु किरायेदार का पुलिस सत्यापन कराएँ। फ़ॉर्म स्थानीय थानों/राज्य पोर्टल पर मिलते हैं।",
      consider: [
        "ID/पते के प्रमाण और अनुबंध रखें।",
        "फोटो/रेफरेंस आवश्यकतानुसार दें।",
        "नवीनीकरण पर सत्यापन अपडेट करें।"
      ]
    }
  },
  {
    en: {
      title: "Online Fraud: Safe Practices",
      body: "Beware of links asking for OTP/UPI PIN. Banks never ask for such details. Use official apps and report suspicious calls immediately.",
      consider: [
        "Never share OTP, CVV, or PIN with anyone.",
        "Type URLs manually; avoid unknown links.",
        "Set transaction limits and enable alerts."
      ]
    },
    hi: {
      title: "ऑनलाइन धोखाधड़ी: सुरक्षा उपाय",
      body: "OTP/UPI PIN माँगने वाले लिंक/कॉल से सावधान रहें। बैंक ऐसे विवरण नहीं मांगते। केवल आधिकारिक ऐप्स का उपयोग करें।",
      consider: [
        "OTP/CVV/PIN कभी साझा न करें।",
        "URL खुद टाइप करें; संदिग्ध लिंक से बचें।",
        "ट्रांजैक्शन लिमिट/अलर्ट सक्षम करें।"
      ]
    }
  },
  {
    en: {
      title: "Defamation Basics",
      body: "Defamation is harming someone's reputation by false statements. Civil suit seeks damages; criminal defamation is also punishable.",
      consider: [
        "Truth and fair comment are defences.",
        "Preserve publications, posts, and witnesses.",
        "Send legal notice before suit where appropriate."
      ]
    },
    hi: {
      title: "मानहानि के मूल सिद्धांत",
      body: "झूठे कथन से प्रतिष्ठा को क्षति पहुँचाना मानहानि है। सिविल में हर्जाना, आपराधिक में दंड संभव है।",
      consider: [
        "सत्य और निष्पक्ष टिप्पणी बचाव हैं।",
        "प्रकाशन/पोस्ट/गवाहों के सबूत सुरक्षित रखें।",
        "उचित हो तो पहले लीगल नोटिस भेजें।"
      ]
    }
  },
  {
    en: {
      title: "Rent Agreement Essentials",
      body: "A written rent agreement prevents disputes. Clearly define rent, deposit, duration, maintenance, and termination clauses.",
      consider: [
        "Register agreement if required by local law.",
        "Take inventory photos at move‑in/out.",
        "Follow notice periods strictly."
      ]
    },
    hi: {
      title: "किराया अनुबंध आवश्यकताएँ",
      body: "लिखित किराया अनुबंध विवादों से बचाता है। किराया, जमा, अवधि, मेंटेनेंस और समाप्ति शर्तें स्पष्ट लिखें।",
      consider: [
        "स्थानीय कानून अनुसार पंजीकरण कराएँ।",
        "इन्वेंटरी की फोटो प्रवेश/निकासी पर लें।",
        "नोटिस अवधि का कड़ाई से पालन करें।"
      ]
    }
  },
  {
    en: {
      title: "Name Change Gazette Process",
      body: "For official name change, make an affidavit, publish in newspapers, and apply to the State Gazette for notification.",
      consider: [
        "Keep copies of affidavit and publications.",
        "Update PAN, Aadhaar, bank, and certificates.",
        "Check state‑specific requirements and fees."
      ]
    },
    hi: {
      title: "नाम परिवर्तन गजट प्रक्रिया",
      body: "कानूनी नाम परिवर्तन हेतु शपथपत्र, समाचारपत्र प्रकाशन और राज्य गजट में अधिसूचना जरूरी होती है।",
      consider: [
        "शपथपत्र/पब्लिकेशन की प्रतियाँ सुरक्षित रखें।",
        "PAN, आधार, बैंक और प्रमाणपत्र अपडेट करें।",
        "राज्य‑विशिष्ट आवश्यकताएँ/शुल्क जांचें।"
      ]
    }
  },
  {
    en: {
      title: "Sexual Harassment at Workplace (POSH)",
      body: "Employers must constitute ICC under POSH Act. Victims can complain to ICC; interim reliefs and confidentiality are available.",
      consider: [
        "File complaint within prescribed timelines.",
        "Seek interim measures (transfer/leave).",
        "Maintain confidentiality and evidence."
      ]
    },
    hi: {
      title: "कार्यस्थल पर यौन उत्पीड़न (POSH)",
      body: "POSH अधिनियम के तहत नियोक्ता को ICC बनाना होता है। पीड़ित ICC में शिकायत कर सकता/सकती है; अंतरिम राहत और गोपनीयता मिलती है।",
      consider: [
        "निर्धारित समय सीमा में शिकायत करें।",
        "अंतरिम उपाय (स्थानांतरण/अवकाश) माँगें।",
        "गोपनीयता और साक्ष्य बनाए रखें।"
      ]
    }
  },
  {
    en: {
      title: "Senior Citizen Rights",
      body: "Parents/senior citizens can claim maintenance from children/relatives under Maintenance and Welfare of Parents and Senior Citizens Act.",
      consider: [
        "Approach Maintenance Tribunal for relief.",
        "Document neglect/expenses and medical needs.",
        "Orders are enforceable with penalties for non‑compliance."
      ]
    },
    hi: {
      title: "वरिष्ठ नागरिक अधिकार",
      body: "वरिष्ठ नागरिक/माता‑पिता भरण‑पोषण अधिनियम के तहत संतान/संबंधियों से भरण‑पोषण माँग सकते हैं।",
      consider: [
        "राहत हेतु मेंटेनेंस ट्रिब्यूनल से संपर्क करें।",
        "उपेक्षा/व्यय/चिकित्सा आवश्यकताओं का प्रमाण रखें।",
        "आदेशों का उल्लंघन दंडनीय है।"
      ]
    }
  },
  {
    en: {
      title: "Basic Startup Compliance",
      body: "Choose the right entity (sole prop/LLP/Private Ltd). Maintain GST, Shops & Establishment, and other registrations as applicable.",
      consider: [
        "Open a current account and maintain books.",
        "File timely returns and compliances.",
        "Use written contracts with vendors/customers."
      ]
    },
    hi: {
      title: "स्टार्टअप के मूल अनुपालन",
      body: "उचित इकाई चुनें (एकल स्वामित्व/LLP/प्राइवेट लिमिटेड)। लागू होने पर GST, दुकान एवं स्थापना आदि पंजीकरण कराएँ।",
      consider: [
        "करेंट अकाउंट खोलें और लेखे रखें।",
        "रिटर्न/अनुपालन समय पर करें।",
        "विक्रेता/ग्राहकों से लिखित अनुबंध करें।"
      ]
    }
  },
  {
    en: {
      title: "Lost Document FIR/Report",
      body: "For lost important documents (PAN, Aadhaar, passport), file a non‑cognizable report or online complaint and apply for reissue.",
      consider: [
        "Keep acknowledgement/complaint number.",
        "Update KYC where the document was used.",
        "Track reissue timelines on official portals."
      ]
    },
    hi: {
      title: "दस्तावेज़ खोने पर रिपोर्ट",
      body: "महत्वपूर्ण दस्तावेज़ (PAN/आधार/पासपोर्ट) खोने पर रिपोर्ट दर्ज कराएँ/ऑनलाइन शिकायत करें और पुनः जारी हेतु आवेदन करें।",
      consider: [
        "स्वीकृति/शिकायत नंबर सुरक्षित रखें।",
        "जहाँ उपयोग हुआ वहाँ KYC अपडेट करें।",
        "आधिकारिक पोर्टल पर पुनः जारी की स्थिति देखें।"
      ]
    }
  },
  {
    en: {
      title: "Passport Police Verification",
      body: "Passport applications may require local police verification. Ensure address proof matches and be available for verification visit.",
      consider: [
        "Keep originals and photocopies ready.",
        "Respond to calls/visits promptly.",
        "Track application on the passport portal."
      ]
    },
    hi: {
      title: "पासपोर्ट पुलिस सत्यापन",
      body: "पासपोर्ट हेतु स्थानीय पुलिस सत्यापन हो सकता है। पता प्रमाण मेल खाता हो और सत्यापन के लिए उपलब्ध रहें।",
      consider: [
        "मूल व फोटोकॉपी तैयार रखें।",
        "कॉल/विज़िट का तुरंत जवाब दें।",
        "पासपोर्ट पोर्टल पर स्थिति ट्रैक करें।"
      ]
    }
  },
  {
    en: {
      title: "Aadhaar / PAN Linking & Updates",
      body: "Ensure PAN–Aadhaar linking and update mobile/email to use e‑KYC services. Mismatch can delay bank/securities transactions.",
      consider: [
        "Use official portals for updates.",
        "Keep KYC documents consistent across accounts.",
        "Save update acknowledgements."
      ]
    },
    hi: {
      title: "आधार/पैन लिंक और अपडेट",
      body: "PAN–आधार लिंक रखें और e‑KYC हेतु मोबाइल/ईमेल अपडेट करें। असंगति से बैंक/सिक्योरिटी लेनदेन में देरी हो सकती है।",
      consider: [
        "अपडेट के लिए आधिकारिक पोर्टल का उपयोग करें।",
        "सभी खातों में KYC दस्तावेज़ एक‑समान रखें।",
        "अपडेट की रसीदें सुरक्षित रखें।"
      ]
    }
  },
  {
    en: {
      title: "E‑Stamp & E‑Registration",
      body: "Many states allow e‑stamp/e‑registration of documents. It reduces fraud risk and eases verification by unique stamp IDs.",
      consider: [
        "Verify authenticity via official portal lookup.",
        "Match amounts and party names carefully.",
        "Keep digital and printed copies safely."
      ]
    },
    hi: {
      title: "ई‑स्टाम्प और ई‑रजिस्ट्रेशन",
      body: "कई राज्यों में ई‑स्टाम्प/ई‑रजिस्ट्रेशन उपलब्ध है। इससे धोखाधड़ी का जोखिम कम होता है और सत्यापन आसान होता है।",
      consider: [
        "आधिकारिक पोर्टल पर प्रामाणिकता जाँचें।",
        "राशि और पक्षकारों के नाम मिलाएँ।",
        "डिजिटल/प्रिंट प्रतियाँ सुरक्षित रखें।"
      ]
    }
  },
  {
    en: {
      title: "E‑Court Cause List & Orders",
      body: "High Courts and District Courts publish cause lists and orders online. Track your case status and orders using case number.",
      consider: [
        "Use official e‑courts portal/mobile app.",
        "Cross‑check party names and case type.",
        "Download and store order PDFs."
      ]
    },
    hi: {
      title: "ई‑कोर्ट कॉज़ लिस्ट और आदेश",
      body: "उच्च/जिला न्यायालय ऑनलाइन कॉज़ लिस्ट और आदेश प्रकाशित करते हैं। केस नंबर से स्थिति और आदेश देखें।",
      consider: [
        "आधिकारिक ई‑कोर्ट पोर्टल/ऐप उपयोग करें।",
        "पक्षकार नाम व केस प्रकार जाँचें।",
        "आदेश PDF डाउनलोड कर रखें।"
      ]
    }
  },
  {
    en: {
      title: "Notary vs Registration",
      body: "Notarization verifies signatures; registration confers legal validity and public notice. Many instruments must be registered by law.",
      consider: [
        "Check Registration Act applicability.",
        "Register leases/sale deeds within timelines.",
        "Notary alone may not protect title."
      ]
    },
    hi: {
      title: "नोटरी बनाम पंजीकरण",
      body: "नोटरी हस्ताक्षर प्रमाणित करता है; पंजीकरण कानूनी वैधता और सार्वजनिक सूचना देता है। कई दस्तावेज़ों का पंजीकरण अनिवार्य है।",
      consider: [
        "रजिस्ट्रेशन एक्ट की लागूता जाँचें।",
        "लीज़/सेल डीड समय पर रजिस्टर करें।",
        "केवल नोटरी से स्वामित्व सुरक्षित नहीं होता।"
      ]
    }
  },
  {
    en: {
      title: "Court Fees & Court Stamps",
      body: "Court fees depend on claim value and case type. Insufficient fees can delay filing; use calculators or consult registry staff.",
      consider: [
        "Estimate fees before drafting reliefs.",
        "Keep receipts and challans attached.",
        "Ask for deficiency memos to cure promptly."
      ]
    },
    hi: {
      title: "अदालती फीस और स्टाम्प",
      body: "अदालती फीस दावे के मूल्य और केस प्रकार पर निर्भर है। कमी होने पर फ़ाइलिंग रुकी रह सकती है।",
      consider: [
        "दावा लिखने से पहले फीस का अनुमान लगाएँ।",
        "रसीद/चलान संलग्न रखें।",
        "कमी की सूचना मिलने पर तुरंत सुधार करें।"
      ]
    }
  },
  {
    en: {
      title: "Arbitration Clause Basics",
      body: "Arbitration offers private dispute resolution. A clear clause on seat, procedure, and arbitrator appointment avoids challenges.",
      consider: [
        "Specify seat/venue and governing rules.",
        "Define panel size and appointment method.",
        "Include interim relief and cost provisions."
      ]
    },
    hi: {
      title: "आर्बिट्रेशन क्लॉज़ के मूल सिद्धांत",
      body: "आर्बिट्रेशन निजी विवाद समाधान देता है। सीट, प्रक्रिया और आर्बिट्रेटर नियुक्ति स्पष्ट होने से विवाद कम होते हैं।",
      consider: [
        "सीट/स्थल और नियम तय करें।",
        "पैनल आकार/नियुक्ति प्रक्रिया लिखें।",
        "अंतरिम राहत/लागत प्रावधान जोड़ें।"
      ]
    }
  },
  {
    en: {
      title: "Mediation Advantage",
      body: "Mediation is collaborative and faster. Parties control the outcome with the mediator's help; settlements are enforceable by courts.",
      consider: [
        "Use mediation before/alongside litigation.",
        "Set clear agendas and confidentiality terms.",
        "Record final settlement in writing."
      ]
    },
    hi: {
      title: "मध्यस्थता (मेडिएशन) के लाभ",
      body: "मेडिएशन सहयोगात्मक और तेज़ होता है। पक्षकार परिणाम पर नियंत्रण रखते हैं; समझौता कोर्ट से प्रवर्तनीय होता है।",
      consider: [
        "वाद से पहले/साथ में मेडिएशन आज़माएँ।",
        "एजेंडा/गोपनीयता शर्तें तय करें।",
        "अंतिम समझौता लिखित रूप में दर्ज करें।"
      ]
    }
  },
  {
    en: {
      title: "Stamp Duty Under‑Payment Risk",
      body: "Under‑stamped documents may be impounded and become inadmissible. Pay correct duty and penalties if regularising later.",
      consider: [
        "Use official calculators/guidance notes.",
        "Revalidate market value and consideration.",
        "Regularise promptly to avoid litigation delays."
      ]
    },
    hi: {
      title: "कम स्टाम्प ड्यूटी का जोखिम",
      body: "कम स्टाम्प लगे दस्तावेज़ जब्त/अमान्य हो सकते हैं। बाद में नियमितीकरण पर पेनल्टी लग सकती है।",
      consider: [
        "आधिकारिक कैलकुलेटर/गाइड देखें।",
        "बाज़ार मूल्य/प्रतिफल पुनः जाँचें।",
        "विलंब से बचने हेतु समय पर नियमित करें।"
      ]
    }
  },
  {
    en: {
      title: "Section 63 BSA Certificate Snapshot",
      body: "For printouts/screenshots of electronic records, a Section 63 BSA (Bharatiya Sakshya Adhiniyam) certificate — replacing the old Section 65B of the Indian Evidence Act — identifies device, process, and authenticity of the computer output.",
      consider: [
        "Include device owner and control details.",
        "Describe the process producing the output.",
        "Sign by responsible person with date."
      ]
    },
    hi: {
      title: "धारा 63 BSA प्रमाणपत्र संक्षेप",
      body: "इलेक्ट्रॉनिक रिकॉर्ड के प्रिंट/स्क्रीनशॉट हेतु धारा 63 BSA (भारतीय साक्ष्य अधिनियम) प्रमाणपत्र — जो पुरानी धारा 65B का स्थान लेती है — डिवाइस, प्रक्रिया और प्रामाणिकता बताता है।",
      consider: [
        "डिवाइस स्वामी/नियंत्रण विवरण दें।",
        "आउटपुट बनाने की प्रक्रिया लिखें।",
        "जिम्मेदार व्यक्ति द्वारा दिनांक सहित हस्ताक्षर करें।"
      ]
    }
  },
  {
    en: {
      title: "Electronic Evidence Basics — Quick Tip",
      body: "Electronic records (emails, CCTV, chats) are admissible if authenticity is proved. A Section 63 BSA (Bharatiya Sakshya Adhiniyam) certificate may be necessary for secondary electronic evidence. This quick tip emphasizes acting promptly and keeping written records to protect your rights.",
      consider: [
        "Preserve original devices when possible.",
        "Maintain chain of custody and logs.",
        "Document timelines and keep acknowledgements."
      ]
    },
    hi: {
      title: "इलेक्ट्रॉनिक साक्ष्य के मूल सिद्धांत — झटपट सुझाव",
      body: "ईमेल, CCTV, चैट जैसे इलेक्ट्रॉनिक रिकॉर्ड प्रमाणिकता सिद्ध होने पर स्वीकार्य हैं। सेकेंडरी साक्ष्य हेतु धारा 63 BSA (भारतीय साक्ष्य अधिनियम) प्रमाणपत्र आवश्यक हो सकता है। यह झटपट सुझाव समय पर कार्रवाई और लिखित रिकॉर्ड रखने पर जोर देता है ताकि आपके अधिकार सुरक्षित रहें।",
      consider: [
        "संभव हो तो मूल डिवाइस सुरक्षित रखें।",
        "कस्टडी और लॉग्स का रिकॉर्ड रखें।",
        "समय‑रेखा और रसीदें सुरक्षित रखें।"
      ]
    }
  }
];