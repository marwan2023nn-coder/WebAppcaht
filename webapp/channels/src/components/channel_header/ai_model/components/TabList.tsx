import { ReactNode } from 'react';
import  '../../style.scss';
import React from 'react';

interface TabListProps {
  children: ReactNode;
}

function TabList({ children }: TabListProps) {
  return (
    <div className="tabList">
      {children}
    </div>
  );
}

export default TabList;