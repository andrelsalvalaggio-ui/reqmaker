"use client";

import React, { useState, useRef, useEffect } from 'react';

interface StringInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function StringInput({ 
  label, 
  value,
  onChange,
  placeholder = "Digite aqui..."
}: StringInputProps) {
    const [isActive, setIsActive] = useState(false);

  return (
      <div className="w-auto h-fit flex flex-col gap-1 select-none">
        <label className={`text-xs font-bold uppercase tracking-wider transition-colors flex justify-between items-center ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
          <span>{label}</span>
        </label>

          <div className={`flex items-center p-1 bg-white border rounded transition-all overflow-hidden ${isActive ? 'border-blue-500 ring-2 ring-blue-100 z-10' : 'border-gray-200 hover:border-gray-300'}`}>
            <textarea
              className="w-full text-sm resize-none min-h-20 max-h-100 field-sizing-content outline-none px-2 py-1 text-gray-700 placeholder-gray-300 bg-transparent"
              
              // 1. O VALOR PRECISA ESTAR AQUI
              value={value || ""} 
              
              onChange={(e) => onChange(e.target.value)}
              
              onFocus={() => setIsActive(true)}
              onBlur={() => setIsActive(false)}
              
              placeholder={placeholder}
            />
          </div>
      </div>
  );
}