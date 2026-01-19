'use client';

import React, { useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  currentSignature?: string;
  onClear: () => void;
}

export default function SignaturePad({ onSignature, currentSignature, onClear }: SignaturePadProps) {
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
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <SignatureCanvas
          ref={sigRef}
          onEnd={handleEnd}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 150,
            className: 'rounded-lg',
          }}
          backgroundColor="white"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear Signature
        </button>
        {currentSignature && (
          <span className="flex items-center text-sm text-green-600">
            ✓ Signature captured
          </span>
        )}
      </div>
    </div>
  );
}
