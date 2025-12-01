"use client";

import React, { useState, useRef, useEffect } from 'react';

interface NumberInputProps {
  label: string;      // Ex: "Largura"
  value: number;      // O valor numérico
  dragLabel?: string;
  onChange: (val: number) => void;
  min?: number;       // Mínimo (padrão 0)
  placeholder?: string; // Texto para quando for 0/vazio (padrão "Auto")
  suffix?: string;    // Ex: "px", "%"
  inputWidth?: number;
  dragSpeed?: number;
}

export function NumberInput({ 
  label, 
  value,
  dragLabel,
  onChange, 
  min = 0, 
  placeholder = "Auto",
  suffix,
  inputWidth,
  dragSpeed
}: NumberInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startValue = useRef(0);

  // Lógica do Drag (Arrastar)
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const speed = (dragSpeed ?? 1) * 0.05;
      const deltaX = e.clientX - startX.current;
      // Sensibilidade: 1px de mouse = 1 unidade de valor
      // Dica: Pressione Shift para ir mais rápido se quiser implementar depois (deltaX * 10)
      const newValue = Math.max(min, Math.floor(startValue.current + deltaX  * speed));
      
      onChange(newValue);
    };

    const handleUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, onChange, min]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Só inicia o drag com botão esquerdo
    if (e.button !== 0) return;
    
    setIsDragging(true);
    startX.current = e.clientX;
    startValue.current = value || 0;
    
    // Trava o cursor visualmente no corpo da página
    document.body.style.cursor = 'ew-resize';
  };

  return (
    
      <div className="w-auto flex flex-col gap-1 select-none">
        <label
          className='text-xs text-gray-600 font-bold uppercase tracking-wider transition-colors flex justify-between items-center group'
        >
          <span>{label}</span>
        </label>


          {/* INPUT REAL */}
          <div 
            className={`relative flex gap-0 items-center p-1 pr-2 pl-2  bg-white border rounded transition-all overflow-hidden ${isDragging ? 'border-blue-500 ring-2 ring-blue-100 z-10' : 'border-gray-200 hover:border-gray-300'}`}
            style={inputWidth ? { maxWidth: `${inputWidth}px` } : {}}
          >
            <div className={`w-9 flex-col justify-center ${dragLabel ? 'flex' : 'hidden'}`}>
              <span 
              className={`text-2xs tracking-wider cursor-ew-resize transition-colors flex justify-between items-center group ${isDragging ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
              onPointerDown={handlePointerDown}
              title="Clique e arraste horizontalmente para ajustar"
              >
                {dragLabel ? dragLabel[0] : ''}
              </span>
            </div>
            <input
              type="number"
              min={min}
              className='w-full text-sm outline-none text-gray-700 placeholder-gray-300 bg-transparent z-10'
              // Se for 0, mostra vazio para aparecer o placeholder
              value={value === 0 ? '' : value} 
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange(isNaN(val) ? 0 : val);
              }}
              placeholder={placeholder}
            />
            
            {/* Sufixo (px) */}
            <div className="text-[12px] text-gray-400 pointer-events-none font-medium bg-white pl-1">
              {suffix}
            </div>
          </div>

      </div>
    
  );
}