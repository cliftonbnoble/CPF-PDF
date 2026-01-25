'use client';

import React, { useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  currentSignature?: string;
  onClear: () => void;
  onSignAll?: () => void;
  unsignedSignableMonthsCount?: number;
}

export default function SignaturePad({ onSignature, currentSignature, onClear, onSignAll, unsignedSignableMonthsCount = 0 }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL('image/png');
      onSignature(dataUrl);
    }
  }, [onSignature]);

  const handleClear = useCallback(() => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
    onClear();
  }, [onClear]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Inspector Signature
      </label>
      <div className="border-2 border-gray-300 rounded-lg bg-white w-full max-w-3xl">
        <SignatureCanvas
          ref={sigRef}
          onEnd={handleEnd}
          penColor="black"
          canvasProps={{
            width: 700,
            height: 150,
            className: 'rounded-lg w-full',
          }}
          backgroundColor="white"
        />
      </div>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear Signature
        </button>
        {onSignAll && (
          <button
            type="button"
            onClick={onSignAll}
            disabled={!currentSignature || unsignedSignableMonthsCount === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentSignature && unsignedSignableMonthsCount > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✍ Sign All ({unsignedSignableMonthsCount} months)
          </button>
        )}
        {currentSignature && (
          <span className="flex items-center text-sm text-green-600">
            ✓ Signature captured
          </span>
        )}
      </div>
    </div>
  );
}
