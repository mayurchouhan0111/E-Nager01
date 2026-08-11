// IndexedDB & Lightweight Base64 Storage Utility for PDF & Image uploads
const DB_NAME = 'NagarPalikaDocVault';
const STORE_NAME = 'official_documents';

function getDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function storeInIndexedDB(key, value) {
  if (!key || !value) return;
  try {
    const db = await getDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (e) {
    console.warn('[DocVault] IndexedDB write error:', e);
  }
}

export async function getFromIndexedDB(key) {
  if (!key) return null;
  try {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

// Compress Image using Canvas (Target size ~80-150KB)
export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const imgReader = new FileReader();
    imgReader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        const approxKb = (Math.round((compressedBase64.length * 3) / 4) / 1024).toFixed(1);
        resolve({
          fileName: file.name,
          fileType: 'image/jpeg',
          fileSize: approxKb + ' KB',
          fileData: compressedBase64
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target.result;
    };
    imgReader.onerror = () => reject(new Error('Failed to read image file'));
    imgReader.readAsDataURL(file);
  });
}

// Process Uploaded File (Image or PDF) safely for Firestore & localStorage
export function processOfficialFile(file, docKey = null) {
  return new Promise(async (resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    if (file.size > 1 * 1024 * 1024) {
      return reject(new Error('फ़ाइल का आकार 1 MB (1024 KB) से कम होना अनिवार्य है। कृपया छोटी PDF या फ़ोटो अपलोड करें।'));
    }

    const storageKey = docKey || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImageFile(file);
        const fileObj = {
          ...compressed,
          uploadedAt: new Date().toISOString(),
          docKey: storageKey
        };
        await storeInIndexedDB(storageKey, fileObj.fileData);
        resolve(fileObj);
      } catch (e) {
        const reader = new FileReader();
        reader.onload = async () => {
          const fileObj = {
            fileName: file.name,
            fileType: file.type || 'image/jpeg',
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            fileData: reader.result,
            uploadedAt: new Date().toISOString(),
            docKey: storageKey
          };
          await storeInIndexedDB(storageKey, reader.result);
          resolve(fileObj);
        };
        reader.readAsDataURL(file);
      }
    } else {
      // PDF File processing - Store 100% complete untouched data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const fullDataUrl = reader.result;
        const sizeKb = (file.size / 1024).toFixed(1);

        // Always store FULL untouched PDF base64 in IndexedDB
        await storeInIndexedDB(storageKey, fullDataUrl);

        const fileObj = {
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: sizeKb + ' KB',
          fileData: fullDataUrl,
          uploadedAt: new Date().toISOString(),
          docKey: storageKey
        };
        resolve(fileObj);
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsDataURL(file);
    }
  });
}

// Retrieve Full File Data (from object or IndexedDB)
export async function getFullFileData(docObj) {
  if (!docObj) return null;
  if (docObj.fileData && docObj.fileData.length > 500) {
    return docObj.fileData;
  }
  if (docObj.docKey) {
    const idbData = await getFromIndexedDB(docObj.docKey);
    if (idbData) return idbData;
  }
  return docObj.fileData || null;
}

// Triggers a 100% valid Blob download so Chrome/browsers open the PDF without corruption
// Returns true on success, false on truncated/invalid data
export async function downloadBlobFile(docObj, defaultFileName = 'Official_Signed_Document.pdf') {
  if (!docObj) return false;

  let dataUrl = await getFullFileData(docObj);
  if (!dataUrl) return false;

  // Validate PDF integrity: if PDF base64 was truncated by old code (< 150KB for a large PDF file), return false for fallback
  if (docObj.fileType?.includes('pdf') || dataUrl.startsWith('data:application/pdf')) {
    if (docObj.fileSize && (docObj.fileSize.includes('MB') || parseFloat(docObj.fileSize) > 250)) {
      if (dataUrl.length < 100000) {
        console.warn('[DocVault] PDF data truncated from old upload. Triggering template fallback.');
        return false;
      }
    }
  }

  const fileName = docObj.fileName || defaultFileName;

  try {
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(';base64,');
      if (parts.length < 2) return false;

      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const bstr = atob(parts[1]);
      let n = bstr.length;

      // If decoded binary size is < 5KB for a PDF, it's incomplete
      if (n < 5000 && (contentType.includes('pdf') || fileName.endsWith('.pdf'))) {
        return false;
      }

      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return true;
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
  } catch (err) {
    console.error('[DocVault] Download error:', err);
    return false;
  }
}
