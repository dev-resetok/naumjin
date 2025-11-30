import React from 'react';
import HeaderBar from "@common/bar/HeaderBar";

export default function Layout({ children, session, handleLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <header className="p-5 bg-indigo-100 border-b-3 border-indigo-300 rounded-b-2xl shadow-sm">
        <HeaderBar session={session} handleLogout={handleLogout} />
      </header>
      {children}
    </div>
  );
}
