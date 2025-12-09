import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, BookMarked, AlertTriangle, TrendingUp } from 'lucide-react';
import { analyticsAPI } from '../lib/api';

export function DashboardView() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    activeBorrows: 0,
    overdueCount: 0,
    lowStockCount: 0,
    totalFines: 0,
    studentCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 10 seconds for real-time updates
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await analyticsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      description: `${stats.availableBooks} available`,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Borrows',
      value: stats.activeBorrows,
      description: `${stats.studentCount} registered students`,
      icon: BookMarked,
      color: 'bg-green-500'
    },
    {
      title: 'Overdue Books',
      value: stats.overdueCount,
      description: 'Need attention',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockCount,
      description: 'Books to reorder',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of library statistics and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="text-sm mb-1">Search Catalog</h4>
              <p className="text-xs text-gray-500">Find and borrow books</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="text-sm mb-1">View Alerts</h4>
              <p className="text-xs text-gray-500">Check overdue and low stock items</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="text-sm mb-1">Manage Returns</h4>
              <p className="text-xs text-gray-500">Process book returns</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm">New book added to catalog</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <BookMarked className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm">Book borrowed by student</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm">Low stock alert triggered</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}