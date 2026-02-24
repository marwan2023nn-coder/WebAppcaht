import { ButtonHTMLAttributes } from 'react';
import '../../style.scss';
import React from 'react';

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
}

function TabButton({ isActive, children, ...props }: TabButtonProps) {
  return (
    <button
      className={`button1 tab ${isActive ? 'selected' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default TabButton;