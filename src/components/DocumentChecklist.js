'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, Square, FileText, Home, Building2, HelpCircle, 
  Printer, Info, Sparkles, CheckCircle2, ShieldCheck, Download
} from 'lucide-react';

export const CHECKLIST_DATA = {
  homeBirth: {
    id: 'homeBirth',
    title: 'जन्म प्रमाण पत्र (घर पर जन्म होने पर)',
    subtitle: 'Required Documents for Birth Certificate - Home Birth',
    category: 'birth',
    icon: '🏠',
    badge: 'घर पर जन्म',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'यदि शिशु का जन्म घर पर हुआ है, तो आवेदन पत्र के साथ निम्नलिखित 5 दस्तावेज संलग्न करना अनिवार्य है:',
    items: [
      {
        id: 'hb_1',
        title: '1. बच्चे के माता-पिता के आधार कार्ड की फोटोकॉपी',
        detail: 'माता तथा पिता दोनों का आधार कार्ड स्पष्ट एवं अद्यतन होना चाहिए।',
        required: true
      },
      {
        id: 'hb_2',
        title: '2. समग्र परिवार आई.डी. (Samagra Family ID)',
        detail: 'समग्र परिवार आईडी की फोटोकॉपी जिसमें माता-पिता का नाम दर्ज होना अनिवार्य है।',
        required: true
      },
      {
        id: 'hb_3',
        title: '3. आँगनवाड़ी कार्यकर्ता द्वारा प्रमाणित पत्र',
        detail: 'आँगनवाड़ी कार्यकर्ता द्वारा प्रमाणित, लिखा हुआ सील और हस्ताक्षर सहित पत्र कि बच्चा घर पर हुआ है।',
        required: true
      },
      {
        id: 'hb_4',
        title: '4. जच्चा-बच्चा कार्ड (MCP Card)',
        detail: 'स्वास्थ्य विभाग द्वारा जारी जच्चा-बच्चा (MCP) कार्ड की स्पष्ट फोटोकॉपी।',
        required: true
      },
      {
        id: 'hb_5',
        title: '5. मुख्य नगरपालिका अधिकारी (CMO) के नाम आवेदन पत्र',
        detail: 'आवेदन पत्र और आवेदन के नीचे कैपिटल लेटर (CAPITAL LETTERS) में बच्चा एवं माता-पिता के नाम की स्पेलिंग दर्ज होनी चाहिए।',
        required: true
      }
    ]
  },
  vardanHospitalBirth: {
    id: 'vardanHospitalBirth',
    title: 'जन्म प्रमाण पत्र (वरदान हॉस्पिटल)',
    subtitle: 'Required Documents for Birth Certificate - Vardan Hospital',
    category: 'birth',
    icon: '🏥',
    badge: 'वरदान हॉस्पिटल जन्म',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'वरदान हॉस्पिटल झाबुआ में जन्म होने की स्थिति में निम्नलिखित दस्तावेज संलग्न करें:',
    items: [
      {
        id: 'vh_1',
        title: '1. बच्चे के माता-पिता के आधार कार्ड की फोटोकॉपी',
        detail: 'माता तथा पिता दोनों का आधार कार्ड अनिवार्य है।',
        required: true
      },
      {
        id: 'vh_2',
        title: '2. समग्र परिवार आई.डी. (Samagra Family ID)',
        detail: 'समग्र परिवार आईडी की फोटोकॉपी जिसमें माता-पिता का नाम होना अनिवार्य है।',
        required: true
      },
      {
        id: 'vh_3',
        title: '3. वरदान हॉस्पिटल की रजिस्ट्रेशन स्लिप व डिस्चार्ज कार्ड',
        detail: 'वरदान हॉस्पिटल द्वारा जारी मूल रजिस्ट्रेशन पर्ची तथा डिस्चार्ज कार्ड की फोटोकॉपी।',
        required: true
      }
    ]
  },
  generalHospitalBirth: {
    id: 'generalHospitalBirth',
    title: 'जन्म प्रमाण पत्र (शासकीय/अन्य अस्पताल)',
    subtitle: 'Required Documents for Birth Certificate - Government / General Hospital',
    category: 'birth',
    icon: '🏢',
    badge: 'अस्पताल जन्म',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'जिला चिकित्सालय झाबुआ या अन्य पंजीकृत अस्पताल में प्रसव होने पर दस्तावेज:',
    items: [
      {
        id: 'gh_1',
        title: '1. माता-पिता का आधार कार्ड फोटोकॉपी',
        detail: 'माता व पिता दोनों का आधार कार्ड।',
        required: true
      },
      {
        id: 'gh_2',
        title: '2. समग्र परिवार आई.डी. फोटोकॉपी',
        detail: 'माता-पिता का नाम दर्ज समग्र आईडी।',
        required: true
      },
      {
        id: 'gh_3',
        title: '3. अस्पताल प्रसव सह डिस्चार्ज कार्ड / प्रसव सूचना पर्ची',
        detail: 'अस्पताल से प्राप्त मूल डिस्चार्ज सह जन्म सूचना पत्र की प्रति।',
        required: true
      }
    ]
  },
  homeDeath: {
    id: 'homeDeath',
    title: 'मृत्यु प्रमाण पत्र (घर पर मृत्यु होने पर)',
    subtitle: 'Required Documents for Death Certificate - Home Death',
    category: 'death',
    icon: '🕯️',
    badge: 'घर पर मृत्यु',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'यदि मृत्यु घर पर हुई है, तो आवेदन के साथ निम्नलिखित 6 आवश्यक दस्तावेज संलग्न करें:',
    items: [
      {
        id: 'hd_1',
        title: '1. मृतक के आधार कार्ड की फोटोकॉपी',
        detail: 'मृतक व्यक्ति का आधार कार्ड की फोटोकॉपी।',
        required: true
      },
      {
        id: 'hd_2',
        title: '2. सूचनादाता के आधार कार्ड की फोटोकॉपी',
        detail: 'आवेदन करने वाले रिश्तेदार / सूचनादाता का आधार कार्ड।',
        required: true
      },
      {
        id: 'hd_3',
        title: '3. अंतिम संस्कार रसीद (मुक्तिधाम / मुस्लिम पंचायत / चर्च)',
        detail: 'मुक्तिधाम, श्मशान घाट, मुस्लिम पंचायत अथवा चर्च द्वारा जारी दाह संस्कार/दफन की आधिकारिक रसीद।',
        required: true
      },
      {
        id: 'hd_4',
        title: '4. मृतक की समग्र आई.डी. की फोटोकॉपी',
        detail: 'मृतक सदस्य का नाम दर्ज समग्र परिवार आईडी फोटोकॉपी।',
        required: true
      },
      {
        id: 'hd_5',
        title: '5. पंचनामा अथवा वार्ड पार्षद द्वारा प्रमाणित पत्र',
        detail: 'पंचनामा अथवा संबंधित वार्ड पार्षद द्वारा प्रमाणित पत्र कि मृत्यु कहाँ एवं किस दिनांक को हुई।',
        required: true
      },
      {
        id: 'hd_6',
        title: '6. मुख्य नगरपालिका अधिकारी (CMO) के नाम आवेदन पत्र',
        detail: 'आवेदन पत्र और उसमें नीचे कैपिटल लेटर (CAPITAL LETTERS) में मृतक तथा माता-पिता/पति/पत्नी के नाम की स्पेलिंग।',
        required: true
      }
    ]
  },
  hospitalDeath: {
    id: 'hospitalDeath',
    title: 'मृत्यु प्रमाण पत्र (अस्पताल में मृत्यु होने पर)',
    subtitle: 'Required Documents for Death Certificate - Hospital Death',
    category: 'death',
    icon: '🏥',
    badge: 'अस्पताल मृत्यु',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'अस्पताल में मृत्यु होने की दशा में आवश्यक दस्तावेज:',
    items: [
      {
        id: 'hosp_d1',
        title: '1. मृतक का आधार कार्ड फोटोकॉपी',
        detail: 'मृतक का आधार कार्ड।',
        required: true
      },
      {
        id: 'hosp_d2',
        title: '2. सूचनादाता / आवेदक का आधार कार्ड',
        detail: 'आवेदक का आधार कार्ड।',
        required: true
      },
      {
        id: 'hosp_d3',
        title: '3. अस्पताल द्वारा जारी मृत्यु सह चिकित्सा प्रमाण पत्र (Form 4/4A)',
        detail: 'अस्पताल का मेडिकल डेथ सर्टिफिकेट एवं डिस्चार्ज समरी।',
        required: true
      },
      {
        id: 'hosp_d4',
        title: '4. समग्र आई.डी. फोटोकॉपी',
        detail: 'मृतक की समग्र आईडी की प्रति।',
        required: true
      }
    ]
  },
  waterConnection: {
    id: 'waterConnection',
    title: 'जल (नल) कनेक्शन हेतु आवश्यक दस्तावेज',
    subtitle: 'Required Documents for New Water Connection',
    category: 'water',
    icon: '🚰',
    badge: 'नल कनेक्शन',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'नगर पालिका परिषद झाबुआ में नए नल कनेक्शन हेतु आवेदन के साथ निम्नलिखित 4 आवश्यक दस्तावेज संलग्न करें:',
    items: [
      {
        id: 'wc_1',
        title: '1. आवेदक का आधार कार्ड की फोटोकॉपी',
        detail: 'भवन स्वामी / आवेदक का 12 अंकों का आधार कार्ड स्पष्ट होना अनिवार्य है।',
        required: true
      },
      {
        id: 'wc_2',
        title: '2. भवन स्वामित्व / संपत्ति कर भुगतान रसीद',
        detail: 'मकान की रजिस्ट्री, पट्टा अथवा नगर पालिका की अद्यतन संपत्ति कर (Property Tax) रसीद की फोटोकॉपी।',
        required: true
      },
      {
        id: 'wc_3',
        title: '3. नोटरी द्वारा सत्यापित शपथ पत्र (Affidavit)',
        detail: 'स्टाम्प पेपर पर नोटरी द्वारा सत्यापित शपथ पत्र (नल कनेक्शन उपयोग नियम एवं शर्तों हेतु)।',
        required: true
      },
      {
        id: 'wc_4',
        title: '4. आवेदक का पासपोर्ट साइज फोटो एवं आवेदन पत्र',
        detail: 'नवीनतम रंगीन पासपोर्ट साइज फोटो एवं ई-पोर्टल द्वारा जनरेटेड हस्ताक्षरित आवेदन पत्र (Hard Copy)।',
        required: true
      }
    ]
  }
};

export default function DocumentChecklist({ defaultCategory = 'all', compact = false }) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory); // 'all' | 'birth' | 'death' | 'water'
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const filteredKeys = Object.keys(CHECKLIST_DATA).filter(key => {
    if (activeCategory === 'all') return true;
    return CHECKLIST_DATA[key].category === activeCategory;
  });

  const handlePrintChecklist = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-lg font-bold">📋</span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                आवश्यक दस्तावेज चैकलिस्ट (Required Document Checklist)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                नगर पालिका परिषद झाबुआ (म.प्र.) आधिकारिक शासकीय निर्देश सूची
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!compact && (
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी सूची
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('birth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === 'birth' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👶 जन्म प्रमाण पत्र
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('death')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === 'death' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🕯️ मृत्यु प्रमाण पत्र
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('water')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === 'water' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🚰 जल कनेक्शन
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrintChecklist}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            💡 महत्वपूर्ण निर्देश (Important Note):
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            ऑनलाइन फॉर्म भरने के पश्चात्, जनरेटेड <strong>भौतिक आवेदन पत्र (Hard Copy Letter)</strong> के साथ ऊपर सूचीबद्ध सभी मूल दस्तावेजों की स्व-प्रमाणित फोटोकॉपी संलग्न करके नगर पालिका कार्यालय में जमा करना अनिवार्य है। नीचे दिए गए टिक-बॉक्स पर क्लिक करके आप अपने पास उपलब्ध दस्तावेजों की जांच कर सकते हैं।
          </p>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredKeys.map(key => {
          const group = CHECKLIST_DATA[key];
          const totalItems = group.items.length;
          const completedItems = group.items.filter(item => checkedItems[item.id]).length;
          const isAllChecked = totalItems > 0 && totalItems === completedItems;

          return (
            <div 
              key={group.id} 
              className={`border rounded-2xl p-5 transition-all duration-300 ${
                isAllChecked ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-200/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.icon}</span>
                    <h3 className="text-sm font-extrabold text-slate-900">{group.title}</h3>
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}>
                    {group.badge}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg ${
                    isAllChecked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {completedItems} / {totalItems} तैयार
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-medium mb-3 leading-relaxed">
                {group.description}
              </p>

              <div className="space-y-2.5">
                {group.items.map(item => {
                  const isChecked = Boolean(checkedItems[item.id]);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-white border-emerald-400 shadow-xs text-emerald-950' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 focus:outline-none"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                      
                      <div className="space-y-0.5 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> नगर पालिका परिषद झाबुआ - सूचना पट्ट के आधार पर तैयार
        </span>
        <span className="font-mono text-[10px]">E-Nagarpalika MP Standards</span>
      </div>
    </div>
  );
}
