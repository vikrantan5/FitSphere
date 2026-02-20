import React from 'react';
import Sidebar from '../pages/Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-gray-50">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
