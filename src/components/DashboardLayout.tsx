import { ReactNode, useState } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  BookOpen, 
  Search, 
  BookPlus, 
  RotateCcw, 
  AlertCircle, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DashboardLayoutProps {
  user: User;
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({ user, children, currentView, onViewChange, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen, roles: ['Admin', 'Student'] },
    { id: 'catalog', label: 'Search Books', icon: Search, roles: ['Admin', 'Student'] },
    { id: 'add-book', label: 'Add Book', icon: BookPlus, roles: ['Admin'] },
    { id: 'borrow-return', label: 'Borrow / Return', icon: RotateCcw, roles: ['Admin', 'Student'] },
    { id: 'alerts', label: 'Alerts & Reports', icon: AlertCircle, roles: ['Admin'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['Admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
  ];

  const availableMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg">Library System</h1>
                <p className="text-xs text-gray-500">{user.role} Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p>{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Switch Profile / Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Standalone Logout Button - Hidden on mobile */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            className="hidden md:flex gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-20",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="p-4 space-y-1">
            {availableMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    currentView === item.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "lg:ml-64" : "ml-0"
          )}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
