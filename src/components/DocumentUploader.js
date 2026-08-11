'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, Eye, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

export default function DocumentUploader({
  title,
  description,
  required = false,
  documentData = null,
  onUpload,
  onRemove
}) {
  const [previewModal, setPreviewModal] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError('फ़ाइल का आकार 1 MB से कम होना अनिवार्य है (File size must be under 1MB)');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('केवल JPG, PNG या PDF फ़ाइल अपलोड करें (Only JPG, PNG or PDF allowed)');
      return;
    }

    const processAndUpload = (fileName, fileType, fileData, sizeKb) => {
      onUpload({
        fileName,
        fileType,
        fileSize: sizeKb + ' KB',
        fileData,
        uploadedAt: new Date().toISOString()
      });
    };

    if (file.type.startsWith('image/')) {
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

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          const approxKb = (Math.round((compressedBase64.length * 3) / 4) / 1024).toFixed(1);
          processAndUpload(file.name, 'image/jpeg', compressedBase64, approxKb);
        };
        img.onerror = () => {
          setError('फ़ाइल पढ़ने में त्रुटि (Error processing image)');
        };
        img.src = event.target.result;
      };
      imgReader.readAsDataURL(file);
    } else {
      // PDF or non-image files
      const reader = new FileReader();
      reader.onload = () => {
        const sizeKb = (file.size / 1024).toFixed(1);
        processAndUpload(file.name, file.type, reader.result, sizeKb);
      };
      reader.onerror = () => {
        setError('फ़ाइल पढ़ने में त्रुटि (Error reading file)');
      };
      reader.readAsDataURL(file);
    }
  };

  const isUploaded = Boolean(documentData && documentData.fileData);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800">{title}</h4>
            {required ? (
              <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                आवश्यक *
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                ऐच्छिक
              </span>
            )}
          </div>
          {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
        </div>

        {isUploaded && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> अपलोड किया गया
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 p-2 rounded-xl flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUploaded ? (
        <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            {documentData.fileType?.includes('image') ? (
              <div
                onClick={() => setPreviewModal(true)}
                className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden cursor-pointer relative group"
              >
                <img
                  src={documentData.fileData}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 shrink-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{documentData.fileName}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{documentData.fileSize}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewModal(true)}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
              title="पूर्वावलोकन देखें (Preview)"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="हटाएं (Remove)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
          <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1 transition-colors" />
          <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
            फ़ाइल / फोटो चुनें या यहाँ खींचकर छोड़ें
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            JPG, PNG या PDF (अधिकतम 5 MB)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {/* PREVIEW MODAL */}
      {previewModal && documentData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{title} - दस्तावेज पूर्वावलोकन</h3>
                <p className="text-[11px] text-slate-500 font-mono">{documentData.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center items-center bg-slate-100 rounded-2xl p-4 min-h-[250px]">
              {documentData.fileType?.includes('image') ? (
                <img
                  src={documentData.fileData}
                  alt={title}
                  className="max-h-[60vh] w-auto object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={documentData.fileData}
                  title={title}
                  className="w-full h-[60vh] rounded-lg border-0"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
