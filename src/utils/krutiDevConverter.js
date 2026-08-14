/**
 * Font Converter Utility for Unicode (Mangal) <-> Kruti Dev 010
 * Ported for the birth-death-certificate no-dues receipt OCR pipeline.
 */

// Mapping of Kruti Dev character representations to Unicode characters
const krutiToUnicodeMap = [
  { k: 'vks%', u: 'ॐ' },
  { k: 'vks', u: 'ओ' },
  { k: 'vkS', u: 'औ' },
  { k: 'vk', u: 'आ' },
  { k: 'v', u: 'अ' },
  { k: 'bZ', u: 'ई' },
  { k: 'b', u: 'इ' },
  { k: 'm', u: 'उ' },
  { k: 'Å', u: 'ऊ' },
  { k: '½', u: 'ऋ' },
  { k: 'S', u: 'ऐ' },
  { k: 's', u: 'ए' },

  // Consonants
  { k: 'd', u: 'क' },
  { k: '[k', u: 'ख' },
  { k: 'x', u: 'ग' },
  { k: '?', u: 'घ' },
  { k: '³', u: 'ङ' },
  { k: 'p', u: 'च' },
  { k: 'N', u: 'छ' },
  { k: 't', u: 'ज' },
  { k: '÷', u: 'झ' },
  { k: '¥', u: 'ञ' },
  { k: 'V', u: 'ट' },
  { k: 'B', u: 'ठ' },
  { k: 'M', u: 'ड' },
  { k: 'ढ्', u: 'ढ' },
  { k: '.', u: 'ण' },
  { k: 'r', u: 'त' },
  { k: 'Fk', u: 'थ' },
  { k: 'n', u: 'द' },
  { k: '/k', u: 'ध' },
  { k: 'u', u: 'न' },
  { k: 'i', u: 'प' },
  { k: 'Q', u: 'फ' },
  { k: 'c', u: 'ब' },
  { k: 'Hk', u: 'भ' },
  { k: 'e', u: 'म' },
  { k: 'j', u: 'र' },
  { k: 'y', u: 'ल' },
  { k: 'o', u: 'व' },
  { k: '\'k', u: 'श' },
  { k: '\'', u: 'ष' },
  { k: 'l', u: 'स' },
  { k: 'g', u: 'ह' },
  { k: ';', u: 'य' },
  { k: '>', u: 'झ' },
  { k: '"', u: 'ष' },
  { k: 'U', u: 'न्' },
  { k: 'I', u: 'प्' },
  { k: 'R', u: 'त्' },

  // Halfs
  { k: 'd~', u: 'क्' },
  { k: '[k~', u: 'ख्' },
  { k: 'x~', u: 'ग्' },
  { k: 't~', u: 'ज्' },
  { k: 'Q~', u: 'फ्' },
  { k: 'c~', u: 'ब्' },
  { k: 'M~', u: 'ड्' },
  { k: 'Hk~', u: 'भ्' },
  { k: 'e~', u: 'म्' },
  { k: 'y~', u: 'ल्' },
  { k: 'o~', u: 'व्' },

  // Matras
  { k: 'k', u: 'ा' },
  { k: 'h', u: 'ी' },
  { k: 'q', u: 'ु' },
  { k: 'w', u: 'ू' },
  { k: '`', u: 'ृ' },
  { k: 's', u: 'े' },
  { k: 'S', u: 'ै' },
  { k: 'ks', u: 'ो' },
  { k: 'kS', u: 'ौ' },
  { k: 'z', u: '्' },
  { k: 'W', u: 'ँ' },
  { k: 'a', u: 'ं' },
  { k: '%', u: 'ः' },

  // Numbers
  { k: '0', u: '०' },
  { k: '1', u: '१' },
  { k: '2', u: '२' },
  { k: '3', u: '३' },
  { k: '4', u: '४' },
  { k: '5', u: '५' },
  { k: '6', u: '६' },
  { k: '7', u: '७' },
  { k: '8', u: '८' },
  { k: '9', u: '९' }
];

export function krutiDevToUnicode(krutiString) {
  if (!krutiString) return "";

  let text = krutiString;

  // 1. Replace special compound characters first
  const conjuncts = [
    { k: 'Hkzw', u: 'भ्रू' },
    { k: 'Hkz', u: 'भ्र' },
    { k: 'Øs', u: 'क्रे' },
    { k: 'Ø', u: 'क्र' },
    { k: 'J', u: 'श्र' },
    { k: 'K', u: 'ज्ञ' },
    { k: 'nz', u: 'द्र' },
    { k: 'iz', u: 'प्र' },
    { k: 'lz', u: 'स्र' },
    { k: 'gz', u: 'ह्र' },
    { k: '=k', u: 'त्र' },
    { k: 'M+', u: 'ड़' },
    { k: 'Tªs', u: 'ट्रे' },
    { k: 'Bªs', u: 'ठ्रे' },
    { k: 'Mªs', u: 'ड्रे' },
    { k: 'Vª', u: 'ट्र' },
    { k: 'Bª', u: 'ठ्र' },
    { k: 'Mª', u: 'ड्र' },
  ];

  for (const pair of conjuncts) {
    text = text.replace(new RegExp(escapeRegExp(pair.k), 'g'), pair.u);
  }

  // 2. Chhoti ee matra rearrangement ('f' precedes the consonant it modifies)
  let position = text.indexOf('f');
  while (position !== -1) {
    let nextChar = text.charAt(position + 1);
    let characterLength = 1;

    if (position + 2 < text.length) {
      const doubleChar = text.substring(position + 1, position + 3);
      if (['[k', '/k', 'Hk', '\'k'].includes(doubleChar)) {
        characterLength = 2;
      }
    }

    const consonant = text.substring(position + 1, position + 1 + characterLength);
    text = text.substring(0, position) + consonant + 'ि' + text.substring(position + 1 + characterLength);
    position = text.indexOf('f', position + 1);
  }

  // 3. Reph (superscript r) rearrangement ('Z' after syllable -> र् before cluster)
  let rephPos = text.indexOf('Z');
  while (rephPos !== -1) {
    if (rephPos > 0) {
      let prevCharPos = rephPos - 1;
      while (prevCharPos >= 0 && ['k', 'h', 'q', 'w', '`', 's', 'S', 'a', '%', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ा'].includes(text.charAt(prevCharPos))) {
        prevCharPos--;
      }

      let clusterStart = prevCharPos;
      if (clusterStart > 0) {
        const potentialDouble = text.substring(clusterStart - 1, clusterStart + 1);
        if (['[k', '/k', 'Hk', '\'k'].includes(potentialDouble)) {
          clusterStart--;
        }
      }

      text = text.substring(0, clusterStart) + 'र्' + text.substring(clusterStart, rephPos) + text.substring(rephPos + 1);
    } else {
      text = text.substring(1);
    }
    rephPos = text.indexOf('Z');
  }

  // 4. Map individual remaining characters
  for (const pair of krutiToUnicodeMap) {
    text = text.replace(new RegExp(escapeRegExp(pair.k), 'g'), pair.u);
  }

  return text;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if the text is in Kruti Dev font (English keystrokes representing Hindi).
 * Requires the whole segment to be lowercase Latin tokens so English labels like
 * "Owner Name" are never mistaken for Kruti Dev.
 */
export function isKrutiDev(text) {
  if (!text) return false;

  if (/[\u0900-\u097F]/.test(text)) return false;
  if (!/^[a-z\s'&%,\-\.\/0-9]+$/.test(text)) return false;

  const commonKrutiWords = ['firk', 'dzekad', 'uxj', 'Hkq[k.M', 'okMZ', 'xka/kh', 'edku', 'IykWV', 'fefydkj', 'laxhr', 'uoxat'];
  for (const word of commonKrutiWords) {
    if (text.includes(word)) return true;
  }

  const devanagariHintCount = (text.match(/[dkhxrpneuoijygl][kha]|[a-zA-Z][kha]/g) || []).length;
  if (devanagariHintCount >= 3) return true;

  return false;
}

/**
 * Ensures the text is standard Unicode (Mangal compatible).
 * If the input text is Kruti Dev, it converts it.
 */
export function ensureUnicode(text) {
  if (!text) return "";
  if (isKrutiDev(text)) {
    return krutiDevToUnicode(text);
  }
  return text;
}