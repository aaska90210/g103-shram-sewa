import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/Dashboard.css';

const HirerLayout = () => {
  return (
    <div className="hirer-layout">
      <header>
        <h1>Hirer Dashboard</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HirerLayout;