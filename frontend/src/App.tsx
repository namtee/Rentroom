import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <AppRoutes />
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
