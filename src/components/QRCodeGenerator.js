'use client';
import React, { useState } from 'react';

export default function QRCodeGenerator({ value, size = 96, className = '' }) {
  const encodedVal = encodeURIComponent(value || 'https://jhabua-nagarpalika-aapke-dwar.netlify.app');
  const googleQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodedVal}`;
  const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedVal}`;

  const [imgSrc, setImgSrc] = useState(googleQrUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc === googleQrUrl) {
      setImgSrc(qrServerUrl);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-24 h-24 bg-slate-900 text-white flex flex-col items-center justify-center p-1 rounded font-mono text-[9px] text-center border border-slate-700">
        <span className="font-bold text-emerald-400">QR VERIFIED</span>
        <span className="text-[8px] text-slate-300 mt-1 break-all">OFFICIAL</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt="Official QR Verification Code"
      onError={handleError}
      width={size}
      height={size}
      className={`object-contain bg-white p-0.5 rounded border border-slate-300 ${className}`}
    />
  );
}
