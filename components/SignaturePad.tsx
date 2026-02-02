
import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  initialValue?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastValueRef = useRef<string | undefined>(initialValue);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialValue && initialValue !== lastValueRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialValue;
      }
    }
    lastValueRef.current = initialValue;
  }, [initialValue]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale coordinates accurately based on canvas internal resolution vs display size
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 3; // Slightly thicker for better visibility
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      lastValueRef.current = dataUrl;
      onSave(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      lastValueRef.current = '';
      onSave('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white touch-none shadow-inner h-40">
        <canvas
          ref={canvasRef}
          width={800} // Increased internal resolution
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-full cursor-crosshair bg-white"
          style={{ touchAction: 'none' }}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-xs text-red-500 hover:text-red-700 font-bold self-end uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full transition-colors"
      >
        Padam & Padan Semula
      </button>
    </div>
  );
};

export default SignaturePad;
