import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { RoomsPage } from '../pages/RoomsPage';
import { TenantsPage } from '../pages/TenantsPage';
import { LeasesPage } from '../pages/LeasesPage';
import { FinancePage } from '../pages/FinancePage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { ReportsPage } from '../pages/ReportsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/tenants" element={<TenantsPage />} />
      <Route path="/leases" element={<LeasesPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);
