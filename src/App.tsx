import { useState, useEffect } from 'react';
import { User } from './types';
import { authAPI } from './lib/api';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { AddBookView } from './components/AddBookView';
import { BorrowReturnView } from './components/BorrowReturnView';
import { AlertsReportsView } from './components/AlertsReportsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Check if user is already logged in (stored in sessionStorage)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'catalog':
        return <CatalogView user={currentUser} />;
      case 'add-book':
        return <AddBookView />;
      case 'borrow-return':
        return <BorrowReturnView user={currentUser} />;
      case 'alerts':
        return <AlertsReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <DashboardLayout
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      >
        {renderView()}
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
}