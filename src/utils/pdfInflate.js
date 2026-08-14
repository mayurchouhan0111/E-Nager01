/**
 * Pure-JS DEFLATE (RFC 1951) / zlib (RFC 1950) decoder.
 * Synchronous, dependency-free, cannot hang or leak unhandled rejections.
 * Used as the reliable inflate path for offline PDF stream extraction.
 *
 * Handles stored, fixed-Huffman and dynamic-Huffman blocks.
 * Returns a Uint8Array, or null if the data is not decodable.
 */

const BFINAL = 0x01, BTYPE_FIXED = 1, BTYPE_DYNAMIC = 2;

export function isZlibStream(b0, b1) {
  return (b0 & 0x0f) === 8 && (b0 >> 4) <= 7 && ((b0 << 8) | b1) % 31 === 0;
}

class BitReader {
  constructor(data) {
    this.data = data;
    this.pos = 0;
    this.bitBuf = 0;
    this.bitCount = 0;
  }
  need(n) {
    while (this.bitCount < n) {
      if (this.pos >= this.data.length) throw new Error('inflate: unexpected end of input');
      this.bitBuf = (this.bitBuf | (this.data[this.pos++] << this.bitCount)) >>> 0;
      this.bitCount += 8;
    }
  }
  readBits(n) {
    this.need(n);
    const v = this.bitBuf & ((1 << n) - 1);
    this.bitBuf >>>= n;
    this.bitCount -= n;
    return v;
  }
  readBitsBig(n) {
    let v = 0;
    for (let i = 0; i < n; i++) v |= this.readBits(1) << i;
    return v;
  }
  alignToByte() {
    this.bitBuf = 0;
    this.bitCount = 0;
  }
}

function buildHuffman(lengths) {
  const MAX = 15;
  const count = new Array(MAX + 1).fill(0);
  for (const l of lengths) if (l > 0) count[l]++;
  if (count[0] === lengths.length) return null;

  const codes = new Array(MAX + 1).fill(0);
  let code = 0;
  for (let bits = 1; bits <= MAX; bits++) {
    code = (code + count[bits - 1]) << 1;
    codes[bits] = code;
  }

  const nextCode = codes.slice();
  const table = new Array(1 << MAX).fill(-1);
  const tableLen = new Array(1 << MAX).fill(0);

  for (let n = 0; n < lengths.length; n++) {
    const len = lengths[n];
    if (len === 0) continue;
    if (len > 15) throw new Error('inflate: invalid code length');
    const start = nextCode[len]++;
    const width = 1 << (MAX - len);
    const base = start << (MAX - len);
    for (let k = 0; k < width; k++) {
      table[base + k] = n;
      tableLen[base + k] = len;
    }
  }
  return { table, tableLen };
}

function decodeSymbol(br, huff) {
  if (!huff) throw new Error('inflate: empty huffman tree');
  br.need(15);
  const peek = br.bitBuf;
  let idx = 0;
  for (let i = 0; i < 15; i++) idx = (idx << 1) | ((peek >> i) & 1);
  const sym = huff.table[idx];
  if (sym < 0) throw new Error('inflate: invalid huffman code');
  const len = huff.tableLen[idx];
  br.bitBuf >>>= len;
  br.bitCount -= len;
  return sym;
}

const LENGTH_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
const LENGTH_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
const DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
const DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

const CLEN_ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

export function inflateRaw(data) {
  if (!data || data.length === 0) return new Uint8Array(0);
  const br = new BitReader(data);
  const out = [];
  let outLen = 0;

  let done = false;
  while (!done) {
    const bfinal = br.readBits(1);
    const btype = br.readBits(2);
    done = bfinal === 1;

    if (btype === 0) {
      // STORED
      br.alignToByte();
      const len = br.readBitsBig(16);
      const nlen = br.readBitsBig(16);
      if ((len ^ 0xffff) !== nlen) throw new Error('inflate: invalid stored block lengths');
      for (let i = 0; i < len; i++) {
        if (br.pos >= data.length) throw new Error('inflate: stored block overrun');
        out[outLen++] = data[br.pos++];
      }
    } else {
      let litHuff, distHuff;
      if (btype === BTYPE_FIXED) {
        const litLen = new Array(288);
        for (let i = 0; i < 144; i++) litLen[i] = 8;
        for (let i = 144; i < 256; i++) litLen[i] = 9;
        for (let i = 256; i < 280; i++) litLen[i] = 7;
        for (let i = 280; i < 288; i++) litLen[i] = 8;
        litHuff = buildHuffman(litLen);
        const distLen = new Array(30).fill(5);
        distHuff = buildHuffman(distLen);
      } else {
        // DYNAMIC
        const hlit = br.readBits(5) + 257;
        const hdist = br.readBits(5) + 1;
        const hclen = br.readBits(4) + 4;
        const clenLens = new Array(19).fill(0);
        for (let i = 0; i < hclen; i++) clenLens[CLEN_ORDER[i]] = br.readBits(3);
        const clHuff = buildHuffman(clenLens);

        const totalExpected = hlit + hdist;
        const allLens = [];
        while (allLens.length < totalExpected) {
          const sym = decodeSymbol(br, clHuff);
          if (sym < 16) {
            allLens.push(sym);
          } else if (sym === 16) {
            if (allLens.length === 0) throw new Error('inflate: repeat without previous length');
            const prev = allLens[allLens.length - 1];
            const rep = 3 + br.readBits(2);
            const count = Math.min(rep, totalExpected - allLens.length);
            for (let i = 0; i < count; i++) allLens.push(prev);
          } else if (sym === 17) {
            const rep = 3 + br.readBits(3);
            const count = Math.min(rep, totalExpected - allLens.length);
            for (let i = 0; i < count; i++) allLens.push(0);
          } else if (sym === 18) {
            const rep = 11 + br.readBits(7);
            const count = Math.min(rep, totalExpected - allLens.length);
            for (let i = 0; i < count; i++) allLens.push(0);
          }
        }
        const litLen = allLens.slice(0, hlit);
        const distLen = allLens.slice(hlit);
        litHuff = buildHuffman(litLen);
        distHuff = buildHuffman(distLen);
      }

      for (;;) {
        const sym = decodeSymbol(br, litHuff);
        if (sym < 256) {
          out[outLen++] = sym;
        } else if (sym === 256) {
          break;
        } else {
          const li = sym - 257;
          const length = LENGTH_BASE[li] + br.readBits(LENGTH_EXTRA[li]);
          if (!distHuff) throw new Error('inflate: length code without distance tree');
          const dsym = decodeSymbol(br, distHuff);
          const distance = DIST_BASE[dsym] + br.readBits(DIST_EXTRA[dsym]);
          if (distance > outLen) throw new Error('inflate: distance too far back');
          for (let i = 0; i < length; i++) {
            out[outLen] = out[outLen - distance];
            outLen++;
          }
        }
      }
    }
  }
  return new Uint8Array(out.buffer, out.byteOffset, outLen);
}

export function inflateZlib(data) {
  if (!data || data.length < 2) return null;
  if (!isZlibStream(data[0], data[1])) return null;
  const fdict = (data[1] & 0x20) !== 0;
  let start = 2;
  if (fdict && data.length > 6) start = 6;
  const body = data.subarray(start);
  const out = inflateRaw(body);
  return out;
}

/**
 * Universal inflate: accepts zlib-wrapped or raw deflate. Returns Uint8Array or null.
 */
export function inflateAll(data) {
  if (!data || data.length === 0) return null;
  try {
    let offset = 0;
    for (let i = 0; i < Math.min(16, data.length - 1); i++) {
      if (isZlibStream(data[i], data[i + 1])) {
        offset = i;
        break;
      }
    }
    const target = offset > 0 ? data.subarray(offset) : data;
    if (target.length >= 2 && isZlibStream(target[0], target[1])) {
      const z = inflateZlib(target);
      if (z && z.length > 0) return z;
    }
    return inflateRaw(target);
  } catch (e) {
    return null;
  }
}