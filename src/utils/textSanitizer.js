/**
 * Utility to sanitize legacy font encoding artifacts, broken unicode glyphs,
 * and raw PDF OCR text dumps for clean professional display in templates and admin views.
 */
export function cleanHindiText(str) {
  if (!str || typeof str !== 'string') return '';

  let cleaned = str;

  // 1. Remove title prefixes like MX., Mx., Mr., Mrs.
  cleaned = cleaned.replace(/^(?:MX\.|Mx\.|Mr\.|Mrs\.|Shri|Smt\.)\s*/gi, '');

  // 2. Truncate raw OCR labels & dump tokens from name/father/address fields
  const dumpTokens = [
    'Father/Husband:', 'Father / Husband:', 'Father/Husband :', 
    'Joint Owner Name:', 'Joint Owner Name :',
    'Rate Zone:', 'Property Tax', 'Usage Type', 'Construction Type', 
    'RESIDENCIAL', 'SELF OCCUPIED', 'Paid Amount:', 'Mode of Payment:',
    'Total Current:', 'Remarks Payment', 'Office Copy', 'Receipt No.',
    'JYSTMBTODGATEFR', 'Assessment Year:'
  ];
  for (const token of dumpTokens) {
    if (cleaned.includes(token)) {
      cleaned = cleaned.split(token)[0];
    }
  }

  // 3. Remove "Address:", "Father/Husband:", "Name:" prefixes if leftover
  cleaned = cleaned.replace(/^(?:Address|Father\/Husband|Name|Property Owner Name|Owner Name|पता|पिता|नाम)\s*[:\-]?\s*/gi, '');

  // 4. Fix specific broken KrutiDev Devnagari ligatures and font artifacts
  cleaned = cleaned
    .replace(/कृ[^\s\w\u0900-\u097F]*णा/g, 'कृष्णा')
    .replace(/महे[^\s\w\u0900-\u097F]*सिंह/g, 'महेंद्र सिंह')
    .replace(/महे[^\s\w\u0900-\u097F]*िसिंह/g, 'महेंद्र सिंह')
    .replace(/शेले[^\s\w\u0900-\u097F]*सिंह/g, 'शैलेन्द्र सिंह')
    .replace(/शेले[^\s\w\u0900-\u097F]*िसिंह/g, 'शैलेन्द्र सिंह')
    .replace(/चेत[^\s\w\u0900-\u097F]*माग[^\s]*/g, 'चैतन्य मार्ग')
    .replace(/सीमे[^\s\w\u0900-\u097F]*ट/g, 'सीमेंट')
    .replace(/यु[^\s\w\u0900-\u097F]*त/g, 'युक्त')
    .replace(/अवय\s*क/g, 'अवयस्क')
    .replace(/िपता/g, 'पिता')
    .replace(/ििसिंह|िसिंह/g, 'सिंह');

  // 5. Remove box characters (🗎), unmapped unicode symbols, control chars
  cleaned = cleaned.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uFFFD\uFFFC\uF5CE\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // 6. Clean trailing periods, dashes, whitespace
  return cleaned.replace(/^[\s:\.\-]+|[\s:\.\-]+$/g, '').replace(/\s+/g, ' ').trim();
}
