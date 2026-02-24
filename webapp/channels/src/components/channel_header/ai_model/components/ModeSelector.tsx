import React from 'react';
import { ImageMode } from '../types';

interface ModeSelectorProps {
  value: ImageMode;
  onChange: (mode: ImageMode) => void;
  disabled?: boolean;
}

const modes: { value: ImageMode; label: string }[] = [
  { value: 'logo', label: 'شعار' },
  { value: 'draw', label: 'رسم' },
  { value: 'general', label: 'واقعي' },
  { value: 'pixel', label: 'بيكسل' },
  { value: 'emoji', label: 'ايموجي' },
  { value: 'vector', label: 'شخصيات كرتوني' },
  { value: 'text_gold', label: 'نص ذهبي' },
  { value: 'text_diamond', label: 'نص ماسي' },
  { value: 'text_fire', label: 'نص ناري' },
  { value: 'anime', label: 'أنمي' }
];

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ImageMode)}
      disabled={disabled}
      className="custom-select"
      dir="rtl"
    >
      {modes.map((mode) => (
        <option key={mode.value} value={mode.value}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}