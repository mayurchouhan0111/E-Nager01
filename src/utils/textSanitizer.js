/**
 * Utility to sanitize legacy font encoding artifacts, broken unicode glyphs,
 * and raw PDF OCR text dumps for clean professional display in templates.
 */
export function cleanHindiText(str) {
  if (!str || typeof str !== 'string') return '';

  let cleaned = str;

  // 1. Truncate raw OCR table dump from address strings if present
  const dumpTokens = [
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

  // 2. Remove "Address:", "Father/Husband:", "Name:" prefixes if leftover
  cleaned = cleaned.replace(/^(?:Address|Father\/Husband|Name|Property Owner Name|Owner Name|पता|पिता|नाम)\s*[:\-]?\s*/gi, '');

  // 3. Fix common broken Devnagari KrutiDev/Legacy PDF font artifacts
  cleaned = cleaned
    .replace(/कृ[\s\S]{1,4}णा/g, 'कृष्णा')
    .replace(/महे[\s\S]{1,6}सिंह/g, 'महेंद्र सिंह')
    .replace(/चेत[\s\S]{1,4}माग[^\s]*/g, 'चैतन्य मार्ग')
    .replace(/सीमे[\s\S]{1,4}ट/g, 'सीमेंट')
    .replace(/यु[\s\S]{1,4}त/g, 'युक्त')
    .replace(/माग[\uFFFD\uF5CE\uD83D\uD83C\uD83E\uD83F\uFFFF\u0000-\u001F\u007F-\u009F]+/g, 'मार्ग')
    .replace(/ि\s*सिंह/g, 'सिंह');

  // 4. Strip out any remaining unmapped control characters / box glyphs (\uFFFD, non-printable unicode symbols)
  cleaned = cleaned.replace(/[\uFFFD\uFFFC\uF5CE\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // 5. Clean extra whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}
