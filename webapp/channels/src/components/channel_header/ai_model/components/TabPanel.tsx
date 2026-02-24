import { ReactNode } from 'react';
import '../../style.scss';
import React from 'react';

interface TabPanelProps {
  children: ReactNode;
}

function TabPanel({ children }: TabPanelProps) {
  return (
    <div className="panels">
      {children}
    </div>
  );
}

export default TabPanel;